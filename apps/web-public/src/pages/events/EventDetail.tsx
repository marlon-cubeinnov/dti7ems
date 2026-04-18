import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Wifi, Clock, ChevronLeft, AlertCircle } from 'lucide-react';
import { eventsApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Event, EventSession } from '@dti-ems/shared-types';

interface EventDetail extends Event {
  sessions: EventSession[];
  _count: { participations: number };
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [dpaConsented, setDpaConsented] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: !!id,
  });

  const { data: myRegData } = useQuery({
    queryKey: ['my-registration', id],
    queryFn: () => eventsApi.getMyRegistration(id!),
    enabled: !!id && isAuthenticated,
  });

  const event = data?.data as unknown as EventDetail | undefined;
  const myRegistration = (myRegData as { data?: { id: string; status: string } | null })?.data;
  const alreadyRegistered = !!myRegistration && myRegistration.status !== 'CANCELLED';

  const registerMutation = useMutation({
    mutationFn: () => eventsApi.register(id!, { dpaConsentConfirmed: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] }); // refresh participant count on the list page
      qc.invalidateQueries({ queryKey: ['my-registration', id] });
      qc.invalidateQueries({ queryKey: ['my-participations'] }); // refresh My Events list
      navigate('/my-events');
    },
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
      else setError('Registration failed. Please try again.');
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!dpaConsented) { setError('Please confirm your consent to our data privacy policy.'); return; }
    setError('');
    registerMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Event not found.</p>
        <Link to="/events" className="btn-primary mt-4 inline-flex">Back to Events</Link>
      </div>
    );
  }

  const canRegister = event.status === 'REGISTRATION_OPEN' && !alreadyRegistered;
  const sessionCount = event.sessions?.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link to="/events" className="flex items-center gap-1 text-dti-blue text-sm mb-6 hover:underline">
        <ChevronLeft className="w-4 h-4" /> Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
            {event.targetSector && (
              <span className="badge-blue">{event.targetSector}</span>
            )}
          </div>

          {event.description && (
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {/* Sessions */}
          {sessionCount > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sessions</h2>
              <div className="space-y-3">
                {event.sessions.map((session) => (
                  <div key={session.id} className="card p-4">
                    <p className="font-medium text-gray-900 text-sm">{session.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(session.startTime), 'MMM d · h:mm a')} – {format(new Date(session.endTime), 'h:mm a')}
                      </span>
                      {session.speakerName && <span>Speaker: {session.speakerName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar / Registration card ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="card space-y-4">
            {/* Key details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-dti-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p>{format(new Date(event.startDate), 'MMMM d, yyyy')}</p>
                  {event.startDate !== event.endDate && (
                    <p>to {format(new Date(event.endDate), 'MMMM d, yyyy')}</p>
                  )}
                </div>
              </div>

              {(event.deliveryMode === 'FACE_TO_FACE' || event.deliveryMode === 'HYBRID') && event.venue && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-dti-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p>{event.venue}</p>
                  </div>
                </div>
              )}

              {(event.deliveryMode === 'ONLINE' || event.deliveryMode === 'HYBRID') && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Wifi className="w-4 h-4 text-dti-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Online</p>
                    <p>Link provided upon confirmation</p>
                  </div>
                </div>
              )}

              {event.maxParticipants && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-dti-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Slots</p>
                    <p>{event._count.participations} / {event.maxParticipants} registered</p>
                  </div>
                </div>
              )}
            </div>

            {/* TNA notice */}
            {event.requiresTNA && (
              <div className="bg-blue-50 rounded-input p-3 text-xs text-blue-700">
                This event requires a Training Needs Assessment (TNA). You'll complete it after registering.
              </div>
            )}

            {/* DPA consent */}
            {canRegister && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpaConsented}
                  onChange={(e) => setDpaConsented(e.target.checked)}
                  className="mt-0.5 accent-dti-blue"
                />
                <span className="text-xs text-gray-600">
                  I consent to DTI Region 7 collecting and processing my personal data for
                  event management purposes under RA 10173 (Data Privacy Act of 2012).
                </span>
              </label>
            )}

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-input p-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {alreadyRegistered ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-input bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <span>✓ You are registered</span>
                  <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full">
                    {myRegistration!.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <Link to="/my-events" className="btn-secondary w-full py-2.5 text-center block text-sm">
                  View My Registration
                </Link>
              </div>
            ) : canRegister ? (
              <button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="btn-primary w-full py-3"
              >
                {registerMutation.isPending ? 'Registering…' : 'Register for this Event'}
              </button>
            ) : (
              <div className="text-center py-2 text-sm text-gray-500 font-medium">
                {event.status === 'COMPLETED' ? 'This event has ended.' : `Registration is ${event.status.toLowerCase().replace('_', ' ')}.`}
              </div>
            )}

            {!isAuthenticated && event.status === 'REGISTRATION_OPEN' && (
              <p className="text-center text-xs text-gray-500">
                <Link to="/login" className="text-dti-blue hover:underline">Log in</Link> or{' '}
                <Link to="/register" className="text-dti-blue hover:underline">create an account</Link> to register.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

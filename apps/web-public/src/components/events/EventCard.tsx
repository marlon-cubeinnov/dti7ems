import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Wifi } from 'lucide-react';
import type { Event } from '@dti-ems/shared-types';
import { clsx } from 'clsx';

const STATUS_BADGE: Record<string, string> = {
  REGISTRATION_OPEN:   'badge-green',
  PUBLISHED:           'badge-blue',
  REGISTRATION_CLOSED: 'badge-yellow',
  ONGOING:             'badge-blue',
  COMPLETED:           'badge-gray',
  CANCELLED:           'badge-red',
  DRAFT:               'badge-gray',
};

const STATUS_LABEL: Record<string, string> = {
  REGISTRATION_OPEN:   'Open for Registration',
  PUBLISHED:           'Coming Soon',
  REGISTRATION_CLOSED: 'Registration Closed',
  ONGOING:             'Ongoing',
  COMPLETED:           'Completed',
  CANCELLED:           'Cancelled',
  DRAFT:               'Draft',
};

interface EventCardProps {
  event: Event;
  participantCount: number;
}

export function EventCard({ event, participantCount }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="card hover:shadow-card-hover transition-shadow duration-200 flex flex-col"
    >
      {/* Cover image / placeholder */}
      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full h-40 object-cover rounded-t-card -mt-6 -mx-6 mb-4"
          style={{ width: 'calc(100% + 3rem)' }}
        />
      ) : (
        <div className="w-full h-2 bg-gradient-to-r from-dti-blue to-dti-orange rounded-full mb-4" />
      )}

      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={clsx(STATUS_BADGE[event.status] ?? 'badge-gray')}>
          {STATUS_LABEL[event.status] ?? event.status}
        </span>
        {event.deliveryMode === 'ONLINE' && (
          <span className="flex items-center gap-1 text-xs text-gray-500"><Wifi className="w-3 h-3" /> Online</span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
        {event.title}
      </h3>

      {event.description && (
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.description}</p>
      )}

      <div className="mt-auto space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-dti-blue shrink-0" />
          <span>{format(new Date(event.startDate), 'MMM d, yyyy')} — {format(new Date(event.endDate), 'MMM d, yyyy')}</span>
        </div>
        {event.venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-dti-blue shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        )}
        {event.maxParticipants && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-dti-blue shrink-0" />
            <span>{participantCount} / {event.maxParticipants} registered</span>
          </div>
        )}
      </div>
    </Link>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, surveyApi, organizerApi } from '@/lib/api';

const SQD_ITEMS = [
  { key: 'sqd0OverallRating', label: 'SQD0: Overall Satisfaction', desc: 'I am satisfied with the service I availed.' },
  { key: 'sqd1Responsiveness', label: 'SQD1: Responsiveness', desc: 'The service was delivered in a timely manner.' },
  { key: 'sqd2Reliability', label: 'SQD2: Reliability', desc: 'The service met my expectations.' },
  { key: 'sqd3AccessFacilities', label: 'SQD3: Access & Facilities', desc: 'The venue/facilities were accessible and adequate.' },
  { key: 'sqd4Communication', label: 'SQD4: Communication', desc: 'Instructions and information were clear and helpful.' },
  { key: 'sqd5Costs', label: 'SQD5: Costs', desc: 'The costs/fees were reasonable. (Leave unrated if free)' },
  { key: 'sqd6Integrity', label: 'SQD6: Integrity', desc: 'The service was fair and transparent.' },
  { key: 'sqd7Assurance', label: 'SQD7: Assurance', desc: 'I felt confident in the competence of the staff/facilitators.' },
  { key: 'sqd8Outcome', label: 'SQD8: Outcome', desc: 'I got what I needed from the service.' },
] as const;

const CC1_OPTIONS = [
  { value: 1, label: 'I know it because I saw the Citizen\'s Charter.' },
  { value: 2, label: 'I know it but I have NOT seen the Citizen\'s Charter.' },
  { value: 3, label: 'I learned about it when I availed the service.' },
  { value: 4, label: 'I do not know about it.' },
];

const CC2_OPTIONS = [
  { value: 1, label: 'Easy to see' },
  { value: 2, label: 'Somewhat easy to see' },
  { value: 3, label: 'Difficult to see' },
  { value: 4, label: 'Not visible at all' },
];

const CC3_OPTIONS = [
  { value: 1, label: 'Helped me very much' },
  { value: 2, label: 'Somewhat helped me' },
  { value: 3, label: 'Did not help at all' },
];

const RATING_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

function LikertRow({ label, desc, value, onChange }: { label: string; desc: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="border-b border-gray-100 py-3">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mb-2">{desc}</p>
      <div className="flex gap-2 items-center flex-wrap">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`w-9 h-9 rounded-full text-sm font-medium border-2 transition-all ${
              value === v
                ? 'bg-dti-blue text-white border-dti-blue'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {v}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-1">{value > 0 ? RATING_LABELS[value] : ''}</span>
      </div>
    </div>
  );
}

export function CsfSurveyPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sqdRatings, setSqdRatings] = useState<Record<string, number>>({});
  const [cc1, setCc1] = useState<number | null>(null);
  const [cc2, setCc2] = useState<number | null>(null);
  const [cc3, setCc3] = useState<number | null>(null);
  const [speakerRatings, setSpeakerRatings] = useState<Record<string, number>>({});
  const [highlights, setHighlights] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [lowRatingReasons, setLowRatingReasons] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: partData, isLoading } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => eventsApi.getMyParticipations({ page: 1, limit: 50 }),
  });

  const participations = (partData?.data as unknown as Array<{
    id: string;
    event: { id: string; title: string };
    csfSurveyResponse?: { status: string } | null;
  }>) ?? [];

  const participation = participations.find(p => p.id === participationId);
  const eventId = participation?.event?.id;
  const eventTitle = participation?.event?.title;

  const { data: speakersData } = useQuery({
    queryKey: ['event-speakers', eventId],
    queryFn: () => organizerApi.getSpeakers(eventId!),
    enabled: !!eventId,
  });
  const speakers = ((speakersData as any)?.data ?? []) as Array<{ id: string; name: string; topic?: string }>;

  const submit = useMutation({
    mutationFn: () => {
      if (!eventId) throw new Error('Event not found');
      return surveyApi.submitCsf(eventId, {
        sqd0OverallRating:    sqdRatings['sqd0OverallRating'] ?? 0,
        sqd1Responsiveness:   sqdRatings['sqd1Responsiveness'] ?? 0,
        sqd2Reliability:      sqdRatings['sqd2Reliability'] ?? 0,
        sqd3AccessFacilities: sqdRatings['sqd3AccessFacilities'] ?? 0,
        sqd4Communication:    sqdRatings['sqd4Communication'] ?? 0,
        sqd5Costs:            sqdRatings['sqd5Costs'] || null,
        sqd6Integrity:        sqdRatings['sqd6Integrity'] ?? 0,
        sqd7Assurance:        sqdRatings['sqd7Assurance'] ?? 0,
        sqd8Outcome:          sqdRatings['sqd8Outcome'] ?? 0,
        cc1Awareness:         cc1,
        cc2Visibility:        cc2,
        cc3Usefulness:        cc3,
        highlightsFeedback:   highlights || undefined,
        improvementsFeedback: improvements || undefined,
        commentsSuggestions:   comments || undefined,
        reasonsForLowRating:  lowRatingReasons || undefined,
        speakerRatings: speakers
          .filter(s => speakerRatings[s.id])
          .map(s => ({ speakerId: s.id, rating: speakerRatings[s.id] })),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!participation || !eventId) {
    return (
      <div className="card text-center py-12 text-gray-500">
        <p>Participation not found.</p>
        <button onClick={() => navigate('/my-events')} className="btn-outline mt-4">← Back to My Events</button>
      </div>
    );
  }

  if (submitted || participation.csfSurveyResponse?.status === 'SUBMITTED') {
    return (
      <div className="max-w-lg mx-auto card text-center py-12 space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-900">Thank you for your feedback!</h2>
        <p className="text-gray-600">Your response has been recorded for <strong>{eventTitle}</strong>.</p>
        <button onClick={() => navigate('/my-events')} className="btn-primary">← Back to My Events</button>
      </div>
    );
  }

  const requiredSqd = SQD_ITEMS.filter(s => s.key !== 'sqd5Costs');
  const allSqdFilled = requiredSqd.every(s => (sqdRatings[s.key] ?? 0) > 0);
  const isValid = allSqdFilled;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← My Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Client Satisfaction Feedback (CSF)</h1>
        <p className="text-gray-600 mt-1">{eventTitle}</p>
      </div>

      {/* Citizen's Charter */}
      <div className="card space-y-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Citizen's Charter</h2>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">CC1: Which best describes your awareness of a Citizen's Charter?</p>
          {CC1_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="cc1" checked={cc1 === opt.value} onChange={() => setCc1(opt.value)} className="mt-0.5" />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">CC2: If aware, is the CC of this office/agency easy to see?</p>
          {CC2_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="cc2" checked={cc2 === opt.value} onChange={() => setCc2(opt.value)} className="mt-0.5" />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">CC3: If aware, how much did the CC help you?</p>
          {CC3_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="cc3" checked={cc3 === opt.value} onChange={() => setCc3(opt.value)} className="mt-0.5" />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SQD Ratings */}
      <div className="card space-y-2">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Service Quality Dimensions (SQD)</h2>
        <p className="text-sm text-gray-600">
          Rate each dimension: 1 = Strongly Disagree … 5 = Strongly Agree
        </p>

        {SQD_ITEMS.map((item) => (
          <LikertRow
            key={item.key}
            label={item.label}
            desc={item.desc}
            value={sqdRatings[item.key] ?? 0}
            onChange={(v) => setSqdRatings(prev => ({ ...prev, [item.key]: v }))}
          />
        ))}
      </div>

      {/* Speaker Ratings */}
      {speakers.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Speaker / Resource Person Ratings</h2>
          <p className="text-sm text-gray-600">Rate each speaker from 1 (Poor) to 5 (Excellent).</p>

          {speakers.map((speaker) => (
            <div key={speaker.id} className="border-b border-gray-100 py-3">
              <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
              {speaker.topic && <p className="text-xs text-gray-500 mb-2">{speaker.topic}</p>}
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSpeakerRatings(prev => ({ ...prev, [speaker.id]: v }))}
                    className={`w-9 h-9 rounded-full text-sm font-medium border-2 transition-all ${
                      speakerRatings[speaker.id] === v
                        ? 'bg-dti-blue text-white border-dti-blue'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-2">
                  {speakerRatings[speaker.id] ? `${speakerRatings[speaker.id]}/5` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Open-ended */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Feedback</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            What did you like most? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea rows={3} maxLength={2000} className="input w-full resize-none" placeholder="Highlights, key takeaways..."
            value={highlights} onChange={(e) => setHighlights(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            What can be improved? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea rows={3} maxLength={2000} className="input w-full resize-none" placeholder="Suggestions for improvement..."
            value={improvements} onChange={(e) => setImprovements(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Comments / Suggestions <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea rows={2} maxLength={2000} className="input w-full resize-none" placeholder="Any other comments..."
            value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Reasons for any low rating <span className="text-gray-400 font-normal">(if applicable)</span>
          </label>
          <textarea rows={2} maxLength={2000} className="input w-full resize-none" placeholder="Please explain any rating of 1 or 2..."
            value={lowRatingReasons} onChange={(e) => setLowRatingReasons(e.target.value)} />
        </div>
      </div>

      {submit.isError && (
        <p className="text-sm text-red-600">
          {(submit.error as Error)?.message ?? 'Failed to submit survey. Please try again.'}
        </p>
      )}

      <button
        className="btn-primary w-full"
        disabled={!isValid || submit.isPending}
        onClick={() => submit.mutate()}
      >
        {submit.isPending ? 'Submitting…' : 'Submit CSF Feedback'}
      </button>
      <p className="text-xs text-gray-500 text-center pb-4">All SQD ratings (except SQD5 Costs) are required. CC questions and feedback are optional.</p>
    </div>
  );
}

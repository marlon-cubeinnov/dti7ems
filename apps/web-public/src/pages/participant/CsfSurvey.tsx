import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, surveyApi, organizerApi } from '@/lib/api';
import dtiLogo from '@/assets/dti-logo.jpg';

/* ── Exact questions from official DTI FM-CSF-ACT form ── */

const SQD_ITEMS = [
  {
    num: '0', title: 'OVERALL RATING',
    key: 'sqd0OverallRating',
    text: 'In general, I am satisfied and I would recommend this session to colleagues.',
  },
  {
    num: '1', title: 'RESPONSIVENESS',
    key: 'sqd1Responsiveness',
    text: 'The session was provided in a timely manner, aligned with my learning needs, and relevant to my role, making it useful for my work.',
  },
  {
    num: '2', title: 'RELIABILITY',
    key: 'sqd2Reliability',
    text: 'The session was consistent with what was promised and effectively covered all key topics.',
  },
  {
    num: '3', title: 'ACCESS AND FACILITIES',
    key: 'sqd3AccessFacilities',
    text: 'The venue/platform was conducive to learning, equipment were appropriate, with clear audio and effective presentation facilities.',
  },
  {
    num: '4', title: 'COMMUNICATION',
    key: 'sqd4Communication',
    text: 'Information were clearly and effectively communicated, with well-structured instructions, and materials that were easy to understand.',
  },
  {
    num: '5', title: 'COSTS',
    key: 'sqd5Costs',
    text: 'N/A',
    isNA: true,
  },
  {
    num: '6', title: 'INTEGRITY',
    key: 'sqd6Integrity',
    text: 'The organizers and the resource speaker consistently provided clear and truthful information about the program. They demonstrated fairness, respect, and integrity in all interaction with participants, ensuring transparency and ethical behavior throughout the process/duration of the session.',
  },
  {
    num: '7', title: 'ASSURANCE',
    key: 'sqd7Assurance',
    text: "The organizers and the resource speaker demonstrated competence and courtesy, instilling confidence and trust in the participants. They provided reliable and credible information, ensuring participants' security and assurance throughout the process.",
  },
  {
    num: '8', title: 'OUTCOME',
    key: 'sqd8Outcome',
    text: 'The session builds productivity and efficiency for the participants.',
  },
] as const;

const CC1_OPTIONS = [
  { value: 1, label: "I know what a CC is and I saw this office's CC." },
  { value: 2, label: "I know what a CC is but I did NOT see this office's CC." },
  { value: 3, label: "I learned of the CC only when I saw this office's CC." },
  { value: 4, label: 'I do not know what a CC is and I did not see one in this office.' },
];

const CC2_OPTIONS = [
  { value: 1, label: 'Easy to see' },
  { value: 2, label: 'Somewhat easy to see' },
  { value: 3, label: 'Difficult to see' },
  { value: 4, label: 'Not visible at all' },
  { value: 5, label: 'N/A' },
];

const CC3_OPTIONS = [
  { value: 1, label: 'Helped very much' },
  { value: 2, label: 'Somewhat helped' },
  { value: 3, label: 'Did not help' },
  { value: 4, label: 'N/A' },
];

const COL_LABELS = ['Strongly\nAgree', 'Agree', 'Neither', 'Disagree', 'Strongly\nDisagree'];
const COL_VALUES = [5, 4, 3, 2, 1];

export function CsfSurveyPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sqdRatings, setSqdRatings] = useState<Record<string, number>>({});
  const [cc1, setCc1] = useState<number | null>(null);
  const [cc2, setCc2] = useState<number | null>(null);
  const [cc3, setCc3] = useState<number | null>(null);
  const [speakerRatings, setSpeakerRatings] = useState<Record<string, number>>({});
  const [lowRatingReasons, setLowRatingReasons] = useState('');
  const [comments, setComments] = useState('');
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
        highlightsFeedback:   undefined,
        improvementsFeedback: undefined,
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

  const requiredSqd = SQD_ITEMS.filter(s => !s.isNA);
  const allSqdFilled = requiredSqd.every(s => (sqdRatings[s.key] ?? 0) > 0);
  const isValid = allSqdFilled;

  return (
    <div className="max-w-3xl mx-auto space-y-0 pb-10">
      <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
        ← My Events
      </button>

      {/* ── Official Form Header ── */}
      <div className="bg-white border border-gray-300 rounded-t-lg">
        {/* Header with Logo and Document Code */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          {/* Left: DTI Logo */}
          <div className="flex items-center gap-2">
            <img src={dtiLogo} alt="DTI Logo" className="w-14 h-14 object-contain" />
            <div>
              <p className="text-[8px] text-gray-400 italic">PHILIPPINES</p>
              <p className="text-[8px] font-bold text-[#003087]">BAGONG PILIPINAS</p>
            </div>
          </div>

          {/* Center: DTI Header */}
          <div className="text-center flex-1 px-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Republic of the Philippines</p>
            <p className="text-sm font-bold text-[#003087] tracking-wide">DEPARTMENT OF TRADE AND INDUSTRY</p>
            <p className="text-xs text-gray-500">DTI-Region VII | DTI-7 Regional Office</p>
          </div>

          {/* Right: Document Code */}
          <div className="text-right text-[10px] text-gray-500 leading-tight">
            <div>Document Code: <span className="font-semibold text-gray-700">FM-CSF-ACT</span></div>
            <div>Version No.: <span className="font-semibold text-gray-700">0</span></div>
            <div>Effectivity Date: <span className="font-semibold text-gray-700">September 1, 2025</span></div>
          </div>
        </div>

        {/* Title */}
        <div className="bg-[#003087] text-white text-center py-2.5 px-4">
          <h1 className="text-base font-bold tracking-wide">CLIENT SATISFACTION FEEDBACK FORM</h1>
          <p className="text-[11px] opacity-80 mt-0.5">Training | Seminar | Conference</p>
        </div>

        {/* Consent */}
        <div className="px-5 py-3 bg-blue-50 border-b border-gray-200">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-700">CONSENT:</span>{' '}
            I agree to let the DTI collect and use my name, contact details, and feedback for purposes of monitoring,
            measuring, and analyzing responses to improve its services. This consent is valid until revoked or withdrawn
            in writing, following the Data Privacy Act of 2012 (RA 10173).
          </p>
        </div>

        {/* Activity Title */}
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-0.5">Title of Program/Activity:</p>
          <p className="text-sm font-semibold text-gray-900">{eventTitle}</p>
        </div>
      </div>

      {/* ── PART I: Citizen's Charter ── */}
      <div className="bg-white border-x border-b border-gray-300">
        <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
          <h2 className="text-sm font-bold text-[#003087]">
            PART I. <span className="font-normal text-gray-700 text-xs ml-1">Citizen's Charter (CC)</span>
          </h2>
        </div>
        <div className="px-5 py-4 text-xs text-gray-600 border-b border-gray-100">
          Place a check mark (✔) beside your selected answer to the Citizen's Charter (CC) questions.
          The Citizen's Charter is an official document that reflects the services of a government agency/office
          including its requirements, fees, and processing times among others.
        </div>

        {/* CC1 */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            <span className="text-[#003087] font-bold mr-1">CC1</span>
            Which of the following best describes your awareness of a Citizen's Charter (CC)?
          </p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {CC1_OPTIONS.map((opt) => (
              <label key={opt.value} className={`flex items-start gap-2 cursor-pointer rounded-md px-3 py-2 transition-colors ${
                cc1 === opt.value ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
              }`}>
                <input type="radio" name="cc1" checked={cc1 === opt.value} onChange={() => setCc1(opt.value)}
                  className="mt-0.5 accent-[#003087]" />
                <span className="text-xs text-gray-700">{opt.value}. {opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CC2 */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            <span className="text-[#003087] font-bold mr-1">CC2</span>
            If aware of the CC (answered 1–3 in CC1), would you say that the CC of this office was …?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CC2_OPTIONS.map((opt) => (
              <label key={opt.value} className={`flex items-center gap-1.5 cursor-pointer rounded-md px-3 py-2 transition-colors ${
                cc2 === opt.value ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
              }`}>
                <input type="radio" name="cc2" checked={cc2 === opt.value} onChange={() => setCc2(opt.value)}
                  className="accent-[#003087]" />
                <span className="text-xs text-gray-700">{opt.value}. {opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CC3 */}
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            <span className="text-[#003087] font-bold mr-1">CC3</span>
            If aware of the CC (answered 1–3 in CC1), how much did the CC help you in your transaction?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CC3_OPTIONS.map((opt) => (
              <label key={opt.value} className={`flex items-center gap-1.5 cursor-pointer rounded-md px-3 py-2 transition-colors ${
                cc3 === opt.value ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
              }`}>
                <input type="radio" name="cc3" checked={cc3 === opt.value} onChange={() => setCc3(opt.value)}
                  className="accent-[#003087]" />
                <span className="text-xs text-gray-700">{opt.value}. {opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── PART II: Service Quality Dimensions ── */}
      <div className="bg-white border-x border-b border-gray-300">
        <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
          <h2 className="text-sm font-bold text-[#003087]">
            PART II. <span className="font-normal text-gray-700 text-xs ml-1">Service Quality Dimensions</span>
          </h2>
        </div>
        <div className="px-5 py-3 text-xs text-gray-600 border-b border-gray-200">
          Our office is committed to continually improve our services to our clients. Please let us know how we can better serve you.
          Your feedback will be taken into consideration, ensuring the strict confidentiality of the information you provide.
          <br /><br />
          For each criterion below, please select the rating pertaining to your answer. Mark <strong>ONE</strong> rating only for each row.
          For every "NEITHER", "DISAGREE" or "STRONGLY DISAGREE" rating you give, please provide reason/s in Part III below.
        </div>

        {/* SQD Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#003087] text-white">
                <th className="text-left px-4 py-2.5 font-semibold text-xs w-[55%]">CRITERIA FOR RATING</th>
                {COL_LABELS.map((label) => (
                  <th key={label} className="text-center px-1 py-2.5 font-semibold text-[10px] whitespace-pre-line leading-tight w-[9%]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SQD_ITEMS.map((item) => (
                <tr key={item.key} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-xs text-[#003087] mb-0.5">{item.num}. {item.title}</div>
                    {!item.isNA && <div className="text-xs text-gray-600 leading-relaxed">{item.text}</div>}
                    {item.isNA && <div className="text-xs text-gray-400 italic">N/A — Skip if the service was free of charge</div>}
                  </td>
                  {COL_VALUES.map((v) => (
                    <td key={v} className="text-center px-1 py-3">
                      <button
                        type="button"
                        onClick={() => setSqdRatings(prev => ({ ...prev, [item.key]: v }))}
                        className={`w-7 h-7 rounded border-2 mx-auto flex items-center justify-center text-xs transition-all ${
                          sqdRatings[item.key] === v
                            ? 'bg-[#003087] text-white border-[#003087]'
                            : 'bg-white text-gray-300 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {sqdRatings[item.key] === v ? '✔' : ''}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}

              {/* ── Supplemental: Speaker Rating rows ── */}
              {speakers.length > 0 && (
                <>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={6} className="px-4 py-2">
                      <div className="font-bold text-xs text-[#003087]">SUPPLEMENTAL — Resource Speaker</div>
                      <div className="text-xs text-gray-600">
                        The resource speaker demonstrated mastery of topic, encouraged interactive discussions, and responded to questions asked.
                      </div>
                    </td>
                  </tr>
                  {speakers.map((speaker) => (
                    <tr key={speaker.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-gray-800">{speaker.name}</div>
                        {speaker.topic && <div className="text-xs text-gray-500">{speaker.topic}</div>}
                      </td>
                      {COL_VALUES.map((v) => (
                        <td key={v} className="text-center px-1 py-3">
                          <button
                            type="button"
                            onClick={() => setSpeakerRatings(prev => ({ ...prev, [speaker.id]: v }))}
                            className={`w-7 h-7 rounded border-2 mx-auto flex items-center justify-center text-xs transition-all ${
                              speakerRatings[speaker.id] === v
                                ? 'bg-[#003087] text-white border-[#003087]'
                                : 'bg-white text-gray-300 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {speakerRatings[speaker.id] === v ? '✔' : ''}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PART III: Comments & Suggestions ── */}
      <div className="bg-white border-x border-b border-gray-300 rounded-b-lg">
        <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
          <h2 className="text-sm font-bold text-[#003087]">
            PART III. <span className="font-normal text-gray-700 text-xs ml-1">Comments and Suggestions</span>
          </h2>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Please provide your reason/s for your "NEITHER", "DISAGREE" or "STRONGLY DISAGREE" answer, including comments/suggestions, if any, for improvement purposes.
            </label>
            <textarea rows={3} maxLength={2000} className="input w-full resize-none text-sm"
              placeholder="Enter reasons here (if applicable)..."
              value={lowRatingReasons} onChange={(e) => setLowRatingReasons(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Please give comments/suggestions to help us improve our service/s:
            </label>
            <textarea rows={3} maxLength={2000} className="input w-full resize-none text-sm"
              placeholder="Your comments and suggestions..."
              value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
        </div>

        {/* Thank You & Submit */}
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500 mb-4 font-medium">THANK YOU!</p>

          {submit.isError && (
            <p className="text-sm text-red-600 mb-3 text-center">
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
          <p className="text-[11px] text-gray-400 text-center mt-2">
            All SQD ratings (except SQD5 Costs) are required. CC questions and comments are optional.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

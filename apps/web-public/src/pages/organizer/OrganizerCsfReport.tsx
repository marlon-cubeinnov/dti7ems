import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

const ADJECTIVAL_COLORS: Record<string, string> = {
  Outstanding: 'bg-green-100 text-green-700',
  'Very Satisfactory': 'bg-blue-100 text-blue-700',
  Satisfactory: 'bg-yellow-100 text-yellow-700',
  Fair: 'bg-orange-100 text-orange-700',
  Unsatisfactory: 'bg-red-100 text-red-700',
};

const CC1_LABELS: Record<number, string> = {
  1: 'I know what a CC is and I saw this office\'s CC',
  2: 'I know what a CC is but I did NOT see this office\'s CC',
  3: 'I learned of the CC only when I saw this office\'s CC',
  4: 'I do not know what a CC is and I did not see one',
};
const CC2_LABELS: Record<number, string> = {
  1: 'Easy to see', 2: 'Somewhat easy to see',
  3: 'Difficult to see', 4: 'Not visible at all',
};
const CC3_LABELS: Record<number, string> = {
  1: 'Helped very much', 2: 'Somewhat helped', 3: 'Did not help',
};

const SEX_LABELS: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', NOT_SPECIFIED: 'Not Specified',
};
const AGE_LABELS: Record<string, string> = {
  AGE_19_OR_LOWER: '19 & Below', AGE_20_TO_34: '20-34', AGE_35_TO_49: '35-49',
  AGE_50_TO_64: '50-64', AGE_65_OR_HIGHER: '65 & Above', NOT_SPECIFIED: 'Not Specified',
};
const CLIENT_LABELS: Record<string, string> = {
  CITIZEN: 'Citizen', BUSINESS: 'Business', GOVERNMENT: 'Government', NOT_SPECIFIED: 'Not Specified',
};

interface SqdItem {
  field: string; label: string;
  ratingCounts: number[]; totalResponses: number;
  csfRatingPct: number | null; adjectival: string | null;
}
interface SpeakerItem {
  speakerId: string; name: string; organization: string | null; topic: string | null;
  average: number; csfPct: number; responseCount: number;
}
interface ReportData {
  event: { id: string; title: string; venue: string | null; startDate: string; endDate: string; targetSector: string | null };
  summary: { totalClients: number; totalResponses: number; retrievalRate: number; overallSatisfactionPct: number | null; overallAdjectival: string | null };
  sqdBreakdown: SqdItem[];
  ccDistribution: { cc1Awareness: Record<string, number>; cc2Visibility: Record<string, number>; cc3Usefulness: Record<string, number> };
  speakerSummary: SpeakerItem[];
  demographics: { sex: Record<string, number>; ageBracket: Record<string, number>; clientType: Record<string, number> };
  feedback: { highlights: string[]; improvements: string[]; comments: string[]; lowRatingReasons: string[] };
}

function PctBar({ pct, color = 'bg-blue-500' }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function DemographicTable({ title, data, labels }: { title: string; data: Record<string, number>; labels: Record<string, string> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {Object.entries(data).sort(([, a], [, b]) => b - a).map(([key, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                <span>{labels[key] ?? key}</span>
                <span>{count} ({pct}%)</span>
              </div>
              <PctBar pct={pct} color="bg-indigo-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrganizerCsfReportPage() {
  const { id } = useParams<{ id: string }>();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['csf-report', id],
    queryFn: () => surveyApi.getCsfReport(id!),
    enabled: Boolean(id),
  });

  const report = reportData?.data as ReportData | undefined;

  if (isLoading) return <div className="card text-center py-16 text-gray-400">Loading CSF Report…</div>;
  if (!report) return (
    <div className="card text-center py-16">
      <p className="text-gray-500">No report data available.</p>
      <Link to={`/organizer/events/${id}`} className="text-dti-blue text-sm mt-2 inline-block">← Back to event</Link>
    </div>
  );

  const { event, summary, sqdBreakdown, ccDistribution, speakerSummary, demographics, feedback } = report;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={`/organizer/events/${id}`} className="text-gray-500 hover:text-gray-700 mt-1">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CSF Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">{event.title}</p>
          <p className="text-xs text-gray-400">
            {new Date(event.startDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
            {event.venue ? ` · ${event.venue}` : ''}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: summary.totalClients, color: 'text-blue-600' },
          { label: 'Responses', value: summary.totalResponses, color: 'text-green-600' },
          { label: 'Retrieval Rate', value: `${summary.retrievalRate}%`, color: 'text-purple-600' },
          { label: 'Overall Satisfaction', value: summary.overallSatisfactionPct != null ? `${summary.overallSatisfactionPct}%` : '—', color: 'text-teal-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {summary.overallAdjectival && (
        <div className="text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${ADJECTIVAL_COLORS[summary.overallAdjectival] ?? 'bg-gray-100 text-gray-700'}`}>
            {summary.overallAdjectival}
          </span>
        </div>
      )}

      {/* SQD Breakdown Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Service Quality Dimensions (SQD)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">SQD</th>
                <th className="px-2 py-3 font-semibold text-gray-600 text-center">1</th>
                <th className="px-2 py-3 font-semibold text-gray-600 text-center">2</th>
                <th className="px-2 py-3 font-semibold text-gray-600 text-center">3</th>
                <th className="px-2 py-3 font-semibold text-gray-600 text-center">4</th>
                <th className="px-2 py-3 font-semibold text-gray-600 text-center">5</th>
                <th className="px-3 py-3 font-semibold text-gray-600 text-center">n</th>
                <th className="px-3 py-3 font-semibold text-gray-600 text-center">CSF %</th>
                <th className="px-3 py-3 font-semibold text-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sqdBreakdown.map((sqd) => (
                <tr key={sqd.field} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{sqd.label}</td>
                  {sqd.ratingCounts.map((c, i) => (
                    <td key={i} className="px-2 py-2.5 text-center text-gray-600">{c}</td>
                  ))}
                  <td className="px-3 py-2.5 text-center text-gray-500">{sqd.totalResponses}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">
                    {sqd.csfRatingPct != null ? `${sqd.csfRatingPct}%` : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    {sqd.adjectival && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ADJECTIVAL_COLORS[sqd.adjectival] ?? ''}`}>
                        {sqd.adjectival}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CC Distribution */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Citizen's Charter (CC) Responses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'CC1: Awareness', dist: ccDistribution.cc1Awareness, labels: CC1_LABELS },
            { title: 'CC2: Visibility', dist: ccDistribution.cc2Visibility, labels: CC2_LABELS },
            { title: 'CC3: Usefulness', dist: ccDistribution.cc3Usefulness, labels: CC3_LABELS },
          ].map(({ title, dist, labels }) => {
            const total = Object.values(dist).reduce((a, b) => a + b, 0);
            return (
              <div key={title}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
                {total === 0 ? (
                  <p className="text-sm text-gray-400">No responses</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(dist).map(([k, count]) => (
                      <div key={k} className="text-xs">
                        <div className="flex justify-between text-gray-600 mb-0.5">
                          <span className="truncate mr-2">{labels[Number(k)] ?? k}</span>
                          <span className="shrink-0">{count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                        </div>
                        <PctBar pct={total > 0 ? (count / total) * 100 : 0} color="bg-teal-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Speaker Satisfaction */}
      {speakerSummary.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Speaker / Resource Person Satisfaction</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Speaker</th>
                  <th className="px-3 py-3 font-semibold text-gray-600">Organization</th>
                  <th className="px-3 py-3 font-semibold text-gray-600">Topic</th>
                  <th className="px-3 py-3 font-semibold text-gray-600 text-center">Avg</th>
                  <th className="px-3 py-3 font-semibold text-gray-600 text-center">CSF %</th>
                  <th className="px-3 py-3 font-semibold text-gray-600 text-center">n</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {speakerSummary.map((s) => (
                  <tr key={s.speakerId} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
                    <td className="px-3 py-2.5 text-gray-600">{s.organization ?? '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600">{s.topic ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">{s.average}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-teal-700">{s.csfPct}%</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{s.responseCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demographics */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Respondent Demographics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DemographicTable title="Sex Distribution" data={demographics.sex} labels={SEX_LABELS} />
          <DemographicTable title="Age Group" data={demographics.ageBracket} labels={AGE_LABELS} />
          <DemographicTable title="Client Type" data={demographics.clientType} labels={CLIENT_LABELS} />
        </div>
      </div>

      {/* Feedback */}
      {(feedback.highlights.length > 0 || feedback.improvements.length > 0 || feedback.comments.length > 0 || feedback.lowRatingReasons.length > 0) && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Open-ended Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Highlights / Best Aspect', items: feedback.highlights, color: 'border-green-300' },
              { title: 'Improvements Suggested', items: feedback.improvements, color: 'border-orange-300' },
              { title: 'Comments & Suggestions', items: feedback.comments, color: 'border-blue-300' },
              { title: 'Reasons for Low Rating', items: feedback.lowRatingReasons, color: 'border-red-300' },
            ].filter(({ items }) => items.length > 0).map(({ title, items, color }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
                <ul className={`space-y-1.5 pl-0 border-l-2 ${color}`}>
                  {items.map((text, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-3">"{text}"</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

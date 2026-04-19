import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '@/lib/api';
import { ArrowLeft, Printer } from 'lucide-react';
import dtiLogo from '@/assets/dti-logo.jpg';

/* ── Official DTI ARTA Client Satisfaction Feedback (CSF) Report ─────────── */
/* Based on FM-CSF-ACT — Anti-Red Tape Authority prescribed format            */

const SQD_FULL_LABELS: Record<string, string> = {
  sqd0OverallRating:   'SQD0 – I am satisfied with the service I availed.',
  sqd1Responsiveness:  'SQD1 – I spent a reasonable amount of time for my transaction.',
  sqd2Reliability:     'SQD2 – The office followed the transaction requirements and steps based on the information provided.',
  sqd3AccessFacilities:'SQD3 – The steps (including payment) I needed to do for my transaction were easy and simple.',
  sqd4Communication:   'SQD4 – I easily found information about my transaction from the office or its website.',
  sqd5Costs:           'SQD5 – I paid a reasonable amount of fees for my transaction. (If applicable)',
  sqd6Integrity:       'SQD6 – I feel the office was fair to everyone, or "walang palakasan", during my transaction.',
  sqd7Assurance:       'SQD7 – I was treated courteously by the staff, and (if asked for help) the staff was helpful.',
  sqd8Outcome:         'SQD8 – I got what I needed from the government office, or (if denied) it was of valid reason.',
};

const RATING_LABELS: Record<number, string> = {
  1: 'Strongly Disagree', 2: 'Disagree', 3: 'Neither Agree nor Disagree',
  4: 'Agree', 5: 'Strongly Agree',
};

const CC1_LABELS: Record<number, string> = {
  1: "I know what a CC is and I saw this office's CC.",
  2: "I know what a CC is but I did NOT see this office's CC.",
  3: "I learned of the CC only when I saw this office's CC.",
  4: 'I do not know what a CC is and I did not see one in this office.',
};
const CC2_LABELS: Record<number, string> = {
  1: 'Easy to see', 2: 'Somewhat easy to see',
  3: 'Difficult to see', 4: 'Not visible at all', 5: 'N/A',
};
const CC3_LABELS: Record<number, string> = {
  1: 'Helped very much', 2: 'Somewhat helped', 3: 'Did not help',
};

const SEX_LABELS: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', NOT_SPECIFIED: 'Prefer not to say',
};
const AGE_LABELS: Record<string, string> = {
  AGE_19_OR_LOWER: '19 & below', AGE_20_TO_34: '20–34', AGE_35_TO_49: '35–49',
  AGE_50_TO_64: '50–64', AGE_65_OR_HIGHER: '65 & above', NOT_SPECIFIED: 'Not specified',
};
const CLIENT_LABELS: Record<string, string> = {
  CITIZEN: 'Citizen', BUSINESS: 'Business', GOVERNMENT: 'Government (employee or official)', NOT_SPECIFIED: 'Not specified',
};

interface SqdItem {
  field: string; label: string;
  ratingCounts: number[]; totalResponses: number;
  csfRatingPct: number | null; adjectival: string | null;
  average?: number | null;
}
interface SpeakerItem {
  speakerId: string; name: string; organization: string | null; topic: string | null;
  average: number; csfPct: number; responseCount: number;
}
interface ReportData {
  event: { id: string; title: string; venue: string | null; startDate: string; endDate: string; targetSector: string | null; region?: string | null };
  summary: { totalClients: number; totalResponses: number; retrievalRate: number; overallSatisfactionPct: number | null; overallAdjectival: string | null };
  sqdBreakdown: SqdItem[];
  ccDistribution: { cc1Awareness: Record<string, number>; cc2Visibility: Record<string, number>; cc3Usefulness: Record<string, number> };
  speakerSummary: SpeakerItem[];
  demographics: { sex: Record<string, number>; ageBracket: Record<string, number>; clientType: Record<string, number> };
  feedback: { highlights: string[]; improvements: string[]; comments: string[]; lowRatingReasons: string[] };
}

function getAdjectivalColor(adj: string | null) {
  if (!adj) return 'text-gray-500';
  if (adj === 'Outstanding') return 'text-green-700';
  if (adj === 'Very Satisfactory') return 'text-blue-700';
  if (adj === 'Satisfactory') return 'text-yellow-700';
  if (adj === 'Fair') return 'text-orange-600';
  return 'text-red-600';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
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
  const totalDemoSex = Object.values(demographics.sex).reduce((a, b) => a + b, 0);
  const totalDemoAge = Object.values(demographics.ageBracket).reduce((a, b) => a + b, 0);
  const totalDemoClient = Object.values(demographics.clientType).reduce((a, b) => a + b, 0);
  const totalCC1 = Object.values(ccDistribution.cc1Awareness).reduce((a, b) => a + b, 0);
  const totalCC2 = Object.values(ccDistribution.cc2Visibility).reduce((a, b) => a + b, 0);
  const totalCC3 = Object.values(ccDistribution.cc3Usefulness).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Non-print toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/organizer/events/${id}`} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
          <ArrowLeft size={18} /> Back to Event
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* ═══════════════ OFFICIAL REPORT BODY ═══════════════ */}
      <div className="bg-white border border-gray-300 print:border-0 print:shadow-none" id="csf-report-printable">

        {/* ── Header / Letterhead ── */}
        <div className="border-b-2 border-black px-6 pt-4 pb-3">
          <div className="flex items-start justify-between">
            {/* Left: DTI Logo */}
            <div className="flex items-center gap-2">
              <img src={dtiLogo} alt="DTI Logo" className="w-14 h-14 object-contain" />
              <div>
                <p className="text-[8px] text-gray-400 italic">PHILIPPINES</p>
                <p className="text-[8px] font-bold text-[#003087]">BAGONG PILIPINAS</p>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1 px-4">
              <p className="text-[11px] tracking-wide text-gray-600 uppercase">Republic of the Philippines</p>
              <p className="text-sm font-bold tracking-wide uppercase">Department of Trade and Industry</p>
              <p className="text-xs text-gray-600">Region VII — Central Visayas</p>
              <div className="mt-2 border-t border-gray-300 pt-2">
                <p className="text-base font-bold tracking-wide uppercase">Client Satisfaction Feedback (CSF) — Activity Report</p>
                <p className="text-[10px] text-gray-500 italic mt-0.5">FM-CSF-ACT-RPT | Anti-Red Tape Authority (ARTA) Prescribed Format</p>
              </div>
            </div>

            {/* Right: Document Code */}
            <div className="text-right text-[10px] text-gray-500 leading-tight">
              <p>Document Code: <span className="font-semibold text-gray-700">FM-CSF-ACT-RPT</span></p>
              <p>Version No.: <span className="font-semibold text-gray-700">0</span></p>
              <p>Effectivity Date: <span className="font-semibold text-gray-700">September 1, 2025</span></p>
            </div>
          </div>
        </div>

        {/* ── Part I: Activity Information ── */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part I — Activity Information</h2>
          <table className="w-full text-sm border border-gray-400">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 w-[160px] border-r border-gray-300 text-xs">Activity / Training Title</td>
                <td className="px-3 py-2 text-gray-900">{event.title}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-300 text-xs">Date of Activity</td>
                <td className="px-3 py-2 text-gray-900">
                  {formatDate(event.startDate)}
                  {event.endDate !== event.startDate ? ` – ${formatDate(event.endDate)}` : ''}
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-300 text-xs">Venue / Platform</td>
                <td className="px-3 py-2 text-gray-900">{event.venue ?? '—'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-300 text-xs">Target Sector</td>
                <td className="px-3 py-2 text-gray-900">{event.targetSector ?? '—'}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-300 text-xs">Region</td>
                <td className="px-3 py-2 text-gray-900">{event.region ?? 'Region VII — Central Visayas'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Part II: Survey Summary ── */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part II — Survey Summary</h2>
          <table className="w-full text-sm border border-gray-400">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 border-r border-gray-300">Metric</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 w-[140px]">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 text-gray-700 border-r border-gray-300">Total Number of Clients / Participants</td>
                <td className="px-3 py-2 text-center font-bold text-gray-900">{summary.totalClients}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 text-gray-700 border-r border-gray-300">Total Number of CSF Responses Received</td>
                <td className="px-3 py-2 text-center font-bold text-gray-900">{summary.totalResponses}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 text-gray-700 border-r border-gray-300">Retrieval Rate</td>
                <td className="px-3 py-2 text-center font-bold text-gray-900">{summary.retrievalRate}%</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 text-gray-700 border-r border-gray-300">Overall Satisfaction Score (CSF Rating %)</td>
                <td className="px-3 py-2 text-center font-bold text-blue-700">
                  {summary.overallSatisfactionPct != null ? `${summary.overallSatisfactionPct}%` : '—'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-700 border-r border-gray-300">Adjectival Rating</td>
                <td className={`px-3 py-2 text-center font-bold ${getAdjectivalColor(summary.overallAdjectival ?? null)}`}>
                  {summary.overallAdjectival ?? '—'}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-gray-500 mt-2 italic">
            CSF Rating % = (Total Score ÷ (5 × n)) × 100 | Adjectival: Outstanding (≥90%), Very Satisfactory (≥80%), Satisfactory (≥70%), Fair (≥60%), Unsatisfactory (&lt;60%)
          </p>
        </div>

        {/* ── Part III: Service Quality Dimensions (SQD) Breakdown ── */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part III — Service Quality Dimensions (SQD) Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-gray-400">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-300" rowSpan={2}>Service Quality Dimension</th>
                  <th className="px-1 py-1 text-center font-bold text-gray-700 border-r border-gray-300" colSpan={5}>Rating Distribution</th>
                  <th className="px-2 py-1 text-center font-bold text-gray-700 border-r border-gray-300" rowSpan={2}>Total<br />Resp.</th>
                  <th className="px-2 py-1 text-center font-bold text-gray-700 border-r border-gray-300" rowSpan={2}>CSF<br />Rating %</th>
                  <th className="px-2 py-1 text-center font-bold text-gray-700" rowSpan={2}>Adjectival<br />Rating</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-400">
                  {[1, 2, 3, 4, 5].map(r => (
                    <th key={r} className="px-1 py-1.5 text-center font-semibold text-gray-600 border-r border-gray-300 w-10" title={RATING_LABELS[r]}>
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sqdBreakdown.map((sqd, idx) => (
                  <tr key={sqd.field} className={`border-b border-gray-300 ${idx === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="px-2 py-2 text-gray-800 border-r border-gray-300 leading-tight">
                      {SQD_FULL_LABELS[sqd.field] ?? sqd.label}
                    </td>
                    {sqd.ratingCounts.map((c, i) => (
                      <td key={i} className="px-1 py-2 text-center text-gray-700 border-r border-gray-300 font-mono">{c}</td>
                    ))}
                    <td className="px-2 py-2 text-center text-gray-700 border-r border-gray-300 font-semibold">{sqd.totalResponses}</td>
                    <td className="px-2 py-2 text-center font-bold text-gray-900 border-r border-gray-300">
                      {sqd.csfRatingPct != null ? `${sqd.csfRatingPct}%` : '—'}
                    </td>
                    <td className={`px-2 py-2 text-center font-semibold ${getAdjectivalColor(sqd.adjectival ?? null)}`}>
                      {sqd.adjectival ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 leading-tight">
            <p>Rating Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neither Agree nor Disagree, 4 = Agree, 5 = Strongly Agree</p>
          </div>
        </div>

        {/* ── Part IV: Citizen's Charter (CC) Awareness ── */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part IV — Citizen&apos;s Charter (CC) Awareness</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CC1 */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">CC1: Awareness of CC</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Response</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ccDistribution.cc1Awareness).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300 leading-tight">{CC1_LABELS[Number(k)] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalCC1 > 0 ? Math.round((count / totalCC1) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* CC2 */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">CC2: Visibility of CC</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Response</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ccDistribution.cc2Visibility).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300">{CC2_LABELS[Number(k)] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalCC2 > 0 ? Math.round((count / totalCC2) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* CC3 */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">CC3: Helpfulness of CC</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Response</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ccDistribution.cc3Usefulness).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300">{CC3_LABELS[Number(k)] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalCC3 > 0 ? Math.round((count / totalCC3) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Part V: Resource Person / Speaker Satisfaction ── */}
        {speakerSummary.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part V — Resource Person / Speaker Satisfaction</h2>
            <table className="w-full text-[11px] border border-gray-400">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-300">Name of Resource Person</th>
                  <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-300">Organization / Office</th>
                  <th className="px-2 py-2 text-left font-bold text-gray-700 border-r border-gray-300">Topic</th>
                  <th className="px-2 py-2 text-center font-bold text-gray-700 border-r border-gray-300 w-16">Mean</th>
                  <th className="px-2 py-2 text-center font-bold text-gray-700 border-r border-gray-300 w-16">CSF %</th>
                  <th className="px-2 py-2 text-center font-bold text-gray-700 w-12">n</th>
                </tr>
              </thead>
              <tbody>
                {speakerSummary.map((s) => (
                  <tr key={s.speakerId} className="border-b border-gray-300">
                    <td className="px-2 py-2 text-gray-900 font-medium border-r border-gray-300">{s.name}</td>
                    <td className="px-2 py-2 text-gray-700 border-r border-gray-300">{s.organization ?? '—'}</td>
                    <td className="px-2 py-2 text-gray-700 border-r border-gray-300">{s.topic ?? '—'}</td>
                    <td className="px-2 py-2 text-center text-gray-900 font-semibold border-r border-gray-300">{s.average}</td>
                    <td className="px-2 py-2 text-center font-bold text-blue-700 border-r border-gray-300">{s.csfPct}%</td>
                    <td className="px-2 py-2 text-center text-gray-600">{s.responseCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Part VI: Respondent Profile / Demographics ── */}
        <div className="px-6 py-4 border-b border-gray-300">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part VI — Respondent Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sex */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">A. Sex</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Category</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(demographics.sex).sort(([,a],[,b]) => b - a).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300">{SEX_LABELS[k] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalDemoSex > 0 ? Math.round((count / totalDemoSex) * 100) : 0}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-2 py-1.5 text-gray-900 border-r border-gray-300">Total</td>
                    <td className="px-2 py-1.5 text-center text-gray-900 border-r border-gray-300">{totalDemoSex}</td>
                    <td className="px-2 py-1.5 text-center text-gray-900">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Age */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">B. Age Bracket</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Age Group</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(demographics.ageBracket).sort(([,a],[,b]) => b - a).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300">{AGE_LABELS[k] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalDemoAge > 0 ? Math.round((count / totalDemoAge) * 100) : 0}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-2 py-1.5 text-gray-900 border-r border-gray-300">Total</td>
                    <td className="px-2 py-1.5 text-center text-gray-900 border-r border-gray-300">{totalDemoAge}</td>
                    <td className="px-2 py-1.5 text-center text-gray-900">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Client Type */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 mb-2">C. Client Type</h3>
              <table className="w-full text-[11px] border border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-r border-gray-300">Type</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12 border-r border-gray-300">n</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-12">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(demographics.clientType).sort(([,a],[,b]) => b - a).map(([k, count]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 text-gray-700 border-r border-gray-300">{CLIENT_LABELS[k] ?? k}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700 border-r border-gray-300">{count}</td>
                      <td className="px-2 py-1.5 text-center text-gray-700">{totalDemoClient > 0 ? Math.round((count / totalDemoClient) * 100) : 0}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-2 py-1.5 text-gray-900 border-r border-gray-300">Total</td>
                    <td className="px-2 py-1.5 text-center text-gray-900 border-r border-gray-300">{totalDemoClient}</td>
                    <td className="px-2 py-1.5 text-center text-gray-900">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Part VII: Open-ended Feedback ── */}
        {(feedback.highlights.length > 0 || feedback.improvements.length > 0 || feedback.comments.length > 0 || feedback.lowRatingReasons.length > 0) && (
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Part VII — Open-ended Feedback / Comments</h2>
            <div className="space-y-4">
              {[
                { title: 'A. Best Aspect / Highlights of the Activity', items: feedback.highlights },
                { title: 'B. Suggestions for Improvement', items: feedback.improvements },
                { title: 'C. Additional Comments / Suggestions', items: feedback.comments },
                { title: 'D. Reason/s for "Strongly Disagree" or "Disagree" rating', items: feedback.lowRatingReasons },
              ].filter(({ items }) => items.length > 0).map(({ title, items }) => {
                // Deduplicate: group by normalized text and count
                const grouped = new Map<string, { text: string; count: number }>();
                for (const raw of items) {
                  const key = raw.trim().toLowerCase();
                  const existing = grouped.get(key);
                  if (existing) { existing.count++; } else { grouped.set(key, { text: raw.trim(), count: 1 }); }
                }
                const unique = Array.from(grouped.values());
                return (
                <div key={title}>
                  <h3 className="text-[11px] font-bold text-gray-700 mb-1.5">
                    {title}
                    {unique.length < items.length && (
                      <span className="font-normal text-gray-400 ml-1">({unique.length} unique of {items.length} responses)</span>
                    )}
                  </h3>
                  <table className="w-full text-[11px] border border-gray-400">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-10 border-r border-gray-300">#</th>
                        <th className="px-2 py-1.5 text-left font-semibold text-gray-600">Response</th>
                        {unique.length < items.length && (
                          <th className="px-2 py-1.5 text-center font-semibold text-gray-600 w-14 border-l border-gray-300">Count</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {unique.map((item, i) => (
                        <tr key={i} className="border-b border-gray-200">
                          <td className="px-2 py-1.5 text-center text-gray-500 border-r border-gray-300">{i + 1}</td>
                          <td className="px-2 py-1.5 text-gray-700 leading-tight">{item.text}</td>
                          {unique.length < items.length && (
                            <td className="px-2 py-1.5 text-center text-gray-500 border-l border-gray-300">{item.count > 1 ? item.count : ''}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Certification / Signature Block ── */}
        <div className="px-6 py-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">Certification</h2>
          <p className="text-[11px] text-gray-700 leading-relaxed mb-6">
            I hereby certify that the above data and information are true and correct based on the Client Satisfaction Feedback (CSF)
            forms collected from the participants of the above-mentioned activity. This report is generated in compliance with
            Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018) and ARTA Memorandum Circular No. 2019-002.
          </p>
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-b border-gray-400 mb-1 h-8" />
              <p className="text-[11px] font-bold text-gray-700">Prepared by</p>
              <p className="text-[10px] text-gray-500">Signature over Printed Name / Date</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 mb-1 h-8" />
              <p className="text-[11px] font-bold text-gray-700">Noted by</p>
              <p className="text-[10px] text-gray-500">Division Chief / Supervisor / Date</p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-2 border-t border-gray-300 bg-gray-50 text-center">
          <p className="text-[9px] text-gray-400">
            FM-CSF-ACT-RPT — Generated by DTI Region VII Event Management System on {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          #csf-report-printable { page-break-inside: auto; }
          #csf-report-printable > div { page-break-inside: avoid; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

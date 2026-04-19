import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizerApi, eventsApi } from '@/lib/api';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';
import dtiLogo from '@/assets/dti-logo.jpg';

/* ── FM-CT-2A Attendance Sheet (External) ─────────────────────────────────── */
/* Exact replica of the official DTI form: Document Code FM-CT-2A v1          */
/* Print-ready A4 landscape layout                                             */

const AGE_LABELS: Record<string, string> = {
  AGE_19_OR_LOWER: '12-35 y/o',
  AGE_20_TO_34: '12-35 y/o',
  AGE_35_TO_49: 'Above 35-below 60 y/o',
  AGE_50_TO_64: 'Above 35-below 60 y/o',
  AGE_65_OR_HIGHER: '60 y/o & above',
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  SELF_EMPLOYED: 'Self-employed',
  EMPLOYED_GOVERNMENT: 'Employed (Govt/Private)',
  EMPLOYED_PRIVATE: 'Employed (Govt/Private)',
  GENERAL_PUBLIC: 'General Public',
};

const SOCIAL_LABELS: Record<string, string> = {
  ABLED: 'Abled',
  PWD: 'PWD',
  FOUR_PS: '4Ps',
  YOUTH: 'Youth',
  SENIOR_CITIZEN: 'Senior Citizen',
  INDIGENOUS_PERSON: 'Indigenous Person',
  OFW: 'OFW',
  OTHERS: 'Others',
};

export function OrganizerAttendanceSheetPage() {
  const { id } = useParams<{ id: string }>();

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  const { data: participantsData, isLoading } = useQuery({
    queryKey: ['event-attendance-sheet', id],
    queryFn: () => organizerApi.getAttendanceSheet(id!),
    enabled: Boolean(id),
  });

  const event = eventData?.data as any;
  const participants: any[] = (participantsData?.data as any) ?? [];
  // Show all participants (the endpoint already returns enriched data)
  const attendees = participants;

  // Create empty rows to fill up to at least 15 rows (like the official form)
  const minRows = 15;
  const totalRows = Math.max(minRows, attendees.length);

  if (isLoading) return <div className="card text-center py-16 text-gray-400">Loading Attendance Sheet…</div>;

  return (
    <div className="max-w-[1200px] mx-auto">
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

      {/* ═══════════════ OFFICIAL FORM BODY ═══════════════ */}
      <div className="bg-white border border-gray-300 print:border-0 print:shadow-none" id="attendance-sheet-printable">

        {/* ── Header with Logo ── */}
        <div className="px-6 pt-4 pb-3">
          <div className="flex items-start justify-between">
            {/* Left: DTI Logo */}
            <div className="flex items-center gap-3">
              <img src={dtiLogo} alt="DTI Logo" className="w-16 h-16 object-contain" />
              <div>
                <p className="text-[10px] text-gray-500 italic">PHILIPPINES</p>
                <p className="text-[10px] font-bold text-[#003087]">BAGONG PILIPINAS</p>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1">
              <p className="text-sm font-bold tracking-wide uppercase text-gray-900">ATTENDANCE SHEET</p>
              <p className="text-xs text-gray-600">(EXTERNAL)</p>
            </div>

            {/* Right: Document Code */}
            <div className="text-right text-[10px] text-gray-600 leading-tight">
              <p>Document Code: <span className="font-semibold text-gray-800">FM-CT-2A</span></p>
              <p>Version No.: <span className="font-semibold text-gray-800">1</span></p>
              <p>Effectivity Date: <span className="font-semibold text-gray-800">February 1, 2024</span></p>
            </div>
          </div>
        </div>

        {/* ── Event Details ── */}
        <div className="px-6 pb-3">
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="py-1.5 font-semibold text-gray-700 w-[140px]">TITLE OF EVENT:</td>
                <td className="py-1.5 text-gray-900 border-b border-gray-400 font-medium">
                  {event?.title ?? ''}
                </td>
                <td className="py-1.5 font-semibold text-gray-700 w-[60px] pl-4">DATE :</td>
                <td className="py-1.5 text-gray-900 border-b border-gray-400 w-[160px]">
                  {event?.startDate ? format(new Date(event.startDate), 'MMMM d, yyyy') : ''}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold text-gray-700">VENUE :</td>
                <td className="py-1.5 text-gray-900 border-b border-gray-400">
                  {event?.venue ?? ''}
                </td>
                <td className="py-1.5 font-semibold text-gray-700 pl-4">TIME :</td>
                <td className="py-1.5 text-gray-900 border-b border-gray-400">
                  {event?.startDate ? format(new Date(event.startDate), 'h:mm a') : ''}
                  {event?.endDate ? ` - ${format(new Date(event.endDate), 'h:mm a')}` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Main Table ── */}
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-[9px] border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-500 px-1 py-1 text-center font-bold text-gray-700 w-[24px]" rowSpan={2}></th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 min-w-[140px]" rowSpan={2}>
                  Name<br /><span className="font-normal text-gray-500">(Title, First, Middle, Last, Suffix)</span>
                </th>
                <th className="border border-gray-500 px-1 py-1 text-center font-bold text-gray-700" colSpan={2}>Sex</th>
                <th className="border border-gray-500 px-1 py-1 text-center font-bold text-gray-700" colSpan={3}>Age</th>
                <th className="border border-gray-500 px-1 py-1 text-center font-bold text-gray-700" colSpan={3}>CATEGORY</th>
                <th className="border border-gray-500 px-1 py-1 text-center font-bold text-gray-700" colSpan={8}>SOCIAL CLASSIFICATION</th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 min-w-[80px]" rowSpan={2}>Company/Office</th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 min-w-[80px]" rowSpan={2}>Address</th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 min-w-[100px]" rowSpan={2}>E-mail Address</th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 min-w-[70px]" rowSpan={2}>Contact No.</th>
                <th className="border border-gray-500 px-1 py-2 text-center font-bold text-gray-700 w-[50px]" rowSpan={2}>Signature</th>
              </tr>
              <tr className="bg-gray-50">
                {/* Sex */}
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[18px]">F</th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[18px]">M</th>
                {/* Age */}
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[28px]">
                  <span className="text-[7px] leading-tight block">12-35<br />y/o</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[34px]">
                  <span className="text-[7px] leading-tight block">Above 35-<br />below<br />60 y/o</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[28px]">
                  <span className="text-[7px] leading-tight block">60 y/o<br />&amp;<br />above</span>
                </th>
                {/* Category */}
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[34px]">
                  <span className="text-[7px] leading-tight block">Self-<br />employed</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[38px]">
                  <span className="text-[7px] leading-tight block">Employed<br />(Govt/<br />Private)</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[34px]">
                  <span className="text-[7px] leading-tight block">General<br />Public</span>
                </th>
                {/* Social Classification */}
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[24px]">
                  <span className="text-[7px]">Abled</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[24px]">
                  <span className="text-[7px]">PWD</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[20px]">
                  <span className="text-[7px]">4Ps</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[24px]">
                  <span className="text-[7px]">Youth</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[30px]">
                  <span className="text-[7px] leading-tight block">Senior<br />Citizen</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[34px]">
                  <span className="text-[7px] leading-tight block">Indige-<br />nous<br />Person</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[24px]">
                  <span className="text-[7px]">OFW</span>
                </th>
                <th className="border border-gray-500 px-0.5 py-1 text-center font-semibold text-gray-600 w-[28px]">
                  <span className="text-[7px]">Others</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRows }).map((_, idx) => {
                const p = attendees[idx];
                const sex = p?.participantSex ?? p?.sex ?? '';
                const ageBracket = p?.participantAgeBracket ?? p?.ageBracket ?? '';
                const employment = p?.participantEmployment ?? p?.employmentCategory ?? '';
                const social = p?.participantSocial ?? p?.socialClassification ?? '';

                // Determine age group
                const isYoung = ['AGE_19_OR_LOWER', 'AGE_20_TO_34'].includes(ageBracket);
                const isMid = ['AGE_35_TO_49', 'AGE_50_TO_64'].includes(ageBracket);
                const isSenior = ageBracket === 'AGE_65_OR_HIGHER';

                return (
                  <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="border border-gray-400 px-1 py-1.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="border border-gray-400 px-1.5 py-1.5 text-gray-900 font-medium">
                      {p ? (p.participantName ?? '—') : ''}
                    </td>
                    {/* Sex */}
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{sex === 'FEMALE' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{sex === 'MALE' ? '✓' : ''}</td>
                    {/* Age */}
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{isYoung ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{isMid ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{isSenior ? '✓' : ''}</td>
                    {/* Category */}
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{employment === 'SELF_EMPLOYED' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{['EMPLOYED_GOVERNMENT', 'EMPLOYED_PRIVATE'].includes(employment) ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{employment === 'GENERAL_PUBLIC' ? '✓' : ''}</td>
                    {/* Social Classification */}
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'ABLED' || (!social && p) ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'PWD' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'FOUR_PS' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'YOUTH' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'SENIOR_CITIZEN' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'INDIGENOUS_PERSON' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'OFW' ? '✓' : ''}</td>
                    <td className="border border-gray-400 px-0.5 py-1.5 text-center">{social === 'OTHERS' ? '✓' : ''}</td>
                    {/* Company/Office */}
                    <td className="border border-gray-400 px-1 py-1.5 text-[8px] text-gray-700">
                      {p?.participantCompany ?? p?.enterprise?.businessName ?? ''}
                    </td>
                    {/* Address */}
                    <td className="border border-gray-400 px-1 py-1.5 text-[8px] text-gray-700">
                      {p?.participantAddress ?? ''}
                    </td>
                    {/* Email */}
                    <td className="border border-gray-400 px-1 py-1.5 text-[8px] text-gray-700">
                      {p?.participantEmail ?? ''}
                    </td>
                    {/* Contact */}
                    <td className="border border-gray-400 px-1 py-1.5 text-[8px] text-gray-700">
                      {p?.participantMobile ?? ''}
                    </td>
                    {/* Signature (empty for print) */}
                    <td className="border border-gray-400 px-1 py-1.5"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          #attendance-sheet-printable { page-break-inside: auto; }
          @page { margin: 0.5cm; size: A4 landscape; }
          table { font-size: 8px !important; }
        }
      `}</style>
    </div>
  );
}

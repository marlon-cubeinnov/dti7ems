import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checklistApi, eventsApi } from '@/lib/api';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';
import dtiLogo from '@/assets/dti-logo.jpg';

/* ── FM-CT-7 Conduct of Training Monitoring Checklist ─────────────────────── */
/* Exact replica of the official DTI form: Document Code FM-CT-7 v0           */
/* Print-ready A4 portrait layout                                              */

const PHASE_MAP: Record<string, string> = {
  PLANNING: 'PART 1\nPRE-TRAINING',
  PREPARATION: 'PART 1\nPRE-TRAINING',
  EXECUTION: 'PART 2\nACTUAL TRAINING',
  POST_EVENT: 'PART 3\nPOST-TRAINING',
};

const STATUS_DISPLAY: Record<string, string> = {
  NOT_STARTED: '',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  CANCELLED: 'Cancelled',
};

export function OrganizerChecklistPrintPage() {
  const { id } = useParams<{ id: string }>();

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  const { data: checklistsData, isLoading } = useQuery({
    queryKey: ['checklists', id],
    queryFn: () => checklistApi.getChecklists(id!),
    enabled: Boolean(id),
  });

  const event = eventData?.data as any;
  const checklists: any[] = (checklistsData?.data ?? []) as any[];
  const checklist = checklists[0]; // primary checklist
  const items: any[] = checklist?.items ?? [];

  // Group items by phase for the official form layout
  const preTraining = items.filter((i: any) => ['PLANNING', 'PREPARATION'].includes(i.phase));
  const actualTraining = items.filter((i: any) => i.phase === 'EXECUTION');
  const postTraining = items.filter((i: any) => i.phase === 'POST_EVENT');

  if (isLoading) return <div className="card text-center py-16 text-gray-400">Loading Checklist…</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Non-print toolbar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/organizer/events/${id}/checklist`} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
          <ArrowLeft size={18} /> Back to Checklist
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* ═══════════════ OFFICIAL FORM BODY ═══════════════ */}
      <div className="bg-white border border-gray-300 print:border-0 print:shadow-none" id="checklist-printable">

        {/* ── Header with Logo ── */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-start justify-between">
            {/* Left: DTI Logo */}
            <div className="flex items-center gap-3">
              <img src={dtiLogo} alt="DTI Logo" className="w-14 h-14 object-contain" />
              <div>
                <p className="text-[9px] text-gray-500 italic">PHILIPPINES</p>
                <p className="text-[9px] font-bold text-[#003087]">BAGONG PILIPINAS</p>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center flex-1 px-4">
              <p className="text-sm font-bold tracking-wide uppercase text-gray-900">DEPARTMENT OF TRADE AND INDUSTRY</p>
              <p className="text-base font-bold tracking-wide uppercase text-gray-900 mt-1">CONDUCT OF TRAINING MONITORING CHECKLIST</p>
            </div>

            {/* Right: Document Code */}
            <div className="text-right text-[10px] text-gray-600 leading-tight">
              <p>Document Code: <span className="font-semibold text-gray-800">FM-CT-7</span></p>
              <p>Version No.: <span className="font-semibold text-gray-800">0</span></p>
              <p>Effectivity Date: <span className="font-semibold text-gray-800">January 02, 2026</span></p>
            </div>
          </div>
        </div>

        {/* ── Training Info ── */}
        <div className="px-8 pb-4">
          <div className="border-b-2 border-gray-400 pb-2 mb-1">
            <p className="text-xs">
              <span className="font-bold text-gray-700">TITLE OF TRAINING:</span>{' '}
              <span className="text-gray-900 border-b border-gray-400 inline-block min-w-[300px]">
                {event?.title ?? '_____________________________________'}
              </span>
            </p>
          </div>
          <div className="border-b-2 border-gray-400 pb-2">
            <p className="text-xs">
              <span className="font-bold text-gray-700">DATE:</span>{' '}
              <span className="text-gray-900 border-b border-gray-400 inline-block min-w-[200px]">
                {event?.startDate ? format(new Date(event.startDate), 'MMMM d, yyyy') : '_________________________'}
              </span>
            </p>
          </div>
        </div>

        {/* ── Main Table ── */}
        <div className="px-6 pb-4">
          <table className="w-full text-[10px] border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[100px]">Phase</th>
                <th className="border border-gray-500 px-2 py-2 text-left font-bold text-gray-700">Task/Activity</th>
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[70px]">Applicable<br />(Yes or No)</th>
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[90px]">Responsible<br />Person</th>
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[80px]">Deadline</th>
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[70px]">Status</th>
                <th className="border border-gray-500 px-2 py-2 text-center font-bold text-gray-700 w-[90px]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {/* PART 1: PRE-TRAINING */}
              {preTraining.length > 0 && (
                <>
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={preTraining.length}>
                      PART 1{'\n'}PRE-TRAINING
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{preTraining[0]?.title}</td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {preTraining[0]?.status === 'CANCELLED' ? 'No' : 'Yes'}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                      {preTraining[0]?.assignedToName ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {preTraining[0]?.dueDate ? format(new Date(preTraining[0].dueDate), 'MMM d') : ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {STATUS_DISPLAY[preTraining[0]?.status] ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                      {preTraining[0]?.notes ?? ''}
                    </td>
                  </tr>
                  {preTraining.slice(1).map((item: any, idx: number) => (
                    <tr key={item.id ?? idx}>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{item.title}</td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.status === 'CANCELLED' ? 'No' : 'Yes'}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                        {item.assignedToName ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.dueDate ? format(new Date(item.dueDate), 'MMM d') : ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {STATUS_DISPLAY[item.status] ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                        {item.notes ?? ''}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Empty spacer row between sections */}
              <tr><td colSpan={7} className="border border-gray-500 h-3 bg-white"></td></tr>

              {/* PART 2: ACTUAL TRAINING */}
              {actualTraining.length > 0 && (
                <>
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={actualTraining.length}>
                      PART 2{'\n'}ACTUAL TRAINING
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{actualTraining[0]?.title}</td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {actualTraining[0]?.status === 'CANCELLED' ? 'No' : 'Yes'}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                      {actualTraining[0]?.assignedToName ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {actualTraining[0]?.dueDate ? format(new Date(actualTraining[0].dueDate), 'MMM d') : ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {STATUS_DISPLAY[actualTraining[0]?.status] ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                      {actualTraining[0]?.notes ?? ''}
                    </td>
                  </tr>
                  {actualTraining.slice(1).map((item: any, idx: number) => (
                    <tr key={item.id ?? idx}>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{item.title}</td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.status === 'CANCELLED' ? 'No' : 'Yes'}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                        {item.assignedToName ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.dueDate ? format(new Date(item.dueDate), 'MMM d') : ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {STATUS_DISPLAY[item.status] ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                        {item.notes ?? ''}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Empty spacer row between sections */}
              <tr><td colSpan={7} className="border border-gray-500 h-3 bg-white"></td></tr>

              {/* PART 3: POST-TRAINING */}
              {postTraining.length > 0 && (
                <>
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={postTraining.length}>
                      PART 3{'\n'}POST-TRAINING
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{postTraining[0]?.title}</td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {postTraining[0]?.status === 'CANCELLED' ? 'No' : 'Yes'}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                      {postTraining[0]?.assignedToName ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {postTraining[0]?.dueDate ? format(new Date(postTraining[0].dueDate), 'MMM d') : ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                      {STATUS_DISPLAY[postTraining[0]?.status] ?? ''}
                    </td>
                    <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                      {postTraining[0]?.notes ?? ''}
                    </td>
                  </tr>
                  {postTraining.slice(1).map((item: any, idx: number) => (
                    <tr key={item.id ?? idx}>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-800">{item.title}</td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.status === 'CANCELLED' ? 'No' : 'Yes'}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700 text-[9px]">
                        {item.assignedToName ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {item.dueDate ? format(new Date(item.dueDate), 'MMM d') : ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-center text-gray-700">
                        {STATUS_DISPLAY[item.status] ?? ''}
                      </td>
                      <td className="border border-gray-500 px-2 py-1.5 text-gray-600 text-[9px]">
                        {item.notes ?? ''}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* If no items yet, show empty template rows */}
              {items.length === 0 && (
                <>
                  {/* Pre-Training placeholder */}
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={5}>
                      PART 1{'\n'}PRE-TRAINING
                    </td>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <td key={i} className="border border-gray-500 px-2 py-3"></td>
                    ))}
                  </tr>
                  {[1,2,3,4].map(r => (
                    <tr key={`pre-${r}`}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <td key={i} className="border border-gray-500 px-2 py-3"></td>
                      ))}
                    </tr>
                  ))}
                  <tr><td colSpan={7} className="border border-gray-500 h-3"></td></tr>
                  {/* Actual Training placeholder */}
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={4}>
                      PART 2{'\n'}ACTUAL TRAINING
                    </td>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <td key={i} className="border border-gray-500 px-2 py-3"></td>
                    ))}
                  </tr>
                  {[1,2,3].map(r => (
                    <tr key={`act-${r}`}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <td key={i} className="border border-gray-500 px-2 py-3"></td>
                      ))}
                    </tr>
                  ))}
                  <tr><td colSpan={7} className="border border-gray-500 h-3"></td></tr>
                  {/* Post-Training placeholder */}
                  <tr>
                    <td className="border border-gray-500 px-2 py-1 text-center font-bold text-gray-700 bg-gray-50 whitespace-pre-line text-[9px]" rowSpan={4}>
                      PART 3{'\n'}POST-TRAINING
                    </td>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <td key={i} className="border border-gray-500 px-2 py-3"></td>
                    ))}
                  </tr>
                  {[1,2,3].map(r => (
                    <tr key={`post-${r}`}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <td key={i} className="border border-gray-500 px-2 py-3"></td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Notes ── */}
        <div className="px-8 pb-3">
          <p className="text-[9px] text-gray-600 leading-relaxed">
            <span className="font-bold">NOTE:</span><br />
            - This checklist must be attached to the Post Activity Report.<br />
            - The Training Coordinator may include additional tasks or activities relevant to the specific training conducted
          </p>
        </div>

        {/* ── Signature Block ── */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-3 gap-8 mt-4">
            <div className="text-center">
              <div className="border-b border-gray-400 mb-1 h-10" />
              <p className="text-[10px] font-bold text-gray-700">PREPARED BY:</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 mb-1 h-10" />
              <p className="text-[10px] font-bold text-gray-700">REVIEWED BY:</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 mb-1 h-10" />
              <p className="text-[10px] font-bold text-gray-700">NOTED BY:</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          #checklist-printable { page-break-inside: auto; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tnaApi } from '@/lib/api';
import { ClipboardList, ChevronRight, PlusCircle, CheckCircle2, FileEdit } from 'lucide-react';

export default function OrganizerTnaList() {
  const { data } = useQuery({
    queryKey: ['tna-list'],
    queryFn: () => tnaApi.listTnas({ limit: 100 }),
  });

  const tnas = ((data as Record<string, unknown>)?.data as unknown[]) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training Needs Assessment (TNA)</h1>
          <p className="text-sm text-gray-500 mt-0.5">TNA is conducted independently to justify or reference a proposal. Not all events require one.</p>
        </div>
        <RouterLink to="/organizer/tna/new"
          className="btn-primary text-sm flex items-center gap-1.5">
          <PlusCircle size={15} /> New TNA
        </RouterLink>
      </div>

      {tnas.length === 0 && (
        <div className="card text-center py-12">
          <ClipboardList size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No TNA records yet.</p>
          <RouterLink to="/organizer/tna/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
            <PlusCircle size={14} /> Create your first TNA
          </RouterLink>
        </div>
      )}

      <div className="space-y-2">
        {tnas.map((t: unknown) => {
          const tna = t as Record<string, unknown>;
          const finalized = tna.status === 'FINALIZED';
          const conductedAt = tna.conductedAt as string | undefined;
          const formatted = conductedAt
            ? new Date(conductedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Date not set';
          const respondentCount = (tna._count as Record<string, number>)?.respondents ?? 0;
          return (
            <div key={tna.id as string} className="card flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{tna.title as string}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    finalized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{finalized ? 'Finalized' : 'Draft'}</span>
                  {finalized && <CheckCircle2 size={13} className="text-green-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {tna.sector as string} · {formatted} · {respondentCount} respondent{respondentCount !== 1 ? 's' : ''}
                </p>
              </div>
              <RouterLink
                to={`/organizer/tna/${tna.id}`}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium shrink-0"
              >
                <FileEdit size={14} /> Open <ChevronRight size={14} />
              </RouterLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}

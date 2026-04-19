import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizerApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { PlusCircle, Eye, FileText, Pencil } from 'lucide-react';

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  DRAFT:        'bg-gray-100 text-gray-600',
  SUBMITTED:    'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED:     'bg-green-100 text-green-700',
  REJECTED:     'bg-red-100 text-red-600',
};

export function OrganizerProposalListPage() {
  const { user } = useAuthStore();

  const isTechnicalStaff = user?.role === 'PROGRAM_MANAGER';
  const isDC = user?.role === 'DIVISION_CHIEF';
  const isRD = user?.role === 'REGIONAL_DIRECTOR' || user?.role === 'PROVINCIAL_DIRECTOR';
  const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isApprover = isDC || isRD;

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-proposals'],
    queryFn: () => organizerApi.listMyEvents({ limit: 50, view: 'proposals' }),
  });

  const proposals: any[] = Array.isArray((data as any)?.data) ? (data as any).data : [];

  const pageTitle = isDC
    ? 'Proposals for Review'
    : isRD
    ? 'Proposals for Approval'
    : 'My Proposals';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-dti-blue" />
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        {(isTechnicalStaff || isAdmin) && (
          <Link to="/organizer/proposals/new" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> New Proposal
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="card text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : proposals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-3">
            {isApprover ? 'No proposals in your queue.' : 'No proposals yet.'}
          </p>
          {(isTechnicalStaff || isAdmin) && (
            <Link to="/organizer/proposals/new" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle size={16} /> Create your first proposal
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Training Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Mode</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Proposal Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proposals.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/organizer/proposals/${p.id}`} className="font-medium text-dti-blue hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {new Date(p.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {p.deliveryMode.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PROPOSAL_STATUS_COLORS[p.proposalStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                      {(p.proposalStatus ?? 'DRAFT').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/organizer/proposals/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={13} /> View
                      </Link>
                      {isApprover && (
                        <Link
                          to={`/organizer/proposals/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Review
                        </Link>
                      )}
                      {(isTechnicalStaff || isAdmin) && (p.proposalStatus === 'DRAFT' || p.proposalStatus === 'REJECTED') && (
                        <Link
                          to={`/organizer/proposals/${p.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Pencil size={13} /> Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

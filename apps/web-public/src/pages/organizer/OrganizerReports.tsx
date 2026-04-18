import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { organizerApi } from '@/lib/api';
import { BarChart3, Users, CheckCircle, Award, Calendar, TrendingUp, Star } from 'lucide-react';

const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  REGISTRATION_OPEN: 'Reg. Open',
  REGISTRATION_CLOSED: 'Reg. Closed',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN: 'bg-green-100 text-green-700',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-700',
  ONGOING: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export function OrganizerReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['organizer-reports-summary'],
    queryFn: () => organizerApi.getMySummary(),
  });

  const report = (data as any)?.data;

  if (isLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading reports…</div>;
  }

  if (!report) {
    return <div className="card text-center py-16 text-gray-400">No report data available.</div>;
  }

  const { summary, recentEvents } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={24} /> Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Track the effectiveness and success of your events</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: summary.totalEvents, icon: Calendar, color: 'text-blue-600' },
          { label: 'Total Participants', value: summary.totalParticipations, icon: Users, color: 'text-green-600' },
          { label: 'Attendance Rate', value: `${summary.overallAttendanceRate}%`, icon: CheckCircle, color: 'text-purple-600' },
          { label: 'Certificates Issued', value: summary.issuedCertificates, icon: Award, color: 'text-teal-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <Icon size={28} className={color} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Event Status Breakdown */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Event Status Breakdown</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(summary.byStatus as Record<string, number>).map(([status, count]) => (
            <div key={status} className={`px-4 py-2 rounded-full text-sm font-medium ${EVENT_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
              {EVENT_STATUS_LABELS[status] ?? status}: {count}
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSF Scores */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Star size={18} className="text-yellow-400" /> Average CSF Scores
          </h2>
          <p className="text-xs text-gray-400 mb-4">CSF Response Rate: {summary.csfResponseRate}%</p>
          {summary.avgCsfScores ? (
            <div className="space-y-3">
              {[
                { label: 'Overall', value: summary.avgCsfScores.overallRating },
                { label: 'Content', value: summary.avgCsfScores.contentRating },
                { label: 'Facilitator', value: summary.avgCsfScores.facilitatorRating },
                { label: 'Logistics', value: summary.avgCsfScores.logisticsRating },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-400 h-3 rounded-full transition-all"
                      style={{ width: `${value ? (Number(value) / 5) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10 text-right">
                    {value ? Number(value).toFixed(1) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No CSF data yet.</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp size={18} /> Performance Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Attended Participants</span>
              <span className="text-sm font-bold text-gray-900">{summary.attendedParticipations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Overall Attendance Rate</span>
              <span className={`text-sm font-bold ${summary.overallAttendanceRate >= 80 ? 'text-green-600' : summary.overallAttendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {summary.overallAttendanceRate}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Certificates</span>
              <span className="text-sm font-bold text-gray-900">{summary.totalCertificates}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">CSF Response Rate</span>
              <span className={`text-sm font-bold ${summary.csfResponseRate >= 80 ? 'text-green-600' : summary.csfResponseRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {summary.csfResponseRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Events */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Completed Events</h2>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No completed events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-3 py-2 font-semibold text-gray-600">Event</th>
                  <th className="px-3 py-2 font-semibold text-gray-600">Date</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-center">Participants</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-center">Attended</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-center">Rate</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 text-center">CSF</th>
                  <th className="px-3 py-2 font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentEvents.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{evt.title}</p>
                      {evt.targetSector && <p className="text-xs text-gray-400">{evt.targetSector}</p>}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {new Date(evt.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700">{evt._count?.participations ?? 0}</td>
                    <td className="px-3 py-2 text-center text-gray-700">{evt.attended}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-medium ${evt.attendanceRate >= 80 ? 'text-green-600' : evt.attendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {evt.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700">{evt.csfSubmitted}</td>
                    <td className="px-3 py-2 text-right">
                      <Link to={`/organizer/events/${evt.id}/report`} className="text-dti-blue hover:underline text-xs">
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

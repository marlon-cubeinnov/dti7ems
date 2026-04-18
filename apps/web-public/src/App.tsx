import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';
import { OrganizerLayout } from '@/components/layout/OrganizerLayout';
import { HomePage } from '@/pages/Home';
import { EventListPage } from '@/pages/events/EventList';
import { EventDetailPage } from '@/pages/events/EventDetail';
import { LoginPage } from '@/pages/auth/Login';
import { RegisterPage } from '@/pages/auth/Register';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmail';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword';
import { ResetPasswordPage } from '@/pages/auth/ResetPassword';
import { AcceptInvitePage } from '@/pages/auth/AcceptInvite';
import { VerifyCertificatePage } from '@/pages/VerifyCertificate';
import { DirectoryPage } from '@/pages/Directory';
import { DashboardPage } from '@/pages/participant/Dashboard';
import { MyEventsPage } from '@/pages/participant/MyEvents';
import { ProfilePage } from '@/pages/participant/Profile';
import { TNAPage } from '@/pages/participant/TNA';
import { MyCertificatesPage } from '@/pages/participant/MyCertificates';
import { MyQrPage } from '@/pages/participant/MyQr';
import { CsfSurveyPage } from '@/pages/participant/CsfSurvey';
import { ImpactSurveyPage } from '@/pages/participant/ImpactSurvey';
import { OrganizerDashboardPage } from '@/pages/organizer/OrganizerDashboard';
import { OrganizerEventsPage } from '@/pages/organizer/OrganizerEvents';
import { OrganizerEventFormPage } from '@/pages/organizer/OrganizerEventForm';
import { OrganizerEventDetailPage } from '@/pages/organizer/OrganizerEventDetail';
import { OrganizerQrScannerPage } from '@/pages/organizer/OrganizerQrScanner';
import { OrganizerParticipantListPage } from '@/pages/organizer/OrganizerParticipantList';
import { OrganizerCsfResultsPage } from '@/pages/organizer/OrganizerCsfResults';
import { OrganizerChecklistPage } from '@/pages/organizer/OrganizerChecklist';
import { OrganizerEventReportPage } from '@/pages/organizer/OrganizerEventReport';
import { OrganizerReportsPage } from '@/pages/organizer/OrganizerReports';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboard';
import { AdminUsersPage } from '@/pages/admin/AdminUsers';
import { AdminEventsPage } from '@/pages/admin/AdminEvents';
import { AdminEnterprisesPage } from '@/pages/admin/AdminEnterprises';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogs';
import { AdminReportsPage } from '@/pages/admin/AdminReports';
import { AdminSettingsPage } from '@/pages/admin/AdminSettings';
import { AdminRolesPermissionsPage } from '@/pages/admin/AdminRolesPermissions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ORGANIZER_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/"             element={<HomePage />} />
        <Route path="/events"       element={<EventListPage />} />
        <Route path="/events/:id"   element={<EventDetailPage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/accept-invite"   element={<AcceptInvitePage />} />
        <Route path="/verify/:code"    element={<VerifyCertificatePage />} />
        <Route path="/directory"       element={<DirectoryPage />} />
      </Route>

      {/* Organizer / Admin portal */}
      <Route element={<ProtectedRoute roles={[...ORGANIZER_ROLES]} />}>
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer/dashboard"          element={<OrganizerDashboardPage />} />
          <Route path="/organizer/events"             element={<OrganizerEventsPage />} />
          <Route path="/organizer/events/new"         element={<OrganizerEventFormPage />} />
          <Route path="/organizer/events/:id"                    element={<OrganizerEventDetailPage />} />
          <Route path="/organizer/events/:id/edit"               element={<OrganizerEventFormPage />} />
          <Route path="/organizer/events/:id/scan"               element={<OrganizerQrScannerPage />} />
          <Route path="/organizer/events/:id/participants"       element={<OrganizerParticipantListPage />} />
          <Route path="/organizer/events/:id/csf-results"        element={<OrganizerCsfResultsPage />} />
          <Route path="/organizer/events/:id/checklist"          element={<OrganizerChecklistPage />} />
          <Route path="/organizer/events/:id/report"             element={<OrganizerEventReportPage />} />
          <Route path="/organizer/reports"                       element={<OrganizerReportsPage />} />
          <Route path="/organizer/profile"            element={<ProfilePage />} />

          {/* Admin-only routes (sidebar gated in OrganizerLayout) */}
          <Route path="/admin/dashboard"    element={<AdminDashboardPage />} />
          <Route path="/admin/users"        element={<AdminUsersPage />} />
          <Route path="/admin/enterprises"  element={<AdminEnterprisesPage />} />
          <Route path="/admin/events"       element={<AdminEventsPage />} />
          <Route path="/admin/audit-logs"   element={<AdminAuditLogsPage />} />
          <Route path="/admin/reports"      element={<AdminReportsPage />} />
          <Route path="/admin/roles"        element={<AdminRolesPermissionsPage />} />
          <Route path="/admin/settings"     element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Participant portal — requires auth, non-organizer roles */}
      <Route element={<ProtectedRoute roles={['PARTICIPANT', 'ENTERPRISE_REPRESENTATIVE']} />}>
        <Route element={<ParticipantLayout />}>
          <Route path="/dashboard"           element={<DashboardPage />} />
          <Route path="/my-events"           element={<MyEventsPage />} />
          <Route path="/my-events/:participationId/tna" element={<TNAPage />} />
          <Route path="/my-events/:participationId/qr"  element={<MyQrPage />} />
          <Route path="/my-events/:participationId/csf" element={<CsfSurveyPage />} />
          <Route path="/my-events/:participationId/impact" element={<ImpactSurveyPage />} />
          <Route path="/my-certificates"     element={<MyCertificatesPage />} />
          <Route path="/profile"             element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

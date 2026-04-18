import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { EnterprisesPage } from './pages/Enterprises';
import { EventsPage } from './pages/Events';
import { AuditLogsPage } from './pages/AuditLogs';
import { ReportsPage } from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/enterprises" element={<EnterprisesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

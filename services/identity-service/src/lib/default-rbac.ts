export const DEFAULT_PERMISSIONS = [
  { code: 'users.view_own', label: 'View Own Profile', group: 'Users' },
  { code: 'users.edit_own', label: 'Edit Own Profile', group: 'Users' },
  { code: 'users.view_all', label: 'View All Users', group: 'Users' },
  { code: 'users.manage', label: 'Manage Users (Role/Status)', group: 'Users' },

  { code: 'events.view', label: 'View Public Events', group: 'Events' },
  { code: 'events.create', label: 'Create Events', group: 'Events' },
  { code: 'events.edit_own', label: 'Edit Own Events', group: 'Events' },
  { code: 'events.manage_all', label: 'Manage All Events', group: 'Events' },
  { code: 'events.delete', label: 'Delete Events', group: 'Events' },

  { code: 'programs.create', label: 'Create Programs', group: 'Programs' },

  { code: 'proposals.review', label: 'Review Proposals', group: 'Proposals' },
  { code: 'proposals.approve', label: 'Approve Proposals', group: 'Proposals' },

  { code: 'tna.view', label: 'View TNA Records', group: 'TNA' },
  { code: 'tna.create', label: 'Create TNA Records', group: 'TNA' },
  { code: 'tna.edit_own', label: 'Edit Own TNA Records', group: 'TNA' },
  { code: 'tna.manage_all', label: 'Manage All TNA Records', group: 'TNA' },

  { code: 'participants.register', label: 'Register for Events', group: 'Participants' },
  { code: 'participants.view_own', label: 'View Own Registrations', group: 'Participants' },
  { code: 'participants.manage', label: 'Manage Participants', group: 'Participants' },
  { code: 'participants.export', label: 'Export Participant Data', group: 'Participants' },

  { code: 'attendance.scan_qr', label: 'Scan QR Attendance', group: 'Attendance' },
  { code: 'attendance.manual', label: 'Manual Check-in', group: 'Attendance' },
  { code: 'attendance.view', label: 'View Attendance Records', group: 'Attendance' },

  { code: 'certificates.view_own', label: 'View Own Certificates', group: 'Certificates' },
  { code: 'certificates.issue', label: 'Issue Certificates', group: 'Certificates' },
  { code: 'certificates.revoke', label: 'Revoke Certificates', group: 'Certificates' },

  { code: 'surveys.submit', label: 'Submit Surveys', group: 'Surveys' },
  { code: 'surveys.view_results', label: 'View Survey Results', group: 'Surveys' },

  { code: 'checklists.manage', label: 'Manage Event Checklists', group: 'Checklists' },
  { code: 'checklists.view', label: 'View Checklists', group: 'Checklists' },

  { code: 'enterprises.view_own', label: 'View Own Enterprise', group: 'Enterprises' },
  { code: 'enterprises.manage_own', label: 'Manage Own Enterprise', group: 'Enterprises' },
  { code: 'enterprises.manage_all', label: 'Manage All Enterprises', group: 'Enterprises' },
  { code: 'enterprises.verify', label: 'Verify Enterprises', group: 'Enterprises' },

  { code: 'reports.view', label: 'View Reports', group: 'Reports' },
  { code: 'reports.export', label: 'Export Reports', group: 'Reports' },
  { code: 'analytics.view', label: 'View Analytics Dashboard', group: 'Reports' },

  { code: 'admin.audit_logs', label: 'View Audit Logs', group: 'Admin' },
  { code: 'admin.settings', label: 'Manage System Settings', group: 'Admin' },
  { code: 'admin.roles', label: 'Manage Roles & Permissions', group: 'Admin' },

  { code: 'notifications.send', label: 'Send Notifications', group: 'Notifications' },
] as const;

export const DEFAULT_ROLES: { name: string; label: string; description: string; isSystem: boolean; permissions: string[] }[] = [
  {
    name: 'PARTICIPANT',
    label: 'Participant',
    description: 'Default role for event participants. Can register for events, submit surveys, and view own certificates.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'participants.register',
      'participants.view_own', 'certificates.view_own', 'surveys.submit',
    ],
  },
  {
    name: 'DTI_EMPLOYEE',
    label: 'DTI Employee',
    description: 'DTI Region 7 employee with general employee-level access. Event and training assignments are handled at the event level.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view',
      'reports.view',
    ],
  },
  {
    name: 'ENTERPRISE_REPRESENTATIVE',
    label: 'Enterprise Representative',
    description: 'Represents a business enterprise. Has participant permissions plus enterprise management.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'participants.register',
      'participants.view_own', 'certificates.view_own', 'surveys.submit',
      'enterprises.view_own', 'enterprises.manage_own',
    ],
  },
  {
    name: 'DIVISION_CHIEF',
    label: 'Technical Divisions Chief',
    description: 'Evaluates submitted training proposals based on client training needs, guidelines, and the approved Annual WFP. Marks proposals for review and endorses to PD/RD.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view',
      'tna.view', 'proposals.review', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'REGIONAL_DIRECTOR',
    label: 'Provincial/Regional Director',
    description: 'Provincial Director or Regional Director responsible for final approval or rejection of training proposals in accordance with COA Rules and Guidelines.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view',
      'tna.view', 'proposals.approve', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'PROVINCIAL_DIRECTOR',
    label: 'Provincial Director',
    description: 'Provincial Director responsible for reviewing and approving training proposals at the provincial level.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view',
      'tna.view', 'proposals.approve', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'SYSTEM_ADMIN',
    label: 'System Admin',
    description: 'System administrator. Full access except role management for admin-level roles.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'users.view_all', 'users.manage',
      'events.view', 'events.create', 'events.edit_own', 'events.manage_all', 'events.delete',
      'programs.create', 'proposals.review', 'proposals.approve',
      'tna.view', 'tna.create', 'tna.edit_own', 'tna.manage_all',
      'participants.manage', 'participants.export', 'attendance.scan_qr', 'attendance.manual',
      'attendance.view', 'certificates.issue', 'certificates.revoke', 'surveys.view_results',
      'checklists.manage', 'checklists.view', 'enterprises.manage_all', 'enterprises.verify',
      'reports.view', 'reports.export', 'analytics.view',
      'admin.audit_logs', 'admin.settings', 'notifications.send',
    ],
  },
  {
    name: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Super administrator. Full unrestricted access to all system features including role management.',
    isSystem: true,
    permissions: DEFAULT_PERMISSIONS.map((permission) => permission.code),
  },
];

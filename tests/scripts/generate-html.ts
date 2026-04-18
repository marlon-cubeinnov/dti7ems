/**
 * Generate HTML Test Plan & User Manual
 * DTI Region 7 EMS — from the Visual Artifact Index (index.json files)
 *
 * Usage: npx tsx scripts/generate-html.ts
 *
 * Reads all index_*.json files from reports/, and produces:
 *   - docs/EMS-TEST-MANUAL.html   (full combined test plan + user guide)
 */

import * as fs   from 'fs';
import * as path from 'path';
import type { ArtifactIndex, StepResult } from '../e2e/types';

const REPORTS_DIR = path.join(__dirname, '../reports');
const DOCS_DIR    = path.join(__dirname, '../../docs');
const OUT_HTML    = path.join(DOCS_DIR,  'EMS-TEST-MANUAL.html');

fs.mkdirSync(DOCS_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// Load all artifact indexes
// ─────────────────────────────────────────────────────────────────────────────

function loadIndexes(): ArtifactIndex[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];

  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.startsWith('index_') && f.endsWith('.json'));

  return files.map((f) => JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, f), 'utf8')));
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML helpers
// ─────────────────────────────────────────────────────────────────────────────

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PASS: 'badge-pass',
    FAIL: 'badge-fail',
    SKIP: 'badge-skip',
  };
  return `<span class="badge ${map[status] ?? 'badge-skip'}">${esc(status)}</span>`;
}

function assertionRows(assertions: StepResult['assertions']) {
  if (!assertions || assertions.length === 0) {
    return '<tr><td colspan="4" class="text-muted">No assertions captured for this step.</td></tr>';
  }
  return assertions
    .map(
      (a) => `
    <tr>
      <td>${esc(a.type)}</td>
      <td><code>${esc(a.target)}</code></td>
      <td>${esc(a.value ?? '')}</td>
      <td>${a.pass === false ? '<span class="badge badge-fail">No</span>' : '<span class="badge badge-pass">Yes</span>'}</td>
    </tr>`,
    )
    .join('');
}

function screenshotBlock(step: StepResult, workflowName: string) {
  if (!step.visual_artifact) {
    return `<div class="no-artifact">No visual artifact for this step.</div>`;
  }
  // Path relative to the docs/ output directory
  const relPath = path.relative(DOCS_DIR, path.join(REPORTS_DIR, '..', step.visual_artifact.replace('./', '')));
  return `
    <div class="screenshot-frame">
      <img src="${esc(relPath)}" alt="${esc(step.title)}" loading="lazy" />
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section renderers
// ─────────────────────────────────────────────────────────────────────────────

function renderSummaryTable(index: ArtifactIndex): string {
  const passRate =
    index.total_steps > 0
      ? Math.round((index.passed / index.total_steps) * 100)
      : 0;

  const rows = index.steps
    .map(
      (s, i) => `
    <tr class="${s.status === 'FAIL' ? 'row-fail' : ''}">
      <td>${i + 1}</td>
      <td><code>${esc(s.id)}</code></td>
      <td>${statusBadge(s.status)}</td>
      <td>${esc(s.action)}</td>
      <td>${esc(s.title)}</td>
      <td>${s.visual_artifact ? `<a href="${esc(path.relative(DOCS_DIR, path.join(REPORTS_DIR, '..', s.visual_artifact.replace('./', ''))))}" target="_blank">artifact</a>` : 'N/A'}</td>
      <td>${esc(s.error_message ?? '')}</td>
    </tr>`,
    )
    .join('');

  return `
  <div class="section-card">
    <div class="summary-header">
      <h2>${esc(index.workflow)}</h2>
      <div class="summary-meta">
        <span class="meta-item"><strong>Run ID:</strong> ${esc(index.run_id)}</span>
        <span class="meta-item"><strong>Persona:</strong> ${esc(index.persona)}</span>
        <span class="meta-item"><strong>Generated:</strong> ${esc(new Date(index.generated_at).toLocaleString('en-PH'))}</span>
      </div>
      <p class="description">${esc(index.description)}</p>
      <div class="stats-row">
        <div class="stat stat-total"><span class="stat-num">${index.total_steps}</span><span class="stat-label">Total Steps</span></div>
        <div class="stat stat-pass"><span class="stat-num">${index.passed}</span><span class="stat-label">Passed</span></div>
        <div class="stat stat-fail"><span class="stat-num">${index.failed}</span><span class="stat-label">Failed</span></div>
        <div class="stat stat-rate"><span class="stat-num">${passRate}%</span><span class="stat-label">Pass Rate</span></div>
      </div>
    </div>

    <h3>Execution Summary</h3>
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>#</th><th>Step ID</th><th>Status</th><th>Action</th><th>Title</th><th>Artifact</th><th>Notes</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function renderStepDetail(step: StepResult, stepNum: number, workflowName: string): string {
  const duration = step.started_at && step.ended_at
    ? `${((new Date(step.ended_at).getTime() - new Date(step.started_at).getTime()) / 1000).toFixed(2)}s`
    : 'N/A';

  return `
  <div class="step-card ${step.is_edge_case ? 'edge-case' : ''}" id="step-${esc(step.id)}">
    <div class="step-header">
      <h3>Step ${stepNum}: <span class="step-id">${esc(step.id)}</span></h3>
      <div class="step-subtitle">${esc(step.title)}</div>
    </div>

    <div class="step-meta-grid">
      <div class="meta-cell"><span class="meta-key">Status</span>${statusBadge(step.status)}</div>
      <div class="meta-cell"><span class="meta-key">Action</span><code>${esc(step.action)}</code></div>
      <div class="meta-cell"><span class="meta-key">Duration</span>${esc(duration)}</div>
      <div class="meta-cell"><span class="meta-key">URL</span><span class="url-chip">${esc(step.url ?? 'N/A')}</span></div>
      ${step.page_title ? `<div class="meta-cell"><span class="meta-key">Page Title</span>${esc(step.page_title)}</div>` : ''}
      ${step.is_edge_case ? `<div class="meta-cell"><span class="badge badge-edge">Edge Case</span></div>` : ''}
    </div>

    ${step.caption ? `<div class="caption"><strong>Caption:</strong> ${esc(step.caption)}</div>` : ''}
    ${step.manual_hint ? `<div class="manual-hint"><strong>Manual Hint:</strong> ${esc(step.manual_hint)}</div>` : ''}
    ${step.error_message ? `<div class="error-box"><strong>Error:</strong> ${esc(step.error_message)}</div>` : ''}

    ${screenshotBlock(step, workflowName)}

    <div class="assertions-section">
      <h4>Assertions</h4>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Type</th><th>Target</th><th>Value</th><th>Pass</th></tr></thead>
          <tbody>${assertionRows(step.assertions)}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderWorkflowSection(index: ArtifactIndex): string {
  const stepDetails = index.steps
    .map((step, i) => renderStepDetail(step, i + 1, index.workflow))
    .join('\n');

  return `
  <section class="workflow-section">
    <div class="workflow-banner">
      <h1>${esc(index.workflow)}</h1>
      <p>${esc(index.description)}</p>
    </div>
    ${renderSummaryTable(index)}
    ${stepDetails}
  </section>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static test plan (when no indexes are available)
// ─────────────────────────────────────────────────────────────────────────────

function renderStaticTestPlan(): string {
  const modules = [
    { code: 'TC-01', name: 'Authentication — Login (Happy Path)', persona: 'Participant', steps: ['Navigate to /login', 'Verify form fields (email, password, submit)', 'Enter valid credentials', 'Submit and verify redirect to dashboard', 'Confirm sidebar/navigation visible'] },
    { code: 'TC-02', name: 'Authentication — Login (Edge Cases)', persona: 'Participant', steps: ['Submit empty form → HTML5 validation', 'Submit wrong credentials → "Invalid credentials" error', 'Verify error message displayed (no email enumeration)'] },
    { code: 'TC-03', name: 'User Registration — Individual', persona: 'PublicUser', steps: ['Navigate to /register', 'Verify Individual/Business tabs', 'Fill name, email, password fields', 'Submit without DPA consent → validation error', 'Check DPA, submit → success message', 'Verify email sent to Mailpit'] },
    { code: 'TC-04', name: 'User Registration — Business', persona: 'BusinessOwner', steps: ['Select Business tab', 'Fill owner + enterprise + employee rows', 'Submit with DPA → success', 'Verify owner verification + employee invite emails'] },
    { code: 'TC-05', name: 'Event Creation & Proposal (FM-CT-4)', persona: 'EventOrganizer', steps: ['Login as Organizer', 'Navigate to /organizer/events/new', 'Fill title, dates, venue, target sector', 'Submit → DRAFT event created', 'Navigate to Proposal page', 'Verify background, objectives, learningOutcomes, methodology fields', 'Verify budget line items section', 'Verify risk register section', 'Verify target groups section'] },
    { code: 'TC-06', name: 'Checklist Management (FM-CT-7)', persona: 'EventOrganizer', steps: ['Open event → Checklist quick action', 'Verify 33 tasks present across Pre/During/Post phases', 'Toggle isApplicable on a task', 'Mark a task as Complete', 'Add a comment to a checklist item'] },
    { code: 'TC-07', name: 'Participant Registration & RSVP', persona: 'Participant', steps: ['Browse /events list', 'Open event detail', 'Click Register → success', 'Receive RSVP email (Mailpit)', 'Confirm RSVP → status → RSVP_CONFIRMED'] },
    { code: 'TC-08', name: 'QR Attendance & Demographics (FM-CT-2A)', persona: 'EventOrganizer', steps: ['Open QR Scanner for active event', 'Verify camera interface or manual check-in', 'Participant profile: verify sex, ageBracket, employmentCategory, socialClassification, clientType fields'] },
    { code: 'TC-09', name: 'CSF Survey — Participant (FM-CSF-ACT)', persona: 'Participant', steps: ['Access CSF from My Events', 'Complete 9 SQD ratings (1–5)', 'Complete 3 CC questions', 'Rate speakers', 'Submit → status SUBMITTED', 'Attempt second submission → blocked'] },
    { code: 'TC-10', name: 'CSF Report — Organizer (FM-CSF-ACT-RPT)', persona: 'EventOrganizer', steps: ['Open CSF Report via event detail', 'Verify SQD breakdown table with adjectival ratings', 'Verify Citizen\'s Charter distribution', 'Verify demographic disaggregation (sex, age bracket, client type)', 'Verify speaker performance summary'] },
    { code: 'TC-11', name: 'Post-Activity Report (FM-CT-6)', persona: 'EventOrganizer', steps: ['Open PAR via event detail', 'Fill Highlights & Outcomes narrative', 'Add beneficiary group with male/female/senior/PWD counts + EDT level', 'Fill Fund Utilization Notes', 'Submit for review → UNDER_REVIEW', 'Admin approves → APPROVED'] },
    { code: 'TC-12', name: 'Impact Survey — Participant (FM-CT-5)', persona: 'Participant', steps: ['Access 6-month impact survey from My Events', 'Answer appliedLearnings (Yes/No)', 'Check applicable benefit indicators (up to 16)', 'Answer trainingEffective (Yes/No)', 'Fill respondentDesignation, respondentCompany, dateAccomplished', 'Submit survey'] },
    { code: 'TC-13', name: 'Effectiveness Report (FM-CT-3)', persona: 'EventOrganizer', steps: ['Open Effectiveness Report via event detail', 'Verify per-participant tabulation rows', 'Verify 16-indicator summary row with percentages', 'Verify response rate displayed'] },
    { code: 'TC-14', name: 'Certificate Issuance & Verification', persona: 'EventOrganizer', steps: ['Event marked COMPLETED → certificates auto-issued to ATTENDED participants', 'Participant views certificate in My Certificates', 'Public visits /verify/:code with certificate code', 'Verify certificate details displayed'] },
    { code: 'TC-15', name: 'Admin — User Management', persona: 'SystemAdmin', steps: ['Navigate to /admin/users', 'Search user by email', 'Lock user account → verify locked status', 'Unlock user → verify active', 'Verify audit log records the action'] },
    { code: 'TC-16', name: 'Admin — Enterprise Management', persona: 'SystemAdmin', steps: ['Navigate to /admin/enterprises', 'View enterprise list with sector and member count', 'Open enterprise detail', 'Verify member list with roles'] },
    { code: 'TC-17', name: 'Admin — Reports Dashboard', persona: 'SystemAdmin', steps: ['Navigate to /admin/reports', 'Verify event statistics', 'Verify CSF aggregate report', 'Verify impact survey analytics'] },
    { code: 'TC-18', name: 'Admin — Audit Logs', persona: 'SystemAdmin', steps: ['Navigate to /admin/audit-logs', 'Verify timestamped entries present', 'Verify entries are immutable (no edit/delete UI)'] },
    { code: 'TC-19', name: 'Public — Enterprise Directory', persona: 'PublicUser', steps: ['Navigate to /directory', 'Verify enterprise list visible without login', 'Search by sector', 'View enterprise profile'] },
    { code: 'TC-20', name: 'Password Reset Flow', persona: 'Participant', steps: ['Navigate to /forgot-password', 'Enter registered email → success message', 'Enter unknown email → same message (no enumeration)', 'Open reset link from Mailpit', 'Submit new password → success', 'Login with new password'] },
  ];

  const rows = modules.map((m, i) => `
    <tr>
      <td>${esc(m.code)}</td>
      <td>${esc(m.name)}</td>
      <td><span class="persona-badge">${esc(m.persona)}</span></td>
      <td>${m.steps.length}</td>
      <td><span class="badge badge-skip">Pending</span></td>
    </tr>`).join('');

  const details = modules.map((m) => `
    <div class="step-card" id="${esc(m.code)}">
      <div class="step-header">
        <h3>${esc(m.code)}: ${esc(m.name)}</h3>
        <div class="step-subtitle">Persona: <span class="persona-badge">${esc(m.persona)}</span></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Test Step</th><th>Status</th></tr></thead>
        <tbody>
          ${m.steps.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s)}</td><td><span class="badge badge-skip">☐ Pending</span></td></tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');

  return `
  <section class="workflow-section">
    <div class="workflow-banner">
      <h1>EMS Test Plan — Static Test Cases</h1>
      <p>
        Comprehensive test plan for the DTI Region 7 Event Management System.
        Run <code>pnpm --filter @dti-ems/tests test:uat</code> against a live environment to generate the full evidence book with screenshots.
      </p>
    </div>
    <div class="section-card">
      <h2>Test Case Summary</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Code</th><th>Test Case</th><th>Persona</th><th>Steps</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    ${details}
  </section>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Full HTML document
// ─────────────────────────────────────────────────────────────────────────────

function buildHtml(indexes: ArtifactIndex[]): string {
  const now = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
  const totalPassed = indexes.reduce((a, b) => a + b.passed, 0);
  const totalFailed = indexes.reduce((a, b) => a + b.failed, 0);
  const totalSteps  = indexes.reduce((a, b) => a + b.total_steps, 0);
  const overallRate = totalSteps > 0 ? Math.round((totalPassed / totalSteps) * 100) : 0;

  const tocEntries = indexes.length > 0
    ? indexes.map((ix, i) => `<li><a href="#workflow-${i}">${esc(ix.workflow)}</a> <span class="toc-persona">(${esc(ix.persona)})</span></li>`).join('')
    : `<li><a href="#static-plan">Full EMS Test Plan — 20 Test Cases</a></li>`;

  const body = indexes.length > 0
    ? indexes.map((ix, i) => `<div id="workflow-${i}">${renderWorkflowSection(ix)}</div>`).join('\n')
    : renderStaticTestPlan();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DTI Region 7 EMS — Test Plan &amp; User Manual</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --dti-blue:    #0c2d6b;
      --dti-red:     #ce1126;
      --dti-yellow:  #f7c948;
      --pass-green:  #166534;
      --pass-bg:     #dcfce7;
      --fail-red:    #991b1b;
      --fail-bg:     #fee2e2;
      --skip-gray:   #374151;
      --skip-bg:     #f3f4f6;
      --edge-bg:     #fffbeb;
      --card-border: #e5e7eb;
      --text-main:   #111827;
      --text-muted:  #6b7280;
      --font:        'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    body {
      font-family: var(--font);
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-main);
      background: #f9fafb;
    }

    /* ── Cover page ── */
    .cover {
      background: var(--dti-blue);
      color: #fff;
      padding: 3rem 2.5rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .cover-flag { display: flex; gap: 0; margin-bottom: 1rem; }
    .cover-flag-blue  { width: 48px; height: 8px; background: var(--dti-blue); border: 1px solid #fff3; }
    .cover-flag-red   { width: 48px; height: 8px; background: var(--dti-red); }
    .cover-flag-white { width: 48px; height: 8px; background: #fff; }
    .cover h1 { font-size: 2.2rem; font-weight: 800; line-height: 1.2; }
    .cover .cover-sub { font-size: 1rem; opacity: 0.85; margin-top: 0.25rem; }
    .cover .cover-meta { margin-top: 1.5rem; font-size: 0.85rem; opacity: 0.7; }

    /* ── Stats banner ── */
    .stats-banner {
      background: #fff;
      border-bottom: 3px solid var(--dti-blue);
      padding: 1.25rem 2.5rem;
      display: flex;
      gap: 2rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .stat { text-align: center; }
    .stat-num { display: block; font-size: 2rem; font-weight: 800; line-height: 1; }
    .stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .stat-total .stat-num { color: var(--dti-blue); }
    .stat-pass  .stat-num { color: #16a34a; }
    .stat-fail  .stat-num { color: var(--dti-red); }
    .stat-rate  .stat-num { color: var(--dti-blue); }

    /* ── Layout ── */
    .layout { display: flex; min-height: calc(100vh - 200px); }

    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background: var(--dti-blue);
      color: #fff;
      padding: 1.5rem 1rem;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; margin-bottom: 0.75rem; }
    .sidebar ul { list-style: none; }
    .sidebar ul li { margin-bottom: 0.4rem; }
    .sidebar ul li a { color: rgba(255,255,255,0.82); text-decoration: none; font-size: 0.82rem; display: block; padding: 0.3rem 0.5rem; border-radius: 4px; transition: background 0.15s; }
    .sidebar ul li a:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .toc-persona { font-size: 0.72rem; opacity: 0.6; }

    .main-content { flex: 1; padding: 2rem 2.5rem; overflow: hidden; }

    /* ── Cards ── */
    .workflow-banner {
      background: linear-gradient(135deg, var(--dti-blue) 0%, #1e3a8a 100%);
      color: #fff;
      padding: 1.75rem 2rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }
    .workflow-banner h1 { font-size: 1.6rem; font-weight: 800; }
    .workflow-banner p { margin-top: 0.4rem; opacity: 0.85; font-size: 0.9rem; max-width: 680px; }

    .section-card, .step-card {
      background: #fff;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .step-card.edge-case {
      border-left: 4px solid var(--dti-yellow);
      background: var(--edge-bg);
    }

    .summary-header { margin-bottom: 1.25rem; }
    .summary-header h2 { font-size: 1.15rem; font-weight: 700; color: var(--dti-blue); }
    .summary-meta { display: flex; gap: 1.5rem; margin: 0.5rem 0; flex-wrap: wrap; }
    .meta-item { font-size: 0.8rem; color: var(--text-muted); }
    .description { font-size: 0.88rem; color: var(--text-muted); margin-top: 0.5rem; max-width: 720px; }

    .stats-row { display: flex; gap: 1.5rem; margin-top: 1rem; }

    .step-header { margin-bottom: 1rem; }
    .step-header h3 { font-size: 1rem; font-weight: 700; color: var(--dti-blue); }
    .step-id { font-family: monospace; background: #eff6ff; padding: 0 0.4em; border-radius: 3px; }
    .step-subtitle { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem; }

    .step-meta-grid { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; margin-bottom: 0.75rem; }
    .meta-cell { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; }
    .meta-key { font-weight: 600; color: var(--text-muted); }
    .url-chip { background: #f0f0f0; border-radius: 3px; padding: 0 0.35em; font-family: monospace; font-size: 0.78rem; }

    .caption { font-size: 0.88rem; background: #eff6ff; border-left: 3px solid var(--dti-blue); padding: 0.5rem 0.75rem; border-radius: 0 4px 4px 0; margin-bottom: 0.6rem; }
    .manual-hint { font-size: 0.85rem; background: #f0fdf4; border-left: 3px solid #16a34a; padding: 0.5rem 0.75rem; border-radius: 0 4px 4px 0; margin-bottom: 0.6rem; white-space: pre-line; }
    .error-box { font-size: 0.85rem; background: var(--fail-bg); border-left: 3px solid var(--dti-red); padding: 0.5rem 0.75rem; border-radius: 0 4px 4px 0; margin-bottom: 0.6rem; color: var(--fail-red); }

    /* ── Screenshots ── */
    .screenshot-frame {
      background: #f3f4f6;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem;
      margin: 0.75rem 0;
      text-align: center;
    }
    .screenshot-frame img {
      max-width: 100%;
      max-height: 560px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .no-artifact { color: var(--text-muted); font-size: 0.82rem; font-style: italic; padding: 0.4rem 0; }

    /* ── Tables ── */
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th { background: var(--dti-blue); color: #fff; text-align: left; padding: 0.5rem 0.75rem; font-weight: 600; }
    td { padding: 0.45rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.row-fail td { background: #fff5f5; }
    tr:nth-child(even) td { background: #fafafa; }
    tr:nth-child(even).row-fail td { background: #fff0f0; }
    code { font-family: monospace; font-size: 0.8em; background: #f3f4f6; padding: 0 0.3em; border-radius: 2px; }

    /* ── Badges ── */
    .badge { display: inline-block; padding: 0.15em 0.55em; border-radius: 99px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; }
    .badge-pass { background: var(--pass-bg); color: var(--pass-green); }
    .badge-fail { background: var(--fail-bg); color: var(--fail-red); }
    .badge-skip { background: var(--skip-bg); color: var(--skip-gray); }
    .badge-edge { background: #fef9c3; color: #854d0e; }
    .persona-badge { background: #e0e7ff; color: #3730a3; padding: 0.1em 0.5em; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }

    .assertions-section { margin-top: 0.75rem; }
    .assertions-section h4 { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .text-muted { color: var(--text-muted); font-style: italic; }

    /* ── Footer ── */
    .footer {
      background: var(--dti-blue);
      color: rgba(255,255,255,0.6);
      text-align: center;
      padding: 1.25rem;
      font-size: 0.78rem;
      margin-top: 3rem;
    }

    /* ── Print ── */
    @media print {
      .sidebar { display: none; }
      .main-content { padding: 1rem; }
      .screenshot-frame img { max-height: 380px; }
      .cover { padding: 2rem; }
    }

    @page { margin: 1.5cm; }
  </style>
</head>
<body>

<!-- ── Cover ─────────────────────────────────────── -->
<div class="cover">
  <div class="cover-flag">
    <div class="cover-flag-blue"></div>
    <div class="cover-flag-red"></div>
    <div class="cover-flag-white"></div>
  </div>
  <h1>DTI Region 7<br/>Event Management System</h1>
  <div class="cover-sub">System Test Plan &amp; UAT Evidence Book</div>
  <div class="cover-sub" style="opacity:0.7">Dual-Purpose Automation Framework — Visual QA + User Documentation</div>
  <div class="cover-meta">
    <div>Generated: ${esc(now)}</div>
    <div>Framework: Playwright + YAML Workflow DSL + Artifact Observer</div>
    <div>Reference: PR-CT-01 v3 — Conduct of Training (DTI Region 7)</div>
  </div>
</div>

<!-- ── Stats banner ───────────────────────────────── -->
<div class="stats-banner">
  <div class="stat stat-total"><span class="stat-num">${totalSteps || '20'}</span><span class="stat-label">${indexes.length > 0 ? 'Total Steps' : 'Test Cases'}</span></div>
  <div class="stat stat-pass"><span class="stat-num">${totalPassed || '—'}</span><span class="stat-label">Passed</span></div>
  <div class="stat stat-fail"><span class="stat-num">${totalFailed || '—'}</span><span class="stat-label">Failed</span></div>
  <div class="stat stat-rate"><span class="stat-num">${indexes.length > 0 ? overallRate + '%' : 'Pending'}</span><span class="stat-label">Pass Rate</span></div>
</div>

<!-- ── Layout ─────────────────────────────────────── -->
<div class="layout">
  <nav class="sidebar">
    <h2>Contents</h2>
    <ul>
      ${tocEntries}
    </ul>
  </nav>

  <main class="main-content">
    ${body}
  </main>
</div>

<div class="footer">
  DTI Region 7 EMS — Test Plan &amp; UAT Evidence Book &nbsp;|&nbsp; Generated ${esc(now)} &nbsp;|&nbsp; Dual-Purpose Automation Framework
</div>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const indexes = loadIndexes();
const html    = buildHtml(indexes);

fs.writeFileSync(OUT_HTML, html, 'utf8');

console.log(`✅  HTML document written → ${path.relative(process.cwd(), OUT_HTML)}`);
console.log(`    Workflows loaded: ${indexes.length}`);
console.log(`    Total steps: ${indexes.reduce((a, b) => a + b.total_steps, 0) || 20} test cases`);

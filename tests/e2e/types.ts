/**
 * Dual-Purpose Automation Framework — TypeScript Schema Types
 * DTI Region 7 EMS — Workflow & Artifact Index types
 */

// ─────────────────────────────────────────────────────────────────────────────
// YAML Workflow Schema
// ─────────────────────────────────────────────────────────────────────────────

export type ActionType =
  | 'goto'
  | 'click'
  | 'type'
  | 'select'
  | 'hover'
  | 'wait'
  | 'screenshot'
  | 'assert'
  | 'upload'
  | 'check'
  | 'uncheck'
  | 'scroll';

export type AssertionType = 'visible' | 'hidden' | 'hasText' | 'hasValue' | 'enabled' | 'disabled' | 'count';

export type StepState = 'Success' | 'Error' | 'Warning' | 'Info' | 'Loading';

export interface Assertion {
  type: AssertionType;
  target: string;
  value?: string;
  pass?: boolean;  // populated at runtime
}

export interface DocMetadata {
  title: string;
  caption: string;
  is_edge_case?: boolean;
  manual_hint?: string;
}

export interface WorkflowStep {
  id: string;
  action: ActionType;
  target?: string;
  value?: string;
  url?: string;
  wait_ms?: number;
  assertions?: Assertion[];
  visual_test?: boolean;
  doc_metadata?: DocMetadata;
  state?: StepState;
}

export interface Workflow {
  name: string;
  description: string;
  persona: string;
  tags?: string[];
  steps: WorkflowStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual Artifact Index (index.json) types
// ─────────────────────────────────────────────────────────────────────────────

export interface StepResult {
  id: string;
  workflow: string;
  persona: string;
  action: ActionType;
  title: string;
  caption: string;
  manual_hint: string;
  is_edge_case: boolean;
  state: StepState;
  status: 'PASS' | 'FAIL' | 'SKIP';
  url: string | null;
  page_title: string | null;
  visual_artifact: string | null;
  dom_context: Record<string, unknown>;
  assertions: Assertion[];
  started_at: string;
  ended_at: string;
  error_message?: string;
}

export interface ArtifactIndex {
  run_id: string;
  workflow: string;
  description: string;
  persona: string;
  generated_at: string;
  base_url: string;
  total_steps: number;
  passed: number;
  failed: number;
  skipped: number;
  steps: StepResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Runner context passed between steps
// ─────────────────────────────────────────────────────────────────────────────

export interface RunnerContext {
  runId: string;
  artifactDir: string;
  reportDir: string;
  index: ArtifactIndex;
}

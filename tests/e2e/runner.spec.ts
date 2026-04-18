/**
 * Dual-Purpose Automation Framework — YAML-to-Playwright Runner
 * DTI Region 7 EMS
 *
 * Reads every YAML workflow in tests/definitions/ and executes it via Playwright.
 * Simultaneously builds a Visual Artifact Index (index.json) for AI documentation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { test, expect, Page } from '@playwright/test';
import { loadAllWorkflows } from './utils/yaml-loader';
import { createIndex, captureArtifact, recordStep } from './observer';
import type {
  Workflow,
  WorkflowStep,
  Assertion,
  StepResult,
  RunnerContext,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────────────────────
const DEFINITIONS_DIR = path.join(__dirname, '../definitions');
const ARTIFACT_DIR    = path.join(__dirname, '../artifacts/screenshots');
const REPORT_DIR      = path.join(__dirname, '../reports');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR,   { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// Action executor — maps YAML action → Playwright page method
// ─────────────────────────────────────────────────────────────────────────────

async function executeAction(
  page: Page,
  step: WorkflowStep,
  baseUrl: string,
): Promise<void> {
  switch (step.action) {
    case 'goto': {
      const url = step.url?.startsWith('http')
        ? step.url
        : `${baseUrl}${step.url ?? '/'}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      break;
    }

    case 'click': {
      if (!step.target) throw new Error(`Step ${step.id}: 'click' requires a target`);
      await page.locator(step.target).first().click();
      break;
    }

    case 'type': {
      if (!step.target) throw new Error(`Step ${step.id}: 'type' requires a target`);
      await page.locator(step.target).first().fill(step.value ?? '');
      break;
    }

    case 'select': {
      if (!step.target) throw new Error(`Step ${step.id}: 'select' requires a target`);
      await page.locator(step.target).first().selectOption(step.value ?? '');
      break;
    }

    case 'check': {
      if (!step.target) throw new Error(`Step ${step.id}: 'check' requires a target`);
      await page.locator(step.target).first().check();
      break;
    }

    case 'uncheck': {
      if (!step.target) throw new Error(`Step ${step.id}: 'uncheck' requires a target`);
      await page.locator(step.target).first().uncheck();
      break;
    }

    case 'hover': {
      if (!step.target) throw new Error(`Step ${step.id}: 'hover' requires a target`);
      await page.locator(step.target).first().hover();
      break;
    }

    case 'scroll': {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      break;
    }

    case 'wait': {
      await page.waitForTimeout(step.wait_ms ?? 1000);
      break;
    }

    case 'screenshot':
    case 'assert':
      // Handled by observer / assertion executor — no DOM action needed
      break;

    default:
      throw new Error(`Unknown action: ${(step as WorkflowStep).action}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Assertion executor
// ─────────────────────────────────────────────────────────────────────────────

async function executeAssertions(
  page: Page,
  assertions: Assertion[],
): Promise<Assertion[]> {
  const results: Assertion[] = [];

  for (const assertion of assertions) {
    const loc = page.locator(assertion.target);

    try {
      switch (assertion.type) {
        case 'visible':
          await expect(loc.first()).toBeVisible({ timeout: 8_000 });
          break;
        case 'hidden':
          await expect(loc.first()).toBeHidden({ timeout: 8_000 });
          break;
        case 'hasText':
          await expect(loc.first()).toContainText(assertion.value ?? '', { timeout: 8_000 });
          break;
        case 'hasValue':
          await expect(loc.first()).toHaveValue(assertion.value ?? '', { timeout: 8_000 });
          break;
        case 'enabled':
          await expect(loc.first()).toBeEnabled({ timeout: 8_000 });
          break;
        case 'disabled':
          await expect(loc.first()).toBeDisabled({ timeout: 8_000 });
          break;
        case 'count':
          await expect(loc).toHaveCount(Number(assertion.value ?? 0), { timeout: 8_000 });
          break;
      }
      results.push({ ...assertion, pass: true });
    } catch {
      results.push({ ...assertion, pass: false });
      throw new Error(
        `Assertion FAILED: [${assertion.type}] on "${assertion.target}"` +
        (assertion.value ? ` = "${assertion.value}"` : ''),
      );
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step runner — executes one step and records to the artifact index
// ─────────────────────────────────────────────────────────────────────────────

async function runStep(
  page: Page,
  step: WorkflowStep,
  ctx: RunnerContext,
  baseUrl: string,
): Promise<void> {
  const startedAt = new Date().toISOString();
  let status: 'PASS' | 'FAIL' = 'PASS';
  let errorMessage: string | undefined;
  let assertions: Assertion[] = [];

  try {
    await executeAction(page, step, baseUrl);

    if (step.assertions && step.assertions.length > 0) {
      assertions = await executeAssertions(page, step.assertions);
    }
  } catch (err) {
    status = 'FAIL';
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const endedAt = new Date().toISOString();

  // Build partial result for the observer
  const partial: Omit<StepResult, 'visual_artifact' | 'dom_context' | 'page_title'> = {
    id: step.id,
    workflow: ctx.index.workflow,
    persona: ctx.index.persona,
    action: step.action,
    title: step.doc_metadata?.title ?? step.id,
    caption: step.doc_metadata?.caption ?? '',
    manual_hint: step.doc_metadata?.manual_hint ?? '',
    is_edge_case: step.doc_metadata?.is_edge_case ?? false,
    state: step.state ?? 'Info',
    status,
    url: page.url(),
    assertions,
    started_at: startedAt,
    ended_at: endedAt,
    error_message: errorMessage,
  };

  const result = await captureArtifact(page, ctx, partial);
  recordStep(ctx, result);

  // Re-throw so Playwright marks the test as failed
  if (status === 'FAIL') {
    throw new Error(errorMessage ?? `Step ${step.id} failed`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow runner — iterates all YAML files and generates test suites
// ─────────────────────────────────────────────────────────────────────────────

const workflows: Workflow[] = loadAllWorkflows(DEFINITIONS_DIR);

for (const workflow of workflows) {
  test.describe(`[${workflow.persona}] ${workflow.name}`, () => {
    const runId  = new Date().toISOString().replace(/[:.]/g, '-');
    const ctx: RunnerContext = {
      runId,
      artifactDir: ARTIFACT_DIR,
      reportDir:   REPORT_DIR,
      index: createIndex({
        runId,
        workflow: workflow.name,
        description: workflow.description,
        persona: workflow.persona,
        baseUrl: process.env.BASE_URL ?? 'http://localhost:5173',
      }),
    };

    for (const step of workflow.steps) {
      test(`${step.id}: ${step.doc_metadata?.title ?? step.action}`, async ({ page }) => {
        await runStep(
          page,
          step,
          ctx,
          process.env.BASE_URL ?? 'http://localhost:5173',
        );
      });
    }
  });
}

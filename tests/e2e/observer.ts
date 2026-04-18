/**
 * Observer Module — hooks into Playwright lifecycle to build the Visual Artifact Index
 * Every screenshot/assertion is intercepted and recorded into the index.json manifest.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';
import type { ArtifactIndex, StepResult, RunnerContext } from './types';

/**
 * Initialise a fresh ArtifactIndex for a workflow run.
 */
export function createIndex(opts: {
  runId: string;
  workflow: string;
  description: string;
  persona: string;
  baseUrl: string;
}): ArtifactIndex {
  return {
    run_id: opts.runId,
    workflow: opts.workflow,
    description: opts.description,
    persona: opts.persona,
    generated_at: new Date().toISOString(),
    base_url: opts.baseUrl,
    total_steps: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    steps: [],
  };
}

/**
 * Capture a screenshot of the current page state and register it in the index.
 * Returns the relative path of the saved screenshot (or null if headless no-screenshot).
 */
export async function captureArtifact(
  page: Page,
  ctx: RunnerContext,
  step: Omit<StepResult, 'visual_artifact' | 'dom_context' | 'page_title'>,
): Promise<StepResult> {
  let visualArtifact: string | null = null;
  let domContext: Record<string, unknown> = {};
  let pageTitle: string | null = null;

  try {
    pageTitle = await page.title().catch(() => null);

    // Capture DOM context — ARIA snapshot + visible error messages
    domContext = await page.evaluate(() => {
      const errorEls = Array.from(
        document.querySelectorAll('[role="alert"], .error-message, [data-error]'),
      ).map((el) => el.textContent?.trim());

      const activeEl = document.activeElement
        ? `${document.activeElement.tagName.toLowerCase()}${
            (document.activeElement as HTMLElement).id
              ? '#' + (document.activeElement as HTMLElement).id
              : ''
          }`
        : null;

      return {
        error_messages: errorEls.filter(Boolean),
        active_element: activeEl,
        url: window.location.href,
        title: document.title,
      };
    });
  } catch {
    // DOM evaluation can fail in some navigation states — non-fatal
  }

  // Take screenshot if the step warrants one
  const shouldCapture =
    step.action !== 'type' && step.action !== 'wait';

  if (shouldCapture) {
    const fileName = `${ctx.runId}_${step.id}.png`;
    const filePath  = path.join(ctx.artifactDir, fileName);

    try {
      await page.screenshot({ path: filePath, fullPage: false });
      // Store relative path for portability
      visualArtifact = `./artifacts/screenshots/${fileName}`;
    } catch {
      // Screenshot may fail if page navigated away — non-fatal
    }
  }

  const result: StepResult = {
    ...step,
    page_title: pageTitle,
    visual_artifact: visualArtifact,
    dom_context: domContext,
  };

  return result;
}

/**
 * Persist the current index to disk as index_<runId>.json
 */
export function flushIndex(ctx: RunnerContext): void {
  const outPath = path.join(ctx.reportDir, `index_${ctx.index.run_id}.json`);
  fs.mkdirSync(ctx.reportDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(ctx.index, null, 2), 'utf8');
}

/**
 * Record a completed step into the index and flush to disk.
 */
export function recordStep(ctx: RunnerContext, result: StepResult): void {
  ctx.index.steps.push(result);
  ctx.index.total_steps = ctx.index.steps.length;
  ctx.index.passed  = ctx.index.steps.filter((s) => s.status === 'PASS').length;
  ctx.index.failed  = ctx.index.steps.filter((s) => s.status === 'FAIL').length;
  ctx.index.skipped = ctx.index.steps.filter((s) => s.status === 'SKIP').length;
  flushIndex(ctx);
}

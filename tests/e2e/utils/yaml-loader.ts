/**
 * YAML Loader — reads and validates workflow YAML definitions
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { Workflow } from '../types';

export function loadWorkflow(filePath: string): Workflow {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = yaml.load(raw) as Workflow;

  if (!parsed.name)        throw new Error(`Workflow at ${filePath} missing "name"`);
  if (!parsed.description) throw new Error(`Workflow at ${filePath} missing "description"`);
  if (!parsed.persona)     throw new Error(`Workflow at ${filePath} missing "persona"`);
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error(`Workflow at ${filePath} has no steps`);
  }

  return parsed;
}

export function loadAllWorkflows(definitionsDir: string): Workflow[] {
  const files = fs
    .readdirSync(definitionsDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort(); // alphabetical = execution order

  return files.map((f) => loadWorkflow(path.join(definitionsDir, f)));
}

import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { validateProjectInput, validateEvaluationInput } = require('../../server/middleware/validate');

// ---------------------------------------------------------------------------
// validateProjectInput
// ---------------------------------------------------------------------------
describe('validateProjectInput', () => {
  const validProject = {
    clientName: 'Acme Corp',
    phase: 'gap_analysis',
    notes: 'Some notes about the project.',
  };

  it('returns an empty array for valid data', () => {
    const errors = validateProjectInput(validProject);
    expect(errors).toEqual([]);
  });

  it('returns an error when clientName exceeds 200 characters', () => {
    const data = { ...validProject, clientName: 'A'.repeat(201) };
    const errors = validateProjectInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /clientName/i.test(e) || /client.?name/i.test(e) || /200/i.test(e))).toBe(true);
  });

  it('returns an error when phase is invalid', () => {
    const data = { ...validProject, phase: 'invalid_phase' };
    const errors = validateProjectInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /phase/i.test(e))).toBe(true);
  });

  it('returns an error when notes exceed 5000 characters', () => {
    const data = { ...validProject, notes: 'N'.repeat(5001) };
    const errors = validateProjectInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /notes/i.test(e) || /5000/i.test(e))).toBe(true);
  });

  it('returns multiple errors when several fields are invalid', () => {
    const data = {
      clientName: 'A'.repeat(201),
      phase: 'not_a_phase',
      notes: 'N'.repeat(5001),
    };
    const errors = validateProjectInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// validateEvaluationInput
// ---------------------------------------------------------------------------
describe('validateEvaluationInput', () => {
  const validEvaluation = {
    status: 'implemented',
    priority: 'high',
    notes: 'Evaluation notes.',
  };

  it('returns an empty array for valid data', () => {
    const errors = validateEvaluationInput(validEvaluation);
    expect(errors).toEqual([]);
  });

  it('returns an error when status is invalid', () => {
    const data = { ...validEvaluation, status: 'unknown_status' };
    const errors = validateEvaluationInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /status/i.test(e))).toBe(true);
  });

  it('returns an error when priority is invalid', () => {
    const data = { ...validEvaluation, priority: 'critical' };
    const errors = validateEvaluationInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /priority/i.test(e))).toBe(true);
  });

  it('returns an error when notes exceed 5000 characters', () => {
    const data = { ...validEvaluation, notes: 'N'.repeat(5001) };
    const errors = validateEvaluationInput(data);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => /notes/i.test(e) || /5000/i.test(e))).toBe(true);
  });
});

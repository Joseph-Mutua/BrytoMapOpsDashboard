import { describe, expect, it } from 'vitest';
import { canTransitionSubmissionStatus, getSubmissionNextStatuses } from '@/features/submissions/statusWorkflow';

describe('submission status workflow', () => {
  it('allows only valid state transitions', () => {
    expect(canTransitionSubmissionStatus('draft', 'submitted')).toBe(true);
    expect(canTransitionSubmissionStatus('submitted', 'accepted')).toBe(true);
    expect(canTransitionSubmissionStatus('submitted', 'live')).toBe(false);
    expect(canTransitionSubmissionStatus('live', 'draft')).toBe(false);
  });

  it('returns expected next statuses', () => {
    expect(getSubmissionNextStatuses('draft')).toEqual(['submitted']);
    expect(getSubmissionNextStatuses('rejected')).toEqual(['draft']);
    expect(getSubmissionNextStatuses('live')).toEqual([]);
  });
});

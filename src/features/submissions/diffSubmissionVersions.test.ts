import { describe, expect, it } from 'vitest';
import { diffSubmissionVersions } from '@/features/submissions/diffSubmissionVersions';
import type { SubmissionVersion } from '@/domain/types';

function makeSubmission(overrides: Partial<SubmissionVersion>): SubmissionVersion {
  return {
    id: 'sub-1',
    versionLabel: 'v1',
    communityId: 'cypress-ridge',
    phaseLabel: 'Phase 2',
    status: 'draft',
    createdAtIso: '2026-02-22T00:00:00Z',
    changedLots: ['201', '202'],
    changedRoads: ['Cedar Loop'],
    attachments: [],
    notes: ['note-a'],
    checklist: [
      { id: 'chk-1', label: 'Plat uploaded', done: true },
      { id: 'chk-2', label: 'Road endpoints snapped', done: false },
    ],
    auditTrail: [],
    ...overrides,
  };
}

describe('diffSubmissionVersions', () => {
  it('reports added/removed roads and lots plus checklist changes', () => {
    const base = makeSubmission({});
    const target = makeSubmission({
      id: 'sub-2',
      versionLabel: 'v2',
      changedLots: ['202', '203'],
      changedRoads: ['Cedar Loop', 'Maple Court'],
      notes: ['note-a', 'note-b'],
      checklist: [
        { id: 'chk-1', label: 'Plat uploaded', done: true },
        { id: 'chk-2', label: 'Road endpoints snapped', done: true },
      ],
    });

    const diff = diffSubmissionVersions(base, target);

    expect(diff.addedRoads).toEqual(['Maple Court']);
    expect(diff.removedRoads).toEqual([]);
    expect(diff.addedLots).toEqual(['203']);
    expect(diff.removedLots).toEqual(['201']);
    expect(diff.checklistChanges).toEqual([
      { label: 'Road endpoints snapped', from: false, to: true },
    ]);
    expect(diff.noteCountDelta).toBe(1);
  });
});

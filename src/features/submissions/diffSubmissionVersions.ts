import type { SubmissionVersion } from '@/domain/types';

export interface SubmissionDiffSummary {
  addedRoads: string[];
  removedRoads: string[];
  addedLots: string[];
  removedLots: string[];
  checklistChanges: Array<{ label: string; from: boolean; to: boolean }>;
  noteCountDelta: number;
}

function diffSet(current: string[], base: string[]) {
  const currentSet = new Set(current);
  const baseSet = new Set(base);

  return {
    added: current.filter((item) => !baseSet.has(item)),
    removed: base.filter((item) => !currentSet.has(item)),
  };
}

export function diffSubmissionVersions(
  base: SubmissionVersion,
  target: SubmissionVersion,
): SubmissionDiffSummary {
  const roads = diffSet(target.changedRoads, base.changedRoads);
  const lots = diffSet(target.changedLots, base.changedLots);

  const checklistByLabel = new Map(base.checklist.map((item) => [item.label, item.done]));
  const checklistChanges = target.checklist.flatMap((item) => {
    const previous = checklistByLabel.get(item.label);
    if (previous == null || previous === item.done) return [];
    return [{ label: item.label, from: previous, to: item.done }];
  });

  return {
    addedRoads: roads.added,
    removedRoads: roads.removed,
    addedLots: lots.added,
    removedLots: lots.removed,
    checklistChanges,
    noteCountDelta: target.notes.length - base.notes.length,
  };
}

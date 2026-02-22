import type { SubmissionStatus } from '@/domain/types';

const TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ['submitted'],
  submitted: ['accepted', 'rejected'],
  accepted: ['live', 'rejected'],
  rejected: ['draft'],
  live: [],
};

export function canTransitionSubmissionStatus(
  from: SubmissionStatus,
  to: SubmissionStatus,
): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function getSubmissionNextStatuses(status: SubmissionStatus): SubmissionStatus[] {
  return TRANSITIONS[status];
}

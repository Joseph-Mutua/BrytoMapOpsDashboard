import type { CommunityMapOpsRecord } from '@/domain/types';
import { useAppStore } from '@/store/appStore';

export function useSelectedCommunityId() {
  return useAppStore((state) => state.selectedCommunityId);
}

export function useEffectiveIntakeDraft(record: CommunityMapOpsRecord | null) {
  const communityId = record?.summary.id ?? null;
  const overrides = useAppStore((state) =>
    communityId ? state.intakeOverridesByCommunity[communityId] : undefined,
  );

  if (!record) return null;

  return {
    ...record.intakeDraft,
    nearestAddress: overrides?.nearestAddress ?? record.intakeDraft.nearestAddress,
    seedCoordinates: overrides?.seedCoordinates ?? record.intakeDraft.seedCoordinates,
    controlPoints: overrides?.controlPoints ?? record.intakeDraft.controlPoints,
  };
}

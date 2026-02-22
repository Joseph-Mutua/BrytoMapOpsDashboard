import { create } from 'zustand';
import type { PlatControlPoint } from '@/domain/types';

interface SeedCoordinatesDraft {
  lat: number | null;
  lng: number | null;
}

interface IntakeDraftOverrides {
  nearestAddress?: string;
  seedCoordinates?: SeedCoordinatesDraft;
  controlPoints?: PlatControlPoint[];
}

interface AppUiState {
  selectedCommunityId: string | null;
  selectedSubmissionVersionId: string | null;
  compareSubmissionBaseId: string | null;
  compareSubmissionTargetId: string | null;
  intakeOverridesByCommunity: Record<string, IntakeDraftOverrides>;
  setSelectedCommunityId: (communityId: string) => void;
  setSelectedSubmissionVersionId: (versionId: string | null) => void;
  setSubmissionComparePair: (baseId: string | null, targetId: string | null) => void;
  resetIntakeOverrides: (communityId: string) => void;
  setNearestAddressOverride: (communityId: string, nearestAddress: string) => void;
  setSeedCoordinatesOverride: (communityId: string, seedCoordinates: SeedCoordinatesDraft) => void;
  setControlPointsOverride: (communityId: string, controlPoints: PlatControlPoint[]) => void;
}

function ensureCommunityDraft(
  store: Record<string, IntakeDraftOverrides>,
  communityId: string,
): IntakeDraftOverrides {
  return store[communityId] ?? {};
}

export const useAppStore = create<AppUiState>((set) => ({
  selectedCommunityId: 'cypress-ridge',
  selectedSubmissionVersionId: null,
  compareSubmissionBaseId: null,
  compareSubmissionTargetId: null,
  intakeOverridesByCommunity: {},

  setSelectedCommunityId: (communityId) =>
    set((state) => ({
      selectedCommunityId: communityId,
      selectedSubmissionVersionId: null,
      compareSubmissionBaseId: null,
      compareSubmissionTargetId: null,
      intakeOverridesByCommunity: state.intakeOverridesByCommunity,
    })),

  setSelectedSubmissionVersionId: (versionId) => set({ selectedSubmissionVersionId: versionId }),

  setSubmissionComparePair: (baseId, targetId) =>
    set({ compareSubmissionBaseId: baseId, compareSubmissionTargetId: targetId }),

  resetIntakeOverrides: (communityId) =>
    set((state) => {
      const next = { ...state.intakeOverridesByCommunity };
      delete next[communityId];
      return { intakeOverridesByCommunity: next };
    }),

  setNearestAddressOverride: (communityId, nearestAddress) =>
    set((state) => {
      const current = ensureCommunityDraft(state.intakeOverridesByCommunity, communityId);
      return {
        intakeOverridesByCommunity: {
          ...state.intakeOverridesByCommunity,
          [communityId]: { ...current, nearestAddress },
        },
      };
    }),

  setSeedCoordinatesOverride: (communityId, seedCoordinates) =>
    set((state) => {
      const current = ensureCommunityDraft(state.intakeOverridesByCommunity, communityId);
      return {
        intakeOverridesByCommunity: {
          ...state.intakeOverridesByCommunity,
          [communityId]: { ...current, seedCoordinates },
        },
      };
    }),

  setControlPointsOverride: (communityId, controlPoints) =>
    set((state) => {
      const current = ensureCommunityDraft(state.intakeOverridesByCommunity, communityId);
      return {
        intakeOverridesByCommunity: {
          ...state.intakeOverridesByCommunity,
          [communityId]: { ...current, controlPoints },
        },
      };
    }),
}));

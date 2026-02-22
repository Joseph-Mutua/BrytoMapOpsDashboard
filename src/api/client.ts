import { getMockCommunityRecord, MOCK_COMMUNITIES } from '@/domain/mockData';
import type { CommunitiesResponse, CommunityRecordResponse } from '@/domain/types';

interface RequestOptions {
  signal?: AbortSignal;
  simulateLatencyMs?: number;
  forceError?: boolean;
}

function delay<T>(producer: () => T, options: RequestOptions = {}): Promise<T> {
  const { signal, simulateLatencyMs = 350, forceError = false } = options;

  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      if (forceError) {
        reject(new Error('Mock API error'));
        return;
      }

      try {
        resolve(producer());
      } catch (error) {
        reject(error);
      }
    }, simulateLatencyMs);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('The operation was aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export const apiClient = {
  getCommunities(options?: RequestOptions): Promise<CommunitiesResponse> {
    return delay(() => ({ communities: MOCK_COMMUNITIES }), options);
  },

  getCommunityRecord(communityId: string, options?: RequestOptions): Promise<CommunityRecordResponse> {
    return delay(() => {
      const community = getMockCommunityRecord(communityId);
      if (!community) {
        throw new Error(`Community "${communityId}" not found`);
      }

      return { community };
    }, options);
  },
};

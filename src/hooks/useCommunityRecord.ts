import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/api/client';
import type { CommunityMapOpsRecord } from '@/domain/types';
import { idleAsyncState, type AsyncState } from '@/hooks/asyncState';

export function useCommunityRecord(communityId: string | null) {
  const [state, setState] = useState<AsyncState<CommunityMapOpsRecord>>(() =>
    idleAsyncState<CommunityMapOpsRecord>(),
  );
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(
    (targetId: string | null = communityId) => {
      if (!targetId) {
        setState(idleAsyncState<CommunityMapOpsRecord>());
        return;
      }

      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;
      const requestId = ++requestIdRef.current;

      setState({ status: 'loading', data: undefined, error: undefined });

      apiClient
        .getCommunityRecord(targetId, { signal: abort.signal })
        .then((response) => {
          if (requestId !== requestIdRef.current) return;
          setState({ status: 'success', data: response.community, error: undefined });
        })
        .catch((error: unknown) => {
          if ((error as { name?: string })?.name === 'AbortError') return;
          if (requestId !== requestIdRef.current) return;
          setState({
            status: 'error',
            data: undefined,
            error: error instanceof Error ? error : new Error('Unknown community error'),
          });
        });
    },
    [communityId],
  );

  useEffect(() => {
    refetch(communityId);
    return () => abortRef.current?.abort();
  }, [communityId, refetch]);

  return { ...state, refetch };
}

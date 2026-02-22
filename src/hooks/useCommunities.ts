import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/api/client';
import type { CommunitySummary } from '@/domain/types';
import { idleAsyncState, type AsyncState } from '@/hooks/asyncState';

export function useCommunities() {
  const [state, setState] = useState<AsyncState<CommunitySummary[]>>(() =>
    idleAsyncState<CommunitySummary[]>(),
  );
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const requestId = ++requestIdRef.current;
    setState({ status: 'loading', data: undefined, error: undefined });

    apiClient
      .getCommunities({ signal: abort.signal })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        setState({ status: 'success', data: response.communities, error: undefined });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === 'AbortError') return;
        if (requestId !== requestIdRef.current) return;
        setState({
          status: 'error',
          data: undefined,
          error: error instanceof Error ? error : new Error('Unknown communities error'),
        });
      });
  }, []);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { ...state, refetch };
}

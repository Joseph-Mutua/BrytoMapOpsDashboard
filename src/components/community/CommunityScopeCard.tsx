import { Button, Card, CardHeader } from '@/components/ui';
import { useCommunities } from '@/hooks';
import { useAppStore } from '@/store';
import { formatUtcDateTime } from '@/utils/format';

export function CommunityScopeCard() {
  const selectedCommunityId = useAppStore((state) => state.selectedCommunityId);
  const setSelectedCommunityId = useAppStore((state) => state.setSelectedCommunityId);
  const { status, data, error, refetch } = useCommunities();

  return (
    <Card className="scope-card">
      <CardHeader title="Community Scope" subtitle="Choose the builder community workspace." />

      {status === 'loading' ? (
        <p className="muted" role="status" aria-live="polite">
          Loading communities...
        </p>
      ) : null}

      {status === 'error' ? (
        <div className="inline-alert inline-alert--error" role="alert">
          <p className="inline-alert__title">Failed to load communities</p>
          <p className="inline-alert__body">{error.message}</p>
          <Button variant="secondary" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : null}

      {status === 'success' && data.length === 0 ? (
        <p className="muted" role="status">
          No communities available yet.
        </p>
      ) : null}

      {status === 'success' && data.length > 0 ? (
        <ul className="community-scope-list" role="listbox" aria-label="Community workspace selector">
          {data.map((community) => {
            const selected = community.id === selectedCommunityId;

            return (
              <li key={community.id}>
                <button
                  type="button"
                  className={['community-scope-item', selected ? 'community-scope-item--active' : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedCommunityId(community.id)}
                  aria-selected={selected}
                  role="option"
                >
                  <span className="community-scope-item__name">{community.name}</span>
                  <span className="community-scope-item__meta">
                    {community.builderName} · {community.city}, {community.state}
                  </span>
                  <span className="community-scope-item__meta">
                    {community.phaseCount} phases · {community.lotCount} lots · Updated{' '}
                    {formatUtcDateTime(community.lastUpdatedAtIso)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}

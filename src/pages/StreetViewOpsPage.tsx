import { useState } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';
import { useCommunityRecord } from '@/hooks';
import { useSelectedCommunityId } from '@/store';
import { formatNumber, formatPercent, formatUtcDateTime } from '@/utils/format';

type HeatCellState = 'covered' | 'planned' | 'gap';

export function StreetViewOpsPage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);
  const [plannedOverrides, setPlannedOverrides] = useState<Record<string, boolean>>({});
  const [metadataOverride, setMetadataOverride] = useState<boolean | null>(null);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader
            title="Street View Coverage Planner + Publishing Status"
            subtitle="Loading route plans and imagery coverage..."
          />
          <p className="muted" role="status">
            Fetching capture routes, segment coverage, and publishing batches.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader
            title="Street View Coverage Planner + Publishing Status"
            subtitle="Unable to load street-view ops."
          />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">Street View ops error</p>
            <p className="inline-alert__body">{error.message}</p>
            <Button onClick={() => refetch(selectedCommunityId)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const record = data;
  const routePlan = record.capturePlans[0] ?? null;

  if (!routePlan) {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader
            title="Street View Coverage Planner + Publishing Status"
            subtitle="No capture routes defined yet."
          />
          <p className="muted">Add a route plan to estimate coverage and identify gaps.</p>
        </Card>
      </div>
    );
  }

  const plannedSegments = routePlan.segments.map((segment) => ({
    ...segment,
    plannedDrive: plannedOverrides[segment.id] ?? segment.plannedDrive,
  }));

  const coveredLength = plannedSegments
    .filter((segment) => segment.covered)
    .reduce((sum, segment) => sum + segment.lengthFt, 0);
  const totalLength = plannedSegments.reduce((sum, segment) => sum + segment.lengthFt, 0);
  const plannedLength = plannedSegments
    .filter((segment) => segment.plannedDrive)
    .reduce((sum, segment) => sum + segment.lengthFt, 0);
  const coveragePercent = totalLength === 0 ? 0 : (coveredLength / totalLength) * 100;
  const plannedPercent = totalLength === 0 ? 0 : (plannedLength / totalLength) * 100;
  const gaps = plannedSegments.filter((segment) => !segment.covered);

  const routeHeatCells = plannedSegments.map((segment) => ({
    id: segment.id,
    label: segment.roadName,
    status: (segment.covered ? 'covered' : segment.plannedDrive ? 'planned' : 'gap') as HeatCellState,
  }));

  const latestBatch = record.publishingBatches[0] ?? null;
  const metadataReady = metadataOverride ?? latestBatch?.metadataComplete ?? false;
  const namingReady = routePlan.name.trim().length >= 6;
  const routeCoverageReady = plannedPercent >= 85;

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Street View Coverage Planner"
          subtitle={`Route ${routePlan.name}${routePlan.captureDateIso ? ` | Scheduled ${formatUtcDateTime(routePlan.captureDateIso)} UTC` : ''}`}
        />
        <div className="metric-grid">
          <div className="card metric-tile metric-tile--accent">
            <p className="metric-tile__label">Current Coverage</p>
            <p className="metric-tile__value">{formatPercent(coveragePercent)}</p>
            <p className="metric-tile__hint">
              {formatNumber(Math.round(coveredLength))} / {formatNumber(totalLength)} ft covered
            </p>
          </div>
          <div className="card metric-tile">
            <p className="metric-tile__label">Planned Drive Coverage</p>
            <p className="metric-tile__value">{formatPercent(plannedPercent)}</p>
            <p className="metric-tile__hint">
              {formatNumber(Math.round(plannedLength))} ft included in route
            </p>
          </div>
          <div className="card metric-tile">
            <p className="metric-tile__label">Est. Route Time</p>
            <p className="metric-tile__value">{formatNumber(routePlan.estimatedMinutes)} min</p>
            <p className="metric-tile__hint">
              Based on current segment plan and slow-drive capture pace.
            </p>
          </div>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <CardHeader
            title="Capture Route Planner"
            subtitle="Define drive lines and identify gaps before dispatch."
          />
          <ul className="list-stack">
            {plannedSegments.map((segment) => (
              <li key={segment.id} className="list-row list-row--stackable">
                <div>
                  <strong>{segment.roadName}</strong>
                  <span className="list-row__meta">
                    {formatNumber(segment.lengthFt)} ft |{' '}
                    {segment.covered ? 'Imagery live' : 'Coverage gap'}
                  </span>
                </div>
                <div className="button-row">
                  <span
                    className={`status-badge ${segment.covered ? 'status-badge--live' : 'status-badge--draft'}`}
                  >
                    {segment.covered ? 'covered' : 'pending'}
                  </span>
                  <Button
                    variant={segment.plannedDrive ? 'secondary' : 'ghost'}
                    onClick={() =>
                      setPlannedOverrides((current) => ({
                        ...current,
                        [segment.id]: !(current[segment.id] ?? segment.plannedDrive),
                      }))
                    }
                  >
                    {segment.plannedDrive ? 'Remove from route' : 'Add to route'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Coverage Heatmap (Segment View)"
            subtitle="Road-level status visualization for customer progress reporting."
          />
          <div className="segment-heatmap" role="img" aria-label="Road coverage heatmap by segment">
            {routeHeatCells.map((cell) => (
              <div
                key={cell.id}
                className={`segment-heatmap__cell segment-heatmap__cell--${cell.status}`}
                title={`${cell.label}: ${cell.status}`}
              >
                <span>{cell.label}</span>
              </div>
            ))}
          </div>

          <Card className="nested-card">
            <CardHeader title="Coverage Gaps" subtitle="Segments not yet live on Street View." />
            {gaps.length === 0 ? (
              <p className="muted">All planned segments have live imagery coverage.</p>
            ) : (
              <ul className="list-stack">
                {gaps.map((segment) => (
                  <li key={segment.id} className="list-row">
                    <span>
                      <strong>{segment.roadName}</strong>
                      <span className="list-row__meta">
                        {segment.plannedDrive ? 'Included in route plan' : 'Not yet planned'}
                      </span>
                    </span>
                    <span className="list-row__meta">{formatNumber(segment.lengthFt)} ft</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <CardHeader
            title="Upload Readiness Checks"
            subtitle="Basic quality gates before publishing/upload handoff."
          />
          <ul className="checklist">
            <li className={namingReady ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Route naming present and descriptive
            </li>
            <li className={metadataReady ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Metadata completeness confirmed
            </li>
            <li className={routeCoverageReady ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Planned coverage at least 85%
            </li>
          </ul>
          <div className="button-row">
            <Button
              variant={metadataReady ? 'secondary' : 'primary'}
              onClick={() => setMetadataOverride((current) => !(current ?? latestBatch?.metadataComplete ?? false))}
            >
              {metadataReady ? 'Mark metadata incomplete' : 'Mark metadata complete'}
            </Button>
          </div>
          <p className="field-help">
            These checks are mockable UI gates; real file metadata validation can be wired to upload manifests.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Publishing Tracker"
            subtitle="Batch visibility from upload to processing to live."
          />
          {record.publishingBatches.length === 0 ? (
            <p className="muted">No publishing batches yet.</p>
          ) : (
            <>
              <ul className="publishing-batch-list">
                {record.publishingBatches.map((batch) => (
                  <li key={batch.id} className="publishing-batch-list__item">
                    <div>
                      <p className="publishing-batch-list__title">{batch.id}</p>
                      <p className="list-row__meta">
                        {batch.imagesCount} images | route {batch.routePlanId}
                      </p>
                    </div>
                    <span className={`status-badge status-badge--${batch.state}`}>{batch.state}</span>
                  </li>
                ))}
              </ul>

              {latestBatch ? (
                <div className="timeline-window">
                  <div className="timeline-window__band">
                    <span className="timeline-window__label">Uploaded</span>
                    <div className="timeline-window__track">
                      <div className="timeline-window__range timeline-window__range--target" style={{ left: '6%', width: latestBatch.uploadedAtIso ? '18%' : '0%' }} />
                    </div>
                    <span className="timeline-window__meta">
                      {latestBatch.uploadedAtIso ? formatUtcDateTime(latestBatch.uploadedAtIso) : '--'} UTC
                    </span>
                  </div>
                  <div className="timeline-window__band">
                    <span className="timeline-window__label">Processing</span>
                    <div className="timeline-window__track">
                      <div className="timeline-window__range timeline-window__range--platform" style={{ left: '30%', width: latestBatch.state === 'processing' || latestBatch.processedAtIso ? '28%' : '0%' }} />
                    </div>
                    <span className="timeline-window__meta">
                      {latestBatch.processedAtIso ? formatUtcDateTime(latestBatch.processedAtIso) : latestBatch.state === 'processing' ? 'In progress' : '--'}
                    </span>
                  </div>
                  <div className="timeline-window__band">
                    <span className="timeline-window__label">Live</span>
                    <div className="timeline-window__track">
                      <div className="timeline-window__range timeline-window__range--target" style={{ left: '66%', width: latestBatch.liveAtIso ? '18%' : '0%' }} />
                    </div>
                    <span className="timeline-window__meta">
                      {latestBatch.liveAtIso ? formatUtcDateTime(latestBatch.liveAtIso) : '--'} UTC
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

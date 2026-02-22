import { Card, CardHeader, Button } from '@/components/ui';
import { MetricTile, StatusTimeline } from '@/components/dashboard';
import { useCommunityRecord } from '@/hooks';
import { useSelectedCommunityId } from '@/store';
import { formatDateRangeDays, formatNumber, formatPercent, formatUtcDateTime } from '@/utils/format';

export function DashboardHomePage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Community Overview" subtitle="Loading workspace metrics..." />
          <p className="muted" role="status" aria-live="polite">
            Fetching map health, submissions, and capture progress...
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Community Overview" subtitle="Unable to load community record." />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">Community record error</p>
            <p className="inline-alert__body">{error.message}</p>
            <Button onClick={() => refetch(selectedCommunityId)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const record = data;
  const coveredSegments = record.capturePlans.flatMap((plan) => plan.segments).filter((segment) => segment.covered);
  const allSegments = record.capturePlans.flatMap((plan) => plan.segments);
  const coveragePercent = allSegments.length === 0 ? 0 : (coveredSegments.length / allSegments.length) * 100;
  const activeSubmission = record.submissions.find((submission) => submission.status === 'submitted') ?? record.submissions[0];

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Community Overview"
          subtitle={`${record.summary.builderName} | ${record.summary.city}, ${record.summary.state} | Last synced ${formatUtcDateTime(record.summary.lastUpdatedAtIso)} UTC`}
        />
        <div className="metric-grid">
          <MetricTile
            label="Map Health Confidence"
            value={formatPercent(record.mapHealth.confidenceScore)}
            hint="Composite of evidence completeness, geometry validity, address coverage, and connectivity."
            tone="accent"
          />
          <MetricTile
            label="Roads Missing (After)"
            value={formatNumber(record.mapHealth.missingRoadsAfter)}
            hint={`${formatNumber(record.mapHealth.missingRoadsBefore)} before submission`}
            tone={record.mapHealth.missingRoadsAfter > 0 ? 'warning' : 'default'}
          />
          <MetricTile
            label="Address Gaps (After)"
            value={formatNumber(record.mapHealth.missingAddressRangesAfter)}
            hint={`${formatNumber(record.mapHealth.missingAddressRangesBefore)} before`}
          />
          <MetricTile
            label="Street View Coverage"
            value={formatPercent(coveragePercent)}
            hint={`${coveredSegments.length}/${allSegments.length} route segments covered`}
          />
          <MetricTile
            label="Bryto Target"
            value={formatDateRangeDays(record.mapHealth.brytoTargetBusinessDays)}
            hint={`Platform variability ${formatDateRangeDays(record.mapHealth.platformVariabilityDays)}`}
          />
          <MetricTile
            label="Active Submission"
            value={activeSubmission ? `${activeSubmission.phaseLabel} ${activeSubmission.versionLabel}` : '--'}
            hint={activeSubmission ? `Status: ${activeSubmission.status}` : 'No submissions yet'}
          />
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <CardHeader title="Geo Preview Snapshot" subtitle="Current generated geometry and validation summary." />
          <dl className="detail-grid">
            <div>
              <dt>Lots</dt>
              <dd>{formatNumber(record.geoPreview.lots.length)}</dd>
            </div>
            <div>
              <dt>Road segments</dt>
              <dd>{formatNumber(record.geoPreview.roads.length)}</dd>
            </div>
            <div>
              <dt>Address points</dt>
              <dd>{formatNumber(record.geoPreview.addressPoints.length)}</dd>
            </div>
            <div>
              <dt>Validation issues</dt>
              <dd>{formatNumber(record.validationIssues.length)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Submission Pipeline" subtitle="Versioned package workflow status distribution." />
          <ul className="status-list">
            {record.submissions.length === 0 ? (
              <li className="status-list__empty">No submissions created yet.</li>
            ) : (
              record.submissions.map((submission) => (
                <li key={submission.id} className="status-list__item">
                  <span className={`status-badge status-badge--${submission.status}`}>
                    {submission.status}
                  </span>
                  <span className="status-list__label">
                    {submission.phaseLabel} {submission.versionLabel}
                  </span>
                  <span className="status-list__meta">
                    {formatUtcDateTime(submission.createdAtIso)} UTC
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <StatusTimeline submissions={record.submissions} />
    </div>
  );
}

import { Card, CardHeader, Button } from '@/components/ui';
import { useCommunityRecord } from '@/hooks';
import { useSelectedCommunityId } from '@/store';
import { formatDateRangeDays, formatNumber, formatPercent } from '@/utils/format';
import { validateGeometryDraft } from '@/features/validation';

export function MapHealthPage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Map Health Detector" subtitle="Loading before/after map checks..." />
          <p className="muted" role="status">
            Comparing submitted roads, address points, and geometry validity.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Map Health Detector" subtitle="Unable to load map health data." />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">Map health error</p>
            <p className="inline-alert__body">{error.message}</p>
            <Button onClick={() => refetch(selectedCommunityId)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const record = data;
  const computedIssues = validateGeometryDraft({
    preview: record.geoPreview,
    controlPoints: record.intakeDraft.controlPoints,
  });
  const geometryErrorCount = computedIssues.filter((issue) => issue.severity === 'error').length;
  const mapHealth = record.mapHealth;
  const metrics = [
    {
      label: 'Missing Roads',
      before: mapHealth.missingRoadsBefore,
      after: mapHealth.missingRoadsAfter,
      improvement: mapHealth.missingRoadsBefore - mapHealth.missingRoadsAfter,
    },
    {
      label: 'Missing Address Ranges',
      before: mapHealth.missingAddressRangesBefore,
      after: mapHealth.missingAddressRangesAfter,
      improvement: mapHealth.missingAddressRangesBefore - mapHealth.missingAddressRangesAfter,
    },
  ];

  const breakdownEntries = Object.entries(mapHealth.scoreBreakdown) as Array<
    [keyof typeof mapHealth.scoreBreakdown, number]
  >;

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Map Health Detector"
          subtitle="Quantified before/after outcomes and submission confidence scoring."
        />
        <div className="metric-grid">
          <div className="card metric-tile metric-tile--accent">
            <p className="metric-tile__label">Confidence Score</p>
            <p className="metric-tile__value">{formatPercent(mapHealth.confidenceScore)}</p>
            <p className="metric-tile__hint">Weighted readiness score for this submission package.</p>
          </div>
          <div className="card metric-tile">
            <p className="metric-tile__label">Bryto Target</p>
            <p className="metric-tile__value">{formatDateRangeDays(mapHealth.brytoTargetBusinessDays)}</p>
            <p className="metric-tile__hint">Internal target window communicated to customers.</p>
          </div>
          <div className="card metric-tile metric-tile--warning">
            <p className="metric-tile__label">Platform Variability</p>
            <p className="metric-tile__value">{formatDateRangeDays(mapHealth.platformVariabilityDays)}</p>
            <p className="metric-tile__hint">External platform timing can vary despite a clean package.</p>
          </div>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <CardHeader title="Before / After Checks" subtitle="Road and address coverage impact from submitted changes." />
          <div className="compare-table" role="table" aria-label="Map health before and after">
            <div className="compare-table__head" role="row">
              <span role="columnheader">Metric</span>
              <span role="columnheader">Before</span>
              <span role="columnheader">After</span>
              <span role="columnheader">Improvement</span>
            </div>
            {metrics.map((metric) => (
              <div key={metric.label} className="compare-table__row" role="row">
                <span role="cell">{metric.label}</span>
                <span role="cell">{formatNumber(metric.before)}</span>
                <span role="cell">{formatNumber(metric.after)}</span>
                <span role="cell" className={metric.improvement > 0 ? 'text-positive' : ''}>
                  {metric.improvement > 0 ? '+' : ''}
                  {formatNumber(metric.improvement)}
                </span>
              </div>
            ))}
          </div>

          <div className="timeline-window">
            <div className="timeline-window__band">
              <span className="timeline-window__label">Bryto target</span>
              <div className="timeline-window__track">
                <div className="timeline-window__range timeline-window__range--target" style={{ left: '6%', width: '22%' }} />
              </div>
              <span className="timeline-window__meta">{formatDateRangeDays(mapHealth.brytoTargetBusinessDays)}</span>
            </div>
            <div className="timeline-window__band">
              <span className="timeline-window__label">Platform variability</span>
              <div className="timeline-window__track">
                <div className="timeline-window__range timeline-window__range--platform" style={{ left: '18%', width: '60%' }} />
              </div>
              <span className="timeline-window__meta">{formatDateRangeDays(mapHealth.platformVariabilityDays)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Confidence Breakdown" subtitle="Evidence and geometry scoring that rolls up to confidence score." />
          <ul className="score-bars">
            {breakdownEntries.map(([label, value]) => (
              <li key={label} className="score-bars__item">
                <div className="score-bars__header">
                  <span>{label.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                  <strong>{formatPercent(value)}</strong>
                </div>
                <div className="score-bars__track" aria-hidden="true">
                  <div className="score-bars__fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                </div>
              </li>
            ))}
          </ul>

          <div className="inline-alert" role="status">
            <p className="inline-alert__title">Computed geometry check</p>
            <p className="inline-alert__body">
              {geometryErrorCount === 0
                ? 'No blocking geometry errors detected in the current preview.'
                : `${formatNumber(geometryErrorCount)} blocking geometry issue(s) should be fixed before submission.`}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

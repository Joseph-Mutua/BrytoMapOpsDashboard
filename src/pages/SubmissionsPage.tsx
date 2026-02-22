import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';
import { useCommunityRecord } from '@/hooks';
import { useAppStore, useSelectedCommunityId } from '@/store';
import { formatBytes, formatUtcDateTime } from '@/utils/format';
import { buildSubmissionBundleSummary, canTransitionSubmissionStatus, getSubmissionNextStatuses } from '@/features/submissions';
import type { SubmissionStatus } from '@/domain/types';

export function SubmissionsPage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);
  const selectedSubmissionVersionId = useAppStore((state) => state.selectedSubmissionVersionId);
  const setSelectedSubmissionVersionId = useAppStore((state) => state.setSelectedSubmissionVersionId);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, SubmissionStatus>>({});

  useEffect(() => {
    if (!data || data.submissions.length === 0) return;
    const fallback = data.submissions[0]?.id ?? null;
    const stillExists = data.submissions.some((submission) => submission.id === selectedSubmissionVersionId);
    if (!stillExists) {
      setSelectedSubmissionVersionId(fallback);
    }
  }, [data, selectedSubmissionVersionId, setSelectedSubmissionVersionId]);

  const selectedSubmission = useMemo(() => {
    if (!data) return null;
    if (!selectedSubmissionVersionId) return data.submissions[0] ?? null;
    return data.submissions.find((submission) => submission.id === selectedSubmissionVersionId) ?? null;
  }, [data, selectedSubmissionVersionId]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Submission Packager + Audit Trail" subtitle="Loading package versions..." />
          <p className="muted" role="status">
            Fetching draft and submitted change request packages.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Submission Packager + Audit Trail" subtitle="Unable to load submissions." />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">Submission data error</p>
            <p className="inline-alert__body">{error.message}</p>
            <Button onClick={() => refetch(selectedCommunityId)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const record = data;
  const submissions = record.submissions;

  if (submissions.length === 0) {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Submission Packager + Audit Trail" subtitle="No submission versions yet." />
          <p className="muted">
            Create a draft package from the intake and georeference steps to start an auditable history.
          </p>
        </Card>
      </div>
    );
  }

  const submission = selectedSubmission ?? submissions[0];
  const effectiveStatus = statusOverrides[submission.id] ?? submission.status;
  const bundle = buildSubmissionBundleSummary(record, submission);
  const nextStatuses = getSubmissionNextStatuses(effectiveStatus);

  function handleStatusChange(nextStatus: SubmissionStatus) {
    if (!canTransitionSubmissionStatus(effectiveStatus, nextStatus)) return;
    setStatusOverrides((current) => ({ ...current, [submission.id]: nextStatus }));
  }

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Submission Packager + Audit Trail"
          subtitle="Versioned change-request packages with reproducible exports and reviewable status workflow."
        />
        <div className="submissions-layout">
          <aside className="submissions-layout__sidebar" aria-label="Submission versions">
            <ul className="version-list">
              {submissions.map((item) => {
                const itemStatus = statusOverrides[item.id] ?? item.status;
                const selected = item.id === submission.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={['version-list__item', selected ? 'version-list__item--active' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedSubmissionVersionId(item.id)}
                    >
                      <span className={`status-badge status-badge--${itemStatus}`}>{itemStatus}</span>
                      <strong>{item.phaseLabel} {item.versionLabel}</strong>
                      <span className="list-row__meta">{formatUtcDateTime(item.createdAtIso)} UTC</span>
                      <span className="list-row__meta">
                        {item.changedRoads.length} roads · {item.changedLots.length} lots
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="submissions-layout__main">
            <div className="two-col">
              <Card>
                <CardHeader
                  title="Bundle Generator"
                  subtitle="One-click export package structure (GeoJSON, coordinates, evidence manifest)."
                  actions={<Button>Generate bundle</Button>}
                />
                <ul className="list-stack">
                  {bundle.files.map((file) => (
                    <li key={file.name} className="list-row">
                      <span>
                        <strong>{file.name}</strong>
                        <span className="list-row__meta">{file.kind}</span>
                      </span>
                      <span className="list-row__meta">{formatBytes(file.bytes)}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <CardHeader
                  title="Status Workflow"
                  subtitle="Draft → Submitted → Accepted/Rejected → Live"
                />
                <div className="status-flow">
                  <p className="field-help">
                    Current status: <strong>{effectiveStatus}</strong>
                  </p>
                  <div className="button-row">
                    {nextStatuses.length === 0 ? (
                      <span className="field-help">No further transitions available.</span>
                    ) : (
                      nextStatuses.map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          variant={nextStatus === 'rejected' ? 'secondary' : 'primary'}
                          onClick={() => handleStatusChange(nextStatus)}
                        >
                          Mark {nextStatus}
                        </Button>
                      ))
                    )}
                  </div>
                  {effectiveStatus !== submission.status ? (
                    <p className="field-help">
                      Local simulation override for review purposes (mock data is not persisted).
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader title="Package Contents" subtitle="Submission scope summary used for reviewer context." />
              <div className="detail-grid">
                <div>
                  <dt>Phase</dt>
                  <dd>{submission.phaseLabel}</dd>
                </div>
                <div>
                  <dt>Version</dt>
                  <dd>{submission.versionLabel}</dd>
                </div>
                <div>
                  <dt>Changed roads</dt>
                  <dd>{submission.changedRoads.join(', ') || '--'}</dd>
                </div>
                <div>
                  <dt>Changed lots</dt>
                  <dd>{submission.changedLots.join(', ') || '--'}</dd>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

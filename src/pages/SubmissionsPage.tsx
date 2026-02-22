import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';
import { useCommunityRecord } from '@/hooks';
import { useAppStore, useSelectedCommunityId } from '@/store';
import { formatBytes, formatUtcDateTime } from '@/utils/format';
import {
  buildSubmissionBundleSummary,
  canTransitionSubmissionStatus,
  diffSubmissionVersions,
  getSubmissionNextStatuses,
} from '@/features/submissions';
import type { SubmissionStatus } from '@/domain/types';

export function SubmissionsPage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);
  const selectedSubmissionVersionId = useAppStore((state) => state.selectedSubmissionVersionId);
  const setSelectedSubmissionVersionId = useAppStore((state) => state.setSelectedSubmissionVersionId);
  const compareSubmissionBaseId = useAppStore((state) => state.compareSubmissionBaseId);
  const compareSubmissionTargetId = useAppStore((state) => state.compareSubmissionTargetId);
  const setSubmissionComparePair = useAppStore((state) => state.setSubmissionComparePair);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, SubmissionStatus>>({});
  const [checklistOverrides, setChecklistOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [noteDraft, setNoteDraft] = useState('');

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

  const submissions = data?.submissions ?? [];

  useEffect(() => {
    if (submissions.length === 0) return;

    const defaultTarget =
      compareSubmissionTargetId && submissions.some((s) => s.id === compareSubmissionTargetId)
        ? compareSubmissionTargetId
        : submissions[0]?.id ?? null;
    const defaultBase =
      compareSubmissionBaseId && submissions.some((s) => s.id === compareSubmissionBaseId)
        ? compareSubmissionBaseId
        : submissions[1]?.id ?? submissions[0]?.id ?? null;

    if (defaultBase !== compareSubmissionBaseId || defaultTarget !== compareSubmissionTargetId) {
      setSubmissionComparePair(defaultBase, defaultTarget);
    }
  }, [
    compareSubmissionBaseId,
    compareSubmissionTargetId,
    setSubmissionComparePair,
    submissions,
  ]);

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
  const effectiveChecklist = submission.checklist.map((item) => ({
    ...item,
    done: checklistOverrides[submission.id]?.[item.id] ?? item.done,
  }));

  const compareBase = submissions.find((item) => item.id === compareSubmissionBaseId) ?? null;
  const compareTarget = submissions.find((item) => item.id === compareSubmissionTargetId) ?? null;
  const diffSummary =
    compareBase && compareTarget ? diffSubmissionVersions(compareBase, compareTarget) : null;

  function handleStatusChange(nextStatus: SubmissionStatus) {
    if (!canTransitionSubmissionStatus(effectiveStatus, nextStatus)) return;
    setStatusOverrides((current) => ({ ...current, [submission.id]: nextStatus }));
  }

  function toggleChecklistItem(itemId: string) {
    setChecklistOverrides((current) => {
      const currentSubmission = current[submission.id] ?? {};
      const baseline = submission.checklist.find((item) => item.id === itemId)?.done ?? false;
      const currentValue = currentSubmission[itemId] ?? baseline;

      return {
        ...current,
        [submission.id]: {
          ...currentSubmission,
          [itemId]: !currentValue,
        },
      };
    });
  }

  const notes = noteDraft.trim()
    ? [...submission.notes, `[Draft note] ${noteDraft.trim()}`]
    : submission.notes;

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
                        {item.changedRoads.length} roads | {item.changedLots.length} lots
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
                  subtitle="Draft -> Submitted -> Accepted/Rejected -> Live"
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

            <div className="two-col">
              <Card>
                <CardHeader
                  title="Version Diff"
                  subtitle="Compare what changed between submission versions."
                />
                <div className="seed-grid">
                  <div className="field-stack">
                    <label className="field-label" htmlFor="compare-base">
                      Base version
                    </label>
                    <select
                      id="compare-base"
                      className="text-input"
                      value={compareBase?.id ?? ''}
                      onChange={(event) =>
                        setSubmissionComparePair(
                          event.currentTarget.value || null,
                          compareTarget?.id ?? submission.id,
                        )
                      }
                    >
                      {submissions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.phaseLabel} {item.versionLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-stack">
                    <label className="field-label" htmlFor="compare-target">
                      Target version
                    </label>
                    <select
                      id="compare-target"
                      className="text-input"
                      value={compareTarget?.id ?? ''}
                      onChange={(event) =>
                        setSubmissionComparePair(
                          compareBase?.id ?? submissions[0]?.id ?? null,
                          event.currentTarget.value || null,
                        )
                      }
                    >
                      {submissions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.phaseLabel} {item.versionLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {diffSummary ? (
                  <div className="diff-grid">
                    <div className="detail-chip">
                      <span>Added roads</span>
                      <strong>{diffSummary.addedRoads.join(', ') || '--'}</strong>
                    </div>
                    <div className="detail-chip">
                      <span>Removed roads</span>
                      <strong>{diffSummary.removedRoads.join(', ') || '--'}</strong>
                    </div>
                    <div className="detail-chip">
                      <span>Added lots</span>
                      <strong>{diffSummary.addedLots.join(', ') || '--'}</strong>
                    </div>
                    <div className="detail-chip">
                      <span>Removed lots</span>
                      <strong>{diffSummary.removedLots.join(', ') || '--'}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="muted">Select two versions to compare.</p>
                )}
              </Card>

              <Card>
                <CardHeader
                  title="Review Checklist + Notes"
                  subtitle="Internal checklist and note capture before/after submission."
                />
                <ul className="checklist">
                  {effectiveChecklist.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="checklist-toggle"
                        onClick={() => toggleChecklistItem(item.id)}
                        aria-pressed={item.done}
                      >
                        <span
                          className={
                            item.done
                              ? 'checklist__item checklist__item--done'
                              : 'checklist__item'
                          }
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="field-stack">
                  <label className="field-label" htmlFor="submission-note-draft">
                    Draft note (local)
                  </label>
                  <textarea
                    id="submission-note-draft"
                    className="text-input textarea-input"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.currentTarget.value)}
                    rows={3}
                    placeholder="Add reviewer note..."
                  />
                </div>
                <ul className="list-stack">
                  {notes.map((note, index) => (
                    <li key={`${submission.id}-note-${index}`} className="list-row">
                      <span>
                        <strong>Note {index + 1}</strong>
                        <span className="list-row__meta">{note}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card>
              <CardHeader title="Audit Trail" subtitle="Status changes, notes, and bundle generation events." />
              <ol className="timeline-list">
                {submission.auditTrail.map((event) => (
                  <li key={event.id} className="timeline-list__item">
                    <div className="timeline-list__dot" aria-hidden="true" />
                    <div>
                      <p className="timeline-list__headline">{event.type.replace('-', ' ')}</p>
                      <p className="timeline-list__text">{event.message}</p>
                      <p className="timeline-list__meta">
                        {event.actor} | {formatUtcDateTime(event.atIso)} UTC
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

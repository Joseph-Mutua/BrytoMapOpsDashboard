import { useMemo, useState, type ChangeEvent } from 'react';
import { Card, CardHeader, Button } from '@/components/ui';
import { useCommunityRecord } from '@/hooks';
import { useAppStore, useEffectiveIntakeDraft, useSelectedCommunityId } from '@/store';
import { formatBytes, formatUtcDateTime } from '@/utils/format';
import { validateIntakeBasics } from '@/features/intake';

export function IntakePage() {
  const selectedCommunityId = useSelectedCommunityId();
  const { status, data, error, refetch } = useCommunityRecord(selectedCommunityId);
  const effectiveDraft = useEffectiveIntakeDraft(status === 'success' ? data : null);
  const setNearestAddressOverride = useAppStore((state) => state.setNearestAddressOverride);
  const setSeedCoordinatesOverride = useAppStore((state) => state.setSeedCoordinatesOverride);
  const resetIntakeOverrides = useAppStore((state) => state.resetIntakeOverrides);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const validationIssues = useMemo(() => {
    if (!effectiveDraft) return [];
    return validateIntakeBasics({
      nearestAddress: effectiveDraft.nearestAddress,
      lat: effectiveDraft.seedCoordinates.lat,
      lng: effectiveDraft.seedCoordinates.lng,
    });
  }, [effectiveDraft]);

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setPendingFiles(files);
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Intake + Plat-to-Geo Preview" subtitle="Loading intake draft..." />
          <p className="muted" role="status">
            Fetching existing attachments and georeference anchors.
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page-stack">
        <Card>
          <CardHeader title="Intake + Plat-to-Geo Preview" subtitle="Unable to load intake draft." />
          <div className="inline-alert inline-alert--error" role="alert">
            <p className="inline-alert__title">Intake data error</p>
            <p className="inline-alert__body">{error.message}</p>
            <Button onClick={() => refetch(selectedCommunityId)}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const record = data;
  const draft = effectiveDraft ?? record.intakeDraft;
  const nearestAddressError = validationIssues.find((issue) => issue.field === 'nearestAddress');
  const coordinatesError = validationIssues.find((issue) => issue.field === 'coordinates');

  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Intake + Plat-to-Geo Preview"
          subtitle="Self-serve intake for plat upload, seed coordinates, and pre-submission georeference setup."
          actions={
            <Button variant="ghost" onClick={() => resetIntakeOverrides(record.summary.id)}>
              Reset edits
            </Button>
          }
        />

        <div className="intake-grid">
          <div className="field-stack">
            <label className="field-label" htmlFor="nearest-address">
              Nearest address / anchor location
            </label>
            <input
              id="nearest-address"
              className={['text-input', nearestAddressError ? 'text-input--error' : ''].join(' ')}
              value={draft.nearestAddress}
              onChange={(event) =>
                setNearestAddressOverride(record.summary.id, event.currentTarget.value)
              }
              placeholder="e.g. 1458 Cedar View Dr, Georgetown, TX"
            />
            <p className={nearestAddressError ? 'field-help field-help--error' : 'field-help'}>
              {nearestAddressError?.message ??
                'Used by Bryto ops to anchor plat-to-geo conversion and validate map submissions.'}
            </p>
          </div>

          <div className="seed-grid">
            <div className="field-stack">
              <label className="field-label" htmlFor="seed-lat">
                Seed latitude
              </label>
              <input
                id="seed-lat"
                inputMode="decimal"
                className={['text-input', coordinatesError ? 'text-input--error' : ''].join(' ')}
                value={draft.seedCoordinates.lat ?? ''}
                onChange={(event) =>
                  setSeedCoordinatesOverride(record.summary.id, {
                    lat: event.currentTarget.value === '' ? null : Number(event.currentTarget.value),
                    lng: draft.seedCoordinates.lng,
                  })
                }
                placeholder="30.6852"
              />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="seed-lng">
                Seed longitude
              </label>
              <input
                id="seed-lng"
                inputMode="decimal"
                className={['text-input', coordinatesError ? 'text-input--error' : ''].join(' ')}
                value={draft.seedCoordinates.lng ?? ''}
                onChange={(event) =>
                  setSeedCoordinatesOverride(record.summary.id, {
                    lat: draft.seedCoordinates.lat,
                    lng: event.currentTarget.value === '' ? null : Number(event.currentTarget.value),
                  })
                }
                placeholder="-97.7442"
              />
            </div>
          </div>

          <p className={coordinatesError ? 'field-help field-help--error' : 'field-help'}>
            {coordinatesError?.message ??
              'Bryto commonly requests nearest coordinates; these seed the georeference preview step.'}
          </p>
        </div>
      </Card>

      <div className="two-col">
        <Card>
          <CardHeader
            title="Attachments"
            subtitle="Plat, orthophotos, and supporting evidence used for map submissions."
          />

          <label className="upload-dropzone">
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelection}
              className="sr-only-input"
            />
            <span className="upload-dropzone__title">Select plat / evidence files</span>
            <span className="upload-dropzone__hint">
              UI is ready; storage integration lands in a later commit.
            </span>
          </label>

          {pendingFiles.length > 0 ? (
            <ul className="list-stack">
              {pendingFiles.map((file) => (
                <li key={`${file.name}-${file.lastModified}`} className="list-row">
                  <span>
                    <strong>{file.name}</strong>
                    <span className="list-row__meta">Pending upload</span>
                  </span>
                  <span className="list-row__meta">{formatBytes(file.size)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {record.intakeDraft.attachments.length === 0 ? (
            <p className="muted">No uploaded attachments yet.</p>
          ) : (
            <ul className="list-stack">
              {record.intakeDraft.attachments.map((attachment) => (
                <li key={attachment.id} className="list-row">
                  <span>
                    <strong>{attachment.filename}</strong>
                    <span className="list-row__meta">
                      {attachment.kind} · {formatUtcDateTime(attachment.uploadedAtIso)} UTC
                    </span>
                  </span>
                  <span className="list-row__meta">{formatBytes(attachment.sizeBytes)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Readiness Checklist"
            subtitle="Intake completeness before georeference control-point mapping."
          />
          <ul className="checklist">
            <li className={draft.nearestAddress.trim().length >= 8 ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Anchor address provided
            </li>
            <li className={draft.seedCoordinates.lat != null && draft.seedCoordinates.lng != null ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Seed coordinates provided
            </li>
            <li className={record.intakeDraft.attachments.some((a) => a.kind === 'plat-pdf') ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Plat map attached
            </li>
            <li className={record.intakeDraft.attachments.some((a) => a.kind === 'orthophoto') ? 'checklist__item checklist__item--done' : 'checklist__item'}>
              Orthophoto / evidence attached
            </li>
          </ul>
          <p className="field-help">
            Next commit adds the control-point editor and the georeferenced geometry preview.
          </p>
        </Card>
      </div>
    </div>
  );
}

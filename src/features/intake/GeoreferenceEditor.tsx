import { useMemo, useState } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';
import type { CommunityMapOpsRecord, PlatControlPoint } from '@/domain/types';
import { validateGeometryDraft } from '@/features/validation';
import { formatNumber } from '@/utils/format';

interface GeoreferenceEditorProps {
  record: CommunityMapOpsRecord;
  controlPoints: PlatControlPoint[];
  onChangeControlPoints: (points: PlatControlPoint[]) => void;
}

interface ControlPointDraft {
  label: string;
  sourceX: string;
  sourceY: string;
  worldLat: string;
  worldLng: string;
  confidence: PlatControlPoint['confidence'];
}

const EMPTY_DRAFT: ControlPointDraft = {
  label: '',
  sourceX: '',
  sourceY: '',
  worldLat: '',
  worldLng: '',
  confidence: 'high',
};

function normalizePoints(points: PlatControlPoint[]) {
  if (points.length === 0) return [];
  const xs = points.map((point) => point.sourceX);
  const ys = points.map((point) => point.sourceY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  return points.map((point) => ({
    ...point,
    normalizedX: ((point.sourceX - minX) / width) * 100,
    normalizedY: ((point.sourceY - minY) / height) * 100,
  }));
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function createControlPoint(draft: ControlPointDraft): PlatControlPoint | null {
  const sourceX = toNumberOrNull(draft.sourceX);
  const sourceY = toNumberOrNull(draft.sourceY);
  const worldLat = toNumberOrNull(draft.worldLat);
  const worldLng = toNumberOrNull(draft.worldLng);

  if (!draft.label.trim() || sourceX == null || sourceY == null || worldLat == null || worldLng == null) {
    return null;
  }

  return {
    id: `cp-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    label: draft.label.trim(),
    sourceX,
    sourceY,
    worldLat,
    worldLng,
    confidence: draft.confidence,
  };
}

function isControlPointDraftValid(draft: ControlPointDraft): boolean {
  return (
    draft.label.trim().length > 0 &&
    toNumberOrNull(draft.sourceX) != null &&
    toNumberOrNull(draft.sourceY) != null &&
    toNumberOrNull(draft.worldLat) != null &&
    toNumberOrNull(draft.worldLng) != null
  );
}

export function GeoreferenceEditor({
  record,
  controlPoints,
  onChangeControlPoints,
}: GeoreferenceEditorProps) {
  const [draft, setDraft] = useState<ControlPointDraft>(EMPTY_DRAFT);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const normalizedPoints = useMemo(() => normalizePoints(controlPoints), [controlPoints]);
  const canGeneratePreview = controlPoints.length >= 3;
  const computedIssues = useMemo(
    () =>
      validateGeometryDraft({
        preview: record.geoPreview,
        controlPoints,
      }),
    [controlPoints, record.geoPreview],
  );
  const previewIssues = computedIssues.filter((issue) =>
    ['insufficient_control_points', 'road_gap', 'invalid_polygon', 'self_intersection', 'duplicate_address'].includes(issue.code),
  );

  function handleAddControlPoint() {
    setSubmitAttempted(true);
    const nextPoint = createControlPoint(draft);
    if (!nextPoint) return;
    onChangeControlPoints([...controlPoints, nextPoint]);
    setDraft(EMPTY_DRAFT);
    setSubmitAttempted(false);
  }

  function handleRemoveControlPoint(id: string) {
    onChangeControlPoints(controlPoints.filter((point) => point.id !== id));
  }

  const draftInvalid = submitAttempted && !isControlPointDraftValid(draft);

  return (
    <div className="two-col">
      <Card>
        <CardHeader
          title="Georeference Control Points"
          subtitle="Drop 3-6 anchor points from the plat and map them to real-world coordinates."
        />

        <div className="seed-grid">
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-label">
              Label
            </label>
            <input
              id="cp-label"
              className={['text-input', draftInvalid && !draft.label.trim() ? 'text-input--error' : '']
                .filter(Boolean)
                .join(' ')}
              value={draft.label}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({ ...state, label: value }));
              }}
              placeholder="NW corner"
            />
          </div>
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-confidence">
              Confidence
            </label>
            <select
              id="cp-confidence"
              className="text-input"
              value={draft.confidence}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({
                  ...state,
                  confidence: value as PlatControlPoint['confidence'],
                }));
              }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="seed-grid">
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-source-x">
              Plat X (source)
            </label>
            <input
              id="cp-source-x"
              className="text-input"
              value={draft.sourceX}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({ ...state, sourceX: value }));
              }}
              placeholder="48"
            />
          </div>
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-source-y">
              Plat Y (source)
            </label>
            <input
              id="cp-source-y"
              className="text-input"
              value={draft.sourceY}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({ ...state, sourceY: value }));
              }}
              placeholder="62"
            />
          </div>
        </div>

        <div className="seed-grid">
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-lat">
              Latitude
            </label>
            <input
              id="cp-lat"
              className="text-input"
              value={draft.worldLat}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({ ...state, worldLat: value }));
              }}
              placeholder="30.68612"
            />
          </div>
          <div className="field-stack">
            <label className="field-label" htmlFor="cp-lng">
              Longitude
            </label>
            <input
              id="cp-lng"
              className="text-input"
              value={draft.worldLng}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setDraft((state) => ({ ...state, worldLng: value }));
              }}
              placeholder="-97.7458"
            />
          </div>
        </div>

        {draftInvalid ? (
          <p className="field-help field-help--error" role="alert">
            All control-point fields are required and must be numeric where applicable.
          </p>
        ) : null}

        <div className="button-row">
          <Button onClick={handleAddControlPoint}>Add control point</Button>
          <Button variant="secondary" onClick={() => setDraft(EMPTY_DRAFT)}>
            Clear
          </Button>
        </div>

        {controlPoints.length === 0 ? (
          <p className="muted" role="status">No control points added yet.</p>
        ) : (
          <ul className="list-stack">
            {controlPoints.map((point) => (
              <li key={point.id} className="list-row list-row--stackable">
                <div>
                  <strong>{point.label}</strong>
                  <span className="list-row__meta">
                    Source ({point.sourceX}, {point.sourceY}) · WGS84 ({point.worldLat}, {point.worldLng})
                  </span>
                  <span className="list-row__meta">
                    Confidence: {point.confidence}
                  </span>
                </div>
                <Button variant="ghost" onClick={() => handleRemoveControlPoint(point.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Plat-to-Geo Preview"
          subtitle="Preview geometry readiness before Bryto submits map modifications."
          actions={
            <span className={`status-badge ${canGeneratePreview ? 'status-badge--accepted' : 'status-badge--draft'}`}>
              {canGeneratePreview ? 'ready' : 'needs points'}
            </span>
          }
        />

        <div className="plat-preview">
          <div className="plat-preview__canvas" aria-label="Plat control point preview">
            {normalizedPoints.length === 0 ? (
              <p className="plat-preview__empty">Add control points to preview georeferencing spread.</p>
            ) : (
              normalizedPoints.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={`plat-preview__point plat-preview__point--${point.confidence}`}
                  style={{ left: `${point.normalizedX}%`, top: `${point.normalizedY}%` }}
                  title={`${point.label} (${point.confidence})`}
                  aria-label={`${point.label}, ${point.confidence} confidence`}
                />
              ))
            )}
          </div>

          <div className="plat-preview__stats">
            <div className="detail-chip">
              <span>Control points</span>
              <strong>{formatNumber(controlPoints.length)}</strong>
            </div>
            <div className="detail-chip">
              <span>Roads (preview)</span>
              <strong>{formatNumber(record.geoPreview.roads.length)}</strong>
            </div>
            <div className="detail-chip">
              <span>Lots (preview)</span>
              <strong>{formatNumber(record.geoPreview.lots.length)}</strong>
            </div>
            <div className="detail-chip">
              <span>Validation issues</span>
              <strong>{formatNumber(previewIssues.length)}</strong>
            </div>
          </div>
        </div>

        <ul className="checklist">
          <li className={controlPoints.length >= 3 ? 'checklist__item checklist__item--done' : 'checklist__item'}>
            Minimum 3 control points
          </li>
          <li className={controlPoints.length >= 4 ? 'checklist__item checklist__item--done' : 'checklist__item'}>
            Recommended 4+ control points
          </li>
          <li className={previewIssues.length === 0 ? 'checklist__item checklist__item--done' : 'checklist__item'}>
            No georeference readiness warnings
          </li>
        </ul>

        {previewIssues.length > 0 ? (
          <ul className="list-stack">
            {previewIssues.map((issue) => (
              <li key={issue.id} className="list-row">
                <span>
                  <strong>
                    {issue.severity.toUpperCase()} · {issue.code.replace(/_/g, ' ')}
                  </strong>
                  <span className="list-row__meta">{issue.message}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="field-help" role="status">
            No current validation issues detected in the preview.
          </p>
        )}
      </Card>
    </div>
  );
}

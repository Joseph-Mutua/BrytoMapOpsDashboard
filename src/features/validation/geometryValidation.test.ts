import { describe, expect, it } from 'vitest';
import { validateGeometryDraft } from '@/features/validation/geometryValidation';
import type { GeoPreviewSnapshot, PlatControlPoint } from '@/domain/types';

const basePreview: GeoPreviewSnapshot = {
  generatedAtIso: '2026-02-22T00:00:00Z',
  lots: [
    {
      id: 'lot-1',
      label: '1',
      status: 'planned',
      coordinates: [
        [-97.1, 30.1],
        [-97.0, 30.1],
        [-97.0, 30.0],
        [-97.1, 30.0],
        [-97.1, 30.1],
      ],
    },
  ],
  roads: [
    {
      id: 'road-a',
      name: 'Road A',
      submitted: false,
      coordinates: [
        [-97.1, 30.1],
        [-97.05, 30.05],
      ],
    },
    {
      id: 'road-b',
      name: 'Road B',
      submitted: false,
      coordinates: [
        [-97.04995, 30.05005],
        [-97.0, 30.0],
      ],
    },
  ],
  addressPoints: [{ id: 'addr-1', lotId: 'lot-1', addressLabel: '101 Main', lat: 30.05, lng: -97.05 }],
};

const controlPoints: PlatControlPoint[] = [
  {
    id: 'cp-1',
    label: 'A',
    sourceX: 10,
    sourceY: 10,
    worldLat: 30.1,
    worldLng: -97.1,
    confidence: 'high',
  },
  {
    id: 'cp-2',
    label: 'B',
    sourceX: 30,
    sourceY: 10,
    worldLat: 30.1,
    worldLng: -97.0,
    confidence: 'high',
  },
  {
    id: 'cp-3',
    label: 'C',
    sourceX: 20,
    sourceY: 30,
    worldLat: 30.0,
    worldLng: -97.05,
    confidence: 'high',
  },
];

describe('validateGeometryDraft', () => {
  it('detects insufficient control points', () => {
    const issues = validateGeometryDraft({ preview: basePreview, controlPoints: controlPoints.slice(0, 2) });
    expect(issues.some((issue) => issue.code === 'insufficient_control_points')).toBe(true);
  });

  it('detects duplicate address points', () => {
    const preview: GeoPreviewSnapshot = {
      ...basePreview,
      addressPoints: [
        ...basePreview.addressPoints,
        { id: 'addr-2', lotId: 'lot-1', addressLabel: '103 Main', lat: 30.05, lng: -97.05 },
      ],
    };
    const issues = validateGeometryDraft({ preview, controlPoints });
    expect(issues.some((issue) => issue.code === 'duplicate_address')).toBe(true);
  });

  it('detects self-intersection in lot polygon', () => {
    const preview: GeoPreviewSnapshot = {
      ...basePreview,
      lots: [
        {
          ...basePreview.lots[0],
          coordinates: [
            [-97.1, 30.1],
            [-97.0, 30.0],
            [-97.0, 30.1],
            [-97.1, 30.0],
            [-97.1, 30.1],
          ],
        },
      ],
    };
    const issues = validateGeometryDraft({ preview, controlPoints });
    expect(issues.some((issue) => issue.code === 'self_intersection')).toBe(true);
  });

  it('detects near road connectivity gaps', () => {
    const issues = validateGeometryDraft({ preview: basePreview, controlPoints });
    expect(issues.some((issue) => issue.code === 'road_gap')).toBe(true);
  });
});

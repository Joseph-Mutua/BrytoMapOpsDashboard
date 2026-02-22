import { booleanValid, distance, kinks, lineString, point, polygon } from '@turf/turf';
import type { GeoPreviewSnapshot, GeometryValidationIssue, PlatControlPoint } from '@/domain/types';

interface GeometryValidationInput {
  preview: GeoPreviewSnapshot;
  controlPoints: PlatControlPoint[];
}

function toRingCoordinates(coordinates: [number, number][]): [number, number][] {
  if (coordinates.length === 0) return coordinates;
  const [firstLng, firstLat] = coordinates[0];
  const [lastLng, lastLat] = coordinates[coordinates.length - 1];
  if (firstLng === lastLng && firstLat === lastLat) return coordinates;
  return [...coordinates, coordinates[0]];
}

function createIssue(
  issue: Omit<GeometryValidationIssue, 'id'>,
  index: number,
): GeometryValidationIssue {
  return {
    id: `${issue.code}-${index}-${issue.featureId ?? 'global'}`,
    ...issue,
  };
}

function endpointFeatureKey(coord: [number, number]): string {
  return `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
}

export function validateGeometryDraft({
  preview,
  controlPoints,
}: GeometryValidationInput): GeometryValidationIssue[] {
  const issues: GeometryValidationIssue[] = [];

  if (controlPoints.length < 3) {
    issues.push(
      createIssue(
        {
          severity: 'warning',
          code: 'insufficient_control_points',
          message: 'At least 3 control points are required to generate a stable georeference preview.',
        },
        issues.length,
      ),
    );
  }

  preview.lots.forEach((lot) => {
    const ring = toRingCoordinates(lot.coordinates);
    if (ring.length < 4) {
      issues.push(
        createIssue(
          {
            severity: 'error',
            code: 'invalid_polygon',
            featureId: lot.id,
            message: `Lot ${lot.label} polygon has fewer than 4 ring coordinates.`,
          },
          issues.length,
        ),
      );
      return;
    }

    const poly = polygon([ring]);
    if (!booleanValid(poly)) {
      issues.push(
        createIssue(
          {
            severity: 'error',
            code: 'invalid_polygon',
            featureId: lot.id,
            message: `Lot ${lot.label} polygon is invalid and may be rejected by downstream map tooling.`,
          },
          issues.length,
        ),
      );
    }

    const kinkReport = kinks(poly);
    if (kinkReport.features.length > 0) {
      issues.push(
        createIssue(
          {
            severity: 'error',
            code: 'self_intersection',
            featureId: lot.id,
            message: `Lot ${lot.label} polygon contains a self-intersection.`,
          },
          issues.length,
        ),
      );
    }
  });

  const addressKeys = new Map<string, string>();
  preview.addressPoints.forEach((addressPointData) => {
    const key = `${addressPointData.lat.toFixed(6)},${addressPointData.lng.toFixed(6)}`;
    const existing = addressKeys.get(key);
    if (existing) {
      issues.push(
        createIssue(
          {
            severity: 'error',
            code: 'duplicate_address',
            featureId: addressPointData.id,
            message: `Address point duplicates coordinates already used by ${existing}.`,
          },
          issues.length,
        ),
      );
      return;
    }

    addressKeys.set(key, addressPointData.id);
  });

  type EndpointRef = {
    roadId: string;
    roadName: string;
    endpointIndex: 0 | 1;
    coordinate: [number, number];
  };

  const endpoints: EndpointRef[] = preview.roads
    .filter((road) => road.coordinates.length >= 2)
    .flatMap((road) => [
      {
        roadId: road.id,
        roadName: road.name,
        endpointIndex: 0 as const,
        coordinate: road.coordinates[0],
      },
      {
        roadId: road.id,
        roadName: road.name,
        endpointIndex: 1 as const,
        coordinate: road.coordinates[road.coordinates.length - 1],
      },
    ]);

  const endpointCounts = new Map<string, number>();
  endpoints.forEach((endpoint) => {
    const key = endpointFeatureKey(endpoint.coordinate);
    endpointCounts.set(key, (endpointCounts.get(key) ?? 0) + 1);
  });

  endpoints.forEach((endpoint) => {
    const key = endpointFeatureKey(endpoint.coordinate);
    if ((endpointCounts.get(key) ?? 0) > 1) return;

    let nearestGapFeet: number | null = null;
    let nearestRoadName: string | null = null;

    endpoints.forEach((otherEndpoint) => {
      if (otherEndpoint.roadId === endpoint.roadId) return;
      const meters = distance(point(endpoint.coordinate), point(otherEndpoint.coordinate), {
        units: 'meters',
      });
      const feet = meters * 3.28084;
      if (feet < 1 || feet > 40) return;
      if (nearestGapFeet == null || feet < nearestGapFeet) {
        nearestGapFeet = feet;
        nearestRoadName = otherEndpoint.roadName;
      }
    });

    if (nearestGapFeet != null && nearestRoadName != null) {
      issues.push(
        createIssue(
          {
            severity: 'warning',
            code: 'road_gap',
            featureId: endpoint.roadId,
            message: `${endpoint.roadName} endpoint is ${Math.round(nearestGapFeet)} ft from ${nearestRoadName}; consider snapping for connectivity.`,
          },
          issues.length,
        ),
      );
    }
  });

  return issues;
}

export function estimateCoverageByRoad(preview: GeoPreviewSnapshot): Record<string, number> {
  const roadLineLengths = preview.roads.map((road) => {
    const line = lineString(road.coordinates);
    return { roadId: road.id, miles: distance(point(road.coordinates[0]), point(road.coordinates.at(-1) ?? road.coordinates[0]), { units: 'miles' }), submitted: road.submitted, points: line.geometry.coordinates.length };
  });

  return roadLineLengths.reduce<Record<string, number>>((acc, road) => {
    const base = road.points > 2 ? 0.8 : 0.55;
    const submittedBonus = road.submitted ? 0.15 : 0;
    acc[road.roadId] = Math.min(1, base + submittedBonus);
    return acc;
  }, {});
}

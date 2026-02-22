interface IntakeBasicsInput {
  nearestAddress: string;
  lat: number | null;
  lng: number | null;
}

export interface IntakeBasicsIssue {
  field: 'nearestAddress' | 'coordinates';
  message: string;
}

export function validateIntakeBasics(input: IntakeBasicsInput): IntakeBasicsIssue[] {
  const issues: IntakeBasicsIssue[] = [];

  if (input.nearestAddress.trim().length < 8) {
    issues.push({
      field: 'nearestAddress',
      message: 'Nearest address is required to anchor Bryto geospatial conversion.',
    });
  }

  if (input.lat == null || input.lng == null) {
    issues.push({
      field: 'coordinates',
      message: 'Seed coordinates are required (latitude + longitude).',
    });
    return issues;
  }

  if (
    Number.isNaN(input.lat) ||
    Number.isNaN(input.lng) ||
    input.lat < -90 ||
    input.lat > 90 ||
    input.lng < -180 ||
    input.lng > 180
  ) {
    issues.push({
      field: 'coordinates',
      message: 'Seed coordinates must be valid WGS84 latitude/longitude values.',
    });
  }

  return issues;
}

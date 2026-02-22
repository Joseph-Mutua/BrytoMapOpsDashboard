import type { CommunityMapOpsRecord, CommunitySummary } from '@/domain/types';

export const MOCK_COMMUNITIES: CommunitySummary[] = [
  {
    id: 'cypress-ridge',
    name: 'Cypress Ridge',
    builderName: 'Meridian Homes',
    city: 'Georgetown',
    state: 'TX',
    phaseCount: 3,
    lotCount: 126,
    lastUpdatedAtIso: '2026-02-21T18:42:00Z',
  },
  {
    id: 'oak-harbor',
    name: 'Oak Harbor',
    builderName: 'Summit Residential',
    city: 'Fort Mill',
    state: 'SC',
    phaseCount: 2,
    lotCount: 88,
    lastUpdatedAtIso: '2026-02-20T14:10:00Z',
  },
];

export const MOCK_COMMUNITY_RECORDS: Record<string, CommunityMapOpsRecord> = {
  'cypress-ridge': {
    summary: MOCK_COMMUNITIES[0],
    intakeDraft: {
      nearestAddress: '1458 Cedar View Dr, Georgetown, TX 78628',
      seedCoordinates: { lat: 30.6852, lng: -97.7442 },
      attachments: [
        {
          id: 'att-plat-1',
          kind: 'plat-pdf',
          filename: 'cypress-ridge-phase-2-plat.pdf',
          uploadedAtIso: '2026-02-19T16:00:00Z',
          sizeBytes: 4_832_441,
        },
        {
          id: 'att-orth-1',
          kind: 'orthophoto',
          filename: 'orthophoto-2026-01-30.png',
          uploadedAtIso: '2026-02-19T16:08:00Z',
          sizeBytes: 14_228_002,
        },
      ],
      controlPoints: [
        { id: 'cp-1', label: 'NW corner', sourceX: 48, sourceY: 62, worldLat: 30.68612, worldLng: -97.7458, confidence: 'high' },
        { id: 'cp-2', label: 'Main gate', sourceX: 362, sourceY: 228, worldLat: 30.6849, worldLng: -97.7435, confidence: 'high' },
        { id: 'cp-3', label: 'Trail bend', sourceX: 688, sourceY: 412, worldLat: 30.68395, worldLng: -97.7411, confidence: 'medium' },
      ],
    },
    geoPreview: {
      generatedAtIso: '2026-02-21T18:30:00Z',
      roads: [
        {
          id: 'road-cedar-loop',
          name: 'Cedar Loop',
          submitted: true,
          coordinates: [
            [-97.7456, 30.6859],
            [-97.7442, 30.6851],
            [-97.7428, 30.6847],
            [-97.7416, 30.6849],
          ],
        },
        {
          id: 'road-ash-glen',
          name: 'Ash Glen Way',
          submitted: false,
          coordinates: [
            [-97.7441, 30.68505],
            [-97.7445, 30.6839],
            [-97.7437, 30.6832],
          ],
        },
        {
          id: 'road-maple-court',
          name: 'Maple Court',
          submitted: true,
          coordinates: [
            [-97.7429, 30.68472],
            [-97.7422, 30.68395],
            [-97.7415, 30.68378],
          ],
        },
      ],
      lots: [
        { id: 'lot-201', label: '201', status: 'planned', coordinates: [[-97.7449, 30.6852], [-97.7445, 30.6851], [-97.7444, 30.6848], [-97.7448, 30.6849], [-97.7449, 30.6852]] },
        { id: 'lot-202', label: '202', status: 'active', coordinates: [[-97.7444, 30.6851], [-97.744, 30.685], [-97.7439, 30.6848], [-97.7443, 30.6848], [-97.7444, 30.6851]] },
        { id: 'lot-224', label: '224', status: 'sold', coordinates: [[-97.7424, 30.6841], [-97.742, 30.684], [-97.7419, 30.6838], [-97.7423, 30.68385], [-97.7424, 30.6841]] },
      ],
      addressPoints: [
        { id: 'addr-201', lotId: 'lot-201', addressLabel: '2108 Ash Glen Way', lat: 30.685, lng: -97.7447 },
        { id: 'addr-202', lotId: 'lot-202', addressLabel: '2112 Ash Glen Way', lat: 30.68492, lng: -97.7442 },
        { id: 'addr-224', lotId: 'lot-224', addressLabel: '105 Maple Court', lat: 30.68392, lng: -97.74215 },
      ],
    },
    validationIssues: [
      {
        id: 'issue-road-gap-ash-maple',
        severity: 'warning',
        code: 'road_gap',
        featureId: 'road-ash-glen',
        message: 'Ash Glen Way endpoint is 18 ft from Maple Court connector. Consider snapping prior to submission.',
      },
      {
        id: 'issue-control-points',
        severity: 'warning',
        code: 'insufficient_control_points',
        message: 'Only 3 control points detected; 4+ recommended for better affine stability.',
      },
    ],
    mapHealth: {
      missingRoadsBefore: 3,
      missingRoadsAfter: 1,
      missingAddressRangesBefore: 41,
      missingAddressRangesAfter: 6,
      brytoTargetBusinessDays: [2, 10],
      platformVariabilityDays: [7, 28],
      scoreBreakdown: {
        evidenceCompleteness: 84,
        geometryValidity: 91,
        addressCoverage: 88,
        connectivity: 73,
      },
      confidenceScore: 84,
    },
    submissions: [
      {
        id: 'sub-phase2-v1',
        versionLabel: 'v1',
        communityId: 'cypress-ridge',
        phaseLabel: 'Phase 2',
        status: 'submitted',
        createdAtIso: '2026-02-20T11:40:00Z',
        submittedAtIso: '2026-02-20T16:15:00Z',
        changedLots: ['201', '202', '203', '204'],
        changedRoads: ['Cedar Loop', 'Ash Glen Way'],
        attachments: [],
        notes: ['Initial road centerline + lot address points package.'],
        checklist: [
          { id: 'chk-1', label: 'Plat uploaded and legible', done: true },
          { id: 'chk-2', label: 'Address range sheet attached', done: true },
          { id: 'chk-3', label: 'Road endpoints snapped', done: false },
        ],
        auditTrail: [
          { id: 'ae-1', atIso: '2026-02-20T11:41:00Z', actor: 'M. Chen', type: 'bundle-generated', message: 'Generated GeoJSON + coordinates export.' },
          { id: 'ae-2', atIso: '2026-02-20T16:15:00Z', actor: 'Bryto Ops', type: 'status-change', message: 'Status changed Draft -> Submitted.' },
        ],
      },
      {
        id: 'sub-phase2-v2',
        versionLabel: 'v2',
        communityId: 'cypress-ridge',
        phaseLabel: 'Phase 2',
        status: 'accepted',
        createdAtIso: '2026-02-21T09:10:00Z',
        submittedAtIso: '2026-02-21T10:20:00Z',
        changedLots: ['205', '206', '224'],
        changedRoads: ['Maple Court'],
        attachments: [],
        notes: ['Added corrected connector and lot 224 address point.'],
        checklist: [
          { id: 'chk-1', label: 'Plat uploaded and legible', done: true },
          { id: 'chk-2', label: 'Address range sheet attached', done: true },
          { id: 'chk-3', label: 'Road endpoints snapped', done: true },
        ],
        auditTrail: [
          { id: 'ae-3', atIso: '2026-02-21T09:12:00Z', actor: 'M. Chen', type: 'note', message: 'Resolved connector geometry gap around Maple Court.' },
          { id: 'ae-4', atIso: '2026-02-21T10:20:00Z', actor: 'Bryto Ops', type: 'status-change', message: 'Status changed Draft -> Submitted.' },
          { id: 'ae-5', atIso: '2026-02-22T08:05:00Z', actor: 'Bryto Ops', type: 'status-change', message: 'Status changed Submitted -> Accepted.' },
        ],
      },
    ],
    capturePlans: [
      {
        id: 'route-p2-alpha',
        name: 'Phase 2 full loop',
        estimatedMinutes: 18,
        captureDateIso: '2026-02-24T15:00:00Z',
        segments: [
          { id: 'seg-1', roadName: 'Cedar Loop', lengthFt: 1430, covered: true, plannedDrive: true },
          { id: 'seg-2', roadName: 'Ash Glen Way', lengthFt: 820, covered: false, plannedDrive: true },
          { id: 'seg-3', roadName: 'Maple Court', lengthFt: 610, covered: true, plannedDrive: true },
        ],
      },
    ],
    publishingBatches: [
      {
        id: 'batch-0219-a',
        routePlanId: 'route-p2-alpha',
        state: 'processing',
        uploadedAtIso: '2026-02-21T13:14:00Z',
        imagesCount: 382,
        metadataComplete: true,
      },
      {
        id: 'batch-0218-z',
        routePlanId: 'route-p2-alpha',
        state: 'live',
        uploadedAtIso: '2026-02-18T17:03:00Z',
        processedAtIso: '2026-02-19T10:55:00Z',
        liveAtIso: '2026-02-20T09:18:00Z',
        imagesCount: 214,
        metadataComplete: true,
      },
    ],
  },
  'oak-harbor': {
    summary: MOCK_COMMUNITIES[1],
    intakeDraft: {
      nearestAddress: '880 Harbor Birch Ln, Fort Mill, SC 29715',
      seedCoordinates: { lat: 35.0104, lng: -80.9721 },
      attachments: [],
      controlPoints: [],
    },
    geoPreview: {
      generatedAtIso: '2026-02-20T14:04:00Z',
      lots: [],
      roads: [],
      addressPoints: [],
    },
    validationIssues: [],
    mapHealth: {
      missingRoadsBefore: 5,
      missingRoadsAfter: 5,
      missingAddressRangesBefore: 58,
      missingAddressRangesAfter: 58,
      brytoTargetBusinessDays: [2, 10],
      platformVariabilityDays: [7, 28],
      scoreBreakdown: {
        evidenceCompleteness: 32,
        geometryValidity: 0,
        addressCoverage: 0,
        connectivity: 0,
      },
      confidenceScore: 12,
    },
    submissions: [],
    capturePlans: [],
    publishingBatches: [],
  },
};

export function getMockCommunityRecord(id: string): CommunityMapOpsRecord | null {
  return MOCK_COMMUNITY_RECORDS[id] ?? null;
}

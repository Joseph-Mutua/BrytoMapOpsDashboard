export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CommunitySummary {
  id: string;
  name: string;
  builderName: string;
  city: string;
  state: string;
  phaseCount: number;
  lotCount: number;
  lastUpdatedAtIso: string;
}

export interface IntakeAttachment {
  id: string;
  kind: 'plat-pdf' | 'site-plan-image' | 'orthophoto' | 'address-sheet' | 'notes';
  filename: string;
  uploadedAtIso: string;
  sizeBytes: number;
}

export interface PlatControlPoint {
  id: string;
  label: string;
  sourceX: number;
  sourceY: number;
  worldLat: number;
  worldLng: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface GeoAddressPoint {
  id: string;
  lotId: string;
  addressLabel: string;
  lat: number;
  lng: number;
}

export interface GeoRoadSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  submitted: boolean;
}

export interface GeoLotPolygon {
  id: string;
  label: string;
  coordinates: [number, number][];
  status: 'planned' | 'active' | 'sold';
}

export interface GeoPreviewSnapshot {
  lots: GeoLotPolygon[];
  roads: GeoRoadSegment[];
  addressPoints: GeoAddressPoint[];
  generatedAtIso: string;
}

export interface GeometryValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  code:
    | 'invalid_polygon'
    | 'self_intersection'
    | 'duplicate_address'
    | 'road_gap'
    | 'insufficient_control_points';
  message: string;
  featureId?: string;
}

export interface IntakeDraft {
  nearestAddress: string;
  seedCoordinates: { lat: number | null; lng: number | null };
  attachments: IntakeAttachment[];
  controlPoints: PlatControlPoint[];
}

export interface BeforeAfterMetric {
  label: string;
  before: number;
  after: number;
  target?: number;
  unit?: 'count' | 'percent' | 'days';
}

export interface MapHealthScoreBreakdown {
  evidenceCompleteness: number;
  geometryValidity: number;
  addressCoverage: number;
  connectivity: number;
}

export interface MapHealthSnapshot {
  missingRoadsBefore: number;
  missingRoadsAfter: number;
  missingAddressRangesBefore: number;
  missingAddressRangesAfter: number;
  brytoTargetBusinessDays: [number, number];
  platformVariabilityDays: [number, number];
  scoreBreakdown: MapHealthScoreBreakdown;
  confidenceScore: number;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'live';

export interface AuditEvent {
  id: string;
  atIso: string;
  actor: string;
  type: 'status-change' | 'note' | 'checklist' | 'bundle-generated';
  message: string;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface SubmissionVersion {
  id: string;
  versionLabel: string;
  communityId: string;
  phaseLabel: string;
  status: SubmissionStatus;
  createdAtIso: string;
  submittedAtIso?: string;
  changedLots: string[];
  changedRoads: string[];
  attachments: IntakeAttachment[];
  notes: string[];
  checklist: ReviewChecklistItem[];
  auditTrail: AuditEvent[];
}

export interface RouteSegmentPlan {
  id: string;
  roadName: string;
  lengthFt: number;
  covered: boolean;
  plannedDrive: boolean;
}

export interface CaptureRoutePlan {
  id: string;
  name: string;
  segments: RouteSegmentPlan[];
  estimatedMinutes: number;
  captureDateIso?: string;
}

export type PublishingState = 'ready' | 'uploaded' | 'processing' | 'live' | 'failed';

export interface PublishingBatch {
  id: string;
  routePlanId: string;
  state: PublishingState;
  uploadedAtIso?: string;
  processedAtIso?: string;
  liveAtIso?: string;
  imagesCount: number;
  metadataComplete: boolean;
}

export interface CommunityMapOpsRecord {
  summary: CommunitySummary;
  intakeDraft: IntakeDraft;
  geoPreview: GeoPreviewSnapshot;
  validationIssues: GeometryValidationIssue[];
  mapHealth: MapHealthSnapshot;
  submissions: SubmissionVersion[];
  capturePlans: CaptureRoutePlan[];
  publishingBatches: PublishingBatch[];
}

export interface CommunitiesResponse {
  communities: CommunitySummary[];
}

export interface CommunityRecordResponse {
  community: CommunityMapOpsRecord;
}

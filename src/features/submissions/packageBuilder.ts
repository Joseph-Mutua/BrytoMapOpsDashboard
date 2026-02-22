import type { CommunityMapOpsRecord, SubmissionVersion } from '@/domain/types';

export interface SubmissionBundleSummary {
  versionId: string;
  communityId: string;
  phaseLabel: string;
  files: Array<{ name: string; kind: 'geojson' | 'coordinates' | 'evidence-manifest' | 'notes'; bytes: number }>;
}

export function buildSubmissionBundleSummary(
  record: CommunityMapOpsRecord,
  submission: SubmissionVersion,
): SubmissionBundleSummary {
  const roadCount = submission.changedRoads.length;
  const lotCount = submission.changedLots.length;
  const attachmentBytes = submission.attachments.reduce((sum, item) => sum + item.sizeBytes, 0);

  return {
    versionId: submission.id,
    communityId: record.summary.id,
    phaseLabel: submission.phaseLabel,
    files: [
      {
        name: `${record.summary.id}-${submission.phaseLabel.replace(/\s+/g, '-').toLowerCase()}-${submission.versionLabel}.geojson`,
        kind: 'geojson',
        bytes: 1200 + roadCount * 620 + lotCount * 420,
      },
      {
        name: `${submission.id}-coordinates.csv`,
        kind: 'coordinates',
        bytes: 800 + lotCount * 96,
      },
      {
        name: `${submission.id}-evidence-manifest.json`,
        kind: 'evidence-manifest',
        bytes: 600 + attachmentBytes,
      },
      {
        name: `${submission.id}-notes.txt`,
        kind: 'notes',
        bytes: 240 + submission.notes.join('\n').length,
      },
    ],
  };
}

import { Card, CardHeader } from '@/components/ui';
import type { SubmissionVersion } from '@/domain/types';
import { formatUtcDateTime } from '@/utils/format';

interface StatusTimelineProps {
  submissions: SubmissionVersion[];
}

export function StatusTimeline({ submissions }: StatusTimelineProps) {
  const events = submissions
    .flatMap((submission) =>
      submission.auditTrail.map((event) => ({
        ...event,
        submissionLabel: `${submission.phaseLabel} ${submission.versionLabel}`,
      })),
    )
    .sort((a, b) => (a.atIso > b.atIso ? -1 : 1))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Recent Ops Activity"
        subtitle="Audit-friendly timeline across submission package versions."
      />
      {events.length === 0 ? (
        <p className="muted">No activity yet.</p>
      ) : (
        <ol className="timeline-list">
          {events.map((event) => (
            <li key={event.id} className="timeline-list__item">
              <div className="timeline-list__dot" aria-hidden="true" />
              <div>
                <p className="timeline-list__headline">
                  {event.submissionLabel} · {event.type.replace('-', ' ')}
                </p>
                <p className="timeline-list__text">{event.message}</p>
                <p className="timeline-list__meta">
                  {event.actor} · {formatUtcDateTime(event.atIso)} UTC
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

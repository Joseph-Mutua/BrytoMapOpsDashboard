import { Card, CardHeader } from '@/components/ui';

export function DashboardHomePage() {
  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title="Community Overview"
          subtitle="Bryto-aligned operations workspace for map fixes, submissions, and street-view publishing."
        />
        <p className="muted">
          Feature modules are scaffolded and will be implemented in subsequent commits.
        </p>
      </Card>
    </div>
  );
}

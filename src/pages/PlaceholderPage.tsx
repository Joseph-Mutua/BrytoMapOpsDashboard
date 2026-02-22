import { Card, CardHeader } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="page-stack">
      <Card>
        <CardHeader
          title={title}
          subtitle="Planned feature surface; implementation arrives in later commits to keep history reviewable."
        />
      </Card>
    </div>
  );
}

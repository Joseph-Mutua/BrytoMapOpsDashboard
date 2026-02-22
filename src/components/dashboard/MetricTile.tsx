import { Card } from '@/components/ui';

interface MetricTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'warning';
}

export function MetricTile({ label, value, hint, tone = 'default' }: MetricTileProps) {
  return (
    <Card className={['metric-tile', `metric-tile--${tone}`].join(' ')}>
      <p className="metric-tile__label">{label}</p>
      <p className="metric-tile__value">{value}</p>
      {hint ? <p className="metric-tile__hint">{hint}</p> : null}
    </Card>
  );
}

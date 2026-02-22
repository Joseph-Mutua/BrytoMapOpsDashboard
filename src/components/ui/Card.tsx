import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </section>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <header className="card__header">
      <div>
        <h2 className="card__title">{title}</h2>
        {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="card__actions">{actions}</div> : null}
    </header>
  );
}

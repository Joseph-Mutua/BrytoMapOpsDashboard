import { NavLink, Outlet } from 'react-router-dom';
import { Card } from '@/components/ui';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/intake', label: 'Intake + Geo' },
  { to: '/map-health', label: 'Map Health' },
  { to: '/submissions', label: 'Submissions' },
  { to: '/streetview-ops', label: 'StreetView Ops' },
] as const;

function navClassName(isActive: boolean): string {
  return ['app-nav__link', isActive ? 'app-nav__link--active' : ''].filter(Boolean).join(' ');
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true">
        <div className="app-backdrop__mesh" />
        <div className="app-backdrop__orb app-backdrop__orb--north" />
        <div className="app-backdrop__orb app-backdrop__orb--east" />
      </div>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <div>
          <p className="app-header__eyebrow">Bryto</p>
          <h1 className="app-header__title">Community MapOps Dashboard</h1>
        </div>
        <div className="app-header__meta" aria-label="Workspace scope">
          <span className="pill pill--accent">Self-serve preview</span>
          <span className="pill">Status dashboard</span>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar" aria-label="Primary navigation">
          <Card>
            <nav className="app-nav">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </Card>
        </aside>

        <main id="main-content" className="app-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

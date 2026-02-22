import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteFocusManager() {
  const location = useLocation();

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.focus({ preventScroll: false });
  }, [location.pathname]);

  return null;
}

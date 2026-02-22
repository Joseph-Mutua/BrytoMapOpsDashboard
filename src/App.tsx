import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardHomePage } from '@/pages/DashboardHomePage';
import { IntakePage } from '@/pages/IntakePage';
import { MapHealthPage } from '@/pages/MapHealthPage';
import { SubmissionsPage } from '@/pages/SubmissionsPage';
import { StreetViewOpsPage } from '@/pages/StreetViewOpsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardHomePage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/map-health" element={<MapHealthPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/streetview-ops" element={<StreetViewOpsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

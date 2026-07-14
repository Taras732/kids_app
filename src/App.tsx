import { useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from '@/pages/Welcome';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import RoleSelect from '@/pages/RoleSelect';
import Hub from '@/pages/Hub';
import ParentDashboard from '@/pages/ParentDashboard';
import GamePlayer from '@/pages/GamePlayer';
import Placement from '@/pages/Placement';
import DayPlan from '@/pages/DayPlan';
import { useAuthStore } from '@/stores/useAuthStore';

// Легасі-сторінки (Welcome/Auth/Onboarding/...) поки в телефонній рамці.
function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="app-container">{children}</div>;
}

// Ігрова частина — повноцінний веб-застосунок, адаптивний під мобілку.
function WebShell({ children }: { children: ReactNode }) {
  return <div className="web-shell">{children}</div>;
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* TODO(auth): тимчасово / веде одразу на дашборд (вхід/реєстрація відкладені).
            Повернути <Welcome /> на "/", коли візьмемось за auth. */}
        <Route path="/" element={<Navigate to="/hub" replace />} />
        <Route path="/welcome" element={<PhoneFrame><Welcome /></PhoneFrame>} />
        <Route path="/auth" element={<PhoneFrame><Auth /></PhoneFrame>} />
        <Route path="/role" element={<PhoneFrame><RoleSelect /></PhoneFrame>} />
        <Route path="/onboarding" element={<PhoneFrame><Onboarding /></PhoneFrame>} />
        {/* S1: кабінет батьків — веб-SaaS layout, як Hub/GamePlayer, а не телефонна рамка. */}
        <Route path="/parent" element={<WebShell><ParentDashboard /></WebShell>} />
        <Route path="/hub" element={<WebShell><Hub /></WebShell>} />
        <Route path="/placement" element={<WebShell><Placement /></WebShell>} />
        <Route path="/day" element={<WebShell><DayPlan /></WebShell>} />
        <Route path="/game/:id" element={<WebShell><GamePlayer /></WebShell>} />
      </Routes>
    </Router>
  );
}

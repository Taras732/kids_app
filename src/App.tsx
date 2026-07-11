import { useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from '@/pages/Welcome';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import RoleSelect from '@/pages/RoleSelect';
import Hub from '@/pages/Hub';
import ParentDashboard from '@/pages/ParentDashboard';
import GamePlayer from '@/pages/GamePlayer';
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
        <Route path="/" element={<PhoneFrame><Welcome /></PhoneFrame>} />
        <Route path="/auth" element={<PhoneFrame><Auth /></PhoneFrame>} />
        <Route path="/role" element={<PhoneFrame><RoleSelect /></PhoneFrame>} />
        <Route path="/onboarding" element={<PhoneFrame><Onboarding /></PhoneFrame>} />
        <Route path="/parent" element={<PhoneFrame><ParentDashboard /></PhoneFrame>} />
        <Route path="/hub" element={<WebShell><Hub /></WebShell>} />
        <Route path="/game/:id" element={<WebShell><GamePlayer /></WebShell>} />
      </Routes>
    </Router>
  );
}

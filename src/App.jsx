import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import useAppStore from './store/useAppStore';

// Pages
import Landing     from './pages/Landing';
import Dashboard   from './pages/Dashboard';
import Logger      from './pages/Logger';
import Coach       from './pages/Coach';
import History     from './pages/History';
import Challenges  from './pages/Challenges';
import WeeklyReport from './pages/WeeklyReport';
import CarbonTwin  from './pages/CarbonTwin';
import Privacy     from './pages/Privacy';
import Terms       from './pages/Terms';

// Layout
import Navbar         from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import FloatingCoach  from './components/coach/FloatingCoach';
import Toast          from './components/ui/Toast';
import SetupBanner    from './components/ui/SetupBanner';
import Footer         from './components/layout/Footer';

function AppContent() {
  useAuth();
  useFirestore();

  const { user, profile, toast, authInitialized } = useAppStore();

  const needsOnboarding = user && profile && !profile.onboardingComplete;

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SetupBanner />
      {toast && <Toast message={toast.msg} type={toast.type} key={toast.id} />}

      {needsOnboarding ? (
        <OnboardingWizard />
      ) : (
        <>
          {user && <Navbar />}
          <main className={user ? 'md:ml-64 min-h-screen flex flex-col' : 'min-h-screen flex flex-col'}>
            <div className="flex-1">
              <Routes>
                <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/log"       element={<ProtectedRoute><Logger /></ProtectedRoute>} />
                <Route path="/coach"     element={<ProtectedRoute><Coach /></ProtectedRoute>} />
                <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/challenges"element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
                <Route path="/report"    element={<ProtectedRoute><WeeklyReport /></ProtectedRoute>} />
                <Route path="/twin"      element={<ProtectedRoute><CarbonTwin /></ProtectedRoute>} />
                <Route path="/privacy"   element={<Privacy />} />
                <Route path="/terms"     element={<Terms />} />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </main>
          {user && <FloatingCoach />}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

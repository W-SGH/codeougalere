import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { CoursesProvider } from './context/CoursesContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ConsentNotice from './components/ConsentNotice';
import { Analytics } from '@vercel/analytics/react';
import { usePageTracking } from './hooks/usePageTracking';

function PageTracker() {
  usePageTracking();
  return null;
}

// Chargement différé de chaque page (code splitting par route)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CoursePlayerPage = lazy(() => import('./pages/CoursePlayerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const PolitiqueConfidentialitePage = lazy(() => import('./pages/PolitiqueConfidentialitePage'));
const CGVPage = lazy(() => import('./pages/CGVPage'));
const PreRegistrationPage = lazy(() => import('./pages/PreRegistrationPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <CoursesProvider>
      <ProgressProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/tarifs" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/exam" element={<ProtectedRoute requireAccess><ExamPage /></ProtectedRoute>} />
              <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
              <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialitePage />} />
              <Route path="/cgv" element={<CGVPage />} />
              <Route path="/preinscription" element={<PreRegistrationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAccess>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/player"
                element={
                  <ProtectedRoute requireAccess>
                    <CoursePlayerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <PageTracker />
          <ConsentNotice />
          <Analytics />
        </Router>
      </ProgressProvider>
    </CoursesProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { CoursesProvider } from './context/CoursesContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import LoginPage from './pages/LoginPage';
import SuccessPage from './pages/SuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import OnboardingPage from './pages/OnboardingPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import ExamPage from './pages/ExamPage';
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage';
import CGVPage from './pages/CGVPage';
import PreRegistrationPage from './pages/PreRegistrationPage';
import ConsentNotice from './components/ConsentNotice';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <CoursesProvider>
      <ProgressProvider>
        <Router>
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
          </Routes>
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

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';
import { theme } from '@/theme/theme';

// Placeholder components for other routes
const Patients = () => <div>Patients Page</div>;
const Visits = () => <div>Visits Page</div>;
const VisitDetail = () => <div>Visit Detail Page</div>;
const TranscriptUpload = () => <div>Transcript Upload Page</div>;
const AIAnalysis = () => <div>AI Analysis Page</div>;
const VisitNotes = () => <div>Visit Notes Page</div>;
const Settings = () => <div>Settings Page</div>;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} />;
};

function App() {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route
            path={ROUTES.HOME}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.DASHBOARD} />
              ) : (
                <Navigate to={ROUTES.LOGIN} />
              )
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PATIENTS}
            element={
              <ProtectedRoute>
                <Layout>
                  <Patients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISITS}
            element={
              <ProtectedRoute>
                <Layout>
                  <Visits />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISIT_DETAIL}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TRANSCRIPT_UPLOAD}
            element={
              <ProtectedRoute>
                <Layout>
                  <TranscriptUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AI_ANALYSIS}
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISIT_NOTES}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitNotes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
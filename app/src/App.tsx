import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Card, CardContent } from '@mui/material';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { PatientManagement } from '@/pages/PatientManagement';
import { VisitManagement } from '@/pages/VisitManagement';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';
import { theme } from '@/theme/theme';

// Proper page components with visible content

// Visits component is now replaced by VisitManagement

const VisitDetail = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Visit Detail
    </Typography>
    <Card>
      <CardContent>
        <Typography variant="body1">
          Detailed visit information - Coming soon!
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

const TranscriptUpload = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Transcript Upload
    </Typography>
    <Card>
      <CardContent>
        <Typography variant="body1">
          Upload and process visit transcripts - Coming soon!
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

const AIAnalysis = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Analysis
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            AI-powered visit analysis and insights - Coming soon!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

const VisitNotes = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Visit Notes
    </Typography>
    <Card>
      <CardContent>
        <Typography variant="body1">
          Generated visit notes and documentation - Coming soon!
        </Typography>
      </CardContent>
    </Card>
  </Box>
);



interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} />;
};

function App() {
  const { initialize, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

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
                  <PatientManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VISITS}
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitManagement />
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
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
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
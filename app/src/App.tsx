import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/constants';

// Placeholder components for other routes
const Patients = () => <div>Patients Page</div>;
const Screening = () => <div>Screening Page</div>;
const Vitals = () => <div>Vitals Page</div>;
const Charts = () => <div>Charts Page</div>;
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
          path={ROUTES.SCREENING}
          element={
            <ProtectedRoute>
              <Layout>
                <Screening />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VITALS}
          element={
            <ProtectedRoute>
              <Layout>
                <Vitals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CHARTS}
          element={
            <ProtectedRoute>
              <Layout>
                <Charts />
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
  );
}

export default App; 
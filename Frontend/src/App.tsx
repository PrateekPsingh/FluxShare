import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from './pages/UploadPage';
import { FilesPage } from './pages/FilesPage';
import { FileDetailsPage } from './pages/FileDetailsPage';
import { Login } from './pages/Login';
import { SharedLinksPage } from './pages/SharedLinksPage';
import { PublicSharePage } from './pages/PublicSharePage';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="auth-form-wrapper">
          <div className="auth-form-card">
            <div className="auth-logo" style={{ margin: '0 auto var(--spacing-8)' }} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated && !isLoading ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files/:id"
        element={
          <ProtectedRoute>
            <FileDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared-links"
        element={
          <ProtectedRoute>
            <SharedLinksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/share/:token"
        element={<PublicSharePage />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated && !isLoading ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

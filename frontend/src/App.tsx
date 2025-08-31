import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

// Auth Pages
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import RegisterPage from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import CustomizationCenter from './pages/CustomizationCenter';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import RestaurantSetup from './pages/RestaurantSetup';
import UserPreferences from './pages/UserPreferences';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeProvider from './components/ThemeProvider';

// Services & Stores
import { authService } from './services/auth.service';
import { useAuthStore } from './stores/authStore';

function App() {
  const { setUser, setAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setUser(user);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        // Token might be expired
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setAuthenticated, setLoading]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-background-primary">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/setup" element={<RestaurantSetup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="preferences" element={<UserPreferences />} />
              <Route path="customization" element={<CustomizationCenter />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-background-primary">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-text-tertiary mb-4">404</h1>
                    <p className="text-xl text-text-secondary mb-8">Page not found</p>
                    <a
                      href="/dashboard"
                      className="btn-primary inline-block"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Auth Pages
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Protected Pages
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import RestaurantSetup from './pages/RestaurantSetup';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
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
            </Route>

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a
                      href="/dashboard"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

import { Loader, Mail } from 'lucide-react';
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireEmailVerification = false
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loading, setUser, setAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      if (!isAuthenticated && authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setAuthenticated(true);
        } catch (error) {
          // Token invalid, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, setUser, setAuthenticated]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && user && !user.isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address to access this feature.
          </p>
          <button
            onClick={() => authService.sendVerificationEmail(user.email)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Resend verification email
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;

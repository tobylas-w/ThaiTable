import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { authService } from '../services/auth.service';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setError('Invalid or missing verification token');
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      await authService.verifyEmail(token!);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    // This would need the user's email, which could be stored in a state or passed via route
    const email = prompt('Enter your email address:');
    if (email) {
      try {
        await authService.sendVerificationEmail(email);
        alert('Verification email sent! Please check your inbox.');
      } catch (err: any) {
        alert('Failed to send verification email. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting to login...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <div className="space-y-3">
          <button
            onClick={resendVerification}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Resend verification email
          </button>
          <Link
            to="/login"
            className="block w-full text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

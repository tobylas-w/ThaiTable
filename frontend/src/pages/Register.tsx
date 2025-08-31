import { Lock, Mail, User as UserIcon, Utensils } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setAuthenticated, setLoading } = useAuthStore();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name_th: '',
    name_en: '',
    restaurant_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    try {
      const { user } = await authService.register({
        ...form,
        phone: '',
        role: 'OWNER'
      } as any);
      setUser(user);
      setAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left hero panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-yellow-500 to-red-500 items-center justify-center p-10 text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome to ThaiTable</h1>
          <p className="text-lg opacity-90">All-in-one restaurant platform built for Thai businesses.</p>
          <Utensils className="w-16 h-16 mx-auto opacity-80" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Owner Account</h2>
          {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                minLength={8}
              />
            </div>

            {/* Name EN */}
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name_en"
                placeholder="Full name (EN)"
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            {/* Name TH */}
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name_th"
                placeholder="ชื่อเต็ม (TH)"
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            {/* Restaurant ID (temp) */}
            <input
              type="text"
              name="restaurant_id"
              placeholder="Restaurant ID (temporary)"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />

            <button
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors"
            >
              {loading ? 'Creating…' : 'Register'}
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account? <a href="/login" className="text-yellow-600 hover:underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

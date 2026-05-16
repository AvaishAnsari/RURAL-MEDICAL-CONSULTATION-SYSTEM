import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.token);
      if (data.user.role === 'patient') navigate('/patient-dashboard');
      else navigate('/doctor-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2 text-center text-primary">Welcome Back</h1>
        <p className="text-textMuted text-center text-sm mb-6">Sign in to your RuralMed account</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-textMuted mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="neon-button w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Quick-fill for testing */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-textMuted mb-2 text-center">Quick test login:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEmail('john@example.com'); setPassword('password123'); }}
              className="flex-1 text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-textMuted transition-colors"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => { setEmail('sarah@ruralmed.com'); setPassword('password123'); }}
              className="flex-1 text-xs px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-textMuted transition-colors"
            >
              Doctor
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-textMuted text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

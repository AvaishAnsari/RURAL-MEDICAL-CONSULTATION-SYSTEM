import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      login(data.user, data.token);
      if (data.user.role === 'patient') navigate('/patient-dashboard');
      else navigate('/doctor-dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Create Account</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-textMuted mb-1">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Email</label>
            <input 
              type="email" 
              className="input-field" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">I am a</label>
            <select 
              className="input-field [&>option]:bg-gray-900" 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          {formData.role === 'doctor' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm text-textMuted mb-1 mt-2">Specialization</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Cardiologist"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                required={formData.role === 'doctor'} 
              />
            </motion.div>
          )}
          <button type="submit" className="neon-button w-full mt-4">Sign Up</button>
        </form>
        <p className="mt-6 text-center text-textMuted text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;

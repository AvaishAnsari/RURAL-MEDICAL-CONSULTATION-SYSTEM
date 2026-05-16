import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Video, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const DoctorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      fetchAppointments();
    } catch {
      alert('Failed to update appointment status. Please try again.');
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Users /> Patient Queue
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <button
            onClick={fetchAppointments}
            className="text-textMuted hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <p className="text-textMuted text-center py-8 animate-pulse">Loading appointments...</p>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <p className="text-textMuted text-center py-8">No patients in queue.</p>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg">{apt.patientId?.name}</h4>
                  <p className="text-sm text-textMuted">{new Date(apt.time).toLocaleString()}</p>
                  {apt.symptoms && (
                    <p className="text-sm mt-2">
                      <span className="text-purple-400">Symptoms:</span> {apt.symptoms}
                    </p>
                  )}
                  <p className="text-sm mt-1">
                    Status:{' '}
                    <span className={`font-bold ${apt.status === 'approved' ? 'text-green-400' : apt.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {apt.status.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(apt._id, 'approved')}
                        title="Approve"
                        className="bg-green-500/20 text-green-400 border border-green-500 p-2 rounded-lg hover:bg-green-500 hover:text-black transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateStatus(apt._id, 'rejected')}
                        title="Reject"
                        className="bg-red-500/20 text-red-400 border border-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-black transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {apt.status === 'approved' && (
                    <button
                      onClick={() => navigate(`/consultation/${apt._id}`)}
                      className="bg-primary/20 text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-black transition-colors flex items-center gap-2"
                    >
                      <Video className="w-5 h-5" /> Join Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    const res = await fetch('http://localhost:5005/api/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAppointments(Array.isArray(data) ? data : []);
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5005/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    fetchAppointments();
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
          <Users /> Patient Queue
        </h2>
        
        {appointments.length === 0 ? (
          <p className="text-textMuted text-center py-8">No patients in queue.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg">{apt.patientId?.name}</h4>
                  <p className="text-sm text-textMuted">{new Date(apt.time).toLocaleString()}</p>
                  {apt.symptoms && <p className="text-sm mt-2"><span className="text-purple-400">Symptoms:</span> {apt.symptoms}</p>}
                  <p className="text-sm mt-1">Status: <span className={`font-bold ${apt.status === 'approved' ? 'text-green-400' : apt.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{apt.status.toUpperCase()}</span></p>
                </div>
                
                <div className="flex gap-2">
                  {apt.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(apt._id, 'approved')} className="bg-green-500/20 text-green-400 border border-green-500 p-2 rounded-lg hover:bg-green-500 hover:text-black transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateStatus(apt._id, 'rejected')} className="bg-red-500/20 text-red-400 border border-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-black transition-colors">
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

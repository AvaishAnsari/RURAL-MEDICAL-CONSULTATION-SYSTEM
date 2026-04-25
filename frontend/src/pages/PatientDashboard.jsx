import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Calendar as CalendarIcon, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const PatientDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!user) {
      // Don't navigate if loading could be true, but assuming user check is solid here
      return;
    }
    fetchAppointments();
    fetchDoctors();
  }, [user]);

  const fetchAppointments = async () => {
    const res = await fetch(`${API_URL}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAppointments(Array.isArray(data) ? data : []);
  };

  const fetchDoctors = async () => {
    const res = await fetch(`${API_URL}/api/auth/doctors`);
    const data = await res.json();
    setDoctors(Array.isArray(data) ? data : []);
  };

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/ai/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    });
    const data = await res.json();
    setAiResult(data);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        time: date,
        symptoms
      })
    });
    setSymptoms('');
    setAiResult(null);
    fetchAppointments();
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8 py-8">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-400">
            <BrainCircuit /> AI Symptom Checker
          </h2>
          <form onSubmit={handleSymptomCheck} className="space-y-4">
            <textarea 
              className="input-field min-h-[100px]" 
              placeholder="Describe your symptoms (e.g., fever, headache, stomach pain)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            ></textarea>
            <button type="submit" className="neon-button w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">Analyze Symptoms</button>
          </form>

          {aiResult && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
              <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
              <p className="text-textMuted mb-1"><strong>Possible Condition:</strong> {aiResult.condition}</p>
              <p className="text-textMuted mb-4"><strong>Recommendation:</strong> {aiResult.recommendation}</p>
              
              <h4 className="font-bold mb-2">Book Appointment</h4>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <select 
                  className="input-field [&>option]:bg-gray-900"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.filter(d => d.specialization === aiResult.specialization || aiResult.specialization === 'General Physician').map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialization}</option>
                  ))}
                </select>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <button type="submit" className="neon-button w-full">Book Now</button>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 h-fit">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
          <CalendarIcon /> Your Appointments
        </h2>
        {appointments.length === 0 ? (
          <p className="text-textMuted text-center py-8">No appointments booked yet.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt._id} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">Dr. {apt.doctorId?.name}</h4>
                  <p className="text-sm text-textMuted">{new Date(apt.time).toLocaleString()}</p>
                  <p className="text-sm mt-1">Status: <span className={`font-bold ${apt.status === 'approved' ? 'text-green-400' : apt.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{apt.status.toUpperCase()}</span></p>
                </div>
                {apt.status === 'approved' && (
                  <button 
                    onClick={() => navigate(`/consultation/${apt._id}`)}
                    className="bg-green-500/20 text-green-400 border border-green-500 p-2 rounded-full hover:bg-green-500 hover:text-black transition-colors"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PatientDashboard;

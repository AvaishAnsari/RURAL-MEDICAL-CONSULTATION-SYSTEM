import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Video, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Telemedicine</span>
        </h1>
        <p className="text-xl text-textMuted mb-10">
          Bridging the gap in rural healthcare with real-time video consultations and AI-driven symptom analysis.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/signup" className="neon-button text-lg px-8 py-3">Get Started</Link>
          <Link to="/login" className="glass-card px-8 py-3 text-lg hover:bg-white/10 transition-colors inline-block text-center border-white/20">Login</Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="grid md:grid-cols-3 gap-8 w-full max-w-5xl"
      >
        <div className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-primary/20 p-4 rounded-full text-primary mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Live Video Calls</h3>
          <p className="text-textMuted">Connect with doctors face-to-face from anywhere seamlessly using WebRTC technology.</p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-purple-500/20 p-4 rounded-full text-purple-400 mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Symptom Checker</h3>
          <p className="text-textMuted">Get immediate recommendations on who to consult based on your symptoms.</p>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
          <div className="bg-secondary/20 p-4 rounded-full text-secondary mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Triage</h3>
          <p className="text-textMuted">Efficient queue system ensuring critical cases are addressed promptly by specialists.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full top-0 left-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-xl bg-black/40">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
        <Stethoscope className="w-6 h-6" />
        <span>RuralMed</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link 
              to={user.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard'} 
              className="text-white hover:text-primary transition-colors flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            <button onClick={handleLogout} className="text-secondary hover:text-red-400 transition-colors flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white hover:text-primary transition-colors">Login</Link>
            <Link to="/signup" className="neon-button">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Skull, Radiation, ShieldCheck } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { AppState } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

export const AttackOverlay: React.FC = () => {
  const { appState, setAppState } = useEvent();
  const navigate = useNavigate();
  const location = useLocation();

  if (appState !== AppState.ATTACK) return null;

  const handleReturnToAdmin = () => {
    setAppState(AppState.NORMAL);
    navigate('/admin');
  };

  // Only show the return button if the user is on the admin route
  // Using startsWith covers cases like /admin/settings if extended later
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-alarm overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-90 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center p-8 border-4 border-red-600 bg-black/80 rounded-lg max-w-2xl mx-4">
        
        {/* Overlapping Icons */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-8">
          <Radiation size={180} className="text-red-600 animate-spin-slow absolute inset-0 m-auto opacity-80" />
          <Skull size={100} className="text-white relative z-10 animate-pulse drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
        </div>
        
        <h1 className="text-6xl font-black text-red-600 mb-4 tracking-widest uppercase glitch-effect" style={{ fontFamily: 'Courier New, monospace' }}>
          PERIGO
        </h1>
        
        <p className="text-3xl font-bold text-white mb-8 blink-text uppercase">
          O teu telefone está sob ataque
        </p>
        
        <div className="text-red-400 font-mono text-xl border border-red-800 p-4 bg-red-900/20 w-full text-left mb-8">
          <p>{`> DETETADO: PAYLOAD MALICIOSO`}</p>
          <p>{`> ALVO: KERNEL DO SISTEMA`}</p>
          <p>{`> ESTADO: FALHA CRÍTICA IMINENTE`}</p>
        </div>

        {isAdmin && (
          <button 
            onClick={handleReturnToAdmin}
            className="group relative px-6 py-3 font-bold text-red-500 border-2 border-red-600 bg-black hover:bg-red-900/30 hover:text-red-300 transition-all uppercase tracking-widest flex items-center gap-2 cursor-pointer z-50 pointer-events-auto"
          >
            <ShieldCheck className="group-hover:scale-110 transition-transform" />
            <span>REGRESSAR AO ADMIN</span>
          </button>
        )}
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .blink-text {
          animation: blink 0.2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
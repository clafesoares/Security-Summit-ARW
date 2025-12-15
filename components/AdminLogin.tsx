import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Shield, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = useEvent();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(username, password);
    if (!success) {
      setError('Credenciais inválidas. Tente novamente.');
    } else {
      setError('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="max-w-md w-full parchment p-10 rounded-lg shadow-2xl border-4 border-yellow-900/30">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-yellow-900 rounded-full border-2 border-yellow-600 mb-4 shadow-lg">
             <Shield size={40} className="text-yellow-100" />
          </div>
          <h2 className="text-3xl font-bold text-center text-yellow-900 display-font uppercase tracking-widest">
             Área Restrita
          </h2>
          <p className="text-sm text-yellow-800 font-serif italic mt-2">Apenas para o Alto Conselho</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-yellow-900 font-bold mb-1 uppercase text-xs tracking-widest">Utilizador</label>
            <input 
              type="text" 
              required
              className="w-full bg-white/50 border-b-2 border-yellow-900/50 p-3 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50 font-bold"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-yellow-900 font-bold mb-1 uppercase text-xs tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/50 border-b-2 border-yellow-900/50 p-3 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-700 bg-red-100 border border-red-300 p-2 text-center text-sm font-bold rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-yellow-900 hover:bg-yellow-800 text-yellow-100 font-bold py-4 mt-4 transition shadow-lg uppercase tracking-widest border border-yellow-950 flex items-center justify-center gap-2"
          >
            <KeyRound size={18} /> Aceder
          </button>
        </form>
      </div>
    </div>
  );
};
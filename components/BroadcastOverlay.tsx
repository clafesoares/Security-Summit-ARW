import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Scroll, X } from 'lucide-react';

export const BroadcastOverlay: React.FC = () => {
  const { broadcastMessage } = useEvent();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    if (broadcastMessage && broadcastMessage.id !== lastSeenId) {
      setMessage(broadcastMessage.text);
      setIsVisible(true);
      setLastSeenId(broadcastMessage.id);
    }
  }, [broadcastMessage, lastSeenId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-yellow-50/90 parchment rounded-lg shadow-2xl border-4 border-yellow-900 transform scale-100 transition-all">
        
        {/* Header Decoration */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-900 text-yellow-100 px-6 py-2 rounded-full border-2 border-yellow-600 shadow-lg flex items-center gap-2">
            <Scroll size={20} />
            <span className="font-serif font-bold tracking-widest uppercase text-sm">Mensagem do Abade</span>
        </div>

        {/* Content */}
        <div className="p-8 pt-10 text-center">
            <h3 className="text-2xl font-bold text-yellow-900 mb-4 display-font border-b border-yellow-900/30 pb-4">
                Atenção Irmãos
            </h3>
            <p className="text-lg text-gray-900 font-serif leading-relaxed">
                {message}
            </p>
        </div>

        {/* Footer / Close */}
        <div className="bg-yellow-900/10 p-4 flex justify-center border-t border-yellow-900/20">
            <button 
                onClick={() => setIsVisible(false)}
                className="bg-yellow-900 hover:bg-yellow-800 text-yellow-100 font-bold py-2 px-8 rounded shadow-lg uppercase tracking-widest flex items-center gap-2 transition-transform transform hover:scale-105"
            >
                <X size={18} /> FECHAR
            </button>
        </div>
      </div>
    </div>
  );
};
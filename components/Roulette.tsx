import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';

export const Roulette: React.FC = () => {
  const { lotteryState, setLotteryState } = useEvent();
  const [rotation, setRotation] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // All possible numbers in the system could be displayed, 
  // but for the visual we'll display numbers 1-12 like a clock 
  // and show the digital result in the center.
  
  useEffect(() => {
    if (lotteryState.isSpinning) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 15);
      }, 50);
      return () => clearInterval(interval);
    } else if (lotteryState.winner) {
      // Land on a "random" position for visual effect when stopped
      setRotation(prev => {
          const remainder = prev % 360;
          return prev + (360 - remainder); // Reset to top or calculate based on number
      });
    }
  }, [lotteryState.isSpinning, lotteryState.winner]);

  if (!lotteryState.active && !lotteryState.winner) return null;

  const isAdmin = location.pathname.startsWith('/admin');

  const handleReturnToAdmin = () => {
    // Close the lottery state
    setLotteryState(prev => ({
        ...prev,
        active: false,
        currentDraw: null,
        winner: null,
        isSpinning: false
    }));
    navigate('/admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-[400px] h-[400px] wood-pattern rounded-full border-8 border-yellow-700 shadow-2xl flex items-center justify-center">
        
        {/* Clock Face Decoration */}
        <div className="absolute inset-0 rounded-full border-4 border-black opacity-50"></div>
        <div className="absolute w-[360px] h-[360px] marble-pattern rounded-full shadow-inner flex items-center justify-center">
          
          {/* Numbers ring */}
          {[...Array(12)].map((_, i) => (
             <div 
                key={i}
                className="absolute font-serif font-bold text-2xl text-yellow-900"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-140px)`,
                }}
             >
                {/* Roman Numerals or basic dots */}
                <div style={{ transform: `rotate(-${i * 30}deg)` }}>I</div>
             </div>
          ))}

          {/* Center Display */}
          <div className="z-20 flex flex-col items-center">
            {lotteryState.isSpinning ? (
               <div className="text-4xl font-bold text-yellow-800 animate-pulse">A GIRAR...</div>
            ) : (
                <>
                 <div className="text-xl text-yellow-900 font-bold mb-2">VENCEDOR</div>
                 <div className="text-6xl font-black text-red-900 display-font">{lotteryState.winner}</div>
                </>
            )}
          </div>
          
          {/* The Hand */}
          <div 
            className="absolute top-1/2 left-1/2 w-2 h-36 bg-black origin-bottom -translate-x-1/2 -translate-y-full z-10 transition-transform duration-75 ease-linear"
            style={{ 
                transform: `translateX(-50%) translateY(-100%) rotate(${rotation}deg)`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
           <div className="absolute w-6 h-6 bg-yellow-600 rounded-full z-20 border-2 border-black"></div>
        </div>
      </div>
      
      {/* Title */}
      <div className="absolute top-20 text-center">
         <h2 className="text-5xl text-yellow-500 font-serif drop-shadow-lg gold-text">
            Sorteio #{lotteryState.currentDraw}
         </h2>
         <p className="text-white text-xl mt-4 animate-pulse">Preparado para o sorteio?</p>
      </div>

      {/* Admin Return Button */}
      {isAdmin && (
        <button 
          onClick={handleReturnToAdmin}
          className="absolute bottom-10 px-6 py-3 font-bold text-yellow-500 border-2 border-yellow-600 bg-black hover:bg-yellow-900/30 transition-all uppercase tracking-widest flex items-center gap-2 cursor-pointer z-50 hover:scale-105"
        >
          <ArrowLeftCircle className="w-6 h-6" />
          <span>REGRESSAR AO ADMIN</span>
        </button>
      )}
    </div>
  );
};
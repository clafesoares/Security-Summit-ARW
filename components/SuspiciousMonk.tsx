import React, { useState, useEffect } from 'react';

const MONK_PHRASES = [
  "A tua password é '123456', não é?",
  "Cuidado com o Phishing, irmão...",
  "Estou a ver o teu tráfego. Pecaminoso.",
  "A tua firewall é feita de queijo?",
  "Esse USB tem demónios!",
  "Não cliques aí! A tentação é grande...",
  "Já fizeste backup ou estás a rezar?",
  "O Wi-Fi do convento é sagrado.",
  "Vi-te a usar o modo incógnito...",
  "A penitência para malware é pesada.",
  "O teu antivírus é desta década?",
  "Confessaste a tua password a alguém?",
];

export const SuspiciousMonk: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(50); // Percentage from left
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Function to trigger the cycle
    const triggerMonk = () => {
      // Random position (avoiding extreme edges)
      const randomPos = Math.floor(Math.random() * 70) + 10;
      setPosition(randomPos);
      
      // Pick random phrase
      const randomPhrase = MONK_PHRASES[Math.floor(Math.random() * MONK_PHRASES.length)];
      setPhrase(randomPhrase);

      // Appear
      setIsVisible(true);

      // Disappear after a few seconds
      setTimeout(() => {
        setIsVisible(false);
        
        // Schedule next appearance (random time between 15 and 30 seconds)
        const nextTime = Math.random() * 15000 + 15000;
        timeoutId = setTimeout(triggerMonk, nextTime);
      }, 5000); // Stays visible for 5 seconds
    };

    // Initial delay
    timeoutId = setTimeout(triggerMonk, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      className={`fixed bottom-0 z-30 transition-transform duration-700 ease-in-out pointer-events-none`}
      style={{ 
        left: `${position}%`,
        transform: isVisible ? `translateY(0)` : `translateY(100%)`
      }}
    >
      <div className={`relative w-48 flex flex-col items-center`}>
        
        {/* Speech Bubble */}
        <div 
          className={`mb-2 bg-yellow-100 text-black p-3 rounded-xl text-xs font-serif border-2 border-yellow-900 shadow-lg text-center w-48 transition-all duration-500 transform origin-bottom ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        >
          <p className="font-bold">"{phrase}"</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-yellow-100 border-b-2 border-r-2 border-yellow-900 transform rotate-45 -translate-x-1/2"></div>
        </div>

        {/* The Monk SVG - Fully constructed in code to prevent broken images */}
        <div className={`w-40 h-40 filter drop-shadow-2xl ${isVisible ? 'monk-shake' : ''}`}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Robe/Body - Original Dark Brown (#3E2723) */}
            <path d="M50,200 L150,200 L140,150 C160,150 170,120 150,100 L130,50 C120,20 80,20 70,50 L50,100 C30,120 40,150 60,150 L50,200 Z" fill="#3E2723" />
            
            {/* Hood opening - Dark/Black for depth */}
            <path d="M70,50 C80,30 120,30 130,50 C140,80 130,120 100,120 C70,120 60,80 70,50 Z" fill="#1a1a1a" />
            
            {/* Face Shadow - Black */}
            <ellipse cx="100" cy="80" rx="25" ry="30" fill="#000000" />
            
            {/* Eyes Container */}
            <g className="eyes-move">
              {/* Left Eye */}
              <circle cx="90" cy="75" r="6" fill="white" />
              <circle cx="92" cy="75" r="2" fill="black" />
              
              {/* Right Eye */}
              <circle cx="110" cy="75" r="6" fill="white" />
              <circle cx="112" cy="75" r="2" fill="black" />
              
              {/* Eyebrows (Suspicious) */}
              <path d="M85,68 L95,70" stroke="black" strokeWidth="2" />
              <path d="M105,70 L115,68" stroke="black" strokeWidth="2" />
            </g>

            {/* Rope Belt */}
            <path d="M60,150 L140,150" stroke="#EFEBE9" strokeWidth="4" />
            <path d="M90,150 L90,180" stroke="#EFEBE9" strokeWidth="3" />
          </svg>
        </div>

      </div>

      <style>{`
        .monk-shake {
          animation: shake 4s ease-in-out infinite;
        }
        .eyes-move {
          animation: lookAround 3s infinite alternate;
        }
        @keyframes shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg) translateY(2px); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(2deg) translateY(2px); }
          100% { transform: rotate(0deg); }
        }
        @keyframes lookAround {
          0% { transform: translateX(-2px); }
          20% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
};
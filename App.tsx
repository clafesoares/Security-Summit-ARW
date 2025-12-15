import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { Registration } from './components/Registration';
import { AdminPanel } from './components/AdminPanel';
import { AttackOverlay } from './components/AttackOverlay';
import { Roulette } from './components/Roulette';
import { SuspiciousMonk } from './components/SuspiciousMonk';
import { Shield } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Background Image Logic - Using reliable Wikimedia links
  const getBackgroundImage = () => {
    if (isAdmin) {
      // Mafra Library for Admin
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Biblioteca_do_Pal%C3%A1cio_Nacional_de_Mafra_%281%29.jpg/1920px-Biblioteca_do_Pal%C3%A1cio_Nacional_de_Mafra_%281%29.jpg";
    }
    // Mafra Facade for Registration
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Pal%C3%A1cio_Nacional_de_Mafra_-_Fachada.jpg/1920px-Pal%C3%A1cio_Nacional_de_Mafra_-_Fachada.jpg";
  };

  return (
    <div className="min-h-screen wood-pattern text-gray-200 flex flex-col relative overflow-hidden transition-all duration-700">
      
      {/* Background Pencil Sketch Effect */}
      {/* Simplified blending to ensure image is visible */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          // Adjusted filter: brighter, less grayscale, simple sepia
          filter: 'sepia(80%) saturate(150%) hue-rotate(5deg) contrast(110%) brightness(0.6)',
          opacity: 0.5, 
        }}
      />
      
      {/* Vignette Overlay to darken edges and focus content */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

      <AttackOverlay />
      <Roulette />
      <SuspiciousMonk />

      {/* Header */}
      <header className="bg-black/80 border-b border-yellow-900/50 py-6 sticky top-0 z-40 backdrop-blur-md shadow-lg">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center relative z-50">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-yellow-900 rounded-full border-2 border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <Shield size={28} className="text-yellow-100" />
             </div>
             <div>
                 <h1 className="text-2xl font-bold gold-text tracking-wider uppercase drop-shadow-md">Cyber Security Summit</h1>
                 <p className="text-xs text-yellow-600 uppercase tracking-widest font-serif">Edição Convento</p>
             </div>
          </div>
          
          <nav className="space-x-6 text-sm font-serif">
             <Link to="/" className={`hover:text-yellow-400 transition font-bold tracking-wide ${location.pathname === '/' ? 'text-yellow-500 underline decoration-yellow-700 underline-offset-4' : 'text-gray-400'}`}>Registo</Link>
             <Link to="/admin" className={`hover:text-yellow-400 transition font-bold tracking-wide ${location.pathname === '/admin' ? 'text-yellow-500 underline decoration-yellow-700 underline-offset-4' : 'text-gray-400'}`}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6 flex flex-col items-center justify-center relative z-10">
        <div className="w-full">
            {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/90 py-4 text-center text-gray-600 text-xs border-t border-yellow-900/30 relative z-10">
        <p className="font-serif">Cyber Security Summit &copy; 2024. Protege os portões.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <EventProvider>
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Registration />} />
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </Layout>
        </HashRouter>
    </EventProvider>
  );
};

export default App;
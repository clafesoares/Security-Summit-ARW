import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { generateMonasteryWisdom } from '../services/geminiService';
import { SecurityTip, User } from '../types';
import { STANDS_LIST } from '../constants';
import { QRCodeSVG } from 'qrcode.react';
import { Scroll, MapPin, Calendar, Clock, Ticket, Trophy, QrCode, X } from 'lucide-react';

type ViewState = 'landing' | 'register' | 'login' | 'dashboard';

export const Registration: React.FC = () => {
  const { registerUser, users, sponsors, visitStand } = useEvent();
  const [view, setView] = useState<ViewState>('landing');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wisdom, setWisdom] = useState<SecurityTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'pass' | 'info' | 'challenge'>('pass');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanInput, setScanInput] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existing) {
        setLoading(false);
        setErrorMsg("Este email já se encontra registado. Por favor faça login.");
        return;
    }

    try {
        // FIX: Added await to resolve the Promise returned by registerUser
        const user = await registerUser(formData.name, formData.email, formData.phone, formData.company);
        
        if (user) {
            setCurrentUser(user);
            
            // Get AI Content
            const tip = await generateMonasteryWisdom();
            setWisdom(tip);

            setView('dashboard'); // Goes to dashboard, but will show pending state immediately
        } else {
            setErrorMsg("Erro ao registar utilizador. Tente novamente.");
        }
    } catch (err) {
        console.error(err);
        setErrorMsg("Ocorreu um erro inesperado.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
      if (user) {
          setCurrentUser(user);
          setView('dashboard');
          setErrorMsg('');
      } else {
          setErrorMsg("Email não encontrado nos pergaminhos.");
      }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;

      const stand = STANDS_LIST.find(s => s.id === scanInput.toUpperCase().trim());
      
      if (stand) {
          visitStand(currentUser.id, stand.id);
          // Update local user state to reflect change immediately
          const updatedUser = { 
              ...currentUser, 
              visitedStands: currentUser.visitedStands ? [...currentUser.visitedStands, stand.id] : [stand.id] 
          };
          setCurrentUser(updatedUser);
          
          alert(`Relíquia desbloqueada: ${stand.name}!`);
          setShowScanner(false);
          setScanInput('');
      } else {
          alert("Código QR inválido. Tenta novamente (ex: STAND1).");
      }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center min-h-[600px]">
        
        {/* LANDING VIEW */}
        {view === 'landing' && (
            <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-10">
                <div className="text-center max-w-2xl px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-6 display-font gold-text drop-shadow-lg">Bem-vindo ao Summit</h2>
                    <p className="text-xl text-gray-300 mb-8 font-serif leading-relaxed">
                        Entre as paredes de pedra e o código binário, a sabedoria espera por ti.
                        Regista-te para garantir o teu lugar ou acede à tua área de monge.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => setView('register')}
                        className="px-8 py-4 bg-yellow-900 hover:bg-yellow-800 text-yellow-100 font-bold text-lg rounded-lg border-2 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        Nova Inscrição
                    </button>
                    <button 
                        onClick={() => setView('login')}
                        className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold text-lg rounded-lg border-2 border-gray-600 shadow-lg transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        A Minha Área
                    </button>
                </div>
            </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
            <div className="max-w-md w-full mx-auto parchment p-10 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-gray-600 hover:text-black font-bold z-10">← Voltar</button>
                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-900 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-900 rounded-br-lg pointer-events-none"></div>

                <h2 className="text-3xl font-bold text-center text-yellow-900 mb-8 display-font tracking-wider">Junta-te à Ordem</h2>
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-yellow-900 font-bold mb-1 uppercase text-sm tracking-widest">Nome Completo</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-transparent border-b-2 border-yellow-900/50 p-2 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
                            placeholder="ex. Irmão Tomás"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-yellow-900 font-bold mb-1 uppercase text-sm tracking-widest">Empresa</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-transparent border-b-2 border-yellow-900/50 p-2 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
                            placeholder="ex. Tech Citadel"
                            value={formData.company}
                            onChange={e => setFormData({...formData, company: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-yellow-900 font-bold mb-1 uppercase text-sm tracking-widest">Email</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full bg-transparent border-b-2 border-yellow-900/50 p-2 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
                            placeholder="pergaminhos@mosteiro.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-yellow-900 font-bold mb-1 uppercase text-sm tracking-widest">Telefone</label>
                        <input 
                            required 
                            type="tel" 
                            className="w-full bg-transparent border-b-2 border-yellow-900/50 p-2 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
                            placeholder="+351 ..."
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    {errorMsg && <p className="text-red-700 text-sm font-bold text-center">{errorMsg}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-yellow-900 text-yellow-100 font-bold py-4 mt-8 hover:bg-yellow-800 transition shadow-lg uppercase tracking-widest border border-yellow-950"
                    >
                        {loading ? "A Escrever..." : "Assinar o Registo"}
                    </button>
                </form>
            </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
            <div className="max-w-md w-full mx-auto parchment p-10 rounded-lg shadow-2xl relative">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-gray-600 hover:text-black font-bold">← Voltar</button>
                <h2 className="text-3xl font-bold text-center text-yellow-900 mb-8 display-font">Identificação</h2>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-yellow-900 font-bold mb-1 uppercase text-sm tracking-widest">Email Registado</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full bg-transparent border-b-2 border-yellow-900/50 p-2 text-gray-900 focus:outline-none focus:border-yellow-900 placeholder-gray-500/50"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                        />
                    </div>
                    {errorMsg && <p className="text-red-700 text-sm font-bold text-center">{errorMsg}</p>}
                    <button 
                        type="submit" 
                        className="w-full bg-yellow-900 text-yellow-100 font-bold py-3 mt-4 hover:bg-yellow-800 transition shadow-lg uppercase tracking-widest"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && currentUser && (
             currentUser.status === 'pending' ? (
                // PENDING VIEW
                <div className="max-w-lg w-full mx-auto parchment p-8 rounded-lg text-center border-4 border-yellow-800/50">
                    <div className="flex justify-center mb-6">
                        <Clock size={64} className="text-yellow-800 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-yellow-900 mb-4 display-font">Inscrição Sob Análise</h2>
                    <p className="text-gray-800 text-lg mb-6">
                        O Abade do Ciberespaço recebeu o teu pedido. <br/>
                        A tua entrada no mosteiro aguarda aprovação.
                    </p>
                    <p className="text-sm text-gray-600 italic border-t border-gray-400 pt-4">
                        Receberás uma notificação quando a aprovação for concedida.<br/>
                        Por favor volta mais tarde.
                    </p>
                    <button onClick={() => setView('landing')} className="mt-8 text-yellow-900 font-bold underline">Voltar ao Início</button>
                </div>
             ) : (
                // APPROVED DASHBOARD
                <div className="max-w-4xl w-full mx-auto bg-black/80 backdrop-blur-md rounded-xl border border-yellow-900 overflow-hidden shadow-2xl relative">
                    
                    {/* Scanner Modal */}
                    {showScanner && (
                        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
                            <div className="w-full max-w-sm border-2 border-yellow-500 rounded-lg p-6 bg-gray-900 relative">
                                <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X /></button>
                                <div className="text-center mb-6">
                                    <QrCode size={64} className="mx-auto text-yellow-500 mb-4 animate-pulse" />
                                    <h3 className="text-xl font-bold text-white mb-2">Leitor de Relíquias</h3>
                                    <p className="text-gray-400 text-sm">Aponta a câmara para o QR Code do Stand</p>
                                    <p className="text-xs text-gray-600 italic mt-2">(Simulação: Introduz o código, ex: STAND1)</p>
                                </div>
                                <form onSubmit={handleScanSubmit} className="space-y-4">
                                    <input 
                                        autoFocus
                                        type="text" 
                                        className="w-full bg-black border border-yellow-700 p-3 text-center text-white font-mono uppercase tracking-widest text-lg focus:outline-none focus:border-yellow-400"
                                        placeholder="CÓDIGO"
                                        value={scanInput}
                                        onChange={e => setScanInput(e.target.value)}
                                    />
                                    <button type="submit" className="w-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 rounded">
                                        CAPTURAR
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Header */}
                    <div className="bg-yellow-900/90 p-6 flex flex-col md:flex-row justify-between items-center border-b-2 border-yellow-600">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <h2 className="text-2xl font-bold text-yellow-100 display-font">Bem-vindo, {currentUser?.name}</h2>
                            <p className="text-yellow-300 text-sm font-serif">{currentUser?.company}</p>
                        </div>
                        <button onClick={() => { setCurrentUser(null); setView('landing'); }} className="px-4 py-2 border border-yellow-500 text-yellow-200 rounded hover:bg-yellow-800 text-sm">
                            Sair
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black border-b border-gray-800 overflow-x-auto">
                        <button 
                            onClick={() => setDashboardTab('pass')}
                            className={`flex-1 min-w-[120px] py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm md:text-base ${dashboardTab === 'pass' ? 'bg-yellow-900/30 text-yellow-500 border-b-4 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Ticket className="mr-2" size={18} /> Passe
                        </button>
                        <button 
                            onClick={() => setDashboardTab('info')}
                            className={`flex-1 min-w-[120px] py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm md:text-base ${dashboardTab === 'info' ? 'bg-yellow-900/30 text-yellow-500 border-b-4 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Scroll className="mr-2" size={18} /> Evento
                        </button>
                        <button 
                            onClick={() => setDashboardTab('challenge')}
                            className={`flex-1 min-w-[120px] py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm md:text-base ${dashboardTab === 'challenge' ? 'bg-yellow-900/30 text-yellow-500 border-b-4 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Trophy className="mr-2" size={18} /> Desafio
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 min-h-[400px]">
                        {/* TAB: PASSE */}
                        {dashboardTab === 'pass' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="parchment p-8 rounded shadow-lg max-w-md w-full text-center border-4 border-yellow-900/20">
                                    <h3 className="text-2xl text-yellow-900 font-bold mb-6 display-font">Credencial Digital</h3>
                                    <div className="flex justify-center mb-6 bg-white p-2 border-2 border-dashed border-gray-400 inline-block mx-auto">
                                        <QRCodeSVG value={currentUser?.id || ""} size={180} />
                                    </div>
                                    <p className="text-xs text-gray-600 mb-6 uppercase">Apresenta na Entrada</p>
                                    
                                    <div className="bg-black/10 p-4 rounded-lg border border-yellow-900/10">
                                        <h4 className="text-yellow-900 font-bold uppercase text-xs mb-3 tracking-widest">Números do Sorteio</h4>
                                        <div className="flex justify-center gap-3">
                                            {currentUser?.ticketNumbers.map(num => (
                                                <span key={num} className="w-12 h-12 flex items-center justify-center bg-yellow-800 text-yellow-100 rounded-full font-bold shadow-md border border-yellow-600">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {wisdom && (
                                        <div className="mt-6 pt-4 border-t border-gray-400/50">
                                            <p className="font-serif italic text-yellow-900 text-sm">"{wisdom.title}"</p>
                                            <p className="text-xs text-gray-600 mt-1">{wisdom.content}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: INFO / AGENDA */}
                        {dashboardTab === 'info' && (
                            <div className="grid md:grid-cols-2 gap-8 animate-fade-in text-gray-300">
                                <div className="space-y-6">
                                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                                        <h3 className="text-xl text-yellow-500 mb-4 flex items-center font-bold">
                                            <MapPin className="mr-2" /> Localização
                                        </h3>
                                        <p className="text-lg font-serif">Convento de Mafra</p>
                                        <p className="text-gray-400">Terreiro D. João V, 2640-492 Mafra</p>
                                        <p className="text-xs text-gray-500 mt-1">GPS: 38.9369° N, 9.3259° W</p>
                                        <div className="mt-4 h-48 bg-gray-800 rounded flex items-center justify-center overflow-hidden border border-gray-700 relative">
                                             <img 
                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Convento_de_Mafra_01.jpg/1280px-Convento_de_Mafra_01.jpg" 
                                                alt="Convento de Mafra"
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                             />
                                             <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">Convento de Mafra</div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                                        <h3 className="text-xl text-yellow-500 mb-4 flex items-center font-bold">
                                            <Calendar className="mr-2" /> Horário
                                        </h3>
                                        <p className="text-lg font-serif">10 de Fevereiro, 2026</p>
                                        <p className="text-gray-400">09:00H - 22:00H</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-6 rounded-lg border border-white/10 h-full overflow-y-auto max-h-[600px] hide-scrollbar">
                                    <h3 className="text-xl text-yellow-500 mb-6 flex items-center font-bold sticky top-0 bg-gray-900/90 py-2 z-10 backdrop-blur-sm">
                                        <Scroll className="mr-2" /> Agenda da Ordem
                                    </h3>
                                    <ul className="space-y-6 relative border-l-2 border-gray-700 ml-3 pl-6 pb-4">
                                        {[
                                            { time: "09:00H", title: "Receção e Check-In do Evento", desc: "" },
                                            { time: "09:30H", title: "Abertura do Evento", desc: "" },
                                            { time: "10:00H", title: "Welcome", desc: "Pedro Pinto e José Charraz" },
                                            { time: "10:30H", title: "Apresentação ISV", desc: "Caso prático" },
                                            { time: "10:40H", title: "Resposta do Fabricante", desc: "CATO" },
                                            { time: "11:00H", title: "Apresentação ISV", desc: "Caso prático" },
                                            { time: "11:10H", title: "Resposta do Fabricante", desc: "Fortinet" },
                                            { time: "11:30H", title: "Coffee Break", desc: "" },
                                            { time: "12:00H", title: "Apresentação de Caso Prático", desc: "NETSKOPE" },
                                            { time: "12:30H", title: "Encerramento da Manhã", desc: "" },
                                            { time: "13:00H", title: "Almoço Volante", desc: "Jardins da Tapada" },
                                            { time: "14:30H", title: "Apresentação ISV", desc: "" },
                                            { time: "14:40H", title: "Resposta do Fabricante", desc: "SPLUNK" },
                                            { time: "15:00H", title: "Apresentação ISV", desc: "" },
                                            { time: "15:10H", title: "Resposta do Fabricante", desc: "TREND MICRO" },
                                            { time: "15:30H", title: "Entrevista", desc: "Miguel Caldas da Microsoft" },
                                            { time: "16:00H", title: "Coffee Break", desc: "" },
                                            { time: "16:30H", title: "Sala de Exposição", desc: "Visita aos Stands do Portfólio Arrow Cibersegurança" },
                                            { time: "18:00H", title: "Encerramento do Evento", desc: "Cocktail servido nos jardins" },
                                            { time: "19:30H", title: "Jantar", desc: "Claustros" },
                                        ].map((item, idx) => (
                                            <li key={idx} className="relative">
                                                <span className="absolute -left-[31px] top-0 w-4 h-4 bg-yellow-600 rounded-full border-2 border-gray-900"></span>
                                                <span className="text-yellow-400 font-mono text-sm block">
                                                    {item.time}
                                                </span>
                                                <h4 className="font-bold text-gray-200 ml-0">{item.title}</h4>
                                                {item.desc && <p className="text-sm text-gray-500 ml-0">{item.desc}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* TAB: CHALLENGE (MONK'S CHALLENGE) */}
                        {dashboardTab === 'challenge' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="text-center mb-8 max-w-2xl">
                                    <h3 className="text-3xl text-yellow-500 display-font mb-4">O Desafio do Monge</h3>
                                    <p className="text-gray-400">
                                        Percorre os corredores do mosteiro (stands). Procura os códigos secretos escondidos e "scana-os" para completar a tua caderneta de relíquias.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                                    {STANDS_LIST.map((stand) => {
                                        const isVisited = currentUser?.visitedStands?.includes(stand.id);
                                        return (
                                            <div 
                                                key={stand.id} 
                                                className={`aspect-[3/4] rounded-lg border-2 relative overflow-hidden transition-all duration-500 group ${
                                                    isVisited 
                                                    ? 'border-yellow-600 bg-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                                                    : 'border-gray-800 bg-gray-900/50 grayscale opacity-70'
                                                }`}
                                            >
                                                {isVisited ? (
                                                    <img src={stand.imageUrl} alt={stand.name} className="w-full h-full object-cover p-2" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-700">
                                                        <span className="text-4xl font-serif font-bold opacity-20">?</span>
                                                    </div>
                                                )}
                                                
                                                <div className="absolute bottom-0 inset-x-0 bg-black/80 py-2 text-center">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${isVisited ? 'text-yellow-500' : 'text-gray-600'}`}>
                                                        {stand.name}
                                                    </span>
                                                </div>

                                                {isVisited && (
                                                    <div className="absolute top-2 right-2 bg-yellow-500 text-black rounded-full p-1 shadow-lg">
                                                        <Trophy size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 flex justify-center">
                                    <button 
                                        onClick={() => setShowScanner(true)}
                                        className="flex items-center gap-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-full shadow-lg border-2 border-yellow-500 transform hover:scale-105 transition-all animate-bounce-slow"
                                    >
                                        <QrCode size={24} />
                                        <span>LER CÓDIGO DO STAND</span>
                                    </button>
                                </div>

                                <div className="mt-6 text-center text-xs text-gray-500 italic">
                                    Progresso: {currentUser?.visitedStands?.length || 0} / {STANDS_LIST.length} Relíquias
                                </div>
                            </div>
                        )}

                    </div>
                </div>
             )
        )}

        {/* SPONSORS SECTION - BOTTOM */}
        {(view === 'landing' || view === 'register' || view === 'login') && sponsors.length > 0 && (
            <div className="w-full max-w-5xl mx-auto mt-12 mb-8 animate-fade-in-up">
                <div className="bg-black/40 backdrop-blur-sm border-t-4 border-b-4 border-yellow-900/50 p-8 rounded-xl shadow-2xl">
                    <h3 className="text-center text-yellow-500 font-serif text-2xl mb-8 uppercase tracking-[0.2em] drop-shadow-md">
                        Mural de Benfeitores
                    </h3>
                    <div className={`grid gap-8 items-center justify-items-center ${
                        sponsors.length === 1 ? 'grid-cols-1' :
                        sponsors.length === 2 ? 'grid-cols-2' :
                        sponsors.length === 3 ? 'grid-cols-3' :
                        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}>
                        {sponsors.map((sponsor) => (
                            <div key={sponsor.id} className="w-full h-32 flex items-center justify-center p-4 bg-white/90 rounded-md border-2 border-yellow-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-300">
                                <img 
                                    src={sponsor.logoBase64} 
                                    alt={sponsor.name} 
                                    className="max-w-full max-h-full object-contain filter hover:brightness-110" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
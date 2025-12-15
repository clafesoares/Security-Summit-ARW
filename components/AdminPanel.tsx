import React, { useState, useRef } from 'react';
import { useEvent } from '../context/EventContext';
import { AppState } from '../types';
import { Download, Upload, ShieldAlert, CheckCircle, Users, Trophy, Trash2, RotateCcw, ImagePlus, XCircle, Clock, Check } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { users, checkInUser, approveUser, deleteUser, exportUsersToExcel, importUsersFromExcel, appState, setAppState, lotteryState, setLotteryState, sponsors, addSponsor, removeSponsor } = useEvent();
  const [activeTab, setActiveTab] = useState<'users' | 'accreditation' | 'controls' | 'sponsors'>('users');
  const [scanId, setScanId] = useState('');
  const [accreditationMsg, setAccreditationMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);

  const handleCheckIn = () => {
    const success = checkInUser(scanId);
    if (success) {
      setAccreditationMsg(`Sucesso: Utilizador ${scanId.substring(0,8)}... entrou.`);
      setScanId('');
    } else {
      setAccreditationMsg("Erro: ID de utilizador não encontrado.");
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Tem a certeza que deseja eliminar o registo de ${name}? Esta ação não pode ser desfeita.`)) {
      deleteUser(id);
    }
  };

  const toggleAttack = () => {
    if (appState === AppState.NORMAL) {
      setAppState(AppState.ATTACK);
    } else {
      setAppState(AppState.NORMAL);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importUsersFromExcel(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSponsorUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("A imagem é demasiado grande. Por favor utilize imagens inferiores a 2MB.");
            return;
        }
        await addSponsor(file);
        if (sponsorInputRef.current) sponsorInputRef.current.value = "";
    }
  };

  const startLottery = (drawNum: 1 | 2 | 3) => {
    const previousWinningTickets = Object.values(lotteryState.results);
    const previousWinnerIds = new Set<string>();
    users.forEach(user => {
        if (user.ticketNumbers.some(num => previousWinningTickets.includes(num))) {
            previousWinnerIds.add(user.id);
        }
    });
    const eligibleUsers = users.filter(user => !previousWinnerIds.has(user.id));
    const eligibleTickets = eligibleUsers.flatMap(u => u.ticketNumbers);

    if (eligibleTickets.length === 0) {
        if (users.length === 0) return alert("Sem utilizadores registados.");
        return alert("Todos os utilizadores registados já ganharam um prémio ou não há bilhetes disponíveis.");
    }

    setLotteryState({ ...lotteryState, active: true, currentDraw: drawNum, isSpinning: true, winner: null });
    
    setTimeout(() => {
        const winner = eligibleTickets[Math.floor(Math.random() * eligibleTickets.length)];
        setLotteryState(prev => ({ 
            ...prev, 
            isSpinning: false, 
            winner,
            results: {
                ...prev.results,
                [drawNum]: winner
            }
        }));
    }, 4000);
  };

  const resetDraw = (drawNum: 1 | 2 | 3) => {
    if (window.confirm(`Tem a certeza que deseja recomeçar o Sorteio ${drawNum}? O vencedor atual será removido.`)) {
        setLotteryState(prev => {
            const newResults = { ...prev.results };
            delete newResults[drawNum];
            const isCurrentDraw = prev.currentDraw === drawNum;
            return {
                ...prev,
                results: newResults,
                winner: isCurrentDraw ? null : prev.winner,
                active: isCurrentDraw ? false : prev.active,
                currentDraw: isCurrentDraw ? null : prev.currentDraw
            };
        });
    }
  };

  const closeLottery = () => {
      setLotteryState({ ...lotteryState, active: false, currentDraw: null, isSpinning: false, winner: null });
  };

  const getWinnerName = (ticketNumber: number) => {
    const user = users.find(u => u.ticketNumbers.includes(ticketNumber));
    return user ? user.name : "Desconhecido";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-4xl text-center text-yellow-600 mb-8 border-b border-yellow-800 pb-4 display-font">Alto Conselho (Admin)</h2>

      {/* Tabs */}
      <div className="flex justify-center flex-wrap gap-2 mb-8">
        {[
            { id: 'users', label: 'Registos', icon: Users },
            { id: 'accreditation', label: 'Acreditação', icon: CheckCircle },
            { id: 'controls', label: 'Controlos', icon: ShieldAlert },
            { id: 'sponsors', label: 'Patrocinadores', icon: ImagePlus }
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-6 py-2 rounded-t-lg border-2 flex items-center transition-colors ${activeTab === tab.id ? 'bg-yellow-900 border-yellow-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
            >
                <tab.icon className="inline mr-2" size={18} /> {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-gray-900/80 p-8 rounded-lg border border-yellow-900/50 shadow-xl min-h-[400px]">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl text-gray-300">Escrivães Registados ({users.length})</h3>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex items-center bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded transition border border-blue-900"
                    >
                        <Upload size={18} className="mr-2" /> Importar .XLSX
                    </button>
                    <button onClick={exportUsersToExcel} className="flex items-center bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded transition border border-green-900">
                        <Download size={18} className="mr-2" /> Exportar .XLSX
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] hide-scrollbar">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800 text-yellow-500 uppercase sticky top-0 z-10">
                        <tr>
                            <th className="p-3">Nome</th>
                            <th className="p-3">Empresa</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Bilhetes</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-800/50">
                                <td className="p-3 font-medium text-white">{user.name}</td>
                                <td className="p-3 text-gray-400">{user.company}</td>
                                <td className="p-3 text-gray-400">{user.email}</td>
                                <td className="p-3 font-mono text-yellow-200">{user.ticketNumbers.join(', ')}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {user.status === 'pending' ? (
                                        <span className="flex items-center text-yellow-500 text-sm">
                                          <Clock size={14} className="mr-1" /> Pendente
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-green-500 text-sm">
                                          <CheckCircle size={14} className="mr-1" /> Aprovado
                                        </span>
                                      )}
                                    </div>
                                </td>
                                <td className="p-3 text-center flex items-center justify-center gap-2">
                                    {user.status === 'pending' && (
                                      <button
                                        onClick={() => approveUser(user.id)}
                                        className="text-green-500 hover:bg-green-900/20 p-2 rounded transition"
                                        title="Aprovar Inscrição"
                                      >
                                        <Check size={18} />
                                      </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        className="text-red-500 hover:text-red-400 hover:bg-red-900/20 p-2 rounded transition"
                                        title="Eliminar Registo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* ACCREDITATION TAB */}
        {activeTab === 'accreditation' && (
           <div className="flex flex-col items-center justify-center h-full space-y-6">
               <h3 className="text-2xl text-gray-300">Verificação de Guardião</h3>
               <div className="w-full max-w-md">
                   <label className="block text-gray-400 mb-2">Ler ID do Utilizador (Conteúdo QR)</label>
                   <div className="flex space-x-2">
                       <input 
                          type="text" 
                          value={scanId}
                          onChange={(e) => setScanId(e.target.value)}
                          placeholder="Colar UUID aqui..."
                          className="flex-1 bg-gray-800 border border-yellow-700 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                       />
                       <button onClick={handleCheckIn} className="bg-yellow-700 hover:bg-yellow-600 text-white px-6 rounded font-bold">
                           VERIFICAR
                       </button>
                   </div>
               </div>
               {accreditationMsg && (
                   <div className={`p-4 rounded border ${accreditationMsg.includes("Sucesso") ? "bg-green-900/50 border-green-500 text-green-200" : "bg-red-900/50 border-red-500 text-red-200"}`}>
                       {accreditationMsg}
                   </div>
               )}
           </div>
        )}

        {/* CONTROLS TAB */}
        {activeTab === 'controls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Attack Control */}
                <div className="border border-red-900/50 bg-red-950/20 p-6 rounded-lg flex flex-col items-center">
                    <ShieldAlert size={48} className="text-red-600 mb-4" />
                    <h3 className="text-xl text-red-400 mb-4 font-bold">Protocolo de Emergência</h3>
                    <p className="text-gray-400 text-center mb-6 text-sm">Desencadeia um ataque simulado em todos os dispositivos ligados.</p>
                    <button 
                        onClick={toggleAttack}
                        className={`w-full py-4 text-xl font-bold rounded uppercase tracking-widest transition-all ${
                            appState === AppState.ATTACK 
                            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.7)] animate-pulse' 
                            : 'bg-gray-800 text-red-600 border border-red-600 hover:bg-red-900/30'
                        }`}
                    >
                        {appState === AppState.ATTACK ? "PARAR ATAQUE" : "INICIAR ATAQUE"}
                    </button>
                </div>

                {/* Lottery Control */}
                <div className="border border-yellow-900/50 bg-yellow-950/20 p-6 rounded-lg flex flex-col items-center">
                    <Trophy size={48} className="text-yellow-600 mb-4" />
                    <h3 className="text-xl text-yellow-400 mb-4 font-bold">O Grande Sorteio</h3>
                    
                    <div className="grid grid-cols-3 gap-4 w-full mb-4">
                        {[1, 2, 3].map((num) => {
                            const drawNumber = num as 1|2|3;
                            const resultNum = lotteryState.results[drawNumber];
                            const winnerName = resultNum ? getWinnerName(resultNum) : null;
                            const hasWinner = !!resultNum;
                            
                            return (
                                <div key={num} className="flex flex-col space-y-2">
                                    <button 
                                        onClick={() => startLottery(drawNumber)}
                                        disabled={lotteryState.active || hasWinner}
                                        className={`py-3 rounded font-serif border border-yellow-600 transition-colors ${
                                            lotteryState.active || hasWinner
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                            : 'bg-yellow-800 hover:bg-yellow-700 text-white'
                                        }`}
                                    >
                                        Sorteio {num}
                                    </button>
                                    
                                    <div className="h-20 flex flex-col items-center justify-center text-center p-1 bg-black/40 border border-yellow-900/30 rounded relative group">
                                        {winnerName ? (
                                            <>
                                                <span className="text-xs text-yellow-500 font-bold uppercase truncate w-full">{winnerName}</span>
                                                <span className="text-lg font-mono text-white leading-none mt-1">#{resultNum}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); resetDraw(drawNumber); }}
                                                    className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 shadow-md border border-red-800 hover:bg-red-700 z-10 hover:scale-110 transition-transform"
                                                    title="Recomeçar Sorteio"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600 italic">Pendente</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {lotteryState.active && (
                        <div className="text-center mt-2 border-t border-yellow-900/30 pt-4 w-full">
                             <p className="text-yellow-200 mb-2 animate-pulse">
                                {lotteryState.isSpinning ? "A girar a roda..." : `Vencedor Sorteio #${lotteryState.currentDraw}: ${lotteryState.winner}`}
                             </p>
                             {!lotteryState.isSpinning && lotteryState.winner && (
                                 <button onClick={closeLottery} className="text-sm underline text-gray-400 hover:text-white">
                                     Fechar Ecrã de Sorteio
                                 </button>
                             )}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* SPONSORS TAB */}
        {activeTab === 'sponsors' && (
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl text-gray-300">Mural de Benfeitores</h3>
                        <p className="text-gray-500 text-sm">Gerir logotipos exibidos no registo.</p>
                    </div>
                    <div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={sponsorInputRef} 
                            onChange={handleSponsorUpload} 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => sponsorInputRef.current?.click()} 
                            className="flex items-center bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded transition border border-yellow-900"
                        >
                            <Upload size={18} className="mr-2" /> Carregar Logotipo
                        </button>
                    </div>
                </div>

                {sponsors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                        <ImagePlus size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Nenhum patrocinador adicionado ainda.</p>
                        <p className="text-sm">Adicione imagens para aparecerem no ecrã de registo.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto max-h-[500px] p-2">
                        {sponsors.map((sponsor) => (
                            <div key={sponsor.id} className="relative group bg-white/5 rounded-lg border border-yellow-900/30 p-4 flex flex-col items-center">
                                <div className="w-full h-32 flex items-center justify-center bg-white/90 rounded mb-2 overflow-hidden">
                                    <img src={sponsor.logoBase64} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <span className="text-xs text-gray-400 truncate w-full text-center">{sponsor.name}</span>
                                <button 
                                    onClick={() => removeSponsor(sponsor.id)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};
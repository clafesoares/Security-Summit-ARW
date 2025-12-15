import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppState, LotteryState, Sponsor } from '../types';
import { supabase } from '../services/supabaseClient';

interface EventContextType {
  users: User[];
  registerUser: (name: string, email: string, phone: string, company: string) => Promise<User | null>;
  checkInUser: (id: string) => Promise<boolean>;
  approveUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  visitStand: (userId: string, standId: string) => Promise<boolean>;
  appState: AppState;
  setAppState: (state: AppState) => void;
  lotteryState: LotteryState;
  setLotteryState: React.Dispatch<React.SetStateAction<LotteryState>>;
  exportUsersToExcel: () => void;
  importUsersFromExcel: (file: File) => Promise<void>;
  sponsors: Sponsor[];
  addSponsor: (file: File) => Promise<void>;
  removeSponsor: (id: string) => Promise<void>;
  // Event Image
  eventImage: string | null;
  uploadEventImage: (file: File) => Promise<void>;
  removeEventImage: () => Promise<void>;
  // Auth
  isAuthenticated: boolean;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  updateAdminPassword: (newPass: string) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  
  // Local state that reflects DB state
  const [appState, setLocalAppState] = useState<AppState>(AppState.NORMAL);
  const [lotteryState, setLocalLotteryState] = useState<LotteryState>({
      active: false,
      currentDraw: null,
      winner: null,
      isSpinning: false,
      results: {}
  });
  const [eventImage, setEventImage] = useState<string | null>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState('SMTsec2026'); // Default fallback
  const ADMIN_USERNAME = 'ArrowSMT';

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      if (usersData) {
        const mappedUsers: User[] = usersData.map((u: any) => ({
           id: u.id,
           name: u.name,
           email: u.email,
           company: u.company,
           phone: u.phone,
           ticketNumbers: u.ticket_numbers || [],
           checkedIn: u.checked_in,
           registrationDate: u.registration_date,
           status: u.status,
           visitedStands: u.visited_stands || []
        }));
        setUsers(mappedUsers);
      }

      // 2. Fetch Sponsors
      const { data: sponsorsData } = await supabase.from('sponsors').select('*');
      if (sponsorsData) {
        setSponsors(sponsorsData.map((s: any) => ({
           id: s.id,
           name: s.name,
           logoBase64: s.logo_base64
        })));
      }

      // 3. Fetch Global State (App State + Lottery + Admin Password + Event Image)
      const { data: globalData } = await supabase.from('global_state').select('*').eq('id', 1).single();
      if (globalData) {
         setLocalAppState(globalData.app_state as AppState);
         setLocalLotteryState({
             active: globalData.lottery_active,
             currentDraw: globalData.lottery_draw,
             winner: globalData.lottery_winner,
             isSpinning: globalData.lottery_is_spinning,
             results: globalData.lottery_results || {}
         });
         
         // Set password if exists in DB, otherwise keep default
         if (globalData.admin_password) {
             setCurrentAdminPassword(globalData.admin_password);
         }

         // Set Event Image
         if (globalData.event_image_base64) {
             setEventImage(globalData.event_image_base64);
         }
      }
    };

    fetchData();
  }, []);

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    const channel = supabase.channel('public:db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
          if (payload.eventType === 'INSERT') {
             const u = payload.new;
             const newUser: User = {
                 id: u.id,
                 name: u.name,
                 email: u.email,
                 company: u.company,
                 phone: u.phone,
                 ticketNumbers: u.ticket_numbers || [],
                 checkedIn: u.checked_in,
                 registrationDate: u.registration_date,
                 status: u.status,
                 visitedStands: u.visited_stands || []
             };
             setUsers(prev => [...prev, newUser]);
          } 
          else if (payload.eventType === 'UPDATE') {
             const u = payload.new;
             setUsers(prev => prev.map(user => user.id === u.id ? {
                 ...user,
                 name: u.name,
                 email: u.email,
                 company: u.company,
                 phone: u.phone,
                 ticketNumbers: u.ticket_numbers || [],
                 checkedIn: u.checked_in,
                 status: u.status,
                 visitedStands: u.visited_stands || []
             } : user));
          }
          else if (payload.eventType === 'DELETE') {
             setUsers(prev => prev.filter(user => user.id !== payload.old.id));
          }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, (payload) => {
          if (payload.eventType === 'INSERT') {
              setSponsors(prev => [...prev, { id: payload.new.id, name: payload.new.name, logoBase64: payload.new.logo_base64 }]);
          } else if (payload.eventType === 'DELETE') {
              setSponsors(prev => prev.filter(s => s.id !== payload.old.id));
          }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_state' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
             const g = payload.new;
             setLocalAppState(g.app_state as AppState);
             setLocalLotteryState({
                 active: g.lottery_active,
                 currentDraw: g.lottery_draw,
                 winner: g.lottery_winner,
                 isSpinning: g.lottery_is_spinning,
                 results: g.lottery_results || {}
             });
             // Update password in real-time
             if (g.admin_password) {
                 setCurrentAdminPassword(g.admin_password);
             }
             // Update event image
             if (g.event_image_base64 !== undefined) {
                 setEventImage(g.event_image_base64);
             }
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- AUTH METHODS ---

  const loginAdmin = (username: string, pass: string): boolean => {
      if (username === ADMIN_USERNAME && pass === currentAdminPassword) {
          setIsAuthenticated(true);
          return true;
      }
      return false;
  };

  const logoutAdmin = () => {
      setIsAuthenticated(false);
  };

  const updateAdminPassword = async (newPass: string): Promise<boolean> => {
      setCurrentAdminPassword(newPass);
      const { error } = await supabase.from('global_state').update({ admin_password: newPass }).eq('id', 1);
      return !error;
  };

  // --- ACTIONS ---

  const generateUniqueNumbers = (existingUsers: User[]): number[] => {
    const usedNumbers = new Set(existingUsers.flatMap(u => u.ticketNumbers));
    const newNumbers: number[] = [];
    while (newNumbers.length < 3) {
      const num = Math.floor(Math.random() * 999) + 1;
      if (!usedNumbers.has(num) && !newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    }
    return newNumbers;
  };

  const registerUser = async (name: string, email: string, phone: string, company: string) => {
    const newNumbers = generateUniqueNumbers(users);
    
    const { data, error } = await supabase.from('users').insert({
        name,
        email,
        phone,
        company,
        ticket_numbers: newNumbers,
        checked_in: false,
        registration_date: new Date().toISOString(),
        status: 'pending',
        visited_stands: []
    }).select().single();

    if (error) {
        console.error("Error registering user:", error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        ticketNumbers: data.ticket_numbers,
        checkedIn: data.checked_in,
        registrationDate: data.registration_date,
        status: data.status,
        visitedStands: data.visited_stands
    };
  };

  const approveUser = async (id: string) => {
    await supabase.from('users').update({ status: 'approved' }).eq('id', id);
  };

  const checkInUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return false;

    const { error } = await supabase.from('users').update({ 
        checked_in: true, 
        status: 'approved' 
    }).eq('id', id);

    return !error;
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
  };

  const visitStand = async (userId: string, standId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    
    if (user.visitedStands.includes(standId)) return true;

    const newStands = [...user.visitedStands, standId];
    await supabase.from('users').update({ visited_stands: newStands }).eq('id', userId);
    return true;
  };

  const setAppState = async (state: AppState) => {
      setLocalAppState(state);
      await supabase.from('global_state').update({ app_state: state }).eq('id', 1);
  };

  const updateLotteryState = async (newStateOrFn: LotteryState | ((prev: LotteryState) => LotteryState)) => {
      let newState: LotteryState;
      if (typeof newStateOrFn === 'function') {
          newState = newStateOrFn(lotteryState);
      } else {
          newState = newStateOrFn;
      }
      setLocalLotteryState(newState);

      await supabase.from('global_state').update({
          lottery_active: newState.active,
          lottery_draw: newState.currentDraw,
          lottery_winner: newState.winner,
          lottery_is_spinning: newState.isSpinning,
          lottery_results: newState.results
      }).eq('id', 1);
  };

  const addSponsor = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await supabase.from('sponsors').insert({
            name: file.name.split('.')[0],
            logo_base64: base64
        });
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeSponsor = async (id: string) => {
      await supabase.from('sponsors').delete().eq('id', id);
  };

  const uploadEventImage = async (file: File) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
              const base64 = reader.result as string;
              setEventImage(base64);
              await supabase.from('global_state').update({ event_image_base64: base64 }).eq('id', 1);
              resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const removeEventImage = async () => {
      setEventImage(null);
      await supabase.from('global_state').update({ event_image_base64: null }).eq('id', 1);
  };

  const exportUsersToExcel = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(users.map(u => ({
      ID: u.id,
      "Nome Completo": u.name,
      "Email": u.email,
      "Empresa": u.company,
      "Telefone": u.phone,
      "Números": u.ticketNumbers.join(', '),
      "Estado": u.status === 'approved' ? 'Aprovado' : 'Pendente',
      "Acreditado": u.checkedIn ? "Sim" : "Não",
      "Stands Visitados": u.visitedStands?.join(', ') || "",
      "Data Registo": u.registrationDate
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participantes");
    XLSX.writeFile(wb, "Cyber_Summit_Participantes.xlsx");
  };

  const importUsersFromExcel = async (file: File) => {
    const XLSX = await import('xlsx');
    const reader = new FileReader();

    return new Promise<void>((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
             alert("O ficheiro parece estar vazio.");
             resolve();
             return;
          }

          let count = 0;
          for (const row of jsonData) {
             const normalizeKey = (obj: any, key: string) => {
               const foundKey = Object.keys(obj).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
               return foundKey ? obj[foundKey] : "";
             };

             const name = normalizeKey(row, "Nome Completo");
             const email = normalizeKey(row, "Email");
             const company = normalizeKey(row, "Empresa");
             const phone = normalizeKey(row, "Telefone");

             if (name && email) {
                if (users.some(u => u.email === email)) continue;
                await registerUser(String(name), String(email), String(phone || ""), String(company || ""));
                count++;
             }
          }
          alert(`${count} utilizadores importados com sucesso!`);
          resolve();
        } catch (error) {
          console.error("Erro ao importar Excel:", error);
          alert("Erro ao processar o ficheiro.");
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <EventContext.Provider value={{
      users,
      registerUser,
      checkInUser,
      approveUser,
      deleteUser,
      visitStand,
      appState,
      setAppState,
      lotteryState,
      setLotteryState: updateLotteryState as any,
      exportUsersToExcel,
      importUsersFromExcel,
      sponsors,
      addSponsor,
      removeSponsor,
      eventImage,
      uploadEventImage,
      removeEventImage,
      isAuthenticated,
      loginAdmin,
      logoutAdmin,
      updateAdminPassword
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used within an EventProvider");
  return context;
};
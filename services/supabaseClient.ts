import { createClient } from '@supabase/supabase-js';

// ⚠️ SUBSTITUI ISTO PELOS TEUS DADOS DO SUPABASE ⚠️
// Podes obter estes dados em: Project Settings -> API
const SUPABASE_URL = 'https://jdyxndpfjggopljobfjw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeXhuZHBmamdnb3Bsam9iZmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODUzOTIsImV4cCI6MjA4MTM2MTM5Mn0.yESPs-wlBUcLXcHUOotjhwlveBuRkkF3zvm362_18Bw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
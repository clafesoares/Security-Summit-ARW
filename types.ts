export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  ticketNumbers: number[];
  checkedIn: boolean;
  registrationDate: string;
  status: 'pending' | 'approved';
  visitedStands: string[]; // List of Stand IDs visited
}

export interface Sponsor {
  id: string;
  name: string; // derived from filename
  logoBase64: string;
}

export interface Stand {
  id: string;
  name: string;
  imageUrl: string; // Placeholder or real image
}

export interface LotteryState {
  active: boolean;
  currentDraw: 1 | 2 | 3 | null;
  winner: number | null;
  isSpinning: boolean;
  results: Record<number, number>; // Maps draw number (1,2,3) to winning ticket number
}

export enum AppState {
  NORMAL = 'NORMAL',
  ATTACK = 'ATTACK',
}

export interface SecurityTip {
  title: string;
  content: string;
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InputMethod = 'manual' | 'ai_chat' | 'voice';
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  account_number: string | null;
  initial_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_system: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string;
  input_method: InputMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
  status: 'in_progress' | 'achieved' | 'cancelled';
  created_at: string;
}

import { createClient } from './client';

export interface DbWallet {
  id: string;
  user_id: string;
  name: string;
  account_number?: string;
  initial_balance: number;
  currency: string;
  is_active: boolean;
}

export async function fetchUserWallets(): Promise<DbWallet[] | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching wallets:', error);
      return null;
    }

    return (data || []).map((w: any) => ({
      id: w.id,
      user_id: w.user_id,
      name: w.name,
      account_number: w.account_number || '',
      initial_balance: Number(w.initial_balance || 0),
      currency: w.currency || 'IDR',
      is_active: w.is_active ?? true,
    }));
  } catch (err) {
    console.error('Exception in fetchUserWallets:', err);
    return null;
  }
}

export async function insertWallet(name: string, initialBalance = 0, accountNumber = '') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('wallets')
    .insert([
      {
        user_id: user.id,
        name,
        account_number: accountNumber,
        initial_balance: initialBalance,
        currency: 'IDR',
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

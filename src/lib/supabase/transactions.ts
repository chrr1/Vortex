import { createClient } from './client';

export interface DbTransaction {
  id?: string | number;
  user_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  wallet_id?: string | null;
  date: string;
  entry_method: 'manual' | 'ai_chat' | 'voice' | 'receipt_scan';
}

export async function fetchUserTransactions() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return null;
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      category: t.category || 'Lainnya',
      description: t.description || 'Tanpa keterangan',
      wallet: t.wallet_id || 'cash',
      date: new Date(t.transaction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/(\w+) (\d{4})/, '$1, $2') + ' ' + new Date(t.transaction_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      m: t.input_method || 'manual',
      rawDate: t.transaction_date,
    }));
  } catch (err) {
    console.error('Exception in fetchUserTransactions:', err);
    return null;
  }
}

export async function insertTransaction(tx: {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  wallet?: string;
  date?: string;
  m?: 'manual' | 'ai_chat' | 'voice' | 'receipt_scan';
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const txDate = tx.date ? new Date(tx.date.replace(',', '')).toISOString() : new Date().toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        transaction_date: txDate,
        input_method: tx.m || 'manual',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }

  return data;
}

export async function deleteTransaction(id: number | string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

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
      .select('*, wallets(id, name)')
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
      walletName: t.wallets?.name || '',
      date: new Date(t.transaction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/(\w+) (\d{4})/, '$1, $2') + ' ' + new Date(t.transaction_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      m: t.input_method || 'manual',
      rawDate: t.transaction_date,
    }));
  } catch (err) {
    console.error('Exception in fetchUserTransactions:', err);
    return null;
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveWalletId(supabase: any, userId: string, wallet?: string): Promise<string | null> {
  if (!wallet) return null;
  if (UUID_RE.test(wallet)) return wallet;
  const { data } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', wallet)
    .limit(1)
    .maybeSingle();
  return data?.id || null;
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
  const walletId = await resolveWalletId(supabase, user.id, tx.wallet);

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        wallet_id: walletId,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        transaction_date: txDate,
        input_method: tx.m || 'manual',
      },
    ])
    .select('*, wallets(id, name)')
    .single();

  if (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }

  return data;
}

export async function updateTransaction(
  id: number | string,
  tx: {
    type?: 'income' | 'expense' | 'transfer';
    amount?: number;
    category?: string;
    description?: string;
    wallet?: string;
  }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const payload: any = { updated_at: new Date().toISOString() };
  if (tx.type !== undefined) payload.type = tx.type;
  if (tx.amount !== undefined) payload.amount = tx.amount;
  if (tx.category !== undefined) payload.category = tx.category;
  if (tx.description !== undefined) payload.description = tx.description;
  if (tx.wallet !== undefined) {
    payload.wallet_id = await resolveWalletId(supabase, user.id, tx.wallet);
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, wallets(id, name)')
    .single();

  if (error) throw error;
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

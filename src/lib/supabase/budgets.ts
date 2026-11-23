import { createClient } from './client';

export interface DbBudget {
  id: string;
  category_name: string;
  amount: number;
  period: string;
}

export async function fetchUserBudgets(): Promise<DbBudget[] | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching budgets:', error);
      return null;
    }

    return (data || []).map((b: any) => ({
      id: b.id,
      category_name: b.category_name || 'Lainnya',
      amount: Number(b.amount),
      period: b.period || 'monthly',
    }));
  } catch (err) {
    console.error('Exception in fetchUserBudgets:', err);
    return null;
  }
}

export async function upsertBudget(categoryName: string, amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        user_id: user.id,
        category_name: categoryName,
        amount,
        period: 'monthly',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

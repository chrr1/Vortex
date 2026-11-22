import { createClient } from './client';

export interface DbGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  description?: string;
  status: 'in_progress' | 'achieved' | 'cancelled';
  icon?: string;
}

export async function fetchUserGoals(): Promise<DbGoal[] | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
      return null;
    }

    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
      target_date: g.target_date,
      description: g.description,
      status: g.status,
      icon: g.name.toLowerCase().includes('laptop') ? '💻' : '🎯',
    }));
  } catch (err) {
    console.error('Exception fetching goals:', err);
    return null;
  }
}

export async function insertGoal(goal: {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  description?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('financial_goals')
    .insert([
      {
        user_id: user.id,
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        target_date: goal.target_date || null,
        description: goal.description || '',
        status: 'in_progress',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving goal:', error);
    throw error;
  }

  return data;
}

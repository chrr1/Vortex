import { createClient } from './client';

export interface DbCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  is_system: boolean;
}

const DEFAULT_CATEGORIES: DbCategory[] = [
  { id: 'c1', name: 'Makanan', type: 'expense', icon: 'food', is_system: true },
  { id: 'c2', name: 'Transportasi', type: 'expense', icon: 'transport', is_system: true },
  { id: 'c3', name: 'Hiburan', type: 'expense', icon: 'entertainment', is_system: true },
  { id: 'c4', name: 'Belanja', type: 'expense', icon: 'shopping', is_system: true },
  { id: 'c5', name: 'Tagihan', type: 'expense', icon: 'bill', is_system: true },
  { id: 'c6', name: 'Pemasukan', type: 'income', icon: 'income', is_system: true },
  { id: 'c7', name: 'Lainnya', type: 'expense', icon: 'other', is_system: true },
];

export async function fetchCategories(): Promise<DbCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      icon: c.icon || 'other',
      is_system: !!c.is_system,
    }));
  } catch (err) {
    console.error('Exception fetching categories:', err);
    return DEFAULT_CATEGORIES;
  }
}

export async function insertCategory(name: string, type: 'income' | 'expense' = 'expense', icon = 'other') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        user_id: user.id,
        name,
        type,
        icon,
        is_system: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

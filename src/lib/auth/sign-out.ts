import { supabase } from '@/lib/supabase';

import { toAuthError } from './errors';

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthError(error);
}

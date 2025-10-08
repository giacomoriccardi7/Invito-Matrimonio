import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RSVPResponse {
  id?: string;
  guest_name: string;
  will_attend: boolean;
  dietary_restrictions?: string;
  song_request?: string;
  message?: string;
  created_at?: string;
}

export async function submitRSVP(data: RSVPResponse) {
  const { error } = await supabase
    .from('rsvp_responses')
    .insert([{
      guest_name: data.guest_name,
      will_attend: data.will_attend,
      dietary_restrictions: data.dietary_restrictions || '',
      song_request: data.song_request || '',
      message: data.message || ''
    }]);

  if (error) throw error;
}

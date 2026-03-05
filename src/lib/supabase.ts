import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 단일 인스턴스(싱글톤) 클라이언트
export const supabase = createClient(supabaseUrl, supabaseKey);

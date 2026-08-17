import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// SUPABASE_URL/SUPABASE_ANON_KEY가 비어 있으면 실제 클라이언트를 만들지 않는다.
// 다른 모듈(index.ts, events.ts)이 이 값을 보고 Mock 모드 여부를 판단한다.
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

export { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY };

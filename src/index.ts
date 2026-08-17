import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  max_attendees: number;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// SUPABASE_URL/SUPABASE_ANON_KEY가 비어 있으면 실제 클라이언트를 만들지 않고
// Mock 모드로 동작한다. .env 없이도 나머지 로직을 검증할 수 있게 하기 위한
// 안전장치다.
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

async function testConnection(): Promise<boolean> {
  if (!supabase) {
    console.log(
      "\n[Mock 모드] SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않아 실제 Supabase에 연결하지 않습니다."
    );
    console.log(".env 파일에 두 값을 채운 뒤 다시 실행하면 실제 연결을 시도합니다.");
    return false;
  }

  const { error } = await supabase.auth.getSession();
  if (error) {
    console.error("Supabase 연결 실패:", error.message);
    return false;
  }

  console.log(`Supabase 연결 성공: ${SUPABASE_URL}`);
  return true;
}

async function main() {
  await testConnection();
}

main();

export { supabase, testConnection };
export type { Event };

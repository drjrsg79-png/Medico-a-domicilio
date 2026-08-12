// =========================================================
// PEGA AQUÍ TUS CREDENCIALES DE SUPABASE
// Las encuentras en: Supabase > Project Settings > API
// =========================================================
const SUPABASE_URL = "PEGA_AQUI_TU_SUPABASE_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

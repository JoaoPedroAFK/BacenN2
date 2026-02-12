/* === CONFIGURAÇÃO SUPABASE === */

// Substitua estas credenciais pelas do seu projeto Supabase
// Acesse: https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/settings/api

const SUPABASE_CONFIG = {
    url: 'https://qiglypxoicicxvyocrzk.supabase.co', // URL do projeto Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZ2x5cHhvaWNpY3h2eW9jcnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDczNjYsImV4cCI6MjA4MTEyMzM2Nn0.oT1j8_eYHF1qc3EJyufGYX1aLQFfPBgBaaqQqZUGlj8' // Chave anônima configurada
};

// Inicializar Supabase
let supabaseClient = null;

// Carregar biblioteca do Supabase
function inicializarSupabase() {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado com sucesso');
        return true;
    } else {
        console.error('❌ Biblioteca Supabase não carregada. Verifique se o script está incluído no HTML.');
        return false;
    }
}

// Verificar se Supabase está disponível
function verificarSupabase() {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase não inicializado. Usando localStorage como fallback.');
        return false;
    }
    return true;
}

// Exportar para uso global
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.inicializarSupabase = inicializarSupabase;
window.verificarSupabase = verificarSupabase;


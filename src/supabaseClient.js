// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Use variáveis de ambiente no Vite (prefixo VITE_). Não comite chaves no repositório.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis existem E não são placeholders
const isPlaceholder = (value) => !value || value.includes('placeholder') || value.includes('your-');
const hasEnv = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey));

function createStubClient(reason = 'Supabase não configurado (.env ausente)') {
	console.warn(`${reason}. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (veja .env.example)`);

	// Retorna sucesso vazio ao invés de erro para não quebrar a aplicação
	const successEmpty = { data: null, error: null };
	
	const rpc = async () => successEmpty;
	const from = () => ({
		select: () => ({
			eq: () => ({
				single: async () => successEmpty,
				order: async () => ({ data: [], error: null })
			}),
			order: async () => ({ data: [], error: null }),
			single: async () => successEmpty
		}),
		insert: async () => successEmpty,
		update: async () => successEmpty,
		delete: async () => successEmpty
	});

	const auth = {
		async getSession() {
			return { data: { session: null }, error: null };
		},
		async getUser() {
			return { data: { user: null }, error: null };
		},
		async signInWithPassword() {
			return { data: { session: null, user: null }, error: { message: 'Supabase não configurado. Configure as credenciais.' } };
		},
		async signUp() {
			return { data: { session: null, user: null }, error: { message: 'Supabase não configurado. Configure as credenciais.' } };
		},
		async signOut() {
			return { error: null };
		},
		onAuthStateChange(callback) {
			// Chama imediatamente com sessão nula
			if (callback) callback('SIGNED_OUT', null);
			return { data: { subscription: { unsubscribe() {} } } };
		}
	};

	const channel = function () {
		return {
			on() { return this; },
			subscribe() { return { unsubscribe() {} }; }
		};
	};
	
	const removeChannel = function () { /* no-op */ };

	return { rpc, from, auth, channel, removeChannel };
}

if (!hasEnv) {
	console.warn('Supabase: variáveis de ambiente ausentes. Veja .env.example e configure seu .env.');
}

export const supabase = hasEnv ? createClient(supabaseUrl, supabaseAnonKey) : createStubClient();
export const isSupabaseConfigured = hasEnv;
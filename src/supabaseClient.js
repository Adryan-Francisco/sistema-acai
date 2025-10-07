// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Use variáveis de ambiente no Vite (prefixo VITE_). Não comite chaves no repositório.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis existem E não são placeholders
const isPlaceholder = (value) => !value || value.includes('placeholder') || value.includes('your-');
const hasEnv = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey));

function createStubClient(reason = 'Supabase não configurado (.env ausente)') {
	const err = new Error(
		`${reason}. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (veja .env.example) e reinicie o servidor.`
	);

	const rpc = async () => ({ data: null, error: err });
	const from = () => ({
		select: () => ({
			order: async () => ({ data: null, error: err })
		})
	});

	const auth = {
		async getSession() {
			// Não quebra a app; devolve sessão nula
			return { data: { session: null }, error: null };
		},
		onAuthStateChange() {
			// Retorna um subscription no-op para evitar erros de unsubscribe
			return { data: { subscription: { unsubscribe() {} } } };
		},
		async signOut() { return { error: null }; },
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
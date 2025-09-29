Melhorias sugeridas (priorizadas)

1) Segurança e configuração
- Mover chaves para variáveis de ambiente (feito: veja `.env.example`).
- Validar rules no Supabase (políticas RLS) para impedir leituras/escritas indevidas.

2) UX e acessibilidade (feito parcialmente)
- Mensagens inline para sucesso/erro no `Cardapio` (feito).
- Acessibilidade: usar aria-labels, fieldset/legend (feito). Mais: testes com leitores de tela.

3) Resiliência e tratamento de erros (feito parcialmente)
- Tratar erros nas chamadas ao Supabase (feito no `Cardapio`).
- Mostrar feedback ao usuário em vez de alert().

4) Performance
- Evitar requisições desnecessárias (usar cache/local state, SWR ou React Query).
- Memoizar componentes pesados com React.memo/useMemo (parte aplicada no Cardapio usando useCallback).

5) Testes
- Criar testes unitários para componentes principais com vitest/react-testing-library.
- Testes end-to-end com Playwright para os fluxos: signup/login/pedido.

6) Qualidade de código
- Adicionar ESLint/Prettier config e rodar lint em CI.
- Configurar Husky para pre-commit hooks.

7) Operacional
- Adicionar um README com setup e execução (pontos de ambiente, variáveis e migration do Supabase).

Como reproduzir localmente (rápido)

1. Copie `.env.example` para `.env` e preencha as chaves.
2. Instale dependências: `npm install`.
3. Rode em dev: `npm run dev`.

Próximos passos que posso executar agora (diga qual quer que eu faça):
- Adicionar um README.md com instruções completas (recomendado).
- Adicionar testes básicos com Vitest para `Cardapio`.
- Integrar React Query para cache/reatividade de chamadas ao Supabase.
- Auditar mais componentes do projeto e aplicar padrões similares.

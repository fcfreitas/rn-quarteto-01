# Volta à Ilha 2026 — RN Quarteto 01

Site de acompanhamento em tempo real do revezamento **Volta à Ilha 2026**, realizado em Florianópolis/SC no dia 11 de abril de 2026.

**RN Assessoria Esportiva — Quarteto 01** · 148,9 km · 19 trechos

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Realtime)
- **next-auth** (Google OAuth)
- **Vercel** (deploy)

---

## 1. Criar projeto no Supabase e rodar a migration

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a **URL do projeto** e as chaves **anon** e **service_role** em *Settings → API*.
3. No **SQL Editor** do Supabase, abra e execute o arquivo:

```
supabase/migrations/001_initial.sql
```

4. Habilite o **Realtime** para as tabelas `segments` e `race_config`:
   - No Dashboard Supabase, vá em *Database → Replication*
   - Adicione as tabelas `segments` e `race_config` à publicação `supabase_realtime`
   - Ou execute no SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE segments;
   ALTER PUBLICATION supabase_realtime ADD TABLE race_config;
   ```

---

## 2. Configurar Google OAuth no Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie ou selecione um projeto
3. Em *APIs & Services → Credentials*, crie um **OAuth 2.0 Client ID** do tipo **Web application**
4. Configure as URIs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:3000` (e seu domínio de produção)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://rn-quarteto-01.vercel.app/api/auth/callback/google`
5. Copie o **Client ID** e o **Client Secret**

---

## 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXTAUTH_SECRET=uma-string-aleatoria-com-pelo-menos-32-chars
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
NEXT_PUBLIC_ADMIN_EMAIL=fabiodacfreitas@gmail.com
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- **Página pública**: http://localhost:3000
- **Painel admin**: http://localhost:3000/admin

---

## 5. Deploy no Vercel

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. **Nome do projeto**: `rn-quarteto-01` → domínio: `rn-quarteto-01.vercel.app`
4. Em *Settings → Environment Variables*, adicione todas as variáveis do `.env.local`
5. Atualize `NEXTAUTH_URL` para `https://rn-quarteto-01.vercel.app`
6. No Google Cloud Console, adicione a URL de produção às URIs autorizadas
7. Clique em **Deploy**

---

## 6. Modo Teste — validar antes do dia da prova

O painel admin (`/admin/dashboard`) possui um **Modo Teste** que permite:

- Registrar chegadas de forma livre, inclusive com horários passados
- Validar o recálculo em cascata das projeções
- Testar o visual de todos os estados (previsto, em andamento, concluído)

**Passo a passo para testar:**

1. Acesse `/admin/dashboard` com sua conta Google
2. Ative o toggle **MODO TESTE** no topo da página
3. Clique em **▶ Dar start na prova** para simular a largada
4. Registre chegadas nos trechos — observe como os horários seguintes se ajustam automaticamente
5. Na tabela pública (`/`), veja as projeções sendo atualizadas em tempo real
6. Ao finalizar os testes, clique em **Limpar dados de teste** no banner amarelo

> **Atenção**: O botão "Limpar dados de teste" zera todos os horários registrados e reseta a prova. Use antes do dia do evento para garantir que o banco está limpo.

---

## Lógica de projeção em cascata

Quando um trecho é concluído com tempo diferente do previsto:

1. O **pace real** daquele atleta é calculado (segundos/km)
2. A **média de pace** de todos os trechos concluídos do atleta é usada para projetar os próximos trechos do mesmo atleta
3. Os **horários de largada/chegada** de todos os trechos seguintes são recalculados em cascata (chegada do trecho N = largada do trecho N+1)

---

## Estrutura de arquivos

```
/app
  /page.tsx                    ← Página pública
  /admin
    /page.tsx                  ← Redireciona para /admin/dashboard
    /login/page.tsx            ← Login Google
    /dashboard/page.tsx        ← Painel admin
  /api
    /auth/[...nextauth]/route.ts
    /race/start/route.ts       ← POST: start | DELETE: reset
    /segments/route.ts         ← GET: todos os segmentos
    /segments/[id]/route.ts    ← PATCH: registrar chegada
/components
  /public
    FlorianopolisSilhouette.tsx
    SegmentsTable.tsx
    RaceStatus.tsx
    ElapsedTimer.tsx
  /admin
    StartRaceButton.tsx
    SegmentEditor.tsx
    TestModeToggle.tsx
/lib
  /supabase.ts
  /projections.ts
/types
  /race.ts
/supabase
  /migrations/001_initial.sql
```

---

## Atletas e cores

| Atleta   | Cor        |
|----------|------------|
| Fabio    | `#B060FF`  |
| Lara     | `#E040FB`  |
| Renata   | `#CE93D8`  |
| Jeferson | `#FFFFFF`  |

---

Boa corrida! 🏃‍♂️💜

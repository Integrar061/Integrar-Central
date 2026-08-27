# Integrar Central

CRM da clínica com gestão de pacientes, tratamentos, agenda e sincronização com **Google Agenda**.

## Como rodar

```bash
npm install
cp .env.example .env
# edite .env e coloque seu VITE_GOOGLE_CLIENT_ID
npm run dev
```

Abre em `http://localhost:3000`.

## Login com Google + Agenda

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto (ou use um existente).
2. Ative a **Google Calendar API**.
3. Em **APIs e serviços → Credenciais**, crie um **ID do cliente OAuth** do tipo **Aplicativo da Web**.
4. Em **Origens JavaScript autorizadas**, adicione:
   - `http://localhost:3000`
5. Copie o Client ID para o arquivo `.env`:

```env
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

6. Reinicie `npm run dev`, abra o app e clique em **Entrar com Google**.

Ao logar, o app pede permissão de perfil e do Google Agenda. Novos agendamentos (com sync ativo) criam eventos na agenda da conta Google. **Sincronizar Agora** importa eventos futuros ainda não mapeados.

## Configuração do Supabase (Banco de Dados & Persistência)

1. Crie ou acesse seu projeto no [Supabase](https://supabase.com/).
2. No menu lateral, abra o **SQL Editor** e execute o script contido em `supabase/schema.sql` para criar a tabela `patients`, índices e políticas de segurança (RLS).
3. Em **Project Settings → API**, copie a **Project URL** e a **API Key** (anon ou service role) para o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Com o Supabase configurado, todos os pacientes cadastrados farão `INSERT` automático no banco e serão carregados via `SELECT` no carregamento da aplicação, sincronizando os dados entre diferentes dispositivos.

## Importação de Leads no Remarketing

Na aba **Remarketing**, clique em **Importar Lista**:
- Suporta arquivos `.csv` com as colunas: `Data`, `Nome completo`, `Whatsapp`, `Link do Whatsapp`, `Contato`, `Tratamento`, `Status`.
- Descarta automaticamente contagens laterais ou colunas irrelevantes da planilha.
- Gera links para o WhatsApp automaticamente caso não estejam preenchidos.
- Detecta telefones duplicados com opções de pular, atualizar ou criar novos registros.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build


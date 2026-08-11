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

## Dados

O app começa **sem pacientes fictícios**. Os dados ficam no `localStorage` do navegador (chave `integrar_central_v2_*`). Se você usou a versão demo antes, os dados antigos não são carregados automaticamente.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build

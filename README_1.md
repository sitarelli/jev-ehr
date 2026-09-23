# Jev EHR - Cartella Clinica con estrazione parametri

Demo che usa **TypeSafe Jev via Vercel AI Gateway** (`typesafe-ai/jev`) per estrarre da un diario libero:
- peso, temp, PA, FC, sat, glicemia, dolore
- eventi: caduta -> proposta scheda cadute, lesione -> proposta scheda lesioni

## 1) Crea chiave Vercel (non serve TypeSafe, è pieno)

1. Vai su https://vercel.com -> Login
2. Dashboard -> AI Gateway -> API Keys -> Create Key
3. Copia chiave che inizia con `vck_...`

## 2) Installa progetto

```bash
cd jev-ehr-app
npm install
cp .env.example .env.local
# apri .env.local e incolla:
# AI_GATEWAY_API_KEY=vck_tua_chiave_qui
npm run dev
```

Apri http://localhost:3000

- Spunta "Usa API reale Vercel" per chiamare Jev vero
- Se lasci mock, funziona anche senza chiave (simula Jev)

## 3) Deploy su Vercel

```bash
vercel
# oppure: push su GitHub e importa su vercel.com
```

Poi:
Vercel Dashboard -> tuo progetto -> Settings -> Environment Variables
Aggiungi `AI_GATEWAY_API_KEY = vck_...` -> Save -> Redeploy

## 4) Come funziona Jev

File `lib/jev-questions.ts` contiene le domande tipizzate:
- type: "noul" = si/no con probabilità
- type: "score" = numero in range
- type: "choice" = una tra opzioni

La chiamata è in `app/api/analyze/route.ts`:
```ts
POST https://ai-gateway.vercel.sh/v1/evaluate
body: { model: "typesafe-ai/jev", state: diario, questions: {...} }
```

Se confidence caduta > 0.75 -> apri /scheda-cadute
Se lesione -> /scheda-lesioni

Costo: $0.042 / 1M token input, output gratis. Con diario medio ~200 token = 0.000008$.

## Supporto
Se hai errori 401/404, verifica che AI Gateway sia abilitato per il tuo account Vercel.

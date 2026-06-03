# Fount — Scaffold Overview

## Folder Structure

```
fount/
├── apps/
│   ├── api/                        # Cloud Run API (Node + Express)
│   │   ├── src/
│   │   │   ├── index.ts            # Entry point — middleware + routes
│   │   │   ├── routes/
│   │   │   │   ├── drops.ts        # POST/GET/PATCH/DELETE /drops
│   │   │   │   ├── flows.ts        # CRUD + POST /flows/:id/generate
│   │   │   │   ├── search.ts       # POST /search (semantic)
│   │   │   │   ├── ai.ts           # Commentary + tag suggestion
│   │   │   │   ├── calendar.ts     # OCR scan + events
│   │   │   │   └── tasks.ts        # Task CRUD
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.ts # Verifies Firebase ID token
│   │   │   │   └── errorHandler.ts # Centralised error format
│   │   │   ├── jobs/
│   │   │   │   ├── tagSuggest.ts   # Async: suggest tags after drop created
│   │   │   │   └── commentaryEngine.ts # Scheduled: AI commentary 2x/day
│   │   │   └── lib/
│   │   │       ├── firebase.ts     # Admin SDK singleton
│   │   │       ├── pinecone.ts     # Pinecone client singleton
│   │   │       ├── aiRouter.ts     # Provider abstraction (Claude/GPT/Gemini)
│   │   │       └── errors.ts       # AppError class
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── web/                        # Next.js app (TODO: scaffold next)
│   └── mobile/                     # React Native + Expo (TODO: scaffold next)
│
├── packages/
│   └── shared/
│       └── src/
│           ├── types/index.ts      # All TypeScript interfaces (Drop, Flow, etc.)
│           └── constants/index.ts  # Collection names, limits, AI task keys
│
├── firestore.rules                 # Security rules — userId isolation enforced
├── firestore.indexes.json          # Composite indexes for all query patterns
├── cloudbuild.yaml                 # CI/CD: build → push → Cloud Run deploy
└── package.json                    # Yarn workspaces root
```

## Getting Started (Local)

```bash
# 1. Install dependencies
yarn install

# 2. Copy env file and fill in keys
cp apps/api/.env.example apps/api/.env

# 3. Start API in dev mode (hot reload)
yarn dev:api
```

## Deploy to Google Cloud

```bash
# One-time: create Artifact Registry repo
gcloud artifacts repositories create fount \
  --repository-format=docker \
  --location=us-central1

# Trigger build + deploy manually
gcloud builds submit --config cloudbuild.yaml .

# Or connect GitHub repo to Cloud Build for auto-deploy on push to main
```

## Next Steps (not yet scaffolded)

- `apps/web/` — Next.js 14 frontend (pages, components, API client hooks)
- `apps/mobile/` — React Native + Expo (screens map 1:1 to the HTML designs)
- `apps/api/src/jobs/embedDrop.ts` — Embedding job (Pinecone upsert)
- Cloud Tasks queue setup (enqueue jobs from routes instead of TODO comments)
- Stripe integration for subscription / usage billing

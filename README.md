# Abu Bakr to FH Aachen

An interactive tracking page for Abu Bakr's journey to a master's at
FH Aachen — University of Applied Sciences. He logs each milestone as it
happens; the family follows along on one link.

There are no preset steps. Every entry is his own.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Go to vercel.com, choose **Add New > Project**, and import that repo.
3. Vercel detects Vite automatically. Accept the defaults and deploy.

Build command: `npm run build` · Output directory: `dist`

## Shared storage (required)

The tracker stores the timeline in Redis via `/api/stages`, a Vercel
serverless function, so everyone who opens the link sees the same entries.

1. In the Vercel dashboard, open the project, then **Storage > Create
   Database > Redis** (powered by Upstash) and connect it to this project.
   Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   automatically — no manual env vars needed.
2. Redeploy so the function picks up the new env vars.

Note: anyone with the link can add or edit steps. That's usually fine for a
family page. Don't put anything private in the notes.

`npm run dev` alone won't serve `/api/stages` (Vite doesn't run serverless
functions). Use `vercel dev` instead if you want shared storage while
developing locally, or expect load/save to fail with "Could not reach the
shared timeline" until deployed.

## Editing the page

- `src/GermanyTracker.jsx` — the page itself, all layout and copy
- `src/storage.js` — how entries are loaded and saved
- `src/index.css` — fonts and base styles

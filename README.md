# waand-ai-studio

React + TypeScript app created from Google AI Studio, built with Vite.

## Framework

- Framework: React 19
- Build tool: Vite 6
- Deploy target: Vercel (static frontend + serverless API)

## Architecture

- Client UI: `src/*` (unchanged UI flow/states)
- Data source switch: `VITE_USE_MOCK`
- Live generation endpoint: `POST /api/generate` (Vercel serverless function)
- Gemini key usage: server-side only via `process.env.GEMINI_API_KEY`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env:

```bash
cp .env.example .env.local
```

3. Choose mode in `.env.local`:

```bash
# mock mode (no secrets required)
VITE_USE_MOCK=true
```

or

```bash
# live mode (serverless Gemini)
VITE_USE_MOCK=false
GEMINI_API_KEY=your_real_key_here
```

4. Run dev server:

```bash
npm run dev
```

App URL: `http://localhost:3001/`

5. Build production bundle:

```bash
npm run build
```

## Environment variables

- `VITE_USE_MOCK` (required):
  - `true`: deterministic mock markdown outputs in client, no Gemini call.
  - `false`: client calls `/api/generate`; Gemini runs on server.
- `VITE_APP_URL` (optional): app URL for client-side links.
- `GEMINI_API_KEY` (server-only): required only when `VITE_USE_MOCK=false`.

## Deploy on Vercel

1. Push repo to GitHub.
2. In Vercel, import the GitHub repo.
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Set environment variables:
   - Mock mode: `VITE_USE_MOCK=true`
   - Live mode: `VITE_USE_MOCK=false` and `GEMINI_API_KEY=...`
   - Optional: `VITE_APP_URL=https://your-domain.vercel.app`
5. Deploy.

## GitHub push

If `.git` already exists:

```bash
git add .
git commit -m "feat: add secure server-side Gemini + mock mode"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If remote `origin` already exists, update it:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

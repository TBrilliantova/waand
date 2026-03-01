# waand-ai-studio

React + TypeScript app created from Google AI Studio, built with Vite.

## Framework

- Framework: React 19
- Build tool: Vite 6
- Package manager: npm (`package-lock.json` present)

## Prerequisites

- Node.js 20+ (recommended: latest LTS)
- npm 10+

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
cp .env.example .env.local
```

3. Add your Gemini key in `.env.local`:

```bash
GEMINI_API_KEY=your_real_key_here
```

4. Start dev server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Environment variables

- `GEMINI_API_KEY` (required): API key used by `@google/genai`.
- `VITE_GEMINI_API_KEY` (optional): alternative key name; build config maps it to `process.env.GEMINI_API_KEY`.

Never commit real secrets. Keep them in local `.env*` files and deployment platform environment settings.

## Deploy

### Option A: Vercel (recommended for this project)

This is a Vite static frontend, so deploy as a static site on Vercel.

1. Import the GitHub repo in Vercel.
2. Vercel should auto-detect Vite.
3. Confirm build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable in Vercel project settings:
   - `GEMINI_API_KEY` = your real key
5. Deploy.

### Option B: Netlify (alternative)

1. Import the GitHub repo in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `GEMINI_API_KEY` in Netlify environment variables.

## GitHub push

If this folder is already a git repo, run:

```bash
git add .
git commit -m "chore: clean repo for GitHub and deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If there is no `.git` folder yet, initialize first:

```bash
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

# 记账 · Voice + Receipt Expense Tracker

Single-page mobile-first expense tracker with:
- Calendar view (daily totals) + pie chart (monthly breakdown)
- Voice recording → AI parses to structured expenses
- Upload receipt image / bank statement PDF → AI reads and logs each item
- All data stored in browser `localStorage` (private, per-device)

## Stack

- Frontend: single `index.html` (no build step, Chart.js + pdf.js from CDN)
- Backend: two Vercel serverless functions calling **Google Gemini** (free tier)
  - `/api/parse-text` — voice transcript → transactions
  - `/api/parse-images` — receipt / statement image → transactions (vision)

## Why Gemini

Google Gemini has a genuinely free API tier — no credit card required, no billing setup:
- **250 requests/day** on `gemini-2.5-flash` (free tier, as of 2026)
- Vision is included in the same free tier
- Chinese language handling is solid

That's plenty for personal use plus a handful of friends. If you outgrow it, you can enable billing in Google AI Studio and continue seamlessly, or swap in another provider.

## Deploy to Vercel

### Get your free Gemini API key (2 min)

1. Go to https://aistudio.google.com/apikey
2. Sign in with any Google account
3. Click **Create API key** → pick or create a project → copy the key (starts with `AIza...`)

No credit card, no billing setup.

### Option A: Deploy via GitHub (recommended)

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOU/jizhang.git
   git push -u origin main
   ```
2. Go to https://vercel.com/new and import the repo
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY` = your `AIza...` key
   - *(optional)* `GEMINI_MODEL` = `gemini-2.5-flash` (default, used for voice text)
   - *(optional)* `GEMINI_VISION_MODEL` = `gemini-2.5-flash` (default, used for images)
4. Click **Deploy**. Done — your app is live at `your-project.vercel.app`.

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
# Follow the prompts, then:
vercel env add GEMINI_API_KEY
# Paste your key when prompted (choose Production + Preview + Development)
vercel --prod
```

### Option C: Drag & drop

1. Zip this folder
2. Go to https://vercel.com/new
3. Drag the zip
4. After first deploy: Project → Settings → Environment Variables → add `GEMINI_API_KEY`
5. Redeploy

## Share with friends

Just send them the Vercel URL — e.g. `https://jizhang-yourname.vercel.app`. They open it in their phone browser and can start recording expenses immediately. Each person's data lives in their own browser (localStorage), so friends can't see each other's expenses.

**One thing to know:** every voice parse or receipt scan they run counts toward YOUR daily Gemini quota (250 requests/day, shared across all users of your key). For a few friends this is fine. If you invite more and start hitting limits, either:
- Enable billing in Google AI Studio (Gemini paid tier is very cheap — ~$0.30 per 1M input tokens on Flash)
- Or switch to per-user BYOK (bring-your-own-key) — I can add a settings page for that if you want.

## Local development

```bash
npm install
npx vercel dev
```

Then open http://localhost:3000. You'll need `GEMINI_API_KEY` in a `.env.local` file:

```
GEMINI_API_KEY=AIza...
```

## Changing the model

Model names occasionally change or new ones ship. Check https://ai.google.dev/gemini-api/docs/models for the latest, then update `GEMINI_MODEL` / `GEMINI_VISION_MODEL` in Vercel env vars — no code change needed.

Reasonable choices (Sep 2026):
- `gemini-2.5-flash` — fast, cheap, good default (what's set now)
- `gemini-2.5-flash-lite` — even faster, slightly less accurate on receipts
- `gemini-2.5-pro` — more accurate, slower, tighter free quota
- `gemini-3-flash-preview` — newest, preview only

## What's stored where

- **Transactions:** browser `localStorage` on the device where the page is opened. Nothing gets sent to any server except what's explicitly submitted for AI parsing.
- **AI calls:** voice transcripts and receipt images are sent to `generativelanguage.googleapis.com` via the Vercel functions. See Google's terms for how they handle free-tier data (spoiler: free-tier requests may be used for model improvement — avoid uploading truly sensitive receipts if that matters to you or your friends).

## Structure

```
.
├── index.html            # The whole app
├── api/
│   ├── parse-text.js     # POST /api/parse-text  (Gemini text-only)
│   └── parse-images.js   # POST /api/parse-images (Gemini vision)
├── package.json          # depends on @google/genai
├── vercel.json           # function timeouts
└── .gitignore
```

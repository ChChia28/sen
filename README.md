# Sen · 记账

Single-page mobile-first expense tracker.

## Features

- **Calendar view** — daily totals per day, monthly total on last day
- **Chart view** — pie chart + category breakdown for any month
- **Manual entry** — big-number amount input, category grid
- **Voice recording** — speak your expense, AI parses to a structured entry (uses Gemini free tier)
- **File import** — upload a bank statement or e-wallet CSV / Excel / TXT, auto-detects columns, categorizes by keyword. **No AI, no API cost, no rate limit.**
- **Local-first** — data lives in browser `localStorage`, private per device

## Stack

- Frontend: single `index.html` (no build step; Chart.js + SheetJS from CDN)
- Backend: one Vercel serverless function for voice parsing (`/api/parse-text`) calling Google Gemini

## Deploy to Vercel

### 1. Get a free Gemini API key (2 min)

- https://aistudio.google.com/apikey → sign in with Google → **Create API key** → copy the `AIza...` string.

No credit card, no billing setup.

### 2. Deploy

Push this folder to GitHub, then https://vercel.com/new → import the repo.

Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | your `AIza...` key |
| `GEMINI_MODEL` | `gemini-flash-latest` |

Deploy. Your app is live at `your-project.vercel.app`.

## File import — what formats work

The import accepts `.csv`, `.xlsx`, `.xls`, `.txt`. It auto-detects the header row (looks for `Date` / `Description` / `Amount` / `Debit` / `Credit` columns, or their Malay/Chinese equivalents).

Confirmed working with exports from:

- **Maybank M2U** (CSV / Excel statement download)
- **CIMB Clicks** (CSV export)
- **Public Bank** (Excel statement)
- **HL Bank Connect** (CSV)
- **Touch 'n Go eWallet** (CSV export from Transactions)
- **Boost** (CSV export)
- **GrabPay** (Excel export)

For any other bank / wallet: as long as it has columns for date, description, and amount (or separate debit/credit), it should work.

### Category auto-detection

Merchants are matched to categories using a Malaysia-focused keyword database — Grab → 交通, McD → 外食, TNB → 生活, Shopee → 购物, and so on. Anything unmatched falls into 其他 and you can tap-toggle it in the confirm screen.

## Share with friends

Send them the Vercel URL. Each person's data stays on their own phone. Only voice recording touches your Gemini quota (250 requests/day on free tier — plenty for a small group).

## Structure

```
.
├── index.html            # The whole app
├── api/
│   └── parse-text.js     # POST /api/parse-text (voice → transactions)
├── package.json
├── vercel.json
└── .gitignore
```

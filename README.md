# Sen · 记账

Mobile-first Chinese expense tracker. Pure static site — no backend, no API keys, no cost. Installable as a PWA on Android and iOS.

## Features

- 📅 **Calendar view** — per-day totals, month total on the last day
- 📊 **Chart view** — doughnut breakdown + per-category bars, month picker
- ✍️ **Manual entry** — amount + category (expense or income)
- 📥 **Import from file** — Excel (`.xlsx` / `.xls`), CSV, TXT, JSON
  - Auto-detects Date / Description / Amount / Category / Debit / Credit columns (English, Malay, Chinese)
  - Handles Malaysia bank statement formats (Maybank, CIMB, PBB, HL) and e-wallets (TNG, Boost, GrabPay)
  - Maps English categories (`food`, `transport`, `shopping`, `grocery`, `study`, `gift`...) → Chinese categories automatically
  - **Duplicate detection** — flags rows that match existing transactions, auto-unchecks them
- ➕ **Custom categories** — add your own with any emoji, per type
- 🔍 **Search** — find any transaction by merchant, note, category, date, or amount
- 💰 **Budget** — monthly limit per category, warning at 80% + 100%, progress bars on chart page
- 💱 **Currency** — pick from RM, $, S$, ¥, €, £, ฿, ₹, Rp, HK$, NT$, ₩
- 💾 **JSON backup** — one-tap export/import of all data (includes categories + settings + budgets)
- 📱 **PWA** — add to home screen, works offline, full-screen like a native app
- 🌙 Everything stays local (browser `localStorage`)

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new and import the repo
3. Deploy — no environment variables needed

That's it. Pure static site — index.html + manifest.json + service worker + icons.

## Data & privacy

Everything stays in the browser. Nothing is sent to any server. To move data between devices:

- Tap ➕ → 数据备份 → 导出备份 → download `.json` file
- On the new device: 导入备份 to restore (includes transactions, custom categories, currency setting, budgets)

## Using an AI to convert receipts / PDFs to JSON

Sen doesn't include AI parsing itself. If you want to import a receipt photo or PDF, paste this into ChatGPT / Gemini / Claude with the file attached:

> Extract every transaction from this receipt / statement and return ONLY a JSON array. Each item must have: `date` (YYYY-MM-DD), `amount` (positive number), `description` (short merchant name), `type` (`"expense"` or `"income"`), `category` (one of: 外食, 交通, 购物, 生活, 娱乐, 医疗, 教育, 通讯, 旅行, 人情, 烟酒, 其他).

Save the reply as `statement.json` and upload via 导入账单.

## Install as an app

- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome menu → Install app / Add to Home screen

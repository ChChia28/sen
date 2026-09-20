# Sen · 记账

Mobile-first Chinese expense tracker. Pure static site — no backend, no API keys, no cost.

## Features

- 📅 **Calendar view** — per-day totals, month total on the last day
- 📊 **Chart view** — doughnut breakdown + per-category bars, month picker
- ✍️ **Manual entry** — amount + category, expense or income
- 📥 **Import from file** — Excel (`.xlsx` / `.xls`), CSV, TXT, JSON
  - Auto-detects Date / Description / Amount columns (English, Malay, Chinese headers)
  - Handles Malaysia bank statement formats (Maybank, CIMB, PBB, HL) and e-wallets (TNG, Boost, GrabPay)
  - Auto-categorizes by keyword (Grab → 交通, McD → 外食, TNB → 生活, etc.)
- 💾 **JSON backup** — export all data to a file, import it back on any device
- 🌙 Full offline — data persists in browser `localStorage`

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new and import the repo
3. Deploy — no environment variables needed

That's it. The whole app is one HTML file.

## Data & privacy

Everything stays in the browser. Nothing is sent to any server. To move data between devices:

- Tap the ➕ button → 数据备份 → 导出备份 to download a `.json` file
- On the new device: 数据备份 → 导入备份 to restore

## Using an AI to convert receipts / PDFs to JSON

Sen doesn't include AI parsing itself (keeps it free and fast). If you want to import a receipt photo or PDF, paste this into ChatGPT / Gemini / Claude with the file attached:

> Extract every transaction from this receipt / statement and return ONLY a JSON array. Each item must have: `date` (YYYY-MM-DD), `amount` (positive number), `description` (short merchant name), `type` (`"expense"` or `"income"`), `category` (one of: 外食, 交通, 购物, 生活, 娱乐, 医疗, 教育, 通讯, 旅行, 人情, 烟酒, 其他).

Save the reply as `statement.json` and upload it via 导入账单.

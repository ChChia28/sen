import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({ code: 'no_key', error: 'GEMINI_API_KEY env var not set' });
  }

  try {
    const { images, today, expense_categories, income_categories } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images array required' });
    }
    if (images.length > 6) {
      return res.status(400).json({ error: 'too many images (max 6)' });
    }
    for (const im of images) {
      if (!im?.data || !im?.media_type) {
        return res.status(400).json({ error: 'image missing data or media_type' });
      }
    }

    const prompt = buildPrompt(today, expense_categories, income_categories);

    // Gemini contents: images then prompt text
    const contents = [
      ...images.map(im => ({
        inlineData: {
          mimeType: im.media_type,
          data: im.data,
        },
      })),
      { text: prompt },
    ];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    const parsed = extractJson(responseText);
    if (!parsed) {
      return res.status(200).json({ items: [] });
    }
    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    const msg = e?.message || String(e);
    const status = /429|rate|quota/i.test(msg) ? 429 : 500;
    const code = status === 429 ? 'rate_limited' : 'server_error';
    return res.status(status).json({ code, error: msg });
  }
}

function buildPrompt(today, expenseCats, incomeCats) {
  const exp = (expenseCats || []).join('、') || '外食、交通、购物、生活、娱乐、医疗、教育、通讯、旅行、人情、烟酒、其他';
  const inc = (incomeCats || []).join('、') || '工资、兼职、红包、理财、退款、其他';
  const dateHint = today || new Date().toISOString().slice(0, 10);
  return `你正在看一张或多张账单 / 收据 / 交易记录截图。请把里面所有的账目条目一条条列出来。

【今天日期】${dateHint}
【可用支出分类】${exp}
【可用收入分类】${inc}

【规则】
- 图片里可能是一张收据（多个商品项，一个日期）、一份账单（很多笔，各自日期不同）或一张交易记录列表。
- 一张收据里的多个商品项，可以合并成一条（分类相同、日期相同），note 里简短提到主要商品即可；金额加总。除非明显是不同分类，才拆开。
- 一份账单里每一笔独立交易都要单独一条。
- 分类必须从上面列表里选一个最贴切的；不确定就用「其他」。
- amount 是正数（不带货币符号）。
- type 只能是 "expense" 或 "income"（消费/支出是 expense；收入/退款/转入才是 income）。
- date 用 YYYY-MM-DD；图上有日期就用图上的，看不清就用今天。
- note 简短描述这笔账（商家、商品名或用途），一句话内。

【输出格式】必须是这个 JSON，不要任何其他文字：
{"items":[{"type":"expense","category":"外食","amount":25,"note":"麦当劳","date":"${dateHint}"}]}`;
}

function extractJson(text) {
  if (!text) return null;
  const t = text.trim();
  try { return JSON.parse(t); } catch {}
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1].trim()); } catch {} }
  const starts = ['{', '['].map(c => t.indexOf(c)).filter(i => i >= 0);
  if (!starts.length) return null;
  const start = Math.min(...starts);
  const ends = ['}', ']'].map(c => t.lastIndexOf(c));
  const end = Math.max(...ends);
  if (end > start) { try { return JSON.parse(t.slice(start, end + 1)); } catch {} }
  return null;
}

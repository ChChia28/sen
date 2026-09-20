import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({ code: 'no_key', error: 'GEMINI_API_KEY env var not set' });
  }

  try {
    const { text, today, expense_categories, income_categories } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text required' });
    }

    const prompt = buildPrompt(text, today, expense_categories, income_categories);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ text: prompt }],
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

function buildPrompt(userText, today, expenseCats, incomeCats) {
  const exp = (expenseCats || []).join('、') || '外食、交通、购物、生活、娱乐、医疗、教育、通讯、旅行、人情、烟酒、其他';
  const inc = (incomeCats || []).join('、') || '工资、兼职、红包、理财、退款、其他';
  const dateHint = today || new Date().toISOString().slice(0, 10);
  return `你是记账助手。用户口述了一段话，帮我提取里面所有的账目条目。

【今天日期】${dateHint}
【可用支出分类】${exp}
【可用收入分类】${inc}

【规则】
- 从下面这段话里找出每一笔账目（可能有多笔）。
- 分类必须从上面列表里选一个最贴切的；如果都不合适就用「其他」。
- amount 是数字，货币单位统一忽略（用户在马来西亚，多是 RM 或者 $）。
- type 只能是 "expense" 或 "income"。
- date 用 YYYY-MM-DD 格式；如果没说具体日期就用今天。
- note 是原文里提到的商家、事情或简短描述（一句话内），可以为空。

【输出格式】必须是这个 JSON，不要任何其他文字：
{"items":[{"type":"expense","category":"外食","amount":25,"note":"麦当劳午饭","date":"${dateHint}"}]}

【用户口述】
"""
${userText}
"""`;
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

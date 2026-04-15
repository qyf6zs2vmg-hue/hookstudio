import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === 'MY_OPENROUTER_API_KEY') {
      return res.status(400).json({ 
        error: 'OpenRouter API Key not configured in Vercel environment variables' 
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://hookstudio.ai",
        "X-Title": "Hook Studio AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat",
        "messages": messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Chat Function error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

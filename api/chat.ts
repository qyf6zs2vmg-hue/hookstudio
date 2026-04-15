import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Prepend aggressive language rule to system message if it exists, or add it
    const aggressiveRule = `STRICT LANGUAGE RULE:
1. Detect the user's language.
2. Respond ONLY in that language.
3. If the user writes in Russian, your response must be 100% Russian.
4. If the user writes in Uzbek, your response must be 100% Uzbek.
5. NEVER use English words like "hook", "viral", "content", "video" if the user is not writing in English. Use their equivalents in the user's language.
6. Mixing languages is strictly forbidden.`;

    const finalMessages = messages.map((m: any) => {
      if (m.role === 'system') {
        return { ...m, content: `${aggressiveRule}\n\n${m.content}` };
      }
      return m;
    });

    if (!finalMessages.some((m: any) => m.role === 'system')) {
      finalMessages.unshift({ role: 'system', content: aggressiveRule });
    }

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
        "messages": finalMessages
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

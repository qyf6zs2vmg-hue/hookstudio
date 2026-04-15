import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log("ENV API KEY:", process.env.API_KEY ? "EXISTS" : "MISSING");

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "API key not found" });
  }

  try {
    const { messages } = req.body;
    
    // Prepend aggressive language rule
    const aggressiveRule = `### MANDATORY LANGUAGE LOCK ###
1. DETECT USER LANGUAGE: Identify if the user is writing in Russian, Uzbek, or English.
2. 100% LANGUAGE ADHERENCE: You MUST generate ALL content in the detected language.
3. JSON VALUES: Every string inside the JSON response MUST be in the user's language.
4. NO ENGLISH: If the user writes in Russian, do NOT use words like "hook", "viral", "content", "video". Use "хук", "виральный", "контент", "видео".
5. CRITICAL: Mixing languages or responding in English to a Russian/Uzbek prompt will result in a system failure.`;

    let finalMessages = [...messages];
    const hasLock = messages.some((m: any) => m.role === 'system' && m.content.includes('MANDATORY LANGUAGE LOCK'));

    if (!hasLock) {
      const systemIndex = finalMessages.findIndex((m: any) => m.role === 'system');
      if (systemIndex !== -1) {
        finalMessages[systemIndex].content = `${aggressiveRule}\n\n${finalMessages[systemIndex].content}`;
      } else {
        finalMessages.unshift({ role: 'system', content: aggressiveRule });
      }
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
        "model": "openai/gpt-4o-mini",
        "messages": finalMessages,
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Generate Function error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

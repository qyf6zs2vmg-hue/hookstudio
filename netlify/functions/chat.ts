import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");
    
    // Prepend aggressive language rule
    const aggressiveRule = `### MANDATORY LANGUAGE LOCK ###
1. DETECT USER LANGUAGE: Identify if the user is writing in Russian, Uzbek, or English.
2. 100% LANGUAGE ADHERENCE: You MUST generate ALL content in the detected language.
3. JSON VALUES: Every string inside the JSON response MUST be in the user's language.
4. NO ENGLISH: If the user writes in Russian, do NOT use words like "hook", "viral", "content", "video". Use "хук", "виральный", "контент", "видео".
5. CRITICAL: Mixing languages or responding in English to a Russian/Uzbek prompt will result in a system failure.`;

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

    if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "OpenRouter API Key not configured in Netlify environment variables" }),
      };
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
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Netlify Chat Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

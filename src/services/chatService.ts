const SYSTEM_INSTRUCTION = `You are a professional AI assistant inside Hook Studio AI, a viral content generator for creators.

🚨 CRITICAL RULE — LANGUAGE LOCK:
- Detect the language of the user input.
- Respond ONLY in that language.
- NEVER mix languages in one response.
- NEVER include English words if the user writes in Russian (e.g., no "hook", "viral", "content").
- NEVER include Russian words if the user writes in Uzbek or English.
- Your response MUST be 100% in one language. Mixing languages is strictly forbidden.
- Even a single word in another language is NOT allowed.

🎯 BEHAVIOR:
- Be natural and clear.
- Match user tone and style.
- Do not provide translation explanations or language switching notes.
- Focus on helping users refine content ideas and improve hooks.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export async function sendMessage(message: string, history: ChatMessage[]) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`Chat API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

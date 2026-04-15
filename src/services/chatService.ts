const SYSTEM_INSTRUCTION = `STRICT LANGUAGE RULE:
1. Detect the user's language.
2. Respond ONLY in that language.
3. If the user writes in Russian, your response must be 100% Russian.
4. If the user writes in Uzbek, your response must be 100% Uzbek.
5. NEVER use English words like "hook", "viral", "content", "video" if the user is not writing in English. Use their equivalents in the user's language.
6. Mixing languages is strictly forbidden and will be considered a failure.

You are a professional AI assistant inside Hook Studio AI. Help users with content ideas and hooks.`;

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

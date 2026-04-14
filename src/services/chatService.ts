import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a helpful AI assistant inside Hook Studio AI, a viral content generator for creators.
Your goal is to help users refine their content ideas, brainstorm new topics, and improve their hooks.

⚠️ IMPORTANT LANGUAGE RULE:
You MUST ALWAYS respond in the SAME language as the user input.
- If the user writes in Russian → respond ONLY in Russian
- If the user writes in Uzbek → respond ONLY in Uzbek
- If the user writes in English → respond ONLY in English
- Never translate unless user explicitly asks for translation
- Never default to English

🎯 BEHAVIOR RULES:
- Be natural and conversational.
- Match user tone and style.
- Do not add explanations about language choice.
- Do not switch languages mid-response.
- Be concise and focus on providing value for content creation.`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendMessage(message: string, history: ChatMessage[]) {
  try {
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add the current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

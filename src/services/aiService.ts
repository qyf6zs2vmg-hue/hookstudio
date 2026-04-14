import { ViralMode, GenerationResult, ContentPack, ContentTone, ToolType } from '../lib/types';

const FALLBACK_TEMPLATES = {
  hooks: [
    "I tried {idea} so you don't have to...",
    "Stop doing {idea} the wrong way!",
    "The secret to {idea} that nobody tells you.",
    "Why {idea} is actually a waste of time.",
    "How I mastered {idea} in just 24 hours.",
    "This one trick for {idea} changed everything.",
    "You won't believe what happened when I did {idea}.",
    "The truth about {idea} revealed.",
    "5 mistakes you're making with {idea}.",
    "Is {idea} actually worth it?"
  ],
  captions: [
    "Save this for later! 📌 #viral #contentcreator",
    "Which one was your favorite? Let me know below! 👇",
    "The results speak for themselves. 🚀",
    "Tag a friend who needs to see this! 🏷️",
    "Follow for more tips on {idea}! ✨"
  ],
  titles: [
    "The {idea} Secret",
    "Mastering {idea}",
    "Why {idea} Matters",
    "Ultimate {idea} Guide",
    "The Truth About {idea}"
  ]
};

export async function generateContent(
  input: string, 
  mode: ViralMode, 
  pack: ContentPack, 
  tone: ContentTone, 
  tool: ToolType
): Promise<GenerationResult> {
  let systemPrompt = `You are a viral content expert for ${pack} content. 
Your goal is to enhance content using curiosity hooks, emotional triggers, storytelling structure, and pattern interruption.
IMPORTANT: You MUST respond in the SAME LANGUAGE as the user's input. If they write in Russian, respond in Russian. If Uzbek, respond in Uzbek. If English, respond in English.
Tone: ${tone}.
Viral Mode: ${mode}.
`;

  let userPrompt = "";

  if (tool === 'generator') {
    userPrompt = `Generate viral content for this idea: "${input}".
Return exactly in this JSON format:
{
  "hooks": ["hook 1", ..., "hook 10"],
  "captions": ["caption 1", ..., "caption 5"],
  "titles": ["title 1", ..., "title 5"]
}`;
  } else if (tool === 'improver') {
    userPrompt = `Improve this weak hook: "${input}".
Return exactly in this JSON format:
{
  "improvement": {
    "improved": "the best improved version",
    "variations": ["variation 1", ..., "variation 5"],
    "explanation": "short explanation of why it's better"
  },
  "hooks": [], "captions": [], "titles": []
}`;
  } else if (tool === 'analyzer') {
    userPrompt = `Analyze this hook: "${input}".
Return exactly in this JSON format:
{
  "analysis": {
    "score": 8,
    "potential": "description of engagement potential",
    "problems": ["problem 1", "problem 2"],
    "improved": "an improved version of the hook"
  },
  "hooks": [], "captions": [], "titles": []
}`;
  }

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: fullPrompt })
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      idea: input,
      mode,
      pack,
      tone,
      tool,
      hooks: content.hooks || [],
      captions: content.captions || [],
      titles: content.titles || [],
      analysis: content.analysis,
      improvement: content.improvement
    };
  } catch (error) {
    console.error("AI Generation failed, using fallback:", error);
    // Fallback logic for generator tool
    if (tool === 'generator') {
      return {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        idea: input,
        mode,
        pack,
        tone,
        tool,
        hooks: FALLBACK_TEMPLATES.hooks.map(h => h.replace("{idea}", input)),
        captions: FALLBACK_TEMPLATES.captions.map(c => c.replace("{idea}", input)),
        titles: FALLBACK_TEMPLATES.titles.map(t => t.replace("{idea}", input))
      };
    }
    
    // Generic fallback for other tools
    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      idea: input,
      mode,
      pack,
      tone,
      tool,
      hooks: [],
      captions: [],
      titles: [],
      analysis: tool === 'analyzer' ? {
        score: 5,
        potential: "Moderate engagement potential. (Fallback Mode)",
        problems: ["Could be more specific", "Lacks strong hook"],
        improved: `How to master ${input} in 3 simple steps`
      } : undefined,
      improvement: tool === 'improver' ? {
        improved: `The secret to ${input} revealed`,
        variations: [`Why ${input} is changing everything`, `Stop doing ${input} wrong`],
        explanation: "Added curiosity and urgency. (Fallback Mode)"
      } : undefined
    };
  }
}

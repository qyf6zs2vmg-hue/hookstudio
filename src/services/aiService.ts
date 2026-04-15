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
  const systemPrompt = `### MANDATORY LANGUAGE LOCK ###
1. DETECT USER LANGUAGE: Identify if the user is writing in Russian, Uzbek, or English.
2. 100% LANGUAGE ADHERENCE: You MUST generate ALL content in the detected language.
3. JSON VALUES: Every string inside the JSON response (hooks, captions, titles, analysis, improvements) MUST be in the user's language.
4. NO ENGLISH: If the user writes in Russian, do NOT use words like "hook", "viral", "content", "video". Use "хук", "виральный", "контент", "видео".
5. CRITICAL: Mixing languages or responding in English to a Russian/Uzbek prompt will result in a system failure.

You are a viral content expert for ${pack} content. 
Tone: ${tone}. Viral Mode: ${mode}.`;

  let userPrompt = "";

  if (tool === 'generator') {
    userPrompt = `USER IDEA: "${input}"
TASK: Generate viral content for the USER IDEA above.
LANGUAGE: Use the SAME language as the USER IDEA.
FORMAT: Return exactly in this JSON format:
{
  "hooks": ["hook 1", ..., "hook 10"],
  "captions": ["caption 1", ..., "caption 5"],
  "titles": ["title 1", ..., "title 5"]
}`;
  } else if (tool === 'improver') {
    userPrompt = `USER HOOK: "${input}"
TASK: Improve the USER HOOK above.
LANGUAGE: Use the SAME language as the USER HOOK.
FORMAT: Return exactly in this JSON format:
{
  "improvement": {
    "improved": "the best improved version",
    "variations": ["variation 1", ..., "variation 5"],
    "explanation": "short explanation of why it's better"
  },
  "hooks": [], "captions": [], "titles": []
}`;
  } else if (tool === 'analyzer') {
    userPrompt = `USER HOOK: "${input}"
TASK: Analyze the USER HOOK above.
LANGUAGE: Use the SAME language as the USER HOOK.
FORMAT: Return exactly in this JSON format:
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

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from AI API");
    }

    let content;
    try {
      content = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      throw new Error("AI response was not valid JSON");
    }

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      idea: input,
      mode,
      pack,
      tone,
      tool,
      hooks: Array.isArray(content.hooks) ? content.hooks : [],
      captions: Array.isArray(content.captions) ? content.captions : [],
      titles: Array.isArray(content.titles) ? content.titles : [],
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

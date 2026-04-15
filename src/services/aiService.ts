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

function detectLanguage(text: string): 'Russian' | 'Uzbek' | 'English' {
  const cyrillicPattern = /[\u0400-\u04FF]/;
  const uzbekLatinPattern = /[o'|g'|sh|ch|q|h]/i; // Common Uzbek Latin markers
  
  if (cyrillicPattern.test(text)) {
    return 'Russian';
  }
  
  // Simple heuristic for Uzbek Latin vs English
  // Uzbek often uses o' and g' which are unique
  if (/[oʻ|gʻ|o'|g']/.test(text.toLowerCase())) {
    return 'Uzbek';
  }

  return 'English';
}

export async function generateContent(
  input: string, 
  mode: ViralMode, 
  pack: ContentPack, 
  tone: ContentTone, 
  tool: ToolType
): Promise<GenerationResult> {
  const detectedLang = detectLanguage(input);

  const systemPrompt = `### MANDATORY LANGUAGE LOCK: ${detectedLang.toUpperCase()} ###
You are a senior viral content expert.
CRITICAL RULE: You MUST respond EXCLUSIVELY in ${detectedLang}.
- Detected User Language: ${detectedLang}
- Your Output Language: ${detectedLang}
- NEVER use English words in ${detectedLang} responses.
- All JSON values MUST be in ${detectedLang}.
- Mixing languages is strictly forbidden and will result in a system error.

Context: ${pack} content.
Tone: ${tone}.
Viral Intensity: ${mode}.`;

  let userPrompt = "";

  if (tool === 'generator') {
    userPrompt = `TASK: Generate 10 viral hooks, 5 captions, and 5 titles for the idea: "${input}".
LANGUAGE REQUIREMENT: Everything must be in ${detectedLang}.
FORMAT: Return ONLY a JSON object:
{
  "hooks": ["..."],
  "captions": ["..."],
  "titles": ["..."]
}`;
  } else if (tool === 'improver') {
    userPrompt = `TASK: Improve this hook: "${input}".
LANGUAGE REQUIREMENT: Everything must be in ${detectedLang}.
FORMAT: Return ONLY a JSON object:
{
  "improvement": {
    "improved": "...",
    "variations": ["...", "...", "...", "...", "..."],
    "explanation": "..."
  },
  "hooks": [], "captions": [], "titles": []
}`;
  } else if (tool === 'analyzer') {
    userPrompt = `TASK: Analyze this hook: "${input}".
LANGUAGE REQUIREMENT: Everything must be in ${detectedLang}.
FORMAT: Return ONLY a JSON object:
{
  "analysis": {
    "score": 8,
    "potential": "...",
    "problems": ["...", "..."],
    "improved": "..."
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API REQUEST FAILED:", errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("RAW AI RESPONSE DATA:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("INVALID RESPONSE STRUCTURE:", data);
      throw new Error("Invalid response format from AI API");
    }

    const rawContent = data.choices[0].message.content;
    console.log("AI MESSAGE CONTENT:", rawContent);

    let content;
    try {
      content = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON PARSE ERROR. Raw content was:", rawContent);
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

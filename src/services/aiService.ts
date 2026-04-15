import { ViralMode, GenerationResult, ContentPack, ContentTone, ToolType } from '../lib/types';

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

    console.log("API STATUS:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OPENROUTER ERROR:", errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("API RESPONSE:", data);
    
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
    console.error("AI Generation failed:", error);
    throw error; // Re-throw to be handled by UI (no fallback)
  }
}

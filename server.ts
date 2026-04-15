import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for OpenRouter Proxy
  app.post("/api/generate", async (req, res) => {
    const { messages } = req.body;
    
    console.log("ENV API KEY:", process.env.API_KEY ? "EXISTS" : "MISSING");
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY") {
      return res.status(400).json({ error: "API key not found" });
    }

    // Prepend aggressive language rule ONLY if not already present
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

    try {
      console.log("SENDING REQUEST TO OPENROUTER...");
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
        console.error(`OPENROUTER API ERROR [${response.status}]:`, errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      console.log("AI RESPONSE RECEIVED:", JSON.stringify(data, null, 2));
      res.json(data);
    } catch (error) {
      console.error("PROXY SERVER ERROR:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API Route for Chat Assistant
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY") {
      return res.status(400).json({ error: "API key not found" });
    }

    try {
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
          "messages": messages
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Chat proxy error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 3000
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Explicitly serve static files with correct MIME types
    app.use(express.static(distPath, { 
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));

    app.get('*', (req, res) => {
      // Only serve index.html for non-file requests (SPA routing)
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        res.status(404).send('Not found');
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

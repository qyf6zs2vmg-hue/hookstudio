import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    console.log("ENV API KEY:", process.env.API_KEY ? "EXISTS" : "MISSING");
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "API key not found" }),
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
        "model": "openai/gpt-4o-mini",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
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
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

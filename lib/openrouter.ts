type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  error?: { message?: string };
  model?: string;
};

export function getOpenRouterStatus() {
  return {
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    model: process.env.OPENROUTER_MODEL || "~openai/gpt-latest",
  };
}

export async function askOpenRouter(prompt: string, system = "You are the concise teaching assistant for a live multi-agent AI workshop. Give practical, accurate explanations and never reveal secrets.") {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter is not configured. Add OPENROUTER_API_KEY to .env.local and restart the workshop.");
  const model = process.env.OPENROUTER_MODEL || "~openai/gpt-latest";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3010",
      "X-OpenRouter-Title": "LiuantX Live Workshop",
    },
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.3, max_tokens: 500 }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json().catch(() => ({})) as OpenRouterResponse;
  if (!response.ok) throw new Error(data.error?.message || `OpenRouter request failed (${response.status}).`);
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : content?.map((part) => part.text || "").join("");
  if (!text) throw new Error("OpenRouter returned an empty response.");
  return { text, model: data.model || model };
}

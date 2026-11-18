// Vercel serverless function: POST /api/chat  { messages: [{ role, content }] }
// Setup: add ANTHROPIC_API_KEY in Vercel project settings. Then set CHAT_ENDPOINT = "/api/chat" in script.js.
// Works when the site is hosted on Vercel (same origin). Keep max_tokens low: every message costs money.
const FACTS = `You answer questions about Rayan Alam for visitors of his portfolio. Be brief, friendly, honest.
Only use these facts; if something is not covered, say so and point to the contact form.
- CS co-op student at Ontario Tech (class of 2028), Mathematics minor, 4.10/4.30 cGPA, President's List 4 times.
- Data Science & AI Development Intern at Bravella Health (Sep 2025 - Sep 2026): ELLA-M clinical AI assistant, Qwen-3 14B on AWS SageMaker, 10,000+ PubMed articles vectorized with FAISS for RAG, 50%+ cloud cost and latency reduction. Stack: Angular, Flask, AWS, Nginx, SQLite.
- Mobile developer and UI/UX at MY Voice Canada (2022-23): award-winning Android app in Flutter, Best Team of the Year 2022.
- Projects: SpaceX launch predictor (about 84% accuracy), dealership review portal (React, Django, MongoDB, Docker, Kubernetes), interview prep repo (LeetCode/NeetCode).
- Open to Summer 2027 internships and co-op. Contact: alamrayan103@gmail.com.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  let msgs = (req.body?.messages || []).slice(-8).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 600),
  }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ error: "bad request" });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 300, system: FACTS, messages: msgs }),
  });
  if (!r.ok) return res.status(502).json({ error: "upstream" });
  const d = await r.json();
  res.json({ reply: d.content?.[0]?.text || "" });
}
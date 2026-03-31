export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { studentName, answers, step } = req.body;

  // Step 0-8: Generate the next adaptive question
  // Step 9: Final confirmation + emit p_passion object
  const isFinalization = step >= 9;

  const conversationHistory = (answers || []).map((a, i) => [
    { role: "assistant", content: a.question },
    { role: "user", content: a.answer },
  ]).flat();

  const system = isFinalization
    ? `You are a passion detection engine for a K-12 AI learning platform. You have asked ${studentName} ${answers.length} questions about their interests.

Based on ALL their answers, emit a JSON detection object. Analyze deeply — look for patterns across all answers, not just the most recent one.

Respond with ONLY this JSON format, nothing else:
{
  "goalLabel": "A short aspirational goal label like 'Game Developer' or 'Music Producer' or 'Sports Analyst' (2-4 words, what they want to become)",
  "domain": "The broad passion domain (e.g., Gaming, Music, Sports, Art, Science, Engineering, Writing, Film, Business, Medicine, Law)",
  "subDomain": "The specific niche within the domain (e.g., Competitive FPS, Hip-Hop Production, Basketball Analytics)",
  "motivationAnchor": "A 1-sentence quote from their own words that reveals WHY this matters to them — pull directly from their answers",
  "confidence": A number 0-100 representing how confident you are in this detection
}`
    : `You are a warm, curious passion discovery guide for a K-12 AI learning platform called The Force Multiplier. You're talking to ${studentName}.

Your job: Through natural conversation, discover what this student is deeply passionate about. You need to find their DOMAIN (what field), SUB-DOMAIN (what niche), and MOTIVATION (why it matters to them).

RULES:
- Ask ONE question at a time. Short, warm, conversational.
- Never ask generic questions like "what are your hobbies?" — be specific and build on what they've said.
- Show genuine curiosity about their answers. React before asking the next question.
- ${step < 3 ? "Start broad — what do they love, what could they do for hours, what excites them." : ""}
- ${step >= 3 && step < 6 ? "Now narrow down — dig into the specific thing within their interest. What part of it? Why that part?" : ""}
- ${step >= 6 ? "Now confirm and deepen — reflect back what you've heard, ask about their dream scenario or goal related to this passion." : ""}
- Keep it to 2-3 sentences max. One question per message.
- Be encouraging and make them feel like their passion matters.
- You are NOT teaching yet — just discovering.

This is question ${step + 1} of about 10.`;

  try {
    const messages = isFinalization
      ? [...conversationHistory, { role: "user", content: "Based on everything I've told you, detect my passion domain and emit the p_passion JSON object." }]
      : step === 0
        ? [{ role: "user", content: `Hi, I'm ${studentName}. I'm starting the Force Multiplier program.` }]
        : [...conversationHistory, { role: "user", content: answers[answers.length - 1]?.answer || "" }];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: isFinalization ? "claude-sonnet-4-20250514" : "claude-sonnet-4-20250514",
        max_tokens: isFinalization ? 300 : 200,
        system,
        messages,
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    if (isFinalization) {
      // Parse the p_passion JSON
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const passion = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (passion && passion.domain) {
          return res.status(200).json({ type: "detection", passion });
        }
      } catch {}
      // Fallback if parsing fails
      return res.status(200).json({ type: "detection", passion: {
        goalLabel: "Your Goal",
        domain: "General",
        subDomain: "Exploration",
        motivationAnchor: "Discovering what matters most",
        confidence: 30,
      }});
    }

    return res.status(200).json({ type: "question", text });
  } catch (error) {
    return res.status(500).json({ error: "API error", details: error.message });
  }
}

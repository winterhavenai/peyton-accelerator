import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const PASSION_EMAIL = "thefootersedge@gmail.com";

async function sendPassionEmail({ studentName, passion, answers }) {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const qaHtml = (answers || []).map((a, i) =>
    `<div style="margin-bottom:14px;padding:12px;background:#0F1629;border:1px solid #1E2D4A;border-radius:8px;"><div style="font-size:12px;color:#00D4FF;font-weight:600;margin-bottom:6px;">Q${i+1}: ${esc(a.question)}</div><div style="font-size:13px;color:#E2E8F0;">${esc(a.answer)}</div></div>`
  ).join("");
  const html = `<div style="font-family:'Inter',sans-serif;max-width:640px;margin:0 auto;background:#0A0E1A;color:#E2E8F0;padding:32px;border-radius:12px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;color:#00D4FF;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">WinterHaven.AI</div>
      <h1 style="font-size:22px;font-weight:900;margin:0;color:#ffffff;">Passion Discovery Complete</h1>
      <div style="font-size:14px;color:#FFB300;margin-top:8px;font-weight:700;">${esc(studentName)}</div>
    </div>
    <div style="background:#0F1629;border:1px solid #FFB300;border-radius:10px;padding:18px;margin-bottom:20px;">
      <div style="font-size:11px;color:#FFB300;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Detected Passion</div>
      <div style="font-size:20px;font-weight:900;color:#ffffff;margin-bottom:4px;">${esc(passion.goalLabel)}</div>
      <div style="font-size:13px;color:#E2E8F0;">${esc(passion.domain)} &middot; ${esc(passion.subDomain)}</div>
      <div style="font-size:12px;color:#64748B;margin-top:6px;">Confidence: ${esc(passion.confidence)}%</div>
      ${passion.motivationAnchor ? `<div style="margin-top:12px;padding:10px;background:rgba(255,179,0,0.05);border-left:3px solid #FFB300;font-size:13px;font-style:italic;color:#E2E8F0;">"${esc(passion.motivationAnchor)}"</div>` : ""}
    </div>
    <div style="font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Full Transcript (${(answers||[]).length} questions)</div>
    ${qaHtml}
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#64748B;">WinterHaven.AI &middot; Passion-Powered Learning</div>
  </div>`;
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: PASSION_EMAIL,
    subject: `WinterHaven.AI - Passion Discovered: ${studentName} -> ${passion.goalLabel}`,
    html,
  });
}

export default async function handler(req, res) {
  // GET: retrieve discovery transcript
  if (req.method === "GET") {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing name" });
    try {
      const key = `transcript:discovery:${name.toLowerCase()}`;
      const raw = await redis.get(key);
      if (!raw) return res.status(200).json({ transcript: null });
      const transcript = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json({ transcript });
    } catch (error) {
      console.error("Discovery transcript GET error:", error);
      return res.status(500).json({ error: "Failed to load transcript" });
    }
  }

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
- ${step >= 6 ? "Now confirm and deepen — reflect back what you've heard, ask about their dream scenario or goal related to this passion. Invite them to imagine how this could help others or make a difference beyond themselves." : ""}
- Keep it to 2-3 sentences max. One question per message.
- Be encouraging and make them feel like their passion matters.
- If a student is unsure or says "I don't know," that's okay — there are no wrong answers. Meet them where they are. Start from whatever they share, even small things like "I like being outside" or "I watch a lot of videos." All interests are valid. Whatever comes to mind counts.
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

    // If API returned an error, log it and use fallback
    if (data.error) {
      console.error("Discover API error:", JSON.stringify(data.error));
      if (isFinalization) {
        return res.status(200).json({ type: "detection", passion: {
          goalLabel: "Your Goal", domain: "General", subDomain: "Exploration",
          motivationAnchor: "Discovering what matters most", confidence: 30,
        }});
      }
      const fallbackQuestions = [
        `Hey ${studentName}! I'm excited to get to know you. What's something you could talk about for hours without getting bored?`,
        "That's awesome! What specifically about that excites you the most?",
        "I love that. If you could spend a whole day doing anything related to that, what would it look like?",
      ];
      return res.status(200).json({ type: "question", text: fallbackQuestions[Math.min(step, fallbackQuestions.length - 1)] });
    }

    const text = data.content?.[0]?.text || "";

    if (isFinalization) {
      // Parse the p_passion JSON
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const passion = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        if (passion && passion.domain) {
          // Persist the full discovery transcript to Redis
          try {
            const transcriptKey = `transcript:discovery:${studentName.toLowerCase()}`;
            const transcript = {
              studentName,
              answers,
              passion,
              completedAt: new Date().toISOString(),
            };
            await redis.set(transcriptKey, JSON.stringify(transcript));
          } catch (saveErr) {
            console.error("Failed to save discovery transcript:", saveErr);
          }
          try {
            await sendPassionEmail({ studentName, passion, answers });
          } catch (emailErr) {
            console.error("Failed to send passion discovery email:", emailErr);
          }
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

    return res.status(200).json({ type: "question", text: text || `Hey ${studentName}! What's something you're really passionate about — something you could talk about for hours?` });
  } catch (error) {
    return res.status(500).json({ error: "API error", details: error.message });
  }
}

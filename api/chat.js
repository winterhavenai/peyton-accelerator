export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { system, messages } = req.body;

  // Extract the latest student message for moderation
  const lastUserMessage = [...(messages || [])].reverse().find((m) => m.role === "user");
  const textToModerate = lastUserMessage?.content || "";

  // --- Content moderation pre-check (Haiku) ---
  try {
    const moderationResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 128,
        system:
          "You are a content moderation system for a student-facing K-12 platform. " +
          "Evaluate the following student message for harmful, inappropriate, or unsafe content. " +
          'Respond with only JSON: { "safe": true/false, "reason": "string" }',
        messages: [{ role: "user", content: textToModerate }],
      }),
    });

    const moderationData = await moderationResponse.json();
    const moderationText = moderationData?.content?.[0]?.text || "";

    let moderationResult;
    try {
      moderationResult = JSON.parse(moderationText);
    } catch {
      // If Haiku returns non-JSON, fail safe — block the message
      return res.status(200).json({
        content: [
          {
            type: "text",
            text: "I wasn't able to process that message. Could you try rephrasing your question about today's lesson?",
          },
        ],
      });
    }

    if (!moderationResult.safe) {
      return res.status(200).json({
        content: [
          {
            type: "text",
            text: "It looks like that message isn't something I can help with. I'm here to support your cybersecurity and AI learning — let's get back on track! What would you like to explore in today's lesson?",
          },
        ],
      });
    }
  } catch {
    // If the moderation call itself errors, fail safe — block the message
    return res.status(200).json({
      content: [
        {
          type: "text",
          text: "I'm having trouble processing your message right now. Please try again in a moment.",
        },
      ],
    });
  }

  // --- Main Cipher call ---
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system,
        messages,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "API error", details: error.message });
  }
}

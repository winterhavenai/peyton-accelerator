import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name" });

  const nameLower = name.toLowerCase();

  try {
    // Fetch memory, discovery transcript, and completions in parallel
    const [memoryRaw, transcriptRaw, completionKeys] = await Promise.all([
      redis.get(`memory:${nameLower}`),
      redis.get(`transcript:discovery:${nameLower}`),
      redis.lrange("completion_index", 0, -1),
    ]);

    const memory = memoryRaw
      ? typeof memoryRaw === "string" ? JSON.parse(memoryRaw) : memoryRaw
      : null;

    const transcript = transcriptRaw
      ? typeof transcriptRaw === "string" ? JSON.parse(transcriptRaw) : transcriptRaw
      : null;

    // Filter completion keys for this student and fetch them
    const studentKeys = (completionKeys || []).filter(k =>
      k.startsWith(`completion:${nameLower}:`) || k.startsWith(`completion:${name}:`)
    );

    const completions = [];
    for (const key of studentKeys) {
      const raw = await redis.get(key);
      if (!raw) continue;
      const record = typeof raw === "string" ? JSON.parse(raw) : raw;
      completions.push(record);
    }

    // Sort completions by day number
    completions.sort((a, b) => a.day - b.day);

    // Build the progress response
    const passion = transcript?.passion || null;
    const latestCompletion = completions[completions.length - 1] || null;

    const progress = {
      name: transcript?.studentName || name,
      passion: passion ? {
        goalLabel: passion.goalLabel,
        domain: passion.domain,
        subDomain: passion.subDomain,
      } : null,
      currentDay: latestCompletion ? latestCompletion.day + 1 : 1,
      daysCompleted: completions.length,
      streak: latestCompletion?.streak || 0,
      skills: memory?.skills || [],
      goals: memory?.goals || [],
      daysSummary: memory?.daysSummary || {},
      completions: completions.map(c => ({
        day: c.day,
        streak: c.streak,
        skills: c.skills || [],
        reflection: c.reflection || "",
        timestamp: c.timestamp,
      })),
    };

    return res.status(200).json(progress);
  } catch (error) {
    console.error("Progress API error:", error);
    return res.status(500).json({ error: "Failed to load progress" });
  }
}

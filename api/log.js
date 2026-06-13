import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
    }
    try {
          const { name, day, streak, skills, reflection, timestamp, competencyId, evidenceRequired, artifactDescriptor, lessonKey } = req.body;
          if (!name || !day) {
                  return res.status(400).json({ error: "Missing required fields" });
          }
          const key = `completion:${name}:day${day}:${Date.now()}`;
          const record = {
                  name, day, streak,
                  skills: skills || [],
                  reflection: reflection || "",
                  timestamp: timestamp || new Date().toISOString(),
          };
          await redis.set(key, JSON.stringify(record));
          await redis.lpush("completion_index", key);

          // Slice B: structured evidence stub (B upgrades status "covered" -> "demonstrated", no migration)
          if (competencyId) {
                  const studentKey = String(name).trim().toLowerCase();
                  const evKey = `evidence:${studentKey}:${competencyId}:${day}`;
                  await redis.set(evKey, JSON.stringify({
                          competencyId, activeDay: day,
                          lessonKey: lessonKey || null,            // Codex: include the versioned lessonKey when available
                          evidenceRequired: evidenceRequired || null,
                          studentReflection: reflection || null,
                          artifactDescriptor: artifactDescriptor || null,
                          status: "covered",
                          at: new Date().toISOString(),
                  }));
          }

          return res.status(200).json({ success: true });
    } catch (error) {
          console.error("Log error:", error);
          return res.status(500).json({ error: "Failed to log completion" });
    }
}

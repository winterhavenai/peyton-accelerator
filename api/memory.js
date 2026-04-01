import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.STORAGE_KV_REST_API_URL,
  token: process.env.STORAGE_KV_REST_API_TOKEN,
});

// Memory key: memory:{studentName}
// Structure: { skills: [], preferences: {}, goals: [], strengths: [], weaknesses: [],
//              personalInfo: {}, conversationHighlights: [], lastUpdated: "" }

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing name" });

    try {
      const key = `memory:${name.toLowerCase()}`;
      const raw = await redis.get(key);
      if (!raw) {
        return res.status(200).json({ memory: null });
      }
      const memory = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json({ memory });
    } catch (error) {
      console.error("Memory GET error:", error);
      return res.status(500).json({ error: "Failed to load memory" });
    }
  }

  if (req.method === "POST") {
    const { name, memory } = req.body;
    if (!name || !memory) return res.status(400).json({ error: "Missing name or memory" });

    try {
      const key = `memory:${name.toLowerCase()}`;
      // Merge with existing memory
      const raw = await redis.get(key);
      const existing = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : {
        skills: [],
        preferences: {},
        goals: [],
        strengths: [],
        weaknesses: [],
        personalInfo: {},
        conversationHighlights: [],
        daysSummary: {},
        lastUpdated: "",
      };

      // Merge arrays (deduplicate), merge objects
      const merged = {
        skills: [...new Set([...(existing.skills || []), ...(memory.skills || [])])],
        preferences: { ...(existing.preferences || {}), ...(memory.preferences || {}) },
        goals: [...new Set([...(existing.goals || []), ...(memory.goals || [])])],
        strengths: [...new Set([...(existing.strengths || []), ...(memory.strengths || [])])],
        weaknesses: [...new Set([...(existing.weaknesses || []), ...(memory.weaknesses || [])])],
        personalInfo: { ...(existing.personalInfo || {}), ...(memory.personalInfo || {}) },
        conversationHighlights: [
          ...(existing.conversationHighlights || []),
          ...(memory.conversationHighlights || []),
        ].slice(-20), // Keep last 20 highlights
        daysSummary: { ...(existing.daysSummary || {}), ...(memory.daysSummary || {}) },
        lastUpdated: new Date().toISOString(),
      };

      await redis.set(key, JSON.stringify(merged));
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Memory POST error:", error);
      return res.status(500).json({ error: "Failed to save memory" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

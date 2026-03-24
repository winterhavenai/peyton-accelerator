import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, day, streak, skills, reflection, timestamp } = req.body;

    if (!name || !day) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const key = `completion:${name}:day${day}:${Date.now()}`;
    const record = {
      name,
      day,
      streak,
      skills: skills || [],
      reflection: reflection || "",
      timestamp: timestamp || new Date().toISOString(),
    };

    await kv.set(key, JSON.stringify(record));

    // Also maintain an index of all completion keys for easy retrieval
    await kv.lpush("completion_index", key);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Log error:", error);
    return res.status(500).json({ error: "Failed to log completion" });
  }
}

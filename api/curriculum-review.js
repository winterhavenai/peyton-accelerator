import { Redis } from "@upstash/redis";

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

function authed(req) {
  const secret = req.headers["x-review-secret"];
  return secret && secret === process.env.CURRICULUM_REVIEW_SECRET;
}

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: "Unauthorized" });

  // GET: list pending lessons
  if (req.method === "GET") {
    const keys = await redis.smembers("lesson_index:pending");
    const lessons = [];
    for (const key of keys || []) {
      const raw = await redis.get(key);
      if (raw) lessons.push({ key, lesson: typeof raw === "string" ? JSON.parse(raw) : raw });
    }
    return res.status(200).json({ pending: lessons });
  }

  // POST: approve or reject one lesson
  if (req.method === "POST") {
    const { lessonKey, action, laneNotes, fidelityScore } = req.body || {};
    if (!lessonKey || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Provide lessonKey and action 'approve'|'reject'" });
    }
    const raw = await redis.get(lessonKey);
    if (!raw) return res.status(404).json({ error: "Lesson not found" });
    const lesson = typeof raw === "string" ? JSON.parse(raw) : raw;

    lesson.reviewStatus = action === "approve" ? "approved" : "rejected";
    lesson.reviewedBy = "lane";
    lesson.reviewedAt = new Date().toISOString();
    if (typeof fidelityScore === "number") lesson.fidelityScore = fidelityScore;
    if (laneNotes) lesson.laneNotes = laneNotes;

    await redis.set(lessonKey, JSON.stringify(lesson));
    await redis.srem("lesson_index:pending", lessonKey);
    return res.status(200).json({ ok: true, lesson });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

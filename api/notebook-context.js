import { readFileSync } from "fs";
import { join } from "path";

let cipherContext = null;

function loadContext() {
  if (cipherContext) return cipherContext;
  try {
    const raw = readFileSync(join(process.cwd(), "src", "cipherContext.json"), "utf-8");
    cipherContext = JSON.parse(raw);
  } catch {
    cipherContext = {};
  }
  return cipherContext;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "topic required" });

  const ctx = loadContext();
  res.status(200).json({ context: ctx[topic] || "" });
}

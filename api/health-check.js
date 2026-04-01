import { Resend } from "resend";
import cipherContext from "../src/cipherContext.json" with { type: "json" };

const resend = new Resend(process.env.RESEND_API_KEY);
const ALERT_EMAIL = "thefootersedge@gmail.com";
const MIN_TOPICS = 20;

export default async function handler(req, res) {
  // Auth check — cron jobs send CRON_SECRET, manual calls use HEALTH_CHECK_SECRET
  const auth = req.headers.authorization?.replace("Bearer ", "") || "";
  const cronSecret = req.headers["x-vercel-cron-secret"] || "";
  const validSecret = process.env.HEALTH_CHECK_SECRET || "";

  if (!auth && !cronSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (auth && auth !== validSecret && cronSecret !== validSecret) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    // Count topics with real content (> 50 chars)
    const entries = Object.entries(cipherContext);
    const populated = entries.filter(
      ([, v]) => typeof v === "string" && v.length > 50
    ).length;
    const total = entries.length;

    if (populated < MIN_TOPICS) {
      // DEGRADED — send alert email
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: ALERT_EMAIL,
          subject:
            "⚠️ TFM Health Check: cipherContext.json is empty or degraded",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#dc2626;">⚠️ cipherContext.json Health Check Failed</h2>
              <p><strong>Topics populated:</strong> ${populated}/${total} (minimum required: ${MIN_TOPICS})</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Status:</strong> DEGRADED — students are getting responses without RAG grounding</p>
              <hr/>
              <h3>How to fix:</h3>
              <ol>
                <li>Run: <code>python3 -m notebooklm login</code> (complete browser auth)</li>
                <li>Run: <code>cat ~/.notebooklm/storage_state.json</code></li>
                <li>Paste that JSON into GitHub → Settings → Secrets → Actions → <code>NOTEBOOKLM_AUTH_JSON</code></li>
                <li>Go to GitHub Actions → "Sync CIPHER-KNOWLEDGE-BASE" → Run workflow</li>
              </ol>
              <p style="color:#6b7280;font-size:12px;">WinterHaven.AI — The Force Multiplier Monitoring</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Health check email failed:", emailErr);
      }

      return res.status(503).json({
        status: "degraded",
        topics: populated,
        total,
        message: `Only ${populated}/${total} topics have content. NotebookLM auth likely expired.`,
      });
    }

    return res.status(200).json({
      status: "healthy",
      topics: populated,
      total,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({ error: "Health check failed" });
  }
}

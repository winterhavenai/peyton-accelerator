import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const SUMMARY_EMAIL = "thefootersedge@gmail.com";

export default async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
    }
    try {
          const keys = await redis.lrange("completion_index", 0, -1);
          if (!keys || keys.length === 0) {
                  await sendEmail("<p>No completions in the last 24 hours.</p>", "WinterHaven.AI - No activity today");
                  return res.status(200).json({ success: true, message: "No completions" });
          }
          const now = Date.now();
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          const recentCompletions = [];
          for (const key of keys) {
                  const raw = await redis.get(key);
                  if (!raw) continue;
                  const record = typeof raw === "string" ? JSON.parse(raw) : raw;
                  const recordTime = new Date(record.timestamp).getTime();
                  if (recordTime >= oneDayAgo) recentCompletions.push(record);
          }
          if (recentCompletions.length === 0) {
                  await sendEmail("<p>No completions in the last 24 hours.</p>", "WinterHaven.AI - No activity today");
                  return res.status(200).json({ success: true, message: "No recent completions" });
          }
          recentCompletions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const today = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
          let html = `<div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#0A0E1A;color:#E2E8F0;padding:32px;border-radius:12px;"><div style="text-align:center;margin-bottom:32px;"><div style="font-size:11px;color:#00D4FF;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">WinterHaven.AI</div><h1 style="font-size:24px;font-weight:900;margin:0;color:#ffffff;">Daily Summary</h1><div style="font-size:13px;color:#64748B;margin-top:6px;">${today}</div><div style="font-size:13px;color:#FFB300;margin-top:4px;font-weight:600;">${recentCompletions.length} completion${recentCompletions.length>1?"s":""} in the last 24 hours</div></div>`;
          for (const c of recentCompletions) {
                  const time = new Date(c.timestamp).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
                  html += `<div style="background:#0F1629;border:1px solid #1E2D4A;border-radius:10px;padding:20px;margin-bottom:16px;"><div style="font-size:18px;font-weight:900;color:#00D4FF;">${c.name} - Day ${c.day} . Streak: ${c.streak} . ${time}</div>${c.skills&&c.skills.length>0?`<div style="margin-top:8px;">${c.skills.map(s=>`<div style="font-size:12px;color:#00FF88;">* ${s}</div>`).join("")}</div>`:""} ${c.reflection?`<div style="margin-top:10px;background:rgba(255,179,0,0.05);border:1px solid rgba(255,179,0,0.2);border-radius:7px;padding:10px;font-size:13px;color:#E2E8F0;font-style:italic;">"${c.reflection}"</div>`:""}</div>`;
          }
          html += `<div style="text-align:center;margin-top:24px;font-size:11px;color:#64748B;">WinterHaven.AI . Passion-Powered Learning</div></div>`;
          const subject = `WinterHaven.AI - Daily Summary . ${recentCompletions.length} completion${recentCompletions.length>1?"s":""} . ${today}`;
          await sendEmail(html, subject);
          return res.status(200).json({ success: true, count: recentCompletions.length });
    } catch (error) {
          console.error("Daily summary error:", error);
          return res.status(500).json({ error: "Failed to send summary" });
    }
}

async function sendEmail(html, subject) {
    await resend.emails.send({
          from: "onboarding@resend.dev",
          to: SUMMARY_EMAIL,
          subject,
          html,
    });
}

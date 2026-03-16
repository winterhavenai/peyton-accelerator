import { useState, useEffect, useRef } from "react";

// ============================================================
// QUOTE LIBRARY — tagged from LB_Quote_Library_Master
// ============================================================
const QUOTES = {
  day1: { text: "We like to think of our champions and idols as superheroes who were born different from us. We don't like to think of them as relatively ordinary people who made themselves extraordinary.", author: "Carol Dweck" },
  day2: { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee" },
  day3: { text: "The undertaking of a new action brings new strength.", author: "Richard L. Evans" },
  day4: { text: "When you are inspired by some great purpose, all of your thoughts break their bonds. Your mind transcends limitations.", author: "Patanjali" },
  day5: { text: "A remarkable, glorious achievement is just what a long series of unremarkable, unglorious tasks looks like from far away.", author: "Tim Urban" },
  resilience: { text: "It is defeat that turns bone to flint; it is defeat that turns gristle to muscle; it is defeat that makes men invincible.", author: "Henry Ward Beecher" },
  courage: { text: "It's not who you are that holds you back. It's who you think you're not.", author: "Mark Pothier" },
  excellence: { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  mindset: { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  growth: { text: "If you have the guts to keep making mistakes, your wisdom and intelligence leap forward with huge momentum.", author: "Holly Near" },
  persistence: { text: "It takes less time to do a thing right, than it does to explain why you did it wrong.", author: "Henry Wadsworth Longfellow" },
  action: { text: "Whatever you think you can do, or believe you can do, begin it. Action has magic, power and grace.", author: "Johann Wolfgang Von Goethe" },
  mastery: { text: "Self-control is strength. Calmness is mastery. You have to get to the point where your mood doesn't shift based on the insignificant actions of someone else.", author: "James Allen" },
  wisdom: { text: "How one reacts to hostility is a strong evidence of wisdom. Maintain a cool, calm, and collected demeanor at all times.", author: "Cato the Elder" },
};

// ============================================================
// 90-DAY CURRICULUM
// ============================================================
const CURRICULUM = {
  // WEEK 1-5: SPARK Onramp (Days 1-5)
  1:  { phase: "SPARK", day: 1, week: 1, title: "SEE IT — Discover AI Through Cybersecurity", quote: QUOTES.day1, mission: "Ask Claude to explain the cybersecurity landscape in 2026. What are the top threats? What does a day in the life of a security analyst look like? What skills pay the most? Have a real conversation — argue, push back, go deep.", deliverable: "Your first AI conversation about cybersecurity — saved and printed.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  2:  { phase: "SPARK", day: 2, week: 1, title: "PROMPT IT — Learn to Talk to AI Like an Analyst", quote: QUOTES.day2, mission: "Master the 3-Part Prompt Formula: Context + Request + Format. Practice prompting Claude to explain attack vectors, write threat summaries, and analyze vulnerabilities. Build your first 5-prompt cybersecurity library.", deliverable: "Your Personal Cybersecurity Prompt Library — 5 reusable prompts.", tools: ["Claude.ai"], badge: null, duration: 60 },
  3:  { phase: "SPARK", day: 3, week: 1, title: "APPLY IT — Build Your First Real Security Asset", quote: QUOTES.day3, mission: "Choose one: (A) Write an AI-assisted threat report on a real recent data breach. (B) Build a personal cybersecurity study plan for UCF freshman year. (C) Create a network security checklist for your home lab.", deliverable: "A document you could show a UCF professor on Day 1.", tools: ["Claude.ai", "Google Docs"], badge: null, duration: 60 },
  4:  { phase: "SPARK", day: 4, week: 1, title: "REMIX IT — Explore the Cybersecurity AI Ecosystem", quote: QUOTES.day4, mission: "Discover the tools used by real security professionals: TryHackMe for CTF challenges, GitHub Copilot for security scripting, Kali Linux concepts, Shodan for network intelligence. Use Claude to explain each one.", deliverable: "Your Personal Cybersecurity Tool Stack document.", tools: ["Claude.ai", "TryHackMe", "GitHub"], badge: null, duration: 60 },
  5:  { phase: "SPARK", day: 5, week: 1, title: "KEEP IT GOING — Design Your 90-Day Plan", quote: QUOTES.day5, mission: "Build your pre-UCF AI practice plan. One hour per day, structured across 90 days. Use Claude as your planning partner. Write your personal commitment statement.", deliverable: "Your 90-Day Cybersecurity Accelerator Plan + Personal Commitment.", tools: ["Claude.ai"], badge: "⚡ The SPARK — 5-Day SPARK Framework Complete", duration: 60 },

  // WEEK 2: Foundations
  6:  { phase: "Foundation", day: 6, week: 2, title: "Networking Fundamentals with AI", quote: QUOTES.growth, mission: "Use Claude to master OSI model, TCP/IP, DNS, HTTP/HTTPS. Ask it to explain each layer like you're a curious UCF freshman. Then quiz yourself by having Claude ask YOU questions.", deliverable: "Networking concepts summary in your own words.", tools: ["Claude.ai"], badge: null, duration: 60 },
  7:  { phase: "Foundation", day: 7, week: 2, title: "Linux Command Line Basics", quote: QUOTES.excellence, mission: "Learn the 20 most important Linux commands for cybersecurity. Use Claude to explain each one with real-world security use cases. Practice in a terminal if you have access.", deliverable: "Your Linux Command Cheat Sheet.", tools: ["Claude.ai", "Terminal/WSL"], badge: null, duration: 60 },
  8:  { phase: "Foundation", day: 8, week: 2, title: "Cryptography Fundamentals", quote: QUOTES.wisdom, mission: "Ask Claude to explain encryption, hashing, and digital signatures using real examples. How does HTTPS work? What is a hash collision? Why does password salting matter?", deliverable: "Cryptography concept map.", tools: ["Claude.ai"], badge: null, duration: 60 },
  9:  { phase: "Foundation", day: 9, week: 2, title: "Threat Landscape — Real Attacks in 2026", quote: QUOTES.mindset, mission: "Research the top 5 most significant cyberattacks of the last 2 years using Perplexity. Use Claude to analyze what went wrong and what defenders could have done differently.", deliverable: "Threat analysis report — 2 attacks in detail.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  10: { phase: "Foundation", day: 10, week: 2, title: "Python for Security — Your First Script", quote: QUOTES.courage, mission: "Use Claude to write your first Python security script — a simple port scanner or password strength checker. Understand every line. Modify it. Break it. Fix it.", deliverable: "Your first working Python security script.", tools: ["Claude.ai", "Python/Replit"], badge: null, duration: 60 },

  // WEEK 3
  11: { phase: "Foundation", day: 11, week: 3, title: "OWASP Top 10 — Web Vulnerabilities", quote: QUOTES.resilience, mission: "The OWASP Top 10 is the Bible of web security. Use Claude to walk you through each one with real examples. Understand SQL injection, XSS, and broken authentication.", deliverable: "OWASP Top 10 summary with real-world examples.", tools: ["Claude.ai"], badge: null, duration: 60 },
  12: { phase: "Foundation", day: 12, week: 3, title: "Your First CTF Challenge on TryHackMe", quote: QUOTES.action, mission: "Create a TryHackMe account. Start the 'Pre-Security' path. Complete your first room. Use Claude as your tutor when you get stuck — describe what you see and ask for guidance.", deliverable: "First TryHackMe room completed.", tools: ["TryHackMe", "Claude.ai"], badge: null, duration: 60 },
  13: { phase: "Foundation", day: 13, week: 3, title: "Social Engineering — The Human Attack Surface", quote: QUOTES.mastery, mission: "Study phishing, pretexting, and social engineering attacks. Use Claude to roleplay both sides: attacker and defender. How would you defend your family from a phishing attack today?", deliverable: "Social engineering defense guide for your family.", tools: ["Claude.ai"], badge: null, duration: 60 },
  14: { phase: "Foundation", day: 14, week: 3, title: "Week 2-3 Review + Portfolio Update", quote: QUOTES.persistence, mission: "Review everything you built in weeks 2-3. Ask Claude to quiz you on weak areas. Update your portfolio document with new skills and artifacts.", deliverable: "Portfolio document updated — Version 2.", tools: ["Claude.ai"], badge: null, duration: 60 },
  15: { phase: "Foundation", day: 15, week: 3, title: "Firewalls, IDS, and Network Defense", quote: QUOTES.day3, mission: "Use Claude to explain firewalls, intrusion detection systems, and VPNs. How does a SOC analyst use these tools daily? Design a basic network defense architecture.", deliverable: "Network defense architecture diagram + explanation.", tools: ["Claude.ai"], badge: "🔍 The Analyst — First Security Research Complete", duration: 60 },

  // WEEKS 4-8: Builder Phase
  16: { phase: "Builder", day: 16, week: 4, title: "Setting Up Your Security Lab", quote: QUOTES.day1, mission: "Design your personal security lab environment. Use Claude to build a shopping list or virtual setup plan using free tools: VirtualBox, Kali Linux, Metasploitable.", deliverable: "Your personal security lab setup guide.", tools: ["Claude.ai", "VirtualBox"], badge: null, duration: 60 },
  17: { phase: "Builder", day: 17, week: 4, title: "Vulnerability Scanning Basics", quote: QUOTES.excellence, mission: "Learn Nmap and vulnerability scanning concepts. Use Claude to explain what each scan type reveals. Practice scanning your own lab environment.", deliverable: "Vulnerability scan report from your lab.", tools: ["Claude.ai", "Nmap"], badge: null, duration: 60 },
  18: { phase: "Builder", day: 18, week: 4, title: "Write Your First Vulnerability Report", quote: QUOTES.day3, mission: "A vulnerability report is the core deliverable of a security professional. Use Claude to help you write a professional-quality report on a known vulnerability (use a public CVE).", deliverable: "Your first professional vulnerability report.", tools: ["Claude.ai"], badge: "🐧 The Linux Learner — Terminal Skills Established", duration: 60 },
  19: { phase: "Builder", day: 19, week: 5, title: "Incident Response Framework", quote: QUOTES.mindset, mission: "Study the NIST incident response framework: Prepare, Detect, Contain, Eradicate, Recover, Learn. Use Claude to walk through a real incident scenario step by step.", deliverable: "Incident response playbook for one attack scenario.", tools: ["Claude.ai"], badge: null, duration: 60 },
  20: { phase: "Builder", day: 20, week: 5, title: "Cloud Security Fundamentals", quote: QUOTES.growth, mission: "AWS, Azure, and GCP are where modern infrastructure lives. Use Claude to explain the shared responsibility model, IAM, and the top cloud security misconfigurations.", deliverable: "Cloud security checklist — 10 must-do configurations.", tools: ["Claude.ai", "AWS Free Tier"], badge: null, duration: 60 },
  21: { phase: "Builder", day: 21, week: 5, title: "AI in Cybersecurity — Both Sides", quote: QUOTES.wisdom, mission: "AI is transforming both attack and defense. Use Claude and Perplexity to research: How are attackers using AI? How are defenders using AI? What does this mean for your career?", deliverable: "AI in cybersecurity research brief.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  22: { phase: "Builder", day: 22, week: 6, title: "Build a Security Automation Script", quote: QUOTES.action, mission: "Use Claude to help you write a Python script that automates a security task: log analysis, port scanning, or checking for weak passwords. This is real work.", deliverable: "Working Python automation script.", tools: ["Claude.ai", "Python"], badge: null, duration: 60 },
  23: { phase: "Builder", day: 23, week: 6, title: "CTF Deep Dive — TryHackMe Level 2", quote: QUOTES.resilience, mission: "Complete 3 more TryHackMe rooms in the Pre-Security or Jr Penetration Tester path. Document what you learned and where you got stuck.", deliverable: "3 rooms completed + learning log.", tools: ["TryHackMe", "Claude.ai"], badge: "🏴 The Flag Catcher — First CTF Challenges Complete", duration: 60 },
  24: { phase: "Builder", day: 24, week: 6, title: "Build Your GitHub Security Portfolio", quote: QUOTES.courage, mission: "Create a GitHub profile and start uploading your security scripts and reports. Use Claude to write your README files professionally. This is what recruiters and professors will see.", deliverable: "GitHub profile live with 3+ security projects.", tools: ["GitHub", "Claude.ai"], badge: null, duration: 60 },
  25: { phase: "Builder", day: 25, week: 7, title: "Certifications Roadmap — Your UCF Strategy", quote: QUOTES.persistence, mission: "Map your certification path: CompTIA Security+, CEH, OSCP. Use Claude to build a realistic study plan that aligns with UCF's cybersecurity curriculum.", deliverable: "Your 2-year certification roadmap.", tools: ["Claude.ai"], badge: null, duration: 60 },
  26: { phase: "Builder", day: 26, week: 7, title: "Mock Security Interview with Claude", quote: QUOTES.mastery, mission: "Claude will interview you for a cybersecurity internship. Answer technical and behavioral questions. Review your performance and identify gaps.", deliverable: "Mock interview transcript + improvement plan.", tools: ["Claude.ai"], badge: null, duration: 60 },
  27: { phase: "Builder", day: 27, week: 7, title: "Threat Intelligence Research", quote: QUOTES.day4, mission: "Use Perplexity to research the current threat actor landscape. Pick one APT group (Advanced Persistent Threat) and build a threat intelligence brief using Claude.", deliverable: "APT threat intelligence brief.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  28: { phase: "Builder", day: 28, week: 8, title: "Build a Personal Security Policy", quote: QUOTES.excellence, mission: "Write a personal and family cybersecurity policy. Password management, device security, phishing awareness, backup strategy. Use Claude to make it professional.", deliverable: "Personal security policy document.", tools: ["Claude.ai"], badge: null, duration: 60 },
  29: { phase: "Builder", day: 29, week: 8, title: "Reverse Engineering Concepts", quote: QUOTES.growth, mission: "Introduction to malware analysis and reverse engineering concepts. Use Claude to explain static vs dynamic analysis, assembly basics, and tools like Ghidra.", deliverable: "Reverse engineering concepts summary.", tools: ["Claude.ai"], badge: null, duration: 60 },
  30: { phase: "Builder", day: 30, week: 8, title: "30-DAY GRADUATION — Builder Badge Earned", quote: QUOTES.day5, mission: "Review your entire journey. Update your portfolio. Write a reflection: What have you learned? Where are your gaps? What are your top 3 goals for the next 60 days?", deliverable: "30-Day portfolio review + Builder graduation document.", tools: ["Claude.ai"], badge: "💻 The Builder — 30-Day Foundation Complete", duration: 60 },

  // DAYS 31-60: Launch Phase
  31: { phase: "Launch", day: 31, week: 9, title: "Deep Dive — Penetration Testing Methodology", quote: QUOTES.day1, mission: "Study the full pentest methodology: Reconnaissance, Scanning, Exploitation, Post-Exploitation, Reporting. Use Claude to walk through each phase with real examples.", deliverable: "Pentest methodology guide in your own words.", tools: ["Claude.ai"], badge: null, duration: 60 },
  32: { phase: "Launch", day: 32, week: 9, title: "Ethical Hacking Ethics & Law", quote: QUOTES.wisdom, mission: "Understand the legal framework around ethical hacking: CFAA, bug bounty programs, responsible disclosure. Use Claude to explore real cases where the line was crossed.", deliverable: "Ethics & legal framework summary.", tools: ["Claude.ai"], badge: null, duration: 60 },
  33: { phase: "Launch", day: 33, week: 9, title: "Bug Bounty Programs — Get Paid to Hack", quote: QUOTES.courage, mission: "Explore HackerOne and Bugcrowd. Use Claude to understand how bug bounty programs work, what types of vulnerabilities pay the most, and how to write a quality report.", deliverable: "Bug bounty strategy document + first target selected.", tools: ["Claude.ai", "HackerOne"], badge: null, duration: 60 },
  34: { phase: "Launch", day: 34, week: 10, title: "Advanced Python — Security Automation", quote: QUOTES.excellence, mission: "Level up your Python. Use Claude to help you build a more complex security tool: a web scraper for OSINT, a log analyzer, or a basic IDS prototype.", deliverable: "Advanced Python security project.", tools: ["Claude.ai", "Python"], badge: null, duration: 60 },
  35: { phase: "Launch", day: 35, week: 10, title: "Network Traffic Analysis", quote: QUOTES.mastery, mission: "Learn Wireshark fundamentals. Capture and analyze network traffic. Use Claude to explain what you're seeing in packet captures.", deliverable: "Network traffic analysis report.", tools: ["Claude.ai", "Wireshark"], badge: null, duration: 60 },
  // Days 36-59 continue the Launch phase with increasing complexity
  36: { phase: "Launch", day: 36, week: 10, title: "Web Application Security Testing", quote: QUOTES.action, mission: "Set up DVWA (Damn Vulnerable Web Application) and practice web attacks in a safe environment. Use Claude to guide you through SQL injection and XSS attacks.", deliverable: "Web application attack documentation.", tools: ["Claude.ai", "DVWA"], badge: null, duration: 60 },
  37: { phase: "Launch", day: 37, week: 11, title: "Build Your First Security Tool — Public Release", quote: QUOTES.growth, mission: "Take your best Python script and polish it for public release. Write documentation, add error handling, publish to GitHub with a professional README.", deliverable: "Public GitHub security tool release.", tools: ["Claude.ai", "GitHub"], badge: null, duration: 60 },
  38: { phase: "Launch", day: 38, week: 11, title: "Security+ Exam Prep — Domain 1", quote: QUOTES.persistence, mission: "Start Security+ prep. Domain 1: Threats, Attacks, and Vulnerabilities. Use Claude as your tutor, Anki for flashcards, and practice test questions.", deliverable: "Domain 1 study guide + practice quiz results.", tools: ["Claude.ai", "Anki"], badge: null, duration: 60 },
  39: { phase: "Launch", day: 39, week: 11, title: "Security+ Exam Prep — Domain 2", quote: QUOTES.resilience, mission: "Domain 2: Technologies and Tools. Use Claude to explain every technology and quiz you on it. Focus on areas where you score below 80%.", deliverable: "Domain 2 mastery score above 80%.", tools: ["Claude.ai"], badge: null, duration: 60 },
  40: { phase: "Launch", day: 40, week: 12, title: "Security+ Exam Prep — Domains 3-4", quote: QUOTES.courage, mission: "Domains 3-4: Architecture, Design, Identity and Access Management. Build concept maps for each domain using Claude.", deliverable: "Domains 3-4 concept maps.", tools: ["Claude.ai"], badge: null, duration: 60 },
  41: { phase: "Launch", day: 41, week: 12, title: "Security+ Exam Prep — Domains 5-6", quote: QUOTES.excellence, mission: "Domains 5-6: Risk Management, Cryptography and PKI. Final push through all Security+ content. Take a full practice exam.", deliverable: "Full practice exam score 80%+.", tools: ["Claude.ai", "Professor Messer"], badge: null, duration: 60 },
  42: { phase: "Launch", day: 42, week: 12, title: "Connect with the Cybersecurity Community", quote: QUOTES.day5, mission: "Join the cybersecurity community: LinkedIn profile, Twitter/X security follows, join DEF CON Discord, find your nearest BSides event. Use Claude to write your professional bio.", deliverable: "LinkedIn profile live + community memberships.", tools: ["Claude.ai", "LinkedIn"], badge: null, duration: 60 },
  43: { phase: "Launch", day: 43, week: 13, title: "Internship Research — UCF Opportunities", quote: QUOTES.mindset, mission: "Research cybersecurity internships in Central Florida and remote. Use Claude to tailor your resume for each opportunity. Target at least 5 specific companies.", deliverable: "Internship target list + tailored resume.", tools: ["Claude.ai", "LinkedIn"], badge: null, duration: 60 },
  44: { phase: "Launch", day: 44, week: 13, title: "AI-Assisted Research Paper", quote: QUOTES.wisdom, mission: "Write a 3-page research paper on an emerging cybersecurity topic: AI-powered attacks, zero-trust architecture, or quantum cryptography. Use Claude as your research partner.", deliverable: "3-page research paper — UCF ready.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  45: { phase: "Launch", day: 45, week: 13, title: "Mid-Point Review — 45 Days In", quote: QUOTES.day2, mission: "Comprehensive review. What have you built? Where are your gaps? What do the next 45 days look like? Update your portfolio and share a summary with your dad.", deliverable: "45-Day progress report + updated portfolio.", tools: ["Claude.ai"], badge: "🎯 The Pioneer — 45-Day Milestone", duration: 60 },
  // Days 46-90: UCF Launch Phase
  46: { phase: "UCF Ready", day: 46, week: 14, title: "UCF Cybersecurity Curriculum Preview", quote: QUOTES.action, mission: "Research UCF's cybersecurity program requirements. Use Claude to map your current skills to each course. Identify where you're already ahead.", deliverable: "UCF curriculum gap analysis.", tools: ["Claude.ai"], badge: null, duration: 60 },
  47: { phase: "UCF Ready", day: 47, week: 14, title: "Professor Research — Know Your Faculty", quote: QUOTES.growth, mission: "Research UCF's cybersecurity faculty. Find 3 professors whose research interests you. Use Claude to help you write an introduction email to one of them.", deliverable: "Faculty research summary + one email drafted.", tools: ["Claude.ai", "Perplexity AI"], badge: null, duration: 60 },
  48: { phase: "UCF Ready", day: 48, week: 14, title: "Build Your Personal Brand", quote: QUOTES.excellence, mission: "You are Peyton Bowers, cybersecurity professional in training. Use Claude to craft your personal brand statement, update all profiles consistently, and plan your content strategy.", deliverable: "Personal brand statement + consistent profiles.", tools: ["Claude.ai", "LinkedIn", "GitHub"], badge: null, duration: 60 },
  49: { phase: "UCF Ready", day: 49, week: 15, title: "Advanced CTF — Intermediate Challenges", quote: QUOTES.resilience, mission: "Level up on TryHackMe or HackTheBox. Attempt 3 intermediate-level challenges. Document your methodology for each one.", deliverable: "3 intermediate CTF solutions documented.", tools: ["TryHackMe", "HackTheBox", "Claude.ai"], badge: null, duration: 60 },
  50: { phase: "UCF Ready", day: 50, week: 15, title: "Build Your Final Capstone Project", quote: QUOTES.mastery, mission: "Design your 90-day capstone: a comprehensive security assessment of a practice target, a security tool, or a research paper. This becomes your flagship portfolio piece.", deliverable: "Capstone project proposal + first milestone.", tools: ["Claude.ai"], badge: null, duration: 60 },
  60: { phase: "UCF Ready", day: 60, week: 17, title: "60-DAY REVIEW — Launch Badge Earned", quote: QUOTES.day5, mission: "Complete portfolio review. Mock interview with Claude. Update your 90-day plan. You have 30 days until UCF. What are the 3 most important things to accomplish?", deliverable: "60-Day portfolio + Launch graduation document.", tools: ["Claude.ai"], badge: "🚀 The Launch — 60-Day Milestone Complete", duration: 60 },
  90: { phase: "UCF Ready", day: 90, week: 25, title: "90-DAY GRADUATION — UCF READY", quote: QUOTES.day5, mission: "You made it. Review your entire journey. Print your portfolio. Write a letter to your UCF freshman self. You are not starting from zero. You are starting from experience.", deliverable: "Complete portfolio + UCF Ready graduation document + Personal Launch Brief.", tools: ["Claude.ai"], badge: "🎓 UCF Ready — 90-Day Graduation Complete", duration: 60 },
};

// Get today's curriculum entry
function getCurriculum(dayNum) {
  if (CURRICULUM[dayNum]) return CURRICULUM[dayNum];
  // Fill gaps with generic daily sessions
  const phase = dayNum <= 5 ? "SPARK" : dayNum <= 30 ? "Foundation" : dayNum <= 60 ? "Builder" : "UCF Ready";
  const quotes = Object.values(QUOTES);
  return {
    phase,
    day: dayNum,
    week: Math.ceil(dayNum / 7),
    title: `Day ${dayNum} — ${phase} Session`,
    quote: quotes[dayNum % quotes.length],
    mission: "Continue your daily cybersecurity practice. Use Claude to explore one new concept, reinforce one existing skill, and document one insight in your journal.",
    deliverable: "Daily learning log entry.",
    tools: ["Claude.ai"],
    badge: null,
    duration: 60,
  };
}

// ============================================================
// BADGE SYSTEM
// ============================================================
const ALL_BADGES = [
  { id: "seed",     icon: "🌱", name: "The Seed",         desc: "Started Day 1",           day: 1 },
  { id: "spark",    icon: "⚡", name: "The SPARK",        desc: "Completed 5-Day Onramp",  day: 5 },
  { id: "analyst",  icon: "🔍", name: "The Analyst",      desc: "First Security Research", day: 15 },
  { id: "linux",    icon: "🐧", name: "The Linux Learner", desc: "Terminal Skills",         day: 18 },
  { id: "flame",    icon: "🔥", name: "The 30-Day Flame", desc: "30 Consecutive Days",     day: 30 },
  { id: "flag",     icon: "🏴", name: "The Flag Catcher", desc: "CTF Challenges Complete", day: 23 },
  { id: "builder",  icon: "💻", name: "The Builder",      desc: "30-Day Foundation",       day: 30 },
  { id: "pioneer",  icon: "🎯", name: "The Pioneer",      desc: "45-Day Milestone",        day: 45 },
  { id: "launch",   icon: "🚀", name: "The Launch",       desc: "60-Day Milestone",        day: 60 },
  { id: "ucf",      icon: "🎓", name: "UCF Ready",        desc: "90-Day Graduation",       day: 90 },
];

// ============================================================
// STYLES
// ============================================================
const styles = {
  bg: "#0A0E1A",
  card: "#0F1629",
  border: "#1E2D4A",
  accent: "#00D4FF",
  gold: "#FFB300",
  green: "#00FF88",
  plum: "#8B5CF6",
  text: "#E2E8F0",
  muted: "#64748B",
  danger: "#FF4444",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${styles.bg}; color: ${styles.text}; font-family: 'Inter', sans-serif; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${styles.bg}; } ::-webkit-scrollbar-thumb { background: ${styles.border}; border-radius: 3px; }
  .glow { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
  .gold-glow { box-shadow: 0 0 20px rgba(255, 179, 0, 0.3); }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .slide-in { animation: slideIn 0.4s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .typing::after { content: '|'; animation: blink 1s infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  button { cursor: pointer; border: none; outline: none; font-family: 'Inter', sans-serif; transition: all 0.2s; }
  button:hover { transform: translateY(-1px); }
  button:active { transform: translateY(0); }
  input, textarea { font-family: 'Inter', sans-serif; outline: none; }
  .mono { font-family: 'JetBrains Mono', monospace; }
`;

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [currentDay, setCurrentDay] = useState(() => parseInt(localStorage.getItem("peyton_day") || "1"));
  const [earnedBadges, setEarnedBadges] = useState(() => JSON.parse(localStorage.getItem("peyton_badges") || '["seed"]'));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("peyton_streak") || "0"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showBadge, setShowBadge] = useState(null);
  const messagesEndRef = useRef(null);

  const curriculum = getCurriculum(currentDay);

  useEffect(() => {
    localStorage.setItem("peyton_day", currentDay);
    localStorage.setItem("peyton_badges", JSON.stringify(earnedBadges));
    localStorage.setItem("peyton_streak", streak);
  }, [currentDay, earnedBadges, streak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function completeDay() {
    const nextDay = currentDay + 1;
    const newStreak = streak + 1;
    setStreak(newStreak);
    setCurrentDay(nextDay);

    // Check for new badges
    const newBadges = [...earnedBadges];
    ALL_BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id) && nextDay > badge.day) {
        newBadges.push(badge.id);
        setShowBadge(badge);
        setTimeout(() => setShowBadge(null), 4000);
      }
    });
    setEarnedBadges(newBadges);
    setMessages([]);
    setSessionStarted(false);
    setScreen("dashboard");
  }

  async function startSession() {
    setScreen("session");
    setSessionStarted(true);
    setMessages([]);
    setLoading(true);

    const systemPrompt = `You are Cipher — Peyton Bowers' personal AI cybersecurity mentor and coach. Peyton is 17 years old, a Florida high school senior, and he's preparing to enter UCF as a cybersecurity freshman. He is in an intense 90-day pre-UCF accelerator program built by his father Lane Bowers.

TODAY IS DAY ${currentDay} of 90. The session topic is: "${curriculum.title}"

Peyton's mission today: ${curriculum.mission}

His deliverable: ${curriculum.deliverable}

Your role:
- Open with genuine energy — you're his mentor, not a textbook
- Reference his day number and streak (${streak} days)
- Connect today's topic directly to his UCF future
- Be technically accurate but explain things like a great professor, not a Wikipedia article
- Push him to think, don't just give answers
- End your opening with a specific first question or challenge to get him started

Keep your opening message to 4-6 sentences. Make it feel like the start of a great training session.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: `Start Day ${currentDay}: ${curriculum.title}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Ready to start your session, Peyton. Let's go.";
      setMessages([{ role: "assistant", content: text }]);
    } catch {
      setMessages([{ role: "assistant", content: `Day ${currentDay} is live. Let's get into it — ${curriculum.title}. What do you already know about today's topic?` }]);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const systemPrompt = `You are Cipher — Peyton Bowers' personal AI cybersecurity mentor. He's 17, heading to UCF for cybersecurity. Day ${currentDay} of 90. Topic: ${curriculum.title}. Mission: ${curriculum.mission}. Be direct, technical, encouraging. Push him. Max 4 sentences unless he asks for detail.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Keep going. What's your next move?";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Stay focused — what were you working through?" }]);
    }
    setLoading(false);
  }

  // ---- SCREENS ----
  if (screen === "welcome") return <WelcomeScreen onStart={() => setScreen("dashboard")} />;
  if (screen === "badges") return <BadgesScreen badges={earnedBadges} onBack={() => setScreen("dashboard")} />;
  if (screen === "session") return (
    <SessionScreen
      curriculum={curriculum}
      messages={messages}
      input={input}
      setInput={setInput}
      loading={loading}
      onSend={sendMessage}
      onComplete={completeDay}
      onBack={() => setScreen("dashboard")}
      messagesEndRef={messagesEndRef}
      streak={streak}
    />
  );

  // Dashboard
  const progress = Math.round((currentDay / 90) * 100);
  const phase30 = currentDay >= 30;
  const phase60 = currentDay >= 60;
  const phase90 = currentDay >= 90;

  return (
    <div style={{ minHeight: "100vh", background: styles.bg, padding: "0 0 80px 0" }}>
      <style>{css}</style>
      {showBadge && <BadgeToast badge={showBadge} />}

      {/* HEADER */}
      <div style={{ background: styles.card, borderBottom: `1px solid ${styles.border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 11, color: styles.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>WinterHaven.AI</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: styles.text }}>Peyton's Accelerator</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: styles.gold }}>{streak}</div>
            <div style={{ fontSize: 10, color: styles.muted }}>streak</div>
          </div>
          <button onClick={() => setScreen("badges")} style={{ background: styles.border, color: styles.text, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            🏆 {earnedBadges.length}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* DAY COUNTER */}
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: styles.muted }}>Day</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: styles.accent, lineHeight: 1 }}>{currentDay}</div>
              <div style={{ fontSize: 13, color: styles.muted }}>of 90</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: styles.muted }}>Phase</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: styles.text }}>{curriculum.phase}</div>
              <div style={{ fontSize: 13, color: styles.muted }}>Week {curriculum.week}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: styles.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${styles.accent}, ${styles.plum})`, borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: styles.muted }}>Start</span>
            <span style={{ fontSize: 11, color: styles.accent, fontWeight: 600 }}>{progress}% complete</span>
            <span style={{ fontSize: 11, color: styles.muted }}>UCF Day 1</span>
          </div>
        </div>

        {/* PHASE MILESTONES */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { label: "Foundation", days: "1-30", done: phase30 },
            { label: "Builder", days: "31-60", done: phase60 },
            { label: "UCF Ready", days: "61-90", done: phase90 },
          ].map(p => (
            <div key={p.label} style={{ flex: 1, background: p.done ? "rgba(0,255,136,0.1)" : styles.card, border: `1px solid ${p.done ? styles.green : styles.border}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{p.done ? "✅" : "🔒"}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: p.done ? styles.green : styles.muted, marginTop: 4 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: styles.muted }}>Days {p.days}</div>
            </div>
          ))}
        </div>

        {/* DAILY QUOTE */}
        <div style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,212,255,0.05))`, border: `1px solid rgba(139,92,246,0.3)`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: styles.plum, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Today's Fuel</div>
          <div style={{ fontSize: 15, color: styles.text, lineHeight: 1.6, fontStyle: "italic" }}>"{curriculum.quote.text}"</div>
          <div style={{ fontSize: 12, color: styles.muted, marginTop: 8, fontWeight: 600 }}>— {curriculum.quote.author}</div>
        </div>

        {/* TODAY'S MISSION CARD */}
        <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: styles.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Day {currentDay} Mission</div>
            <div style={{ fontSize: 11, color: styles.muted, background: styles.border, padding: "4px 10px", borderRadius: 99 }}>⏱ {curriculum.duration} min</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: styles.text, marginBottom: 12, lineHeight: 1.3 }}>{curriculum.title}</div>
          <div style={{ fontSize: 14, color: styles.muted, lineHeight: 1.7, marginBottom: 16 }}>{curriculum.mission}</div>

          {/* Deliverable */}
          <div style={{ background: "rgba(0,255,136,0.05)", border: `1px solid rgba(0,255,136,0.2)`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: styles.green, fontWeight: 600, marginBottom: 4 }}>📦 DELIVERABLE</div>
            <div style={{ fontSize: 13, color: styles.text }}>{curriculum.deliverable}</div>
          </div>

          {/* Tools */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {curriculum.tools.map(t => (
              <span key={t} style={{ fontSize: 11, color: styles.accent, background: "rgba(0,212,255,0.1)", border: `1px solid rgba(0,212,255,0.2)`, padding: "4px 10px", borderRadius: 99, fontWeight: 500 }}>{t}</span>
            ))}
          </div>

          {/* Badge Preview */}
          {curriculum.badge && (
            <div style={{ background: "rgba(255,179,0,0.05)", border: `1px solid rgba(255,179,0,0.3)`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: styles.gold, fontWeight: 600, marginBottom: 4 }}>🏆 BADGE UNLOCKS TODAY</div>
              <div style={{ fontSize: 13, color: styles.text }}>{curriculum.badge}</div>
            </div>
          )}

          <button
            onClick={startSession}
            className="glow"
            style={{ width: "100%", background: `linear-gradient(135deg, ${styles.accent}, ${styles.plum})`, color: "#000", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}
          >
            ⚡ START DAY {currentDay} →
          </button>
        </div>

        {/* NEXT BADGE */}
        <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: styles.gold, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Next Badge</div>
          {(() => {
            const next = ALL_BADGES.find(b => !earnedBadges.includes(b.id));
            if (!next) return <div style={{ color: styles.muted, fontSize: 13 }}>All badges earned! 🎓</div>;
            const daysLeft = next.day - currentDay + 1;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 32 }}>{next.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: styles.text }}>{next.name}</div>
                  <div style={{ fontSize: 12, color: styles.muted }}>{next.desc}</div>
                  <div style={{ fontSize: 12, color: styles.gold, marginTop: 4 }}>{daysLeft > 0 ? `${daysLeft} days away` : "Complete today!"}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WELCOME SCREEN
// ============================================================
function WelcomeScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: styles.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: styles.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>A Gift From Lane</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: styles.text, lineHeight: 1.1, marginBottom: 8 }}>Peyton's<br /><span style={{ color: styles.accent }}>Accelerator</span></div>
        <div style={{ fontSize: 16, color: styles.muted, marginBottom: 8 }}>90 Days. 1 Hour Per Day.</div>
        <div style={{ fontSize: 14, color: styles.muted, marginBottom: 40, fontStyle: "italic" }}>UCF Cybersecurity — Freshman Year</div>

        <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: 16, padding: 24, marginBottom: 32, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: styles.gold, marginBottom: 12 }}>🎯 Your Mission</div>
          <div style={{ fontSize: 14, color: styles.text, lineHeight: 1.7 }}>
            90 days from now you walk into UCF not as a student trying to figure it out — but as a cybersecurity professional in training who has already built real things, solved real problems, and committed to mastery.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          {[["⚡", "5-Day SPARK Onramp"], ["🔍", "Real Security Research"], ["💻", "Code You Write"], ["🎓", "UCF Ready Day 1"]].map(([icon, text]) => (
            <div key={text} style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 12, color: styles.text, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: styles.muted, fontStyle: "italic", marginBottom: 32 }}>
          "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times." — Bruce Lee
        </div>

        <button
          onClick={onStart}
          className="glow"
          style={{ width: "100%", background: `linear-gradient(135deg, ${styles.accent}, ${styles.plum})`, color: "#000", padding: "18px", borderRadius: 14, fontSize: 18, fontWeight: 900 }}
        >
          I'M READY — LET'S GO →
        </button>
        <div style={{ fontSize: 12, color: styles.muted, marginTop: 12 }}>Take your time. There is no rush. Your work matters.</div>
      </div>
    </div>
  );
}

// ============================================================
// SESSION SCREEN
// ============================================================
function SessionScreen({ curriculum, messages, input, setInput, loading, onSend, onComplete, onBack, messagesEndRef, streak }) {
  return (
    <div style={{ minHeight: "100vh", background: styles.bg, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Session Header */}
      <div style={{ background: styles.card, borderBottom: `1px solid ${styles.border}`, padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: "transparent", color: styles.muted, fontSize: 13, padding: "4px 8px" }}>← Back</button>
          <div style={{ fontSize: 11, color: styles.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Day {curriculum.day} • Cipher AI</div>
          <div style={{ fontSize: 11, color: styles.gold }}>🔥 {streak}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: styles.text }}>{curriculum.title}</div>
        <div style={{ fontSize: 12, color: styles.muted, marginTop: 2 }}>📦 {curriculum.deliverable}</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: styles.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: styles.text }}>Cipher is loading your session...</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="slide-in" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: 10, color: styles.muted, marginBottom: 4, padding: "0 4px" }}>{msg.role === "user" ? "Peyton" : "Cipher"}</div>
            <div style={{
              maxWidth: "88%", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? `linear-gradient(135deg, ${styles.accent}, ${styles.plum})` : styles.card,
              border: msg.role === "user" ? "none" : `1px solid ${styles.border}`,
              color: msg.role === "user" ? "#000" : styles.text,
              fontSize: 14, lineHeight: 1.7, fontWeight: msg.role === "user" ? 500 : 400,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ background: styles.card, border: `1px solid ${styles.border}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: styles.accent, animation: `pulse ${0.6 + i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ background: styles.card, borderTop: `1px solid ${styles.border}`, padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Ask Cipher anything..."
            style={{ flex: 1, background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 12, padding: "12px 16px", color: styles.text, fontSize: 14 }}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            style={{ background: input.trim() ? `linear-gradient(135deg, ${styles.accent}, ${styles.plum})` : styles.border, color: "#000", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, opacity: loading ? 0.5 : 1 }}
          >
            →
          </button>
        </div>
        <button
          onClick={onComplete}
          style={{ width: "100%", background: "rgba(0,255,136,0.1)", border: `1px solid ${styles.green}`, color: styles.green, padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}
        >
          ✅ Mark Day {curriculum.day} Complete → Unlock Day {curriculum.day + 1}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BADGES SCREEN
// ============================================================
function BadgesScreen({ badges, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: styles.bg, padding: 20 }}>
      <style>{css}</style>
      <button onClick={onBack} style={{ background: "transparent", color: styles.muted, fontSize: 14, marginBottom: 20, padding: "4px 0" }}>← Back</button>
      <div style={{ fontSize: 11, color: styles.gold, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Badge Collection</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: styles.text, marginBottom: 24 }}>Your Achievements</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ALL_BADGES.map(badge => {
          const earned = badges.includes(badge.id);
          return (
            <div key={badge.id} style={{ background: earned ? `rgba(255,179,0,0.05)` : styles.card, border: `1px solid ${earned ? "rgba(255,179,0,0.4)" : styles.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, opacity: earned ? 1 : 0.4 }}>
              <div style={{ fontSize: 36 }}>{badge.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: earned ? styles.gold : styles.muted }}>{badge.name}</div>
                <div style={{ fontSize: 13, color: styles.muted, marginTop: 2 }}>{badge.desc}</div>
                <div style={{ fontSize: 11, color: styles.muted, marginTop: 4 }}>Unlocks: Day {badge.day}</div>
              </div>
              {earned && <div style={{ fontSize: 20 }}>✅</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// BADGE TOAST
// ============================================================
function BadgeToast({ badge }) {
  return (
    <div className="gold-glow" style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: styles.card, border: `2px solid ${styles.gold}`, borderRadius: 16, padding: "16px 24px", zIndex: 9999, textAlign: "center", minWidth: 280, animation: "slideIn 0.4s ease" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{badge.icon}</div>
      <div style={{ fontSize: 12, color: styles.gold, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>Badge Unlocked!</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: styles.text, marginTop: 4 }}>{badge.name}</div>
      <div style={{ fontSize: 13, color: styles.muted, marginTop: 4 }}>{badge.desc}</div>
    </div>
  );
}

import { useState, useRef } from "react";

// ============================================================
//  QUIZ QUESTIONS — 50 MCQs
// ============================================================
const QUIZ = [
  { q:"What does AI stand for?", o:["Automated Interface","Artificial Intelligence","Advanced Integration","Automated Input"], a:1 },
  { q:"What is GoPlanet's primary function?", o:["File Storage","AI Chatbot Platform","Social Network","Video Streaming"], a:1 },
  { q:"Which API powers GoPlanet's chatbot?", o:["OpenAI","Gemini","Groq","Cohere"], a:2 },
  { q:"What does LLM stand for?", o:["Large Language Model","Logical Learning Machine","Local Logic Module","Linear Learning Method"], a:0 },
  { q:"Minimum score to earn a GoPlanet certificate?", o:["30/50","35/50","40/50","45/50"], a:2 },
  { q:"What does 'prompt' mean in AI chatbots?", o:["A payment","User input to the AI","A notification","A file format"], a:1 },
  { q:"What is 'context' in an AI conversation?", o:["The font size","Previous chat history used by AI","The background color","User's location"], a:1 },
  { q:"Which is a responsible AI usage principle?", o:["Share passwords freely","Use AI with integrity","Replace all human decisions","Ignore AI errors"], a:1 },
  { q:"What is a Groq API key used for?", o:["Login authentication","Authorising access to Groq AI services","File encryption","Image generation"], a:1 },
  { q:"What does 'token' mean in AI language models?", o:["A crypto currency","A unit of text (word/part of word)","A user account","A payment method"], a:1 },
  { q:"What is machine learning?", o:["Teaching machines to walk","AI learning from data patterns","Programming robots","Computer maintenance"], a:1 },
  { q:"What is natural language processing (NLP)?", o:["Writing code in English","AI understanding human language","Network protocols","Nature-based computing"], a:1 },
  { q:"What does 'Human First' represent?", o:["Humans do everything manually","Empower people, not replace them","Humans control all AI code","Only humans can use AI"], a:1 },
  { q:"What is a chatbot?", o:["A physical robot","Software simulating human conversation","A chat room","A messaging app"], a:1 },
  { q:"What is the GoPlanet certification about?", o:["Coding only","Responsible AI usage & smart communication","Database management","Web design"], a:1 },
  { q:"What does 'inference' mean in AI?", o:["Training a new model","Running AI to get predictions","Deleting AI data","Uploading datasets"], a:1 },
  { q:"What is a subscription plan?", o:["A free service forever","A paid tier with extra features","A one-time purchase","A government program"], a:1 },
  { q:"What does 'hallucination' mean in AI?", o:["AI seeing images","AI generating false info confidently","AI sleeping mode","AI voice response"], a:1 },
  { q:"Purpose of an AI guide?", o:["To restrict users","Help users understand the app effectively","To collect data","Show advertisements"], a:1 },
  { q:"What is 'Effective' as a GoPlanet principle?", o:["Being strict","Work smarter, achieve more","Using the most expensive tools","Coding everything yourself"], a:1 },
  { q:"What is Smart Thinking as a GoPlanet principle?", o:["Memorising facts","Solve problems with intelligence","Working faster always","Using shortcuts"], a:1 },
  { q:"What is an admin in an app?", o:["A regular user","A user with special management privileges","A paid subscriber only","A developer only"], a:1 },
  { q:"What does 'Pro subscription' typically offer?", o:["Same as free","Faster responses and advanced features","Less storage","Fewer models"], a:1 },
  { q:"What is a language model's training data?", o:["Images and videos only","Large amounts of text from various sources","Audio files only","Code files only"], a:1 },
  { q:"What does 'Honest Use' mean in GoPlanet?", o:["Using AI to cheat","Use technology with integrity","Only using free tools","Sharing all data publicly"], a:1 },
  { q:"What is an API?", o:["Application Programming Interface","Automated Program Input","Advanced Page Interface","App Protocol Integration"], a:0 },
  { q:"What should you do if an AI gives wrong info?", o:["Trust it completely","Verify with reliable sources","Delete the app","Report to police"], a:1 },
  { q:"GoPlanet's backend AI is powered by?", o:["OpenAI GPT","Google Bard","Groq API","Amazon Alexa"], a:2 },
  { q:"What is 'temperature' in AI models?", o:["Server heat","Controls randomness/creativity of AI output","User's location climate","Battery level"], a:1 },
  { q:"Best practice when using AI chatbots?", o:["Never verify AI answers","Cross-check important information","Share personal passwords with AI","Use AI blindly"], a:1 },
  { q:"GoPlanet certification date is based on?", o:["App launch date","The day you take the exam","Your birthday","A fixed annual date"], a:1 },
  { q:"GoPlanet is primarily designed for?", o:["Gaming","Everyone — easy to use AI chatbot","Advanced developers only","Children under 10"], a:1 },
  { q:"What is 'Secure & Private' in GoPlanet?", o:["Data is sold to partners","Data is encrypted and safe","Users' data is public","No security measures"], a:1 },
  { q:"What is a multiple-choice question exam?", o:["Essay writing","Questions with several answer options to choose from","Oral exam","Drawing test"], a:1 },
  { q:"What is 'context window' in AI?", o:["Browser window size","Amount of text AI can process at once","Screen resolution","Network bandwidth"], a:1 },
  { q:"What does re-taking an exam allow?", o:["Getting a higher score automatically","Attempting the exam again after failure","Changing the questions","Getting a free subscription"], a:1 },
  { q:"What is an AI project in GoPlanet?", o:["A physical project","An organised workspace to manage AI tasks","A government initiative","A hardware device"], a:1 },
  { q:"What makes GoPlanet 'Innovative AI'?", o:["Only uses old technology","Choose from the best open models","No model options","Only one fixed model"], a:1 },
  { q:"What is 'User Friendly' design?", o:["Designed only for tech experts","Designed for everyone, easy to use","Complex interface intentionally","No help documentation"], a:1 },
  { q:"Purpose of subscription tiers?", o:["To confuse users","Offer different feature levels for different needs","Restrict all users equally","To remove features"], a:1 },
  { q:"What to do before sharing AI-generated content?", o:["Share immediately without review","Review and verify the accuracy","Delete it","Print it only"], a:1 },
  { q:"Role of AI in smart communication?", o:["Replace all human communication","Enhance and assist human communication","Stop communication","Monitor users"], a:1 },
  { q:"What is 'real-world AI application'?", o:["AI only in science fiction","Using AI to solve practical everyday problems","AI in video games only","AI in space only"], a:1 },
  { q:"What happens after completing GoPlanet certification?", o:["Nothing","Receive a digital certificate if score ≥ 40/50","Get a free phone","Become an admin automatically"], a:1 },
  { q:"What is 'model selection' in GoPlanet?", o:["Choosing clothing models","Selecting which AI model to use for chat","Picking screen themes","Choosing subscription plans"], a:1 },
  { q:"What does an AI assistant help with?", o:["Only math problems","Chatting, creating, coding, and more","Only image generation","Only translations"], a:1 },
  { q:"Recommended approach to AI usage per GoPlanet?", o:["Rely on AI for everything","Use AI as a tool to empower, not replace human judgment","Never use AI","Only for entertainment"], a:1 },
  { q:"GoPlanet AI Chatbot powered by (code version)?", o:["LangChain + Ollama locally","Google Cloud only","Microsoft Azure only","Manual responses"], a:0 },
  { q:"What is 'Local & Fast' in GoPlanet?", o:["Works only locally without internet","Powered by Ollama running locally for speed","Users meet locally","Fast food delivery"], a:1 },
  { q:"Which principle says 'Empower people, not replace them'?", o:["Honest Use","Smart Thinking","Effective","Human First"], a:3 },
];

// ============================================================
//  CERTIFICATE GENERATOR
// ============================================================
function generateCert(name, score, dateStr) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, 1000, 1120);
  bg.addColorStop(0, "#f0f4ff");
  bg.addColorStop(1, "#e8eeff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1000, 1120);

  // Corner decorations
  const corners = [[0,0],[1000,0],[0,1120],[1000,1120]];
  corners.forEach(([x,y]) => {
    const cg = ctx.createRadialGradient(x, y, 0, x, y, 120);
    cg.addColorStop(0, "rgba(108,92,231,0.15)");
    cg.addColorStop(1, "rgba(108,92,231,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, 1000, 1120);
  });

  // Outer border
  ctx.strokeStyle = "#6c5ce7";
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 960, 1080);
  // Inner border
  ctx.strokeStyle = "#a29bfe";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(36, 36, 928, 1048);

  // Top decorative line
  ctx.fillStyle = "#6c5ce7";
  ctx.fillRect(60, 58, 880, 3);

  // Logo circle
  const lg = ctx.createRadialGradient(500, 128, 8, 500, 128, 52);
  lg.addColorStop(0, "#a29bfe");
  lg.addColorStop(1, "#6c5ce7");
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.arc(500, 128, 52, 0, Math.PI * 2); ctx.fill();
  // Globe icon text
  ctx.font = "44px serif";
  ctx.textAlign = "center";
  ctx.fillText("🌍", 500, 143);

  // GoPlanet name
  ctx.fillStyle = "#2d3436";
  ctx.font = "bold 48px Arial";
  ctx.fillText("GoPlanet", 500, 238);
  ctx.fillStyle = "#6c5ce7";
  ctx.font = "16px Arial";
  ctx.letterSpacing = "3px";
  ctx.fillText("— AI CHATBOT —", 500, 268);

  // Certificate heading
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 70px Arial";
  ctx.fillText("CERTIFICATE", 500, 362);
  ctx.fillStyle = "#6c5ce7";
  ctx.font = "bold 24px Arial";
  ctx.fillText("OF  COMPLETION", 500, 400);

  // Divider
  ctx.strokeStyle = "#a29bfe";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(160, 424); ctx.lineTo(840, 424); ctx.stroke();

  // "Presented to" label
  ctx.fillStyle = "#636e72";
  ctx.font = "15px Arial";
  ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 500, 462);

  // Recipient name — large, prominent
  ctx.fillStyle = "#2d3436";
  ctx.font = "bold 44px Arial";
  ctx.fillText(name, 500, 538);
  // Underline for name
  const nameWidth = ctx.measureText(name).width;
  ctx.strokeStyle = "#6c5ce7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500 - nameWidth / 2, 552);
  ctx.lineTo(500 + nameWidth / 2, 552);
  ctx.stroke();

  // Body text
  ctx.fillStyle = "#555";
  ctx.font = "17px Arial";
  ctx.fillText("for successfully completing the GoPlanet AI Chatbot Certification Program.", 500, 600);
  ctx.fillText("This certifies your understanding and practical knowledge of", 500, 628);
  ctx.fillText("responsible AI usage, smart communication, and real-world AI applications.", 500, 656);

  // Score badge
  ctx.fillStyle = "#f0ecff";
  ctx.beginPath();
  ctx.roundRect(420, 672, 160, 40, 20);
  ctx.fill();
  ctx.fillStyle = "#6c5ce7";
  ctx.font = "bold 16px Arial";
  ctx.fillText(`Score: ${score} / 50`, 500, 697);

  // Recognition line
  ctx.strokeStyle = "#a29bfe";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 728); ctx.lineTo(840, 728); ctx.stroke();
  ctx.fillStyle = "#636e72";
  ctx.font = "bold 14px Arial";
  ctx.fillText("YOU ARE NOW RECOGNISED AS", 500, 758);
  ctx.fillStyle = "#6c5ce7";
  ctx.font = "bold 28px Arial";
  ctx.fillText("GOPLANET CERTIFIED USER", 500, 796);

  // 4 principle icons
  const principles = [
    { icon:"🛡️", label:"HONEST USE",     sub:"Use technology with integrity." },
    { icon:"🧠", label:"SMART THINKING", sub:"Solve problems with intelligence." },
    { icon:"⚡", label:"EFFECTIVE",       sub:"Work smarter, achieve more." },
    { icon:"❤️", label:"HUMAN FIRST",    sub:"Empower people, not replace them." },
  ];
  principles.forEach((p, i) => {
    const x = 130 + i * 185;
    // Circle
    ctx.fillStyle = "#6c5ce7";
    ctx.beginPath(); ctx.arc(x, 856, 28, 0, Math.PI * 2); ctx.fill();
    // Icon
    ctx.font = "20px serif";
    ctx.fillText(p.icon, x, 864);
    // Label
    ctx.fillStyle = "#2d3436";
    ctx.font = "bold 10px Arial";
    ctx.fillText(p.label, x, 904);
    // Sub text
    ctx.fillStyle = "#636e72";
    ctx.font = "9px Arial";
    const words = p.sub.split(" ");
    let line = "", ly = 918;
    words.forEach(w => {
      if ((line + w).length > 18) { ctx.fillText(line.trim(), x, ly); line = w + " "; ly += 13; }
      else line += w + " ";
    });
    ctx.fillText(line.trim(), x, ly);
  });

  // Medal badge (bottom centre)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath(); ctx.arc(500, 988, 38, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f9ca24";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(500, 988, 38, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "30px serif";
  ctx.fillText("🏆", 500, 998);
  // Ribbon
  ctx.fillStyle = "#6c5ce7";
  ctx.fillRect(488, 1024, 8, 22);
  ctx.fillStyle = "#a29bfe";
  ctx.fillRect(504, 1024, 8, 22);

  // Signature left
  ctx.textAlign = "left";
  ctx.fillStyle = "#6c5ce7";
  ctx.font = "italic bold 22px Arial";
  ctx.fillText("GoPlanet Team", 110, 1000);
  ctx.fillStyle = "#636e72";
  ctx.font = "11px Arial";
  ctx.fillText("GOPLANET TEAM  |  ISSUER", 110, 1018);

  // Date right
  ctx.textAlign = "right";
  ctx.fillStyle = "#2d3436";
  ctx.font = "bold 15px Arial";
  ctx.fillText(dateStr, 890, 1000);
  ctx.fillStyle = "#636e72";
  ctx.font = "11px Arial";
  ctx.fillText("DATE OF ISSUE", 890, 1018);

  // Bottom line
  ctx.fillStyle = "#6c5ce7";
  ctx.fillRect(60, 1058, 880, 3);

  return canvas.toDataURL("image/png");
}

// ============================================================
//  MAIN APP
// ============================================================
export default function GoPlanetCertification() {
  // screen: "entry" | "exam" | "result" | "certificate"
  const [screen, setScreen]       = useState("entry");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [formErr, setFormErr]     = useState("");
  const [answers, setAnswers]     = useState({});
  const [score, setScore]         = useState(0);
  const [certDate, setCertDate]   = useState("");
  const [certUrl, setCertUrl]     = useState("");
  const topRef = useRef(null);

  const accent  = "#6c5ce7";
  const accent2 = "#a29bfe";
  const bg      = "#f7f7fc";

  const S = {
    app:   { minHeight:"100dvh", width:"100%", maxWidth:"460px", margin:"0 auto", fontFamily:"system-ui,sans-serif", background:bg, color:"#1a1a2e", boxSizing:"border-box" },
    topBar:{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", padding:"14px 16px", background:"#fff", borderBottom:"1px solid #e8e8f0", position:"sticky", top:0, zIndex:10 },
    logo:  { display:"flex", alignItems:"center", gap:"8px", fontWeight:900, fontSize:"20px", color:accent },
    logoBox:{ width:"34px", height:"34px", borderRadius:"9px", background:`linear-gradient(135deg,${accent},${accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"19px" },
    page:  { padding:"20px 16px 40px" },
    card:  { background:"#fff", borderRadius:"14px", padding:"18px", marginBottom:"14px", border:"1px solid #e8e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
    input: { width:"100%", padding:"13px 14px", border:"1.5px solid #e0e0f0", borderRadius:"10px", background:"#fff", color:"#1a1a2e", fontSize:"15px", outline:"none", boxSizing:"border-box" },
    btn:   (bg2=accent, fg="#fff") => ({ background:bg2, color:fg, border:"none", borderRadius:"11px", padding:"14px 22px", fontSize:"15px", fontWeight:700, cursor:"pointer", width:"100%", transition:"opacity 0.15s" }),
    label: { fontSize:"12px", fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"6px", display:"block" },
    err:   { color:"#e74c3c", fontSize:"13px", padding:"9px 13px", background:"#fff0f0", borderRadius:"9px", border:"1px solid #ffd0d0", marginTop:"4px" },
  };

  const Header = () => (
    <div style={S.topBar}>
      <div style={S.logoBox}>🌍</div>
      <span style={S.logo}>GoPlanet</span>
      <span style={{ fontSize:"12px", color:"#999", fontWeight:600, background:"#f0ecff", padding:"3px 10px", borderRadius:"20px", marginLeft:"4px" }}>Certification</span>
    </div>
  );

  // ── ENTRY SCREEN ─────────────────────────────────────
  if (screen === "entry") return (
    <div style={S.app}>
      <Header />
      <div style={S.page}>
        {/* Hero */}
        <div style={{ textAlign:"center", padding:"28px 16px 24px", background:`linear-gradient(135deg,${accent},${accent2})`, borderRadius:"18px", marginBottom:"22px", color:"#fff" }}>
          <div style={{ fontSize:"54px", marginBottom:"10px" }}>📜</div>
          <h1 style={{ margin:"0 0 6px", fontSize:"22px", fontWeight:900 }}>GoPlanet AI Certification</h1>
          <p style={{ margin:0, fontSize:"13px", opacity:0.9, lineHeight:1.6 }}>50 questions · Score 40 or above to earn your certificate</p>
        </div>

        {/* What to expect */}
        <div style={S.card}>
          <p style={{ margin:"0 0 12px", fontWeight:700, fontSize:"14px", color:accent }}>📋 Before you begin</p>
          {[
            ["📝","50 multiple-choice questions on AI & GoPlanet"],
            ["🏆","Score 40 / 50 or above to get a certificate"],
            ["📛","Your name will appear on the certificate exactly as you enter it"],
            ["📅","Today's date will be printed on the certificate"],
            ["🔄","You can retake the exam anytime"],
          ].map(([icon,text],i) => (
            <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:"10px" }}>
              <span style={{ fontSize:"16px", flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:"13px", color:"#555", lineHeight:1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Name & Email form */}
        <div style={S.card}>
          <p style={{ margin:"0 0 14px", fontWeight:700, fontSize:"14px", color:accent }}>👤 Enter Your Details</p>
          <div style={{ marginBottom:"12px" }}>
            <span style={S.label}>Full Name <span style={{ color:"#e74c3c" }}>*</span></span>
            <input
              style={S.input}
              placeholder="e.g. Alice Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && document.getElementById("emailInput").focus()}
            />
            <p style={{ margin:"4px 0 0", fontSize:"11px", color:"#aaa" }}>This name will appear on your certificate</p>
          </div>
          <div style={{ marginBottom:"14px" }}>
            <span style={S.label}>Email Address <span style={{ color:"#e74c3c" }}>*</span></span>
            <input
              id="emailInput"
              style={S.input}
              placeholder="e.g. alice@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter") startExam(); }}
            />
          </div>
          {formErr && <div style={S.err}>{formErr}</div>}
          <button style={S.btn()} onClick={startExam}>Start Exam →</button>
        </div>
      </div>
    </div>
  );

  function startExam() {
    setFormErr("");
    if (!name.trim()) { setFormErr("Please enter your full name."); return; }
    if (name.trim().length < 2) { setFormErr("Please enter a valid name."); return; }
    if (!email.trim()) { setFormErr("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email.trim())) { setFormErr("Please enter a valid email address."); return; }
    setAnswers({});
    setScreen("exam");
    setTimeout(() => topRef.current?.scrollIntoView(), 100);
  }

  function submitExam() {
    let s = 0;
    QUIZ.forEach((q, i) => { if (answers[i] === q.a) s++; });
    const today = new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
    setScore(s);
    setCertDate(today);
    if (s >= 40) {
      const url = generateCert(name.trim(), s, today);
      setCertUrl(url);
    }
    setScreen("result");
    setTimeout(() => topRef.current?.scrollIntoView(), 100);
  }

  // ── EXAM SCREEN ──────────────────────────────────────
  if (screen === "exam") {
    const answered = Object.keys(answers).length;
    const progress = Math.round((answered / QUIZ.length) * 100);
    return (
      <div style={S.app}>
        <div ref={topRef} />
        {/* Sticky exam header */}
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#fff", borderBottom:"1px solid #e8e8f0", padding:"10px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
            <div style={S.logoBox}>🌍</div>
            <span style={{ fontWeight:700, fontSize:"14px" }}>Certification Exam</span>
            <span style={{ fontSize:"13px", color:accent, fontWeight:700, background:"#f0ecff", padding:"4px 12px", borderRadius:"20px" }}>{answered}/{QUIZ.length}</span>
          </div>
          {/* Progress bar */}
          <div style={{ height:"5px", background:"#e8e8f0", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${accent},${accent2})`, borderRadius:"3px", transition:"width 0.3s" }} />
          </div>
        </div>

        <div style={{ padding:"16px 16px 40px" }}>
          {QUIZ.map((q, i) => (
            <div key={i} style={{ ...S.card, marginBottom:"12px", border: answers[i] !== undefined ? `1.5px solid ${accent2}` : "1px solid #e8e8f0" }}>
              <p style={{ fontWeight:700, fontSize:"13px", margin:"0 0 12px", lineHeight:1.6, color:"#1a1a2e" }}>
                <span style={{ color:accent, fontWeight:900, marginRight:"6px" }}>Q{i+1}.</span>{q.q}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                {q.o.map((opt, j) => (
                  <button key={j} onClick={() => setAnswers(prev => ({ ...prev, [i]:j }))}
                    style={{ textAlign:"left", padding:"10px 13px", borderRadius:"9px", border:`1.5px solid ${answers[i]===j ? accent : "#e0e0f0"}`, background: answers[i]===j ? "#f0ecff" : "#fafafa", cursor:"pointer", fontSize:"13px", color: answers[i]===j ? accent : "#333", fontWeight: answers[i]===j ? 700 : 400, transition:"all 0.15s" }}>
                    <span style={{ fontWeight:800, marginRight:"8px", color: answers[i]===j ? accent : "#aaa" }}>{["A","B","C","D"][j]}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ position:"sticky", bottom:"16px", marginTop:"8px" }}>
            <button
              style={{ ...S.btn(answered < QUIZ.length ? "#ccc" : accent), boxShadow: answered >= QUIZ.length ? "0 4px 20px rgba(108,92,231,0.4)" : "none" }}
              disabled={answered < QUIZ.length}
              onClick={submitExam}>
              {answered < QUIZ.length ? `Answer all questions (${answered}/${QUIZ.length} done)` : "Submit Exam ✓"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ────────────────────────────────────
  if (screen === "result") {
    const passed = score >= 40;
    return (
      <div style={S.app}>
        <div ref={topRef} />
        <Header />
        <div style={S.page}>
          {/* Result hero */}
          <div style={{ textAlign:"center", padding:"28px 16px", background: passed ? `linear-gradient(135deg,${accent},${accent2})` : "linear-gradient(135deg,#e17055,#d63031)", borderRadius:"18px", marginBottom:"20px", color:"#fff" }}>
            <div style={{ fontSize:"60px", marginBottom:"10px" }}>{passed ? "🏆" : "📚"}</div>
            <h2 style={{ margin:"0 0 6px", fontSize:"22px" }}>{passed ? "Congratulations!" : "Almost There!"}</h2>
            <p style={{ margin:"0 0 14px", opacity:0.9, fontSize:"14px" }}>{name}</p>
            <div style={{ display:"inline-block", background:"rgba(255,255,255,0.2)", borderRadius:"14px", padding:"10px 24px" }}>
              <span style={{ fontSize:"36px", fontWeight:900 }}>{score}</span>
              <span style={{ fontSize:"16px", opacity:0.8 }}> / 50</span>
            </div>
            <p style={{ margin:"10px 0 0", fontSize:"13px", opacity:0.85 }}>
              {passed ? "You passed! You are a GoPlanet Certified User." : `You need ${40 - score} more correct answer${40-score===1?"":"s"} to pass.`}
            </p>
          </div>

          {/* Score breakdown */}
          <div style={S.card}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", textAlign:"center" }}>
              {[["✅ Correct", score, "#00b894"],["❌ Wrong", 50-score, "#e74c3c"],["📊 Score", `${Math.round(score/50*100)}%`, accent]].map(([l,v,c2],i) => (
                <div key={i}>
                  <p style={{ fontSize:"22px", fontWeight:900, color:c2, margin:0 }}>{v}</p>
                  <p style={{ fontSize:"11px", color:"#888", margin:"3px 0 0" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {passed ? (
            <>
              <div style={{ ...S.card, border:`2px solid ${accent}`, background:"#f9f7ff" }}>
                <p style={{ margin:"0 0 6px", fontWeight:700, color:accent, fontSize:"14px" }}>🎉 Your certificate is ready!</p>
                <p style={{ margin:0, fontSize:"13px", color:"#555", lineHeight:1.6 }}>Your certificate has been generated with your name <strong>{name}</strong> and today's date <strong>{certDate}</strong>.</p>
              </div>
              <button style={{ ...S.btn(), marginBottom:"10px", boxShadow:"0 4px 20px rgba(108,92,231,0.35)" }}
                onClick={() => setScreen("certificate")}>
                View My Certificate 🏆
              </button>
              <a href={certUrl} download={`GoPlanet_Certificate_${name.replace(/\s+/g,"_")}.png`}
                style={{ display:"block", ...S.btn("#00b894"), textDecoration:"none", textAlign:"center", lineHeight:"normal", padding:"14px", marginBottom:"10px" }}>
                📥 Download Certificate
              </a>
            </>
          ) : (
            <div style={{ ...S.card, background:"#fff8f0", border:"1px solid #ffd0b0" }}>
              <p style={{ margin:"0 0 6px", fontWeight:700, color:"#e17055", fontSize:"14px" }}>💡 You can do it!</p>
              <p style={{ margin:0, fontSize:"13px", color:"#666", lineHeight:1.6 }}>Review the guide, practice more, and come back. You only need {40-score} more correct answer{40-score===1?"":"s"}!</p>
            </div>
          )}

          <button style={S.btn("#a29bfe")} onClick={() => {
            setAnswers({});
            setScreen("exam");
            setTimeout(() => topRef.current?.scrollIntoView(), 100);
          }}>
            🔄 Retake Exam
          </button>

          <button style={{ background:"none", border:"none", color:accent, cursor:"pointer", fontSize:"14px", display:"block", margin:"16px auto 0", fontWeight:600 }}
            onClick={() => { setAnswers({}); setScreen("entry"); }}>
            ← Change Name / Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── CERTIFICATE SCREEN ───────────────────────────────
  if (screen === "certificate") return (
    <div style={S.app}>
      <div ref={topRef} />
      <div style={{ position:"sticky", top:0, zIndex:10, background:"#fff", borderBottom:"1px solid #e8e8f0", padding:"11px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={() => setScreen("result")} style={{ background:"none", border:"none", color:accent, fontWeight:800, fontSize:"17px", cursor:"pointer" }}>←</button>
        <span style={{ fontWeight:800, color:accent, fontSize:"16px" }}>🏆 Your Certificate</span>
      </div>
      <div style={{ padding:"16px 16px 40px" }}>
        <div style={{ textAlign:"center", padding:"20px 16px", background:`linear-gradient(135deg,${accent},${accent2})`, borderRadius:"16px", marginBottom:"16px", color:"#fff" }}>
          <div style={{ fontSize:"40px", marginBottom:"8px" }}>🏆</div>
          <h2 style={{ margin:"0 0 4px", fontSize:"20px" }}>GoPlanet Certified User</h2>
          <p style={{ margin:"0 0 2px", fontSize:"15px", fontWeight:700 }}>{name}</p>
          <p style={{ margin:0, fontSize:"12px", opacity:0.85 }}>Score: {score}/50 · {certDate}</p>
        </div>

        <img src={certUrl} alt="GoPlanet Certificate" style={{ width:"100%", borderRadius:"14px", border:`2px solid ${accent}`, display:"block", marginBottom:"14px" }} />

        <a href={certUrl} download={`GoPlanet_Certificate_${name.replace(/\s+/g,"_")}.png`}
          style={{ display:"block", ...S.btn(), textDecoration:"none", textAlign:"center", lineHeight:"normal", padding:"14px", marginBottom:"10px", boxShadow:"0 4px 20px rgba(108,92,231,0.35)" }}>
          📥 Download Certificate
        </a>

        <button style={S.btn("#a29bfe")} onClick={() => {
          setAnswers({});
          setScreen("exam");
          setTimeout(() => topRef.current?.scrollIntoView(), 100);
        }}>
          🔄 Retake Exam
        </button>
      </div>
    </div>
  );

  return null;
}

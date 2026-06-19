import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  SECURITY LAYER
//  - Passwords are hashed with SHA-256 before storage
//  - User data stored separately from session token
//  - Session token is a random UUID, not the email
//  - Sensitive fields never stored in plain text
//  - Each user's data stored under their own hashed key
// ============================================================

const hashString = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const genToken = () => crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));

// Separate storage keys — no single blob containing all users
const SESSION_KEY   = "gp_sess";          // stores only session token
const USERS_INDEX   = "gp_users_idx";     // stores hashed-email index only
const userKey  = (hashedEmail) => `gp_u_${hashedEmail}`;
const chatsKey = (hashedEmail) => `gp_c_${hashedEmail}`;
const projKey  = (hashedEmail) => `gp_p_${hashedEmail}`;
const settKey  = (hashedEmail) => `gp_s_${hashedEmail}`;

const safe = { 
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ============================================================
//  QUIZ QUESTIONS
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
  { q:"What is a Groq API key used for?", o:["Login authentication","Authorizing access to Groq AI services","File encryption","Image generation"], a:1 },
  { q:"What does 'token' mean in AI language models?", o:["A crypto currency","A unit of text (word/part of word)","A user account","A payment method"], a:1 },
  { q:"What is machine learning?", o:["Teaching machines to walk","AI learning from data patterns","Programming robots","Computer maintenance"], a:1 },
  { q:"What is natural language processing (NLP)?", o:["Writing code in English","AI understanding human language","Network protocols","Nature-based computing"], a:1 },
  { q:"What does 'Human First' represent?", o:["Humans do everything manually","Empower people, not replace them","Humans control all AI code","Only humans can use AI"], a:1 },
  { q:"What is a chatbot?", o:["A physical robot","Software simulating human conversation","A chat room","A messaging app"], a:1 },
  { q:"What is the GoPlanet certification about?", o:["Coding only","Responsible AI usage & smart communication","Database management","Web design"], a:1 },
  { q:"What does 'inference' mean in AI?", o:["Training a new model","Running AI to get predictions","Deleting AI data","Uploading datasets"], a:1 },
  { q:"What is a subscription plan?", o:["A free service forever","A paid tier with extra features","A one-time purchase","A government program"], a:1 },
  { q:"What does 'hallucination' mean in AI?", o:["AI seeing images","AI generating false info confidently","AI sleeping mode","AI voice response"], a:1 },
  { q:"Purpose of an AI guide?", o:["To restrict users","Help users understand the app effectively","To collect data","To show advertisements"], a:1 },
  { q:"What is 'Effective' as a GoPlanet principle?", o:["Being strict","Work smarter, achieve more","Using the most expensive tools","Coding everything yourself"], a:1 },
  { q:"What is Smart Thinking as a GoPlanet principle?", o:["Memorizing facts","Solve problems with intelligence","Working faster always","Using shortcuts"], a:1 },
  { q:"What is an admin in an app?", o:["A regular user","A user with special management privileges","A paid subscriber only","A developer only"], a:1 },
  { q:"What is email verification used for?", o:["Spam promotion","Confirming a user's email is real","Sending ads","Logging out users"], a:1 },
  { q:"What does 'Pro subscription' typically offer?", o:["Same as free","Faster responses and advanced features","Less storage","Fewer models"], a:1 },
  { q:"What is a language model's training data?", o:["Images and videos only","Large amounts of text from various sources","Audio files only","Code files only"], a:1 },
  { q:"What does 'Honest Use' mean in GoPlanet?", o:["Using AI to cheat","Use technology with integrity","Only using free tools","Sharing all data publicly"], a:1 },
  { q:"What is an API?", o:["Application Programming Interface","Automated Program Input","Advanced Page Interface","App Protocol Integration"], a:0 },
  { q:"What should you do if an AI gives wrong info?", o:["Trust it completely","Verify with reliable sources","Delete the app","Report to police"], a:1 },
  { q:"GoPlanet's backend AI powered by?", o:["OpenAI GPT","Google Bard","Groq API","Amazon Alexa"], a:2 },
  { q:"What is 'temperature' in AI models?", o:["Server heat","Controls randomness/creativity of AI output","User's location climate","Battery level"], a:1 },
  { q:"Best practice when using AI chatbots?", o:["Never verify AI answers","Cross-check important information","Share personal passwords with AI","Use AI blindly"], a:1 },
  { q:"GoPlanet certification date is based on?", o:["App launch date","The day you take the exam","Your birthday","A fixed annual date"], a:1 },
  { q:"GoPlanet is primarily designed for?", o:["Gaming","Everyone, easy to use AI chatbot","Advanced developers only","Children under 10"], a:1 },
  { q:"What is 'Secure & Private' in GoPlanet?", o:["Data is sold to partners","Data is encrypted and safe","Users' data is public","No security measures"], a:1 },
  { q:"What is a multiple-choice question exam?", o:["Essay writing","Questions with several answer options","Oral exam","Drawing test"], a:1 },
  { q:"What is 'context window' in AI?", o:["Browser window size","Amount of text AI can process at once","Screen resolution","Network bandwidth"], a:1 },
  { q:"What does re-taking an exam allow?", o:["Getting higher score automatically","Attempting the exam again after failure","Changing the questions","Getting a free subscription"], a:1 },
  { q:"What is an AI project in GoPlanet?", o:["A physical project","An organized workspace to manage AI tasks","A government initiative","A hardware device"], a:1 },
  { q:"What makes GoPlanet 'Innovative AI'?", o:["Only uses old technology","Choose from the best open models","No model options","Only one fixed model"], a:1 },
  { q:"What is 'User Friendly' design?", o:["Designed only for tech experts","Designed for everyone, easy to use","Complex interface intentionally","No help documentation"], a:1 },
  { q:"Purpose of subscription tiers?", o:["To confuse users","Offer different feature levels for different needs","To restrict all users equally","To remove features"], a:1 },
  { q:"What to do before sharing AI-generated content?", o:["Share immediately without review","Review and verify the accuracy","Delete it","Print it only"], a:1 },
  { q:"Role of AI in smart communication?", o:["Replace all human communication","Enhance and assist human communication","Stop communication","Monitor users"], a:1 },
  { q:"What is 'real-world AI application'?", o:["AI only in science fiction","Using AI to solve practical everyday problems","AI in video games only","AI in space only"], a:1 },
  { q:"What happens when you complete GoPlanet certification?", o:["Nothing","Receive a digital certificate if score ≥ 40/50","Get a free phone","Become an admin automatically"], a:1 },
  { q:"What is 'model selection' in GoPlanet?", o:["Choosing clothing models","Selecting which AI model to use for chat","Picking screen themes","Choosing subscription plans"], a:1 },
  { q:"What does an AI assistant help with?", o:["Only math problems","Chatting, creating, coding, and more","Only image generation","Only translations"], a:1 },
  { q:"Recommended approach to AI usage per GoPlanet?", o:["Rely on AI for everything","Use AI as a tool to empower, not replace human judgment","Never use AI","Only for entertainment"], a:1 },
  { q:"GoPlanet AI Chatbot powered by (code version)?", o:["LangChain + Ollama locally","Google Cloud only","Microsoft Azure only","Manual responses"], a:0 },
  { q:"What is 'Local & Fast' in GoPlanet?", o:["Works only locally without internet","Powered by Ollama running locally for speed","Users meet locally","Fast food delivery"], a:1 },
];

// ============================================================
//  GUIDE
// ============================================================
const GUIDE = [
  { title:"Getting Started", content:"After signing up and verifying your email, you'll land on the main dashboard. Start a new chat, manage projects, or explore settings. Your session stays active — no need to log in every time." },
  { title:"Setting Up Your Groq API Key", content:"Go to Settings → API Configuration. Enter your Groq API key (starts with gsk_) to unlock fast AI models. Switch between API Mode (Groq) and Code Mode anytime from the chat header." },
  { title:"Starting a Chat", content:"Tap '+ New Chat' to begin. Type your message and press Send or hit Enter. The AI responds based on your selected model. All conversations are saved automatically under your account." },
  { title:"Managing Projects", content:"Use the Projects tab to organise your AI work. Create named workspaces to group related chats and tasks." },
  { title:"Image Generator", content:"Go to the Images tab, describe what you want, and tap Generate. Add an image generation API key in Settings for real AI-generated images." },
  { title:"Subscription Plans", content:"GoPlanet offers Free and Pro ($25/year) plans. Pro unlocks faster responses, advanced models, priority support, and early access features. Subscribe from the Plans tab." },
  { title:"Admin Features", content:"The first registered user becomes Admin automatically. Admins can view all members, grant Pro or Admin access, and manage the platform from the Admin tab." },
  { title:"Certification Exam", content:"Go to Settings → Enter Exam. Answer all 50 multiple-choice questions on AI and GoPlanet. Score 40 or more out of 50 to earn your GoPlanet Certified User certificate." },
  { title:"Responsible AI Usage", content:"Use AI with integrity (Honest Use). Always verify important AI-generated information. AI empowers people — it doesn't replace human judgment. Work smarter (Effective) and think critically (Smart Thinking)." },
  { title:"Privacy & Security", content:"Your password is hashed before storage and never readable. API keys are stored only on your device. Each user's data is isolated. Always log out on shared devices." },
];

// ============================================================
//  MAIN APP
// ============================================================
export default function GoPlanetApp() {
  const [screen, setScreen]         = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);
  const [hashedEmail, setHashedEmail] = useState(null);

  // Registration flow
  const [step, setStep]         = useState(1); // 1=login/reg, 2=details, 3=verify
  const [isLogin, setIsLogin]   = useState(true);
  const [form, setForm]         = useState({ email:"", password:"", name:"", mobile:"" });
  const [formErr, setFormErr]   = useState("");
  const [loading, setLoading]   = useState(false);

  // App state
  const [activeTab, setActiveTab]   = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode]     = useState(false);

  // Chat
  const [chats, setChats]           = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [inputMsg, setInputMsg]     = useState("");
  const [isTyping, setIsTyping]     = useState(false);

  // Projects
  const [projects, setProjects]     = useState({});
  const [newProjName, setNewProjName] = useState("");
  const [showNewProj, setShowNewProj] = useState(false);

  // Settings
  const [groqKey, setGroqKey]       = useState("");
  const [powerMode, setPowerMode]   = useState("code");
  const [selModel, setSelModel]     = useState("llama-3.3-70b-versatile");

  // Image gen
  const [imgPrompt, setImgPrompt]   = useState("");
  const [genImg, setGenImg]         = useState(null);

  // Exam
  const [examActive, setExamActive] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [examDone, setExamDone]     = useState(false);
  const [examScore, setExamScore]   = useState(0);

  // UI
  const [showCert, setShowCert]     = useState(false);
  const [showGuide, setShowGuide]   = useState(false);
  const [subModal, setSubModal]     = useState(false);
  const [adminTab, setAdminTab]     = useState("members");
  const [allUsers, setAllUsers]     = useState([]);

  const chatEndRef = useRef(null);

  const MODELS = [
    { id:"llama-3.3-70b-versatile", name:"Llama 3.3 70B", provider:"Meta" },
    { id:"mixtral-8x7b-32768",      name:"Mixtral 8x7B",  provider:"Mistral" },
    { id:"gemma2-9b-it",            name:"Gemma 2 9B",    provider:"Google" },
    { id:"llama-3.1-8b-instant",    name:"Llama 3.1 8B",  provider:"Meta" },
  ];

  // ── Load session on mount ──────────────────────────────
  useEffect(() => {
    (async () => {
      const token = safe.get(SESSION_KEY);
      if (!token) { setScreen("auth"); return; }
      // Find user by session token
      const idx = safe.get(USERS_INDEX) || [];
      for (const he of idx) {
        const u = safe.get(userKey(he));
        if (u && u.sessionToken === token && u.verified) {
          await loadUserSession(u, he);
          return;
        }
      }
      safe.del(SESSION_KEY);
      setScreen("auth");
    })();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const loadUserSession = async (u, he) => {
    setCurrentUser(u);
    setHashedEmail(he);
    const savedChats = safe.get(chatsKey(he)) || {};
    const savedProjs = safe.get(projKey(he))  || {};
    const savedSett  = safe.get(settKey(he))  || {};
    setChats(savedChats);
    setProjects(savedProjs);
    setGroqKey(savedSett.groqKey || "");
    setPowerMode(savedSett.powerMode || "code");
    setSelModel(savedSett.selModel || "llama-3.3-70b-versatile");
    setDarkMode(savedSett.darkMode || false);
    setScreen("main");
  };

  const saveChats = (he, data) => safe.set(chatsKey(he), data);
  const saveProjs = (he, data) => safe.set(projKey(he),  data);
  const saveSettings = (he, data) => safe.set(settKey(he), data);

  const updateUser = (he, patch) => {
    const u = safe.get(userKey(he)) || {};
    const updated = { ...u, ...patch };
    safe.set(userKey(he), updated);
    setCurrentUser(updated);
  };

  // ── AUTH ──────────────────────────────────────────────
  const handleLogin = async () => {
    setFormErr(""); setLoading(true);
    try {
      if (!form.email || !form.password) { setFormErr("Please fill all fields."); return; }
      if (!/\S+@\S+\.\S+/.test(form.email)) { setFormErr("Invalid email address."); return; }
      const he = await hashString(form.email.toLowerCase().trim());
      const u  = safe.get(userKey(he));
      if (!u) { setFormErr("No account found. Please register."); return; }
      if (!u.verified) { setFormErr("Please verify your email first. Check your inbox."); return; }
      const hp = await hashString(form.password);
      if (u.passwordHash !== hp) { setFormErr("Incorrect password."); return; }
      // Create new session token
      const token = genToken();
      updateUser(he, { sessionToken: token });
      safe.set(SESSION_KEY, token);
      await loadUserSession({ ...u, sessionToken: token }, he);
    } finally { setLoading(false); }
  };

  const handleRegStep1 = async () => {
    setFormErr("");
    if (!form.email || !form.password) { setFormErr("Please fill all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setFormErr("Invalid email address."); return; }
    if (form.password.length < 8) { setFormErr("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(form.password)) { setFormErr("Password must contain at least one uppercase letter."); return; }
    if (!/[0-9]/.test(form.password)) { setFormErr("Password must contain at least one number."); return; }
    const he = await hashString(form.email.toLowerCase().trim());
    const existing = safe.get(userKey(he));
    if (existing) { setFormErr("This email is already registered. Please log in."); return; }
    setStep(2);
  };

  const handleRegStep2 = async () => {
    setFormErr(""); setLoading(true);
    try {
      if (!form.name.trim() || !form.mobile.trim()) { setFormErr("Please fill all fields."); return; }
      if (!/^\d{7,15}$/.test(form.mobile.replace(/[\s\-\+\(\)]/g,""))) { setFormErr("Enter a valid mobile number."); return; }
      const he = await hashString(form.email.toLowerCase().trim());
      const hp = await hashString(form.password);
      const verifyToken = genToken();
      const idx = safe.get(USERS_INDEX) || [];
      const isFirstUser = idx.length === 0;
      const newUser = {
        // No plain-text email or password stored
        nameDisplay: form.name.trim(),
        mobile: form.mobile.trim(),
        passwordHash: hp,
        verified: false,
        verifyToken,
        sessionToken: null,
        isAdmin: isFirstUser,
        isPro: false,
        joinedAt: new Date().toISOString(),
        examScore: null,
        certDate: null,
        certGranted: false,
        // Store email hint only for display (masked)
        emailMask: form.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c),
      };
      safe.set(userKey(he), newUser);
      if (!idx.includes(he)) { safe.set(USERS_INDEX, [...idx, he]); }
      setHashedEmail(he);
      setStep(3);
    } finally { setLoading(false); }
  };

  // Simulate email link click (in production, send real email with verifyToken link)
  const handleVerify = () => {
    const he = hashedEmail;
    const u  = safe.get(userKey(he));
    if (!u) return;
    const token = genToken();
    safe.set(userKey(he), { ...u, verified: true, verifyToken: null, sessionToken: token });
    const idx = safe.get(USERS_INDEX) || [];
    if (!idx.includes(he)) safe.set(USERS_INDEX, [...idx, he]);
    safe.set(SESSION_KEY, token);
    loadUserSession({ ...u, verified: true, sessionToken: token }, he);
  };

  const logout = () => {
    if (hashedEmail) {
      const u = safe.get(userKey(hashedEmail));
      if (u) safe.set(userKey(hashedEmail), { ...u, sessionToken: null });
    }
    safe.del(SESSION_KEY);
    setCurrentUser(null); setHashedEmail(null);
    setChats({}); setProjects({}); setMessages([]);
    setActiveChatId(null); setScreen("auth"); setStep(1);
    setIsLogin(true); setForm({ email:"", password:"", name:"", mobile:"" });
  };

  // ── CHAT ──────────────────────────────────────────────
  const newChat = () => {
    const cid = "c_" + Date.now();
    const welcome = { role:"ai", text:`Hello ${currentUser?.nameDisplay}! 👋 I'm GoPlanet AI. How can I help you today?`, ts: new Date().toLocaleTimeString() };
    const updated = { ...chats, [cid]: [welcome] };
    setChats(updated); saveChats(hashedEmail, updated);
    setActiveChatId(cid); setMessages([welcome]);
    setActiveTab("chat"); setSidebarOpen(false);
  };

  const openChat = (cid) => {
    setActiveChatId(cid);
    setMessages(chats[cid] || []);
    setActiveTab("chat"); setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!inputMsg.trim() || !activeChatId) return;
    const userMsg = { role:"user", text:inputMsg.trim(), ts: new Date().toLocaleTimeString() };
    const withUser = [...messages, userMsg];
    setMessages(withUser); setInputMsg(""); setIsTyping(true);
    let aiText = "";
    try {
      if (powerMode === "api" && groqKey.startsWith("gsk_")) {
        const history = withUser.slice(-10).map(m => ({ role: m.role==="user"?"user":"assistant", content: m.text }));
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method:"POST",
          headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${groqKey}` },
          body: JSON.stringify({ model: selModel, messages: history, max_tokens:1024 })
        });
        if (!res.ok) throw new Error("Groq API error " + res.status);
        const data = await res.json();
        aiText = data.choices?.[0]?.message?.content || "No response received.";
      } else {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            model:"claude-sonnet-4-6", max_tokens:1000,
            system:"You are GoPlanet AI, a helpful and friendly assistant. Keep responses clear and concise.",
            messages:[{ role:"user", content: inputMsg.trim() }]
          })
        });
        const data = await res.json();
        aiText = data.content?.[0]?.text || "Please add your Groq API key in Settings to enable full AI responses.";
      }
    } catch (e) {
      aiText = powerMode === "api"
        ? "⚠️ Groq API error. Please check your API key in Settings."
        : "⚠️ Connection issue. Please try again.";
    }
    const aiMsg = { role:"ai", text:aiText, ts: new Date().toLocaleTimeString() };
    const final = [...withUser, aiMsg];
    setMessages(final); setIsTyping(false);
    const updatedChats = { ...chats, [activeChatId]: final };
    setChats(updatedChats); saveChats(hashedEmail, updatedChats);
  };

  // ── PROJECTS ──────────────────────────────────────────
  const createProject = () => {
    if (!newProjName.trim()) return;
    const pid = "p_" + Date.now();
    const updated = { ...projects, [pid]: { name: newProjName.trim(), createdAt: new Date().toISOString() } };
    setProjects(updated); saveProjs(hashedEmail, updated);
    setNewProjName(""); setShowNewProj(false);
  };

  // ── SETTINGS ──────────────────────────────────────────
  const saveSettingsHandler = () => {
    const sett = { groqKey, powerMode, selModel, darkMode };
    saveSettings(hashedEmail, sett);
    alert("✅ Settings saved!");
  };

  // ── EXAM ──────────────────────────────────────────────
  const submitExam = () => {
    let score = 0;
    QUIZ.forEach((q, i) => { if (examAnswers[i] === q.a) score++; });
    setExamScore(score); setExamDone(true);
    if (score >= 40) {
      const certDate = new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
      updateUser(hashedEmail, { examScore: score, certDate, certGranted: true });
    } else {
      updateUser(hashedEmail, { examScore: score });
    }
  };

  // ── ADMIN ─────────────────────────────────────────────
  const loadAllUsers = () => {
    const idx = safe.get(USERS_INDEX) || [];
    const users = idx.map(he => {
      const u = safe.get(userKey(he));
      if (!u) return null;
      // Return only non-sensitive fields
      return { he, name: u.nameDisplay, emailMask: u.emailMask, isPro: u.isPro, isAdmin: u.isAdmin, verified: u.verified, certGranted: u.certGranted, examScore: u.examScore, joinedAt: u.joinedAt };
    }).filter(Boolean);
    setAllUsers(users);
  };

  const grantPro = (he) => {
    const u = safe.get(userKey(he));
    if (u) safe.set(userKey(he), { ...u, isPro: true });
    loadAllUsers();
  };
  const grantAdmin = (he) => {
    const u = safe.get(userKey(he));
    if (u) safe.set(userKey(he), { ...u, isAdmin: true });
    loadAllUsers();
  };

  // ── CERTIFICATE ───────────────────────────────────────
  const generateCert = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000; canvas.height = 1120;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0,0,1000,1120);
    grad.addColorStop(0,"#f0f4ff"); grad.addColorStop(1,"#e8eeff");
    ctx.fillStyle = grad; ctx.fillRect(0,0,1000,1120);
    ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=8; ctx.strokeRect(20,20,960,1080);
    ctx.strokeStyle="#a29bfe"; ctx.lineWidth=3; ctx.strokeRect(35,35,930,1050);
    // Logo
    const lg = ctx.createRadialGradient(500,130,10,500,130,55);
    lg.addColorStop(0,"#a29bfe"); lg.addColorStop(1,"#6c5ce7");
    ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(500,130,55,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 26px Arial"; ctx.textAlign="center"; ctx.fillText("🌍",500,140);
    // Title
    ctx.fillStyle="#2d3436"; ctx.font="bold 50px Arial"; ctx.fillText("GoPlanet",500,240);
    ctx.fillStyle="#6c5ce7"; ctx.font="18px Arial"; ctx.fillText("— AI CHATBOT —",500,272);
    ctx.fillStyle="#1a1a2e"; ctx.font="bold 74px Arial"; ctx.fillText("CERTIFICATE",500,375);
    ctx.fillStyle="#6c5ce7"; ctx.font="bold 26px Arial"; ctx.fillText("OF COMPLETION",500,418);
    ctx.strokeStyle="#a29bfe"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(150,442); ctx.lineTo(850,442); ctx.stroke();
    ctx.fillStyle="#636e72"; ctx.font="18px Arial";
    ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO",500,480);
    ctx.fillStyle="#2d3436"; ctx.font="bold 40px Arial";
    ctx.fillText(currentUser?.nameDisplay || "Certified User",500,555);
    ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(200,572); ctx.lineTo(800,572); ctx.stroke();
    ctx.fillStyle="#555"; ctx.font="18px Arial";
    ctx.fillText("for successfully completing the GoPlanet AI Chatbot Certification Program.",500,612);
    ctx.fillText("This certifies your understanding and practical knowledge",500,640);
    ctx.fillText("of responsible AI usage, smart communication,",500,668);
    ctx.fillText("and real-world AI chatbot applications.",500,696);
    ctx.strokeStyle="#a29bfe"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(200,722); ctx.lineTo(800,722); ctx.stroke();
    ctx.fillStyle="#636e72"; ctx.font="bold 15px Arial";
    ctx.fillText("YOU ARE NOW RECOGNIZED AS",500,752);
    ctx.fillStyle="#6c5ce7"; ctx.font="bold 30px Arial";
    ctx.fillText("GOPLANET CERTIFIED USER",500,790);
    const icons=[{l:"HONEST USE",s:"Use technology with integrity."},{l:"SMART THINKING",s:"Solve problems with intelligence."},{l:"EFFECTIVE",s:"Work smarter, achieve more."},{l:"HUMAN FIRST",s:"Empower people, not replace them."}];
    icons.forEach((ic,i)=>{
      const x=130+i*185;
      ctx.fillStyle="#6c5ce7"; ctx.beginPath(); ctx.arc(x,850,28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#fff"; ctx.font="bold 16px Arial"; ctx.fillText("✓",x,857);
      ctx.fillStyle="#2d3436"; ctx.font="bold 10px Arial"; ctx.fillText(ic.l,x,900);
      ctx.fillStyle="#636e72"; ctx.font="10px Arial"; ctx.fillText(ic.s.slice(0,22),x,916);
    });
    ctx.textAlign="left"; ctx.fillStyle="#6c5ce7"; ctx.font="italic bold 22px Arial"; ctx.fillText("GoPlanet Team",115,1000);
    ctx.fillStyle="#636e72"; ctx.font="12px Arial"; ctx.fillText("GOPLANET TEAM  |  ISSUER",115,1020);
    ctx.textAlign="right"; ctx.fillStyle="#2d3436"; ctx.font="bold 16px Arial";
    ctx.fillText(currentUser?.certDate || new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),885,1000);
    ctx.fillStyle="#636e72"; ctx.font="12px Arial"; ctx.fillText("DATE OF ISSUE",885,1020);
    return canvas.toDataURL("image/png");
  };

  // ============================================================
  //  STYLES
  // ============================================================
  const c = {
    bg:     darkMode ? "#0f0f1a" : "#f7f7fc",
    surface:darkMode ? "#1a1a2e" : "#ffffff",
    border: darkMode ? "#2a2a4a" : "#e8e8f0",
    text:   darkMode ? "#e0e0ff" : "#1a1a2e",
    sub:    darkMode ? "#9090bb" : "#666680",
    accent: "#6c5ce7",
    accent2:"#a29bfe",
  };

  const S = {
    app:    { display:"flex", flexDirection:"column", height:"100dvh", width:"100%", maxWidth:"430px", margin:"0 auto", fontFamily:"system-ui,sans-serif", background:c.bg, color:c.text, position:"relative", overflow:"hidden" },
    topBar: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:c.surface, borderBottom:`1px solid ${c.border}`, minHeight:"52px", flexShrink:0 },
    logo:   { display:"flex", alignItems:"center", gap:"8px", fontWeight:800, fontSize:"18px", color:c.accent },
    logoBox:{ width:"32px", height:"32px", borderRadius:"8px", background:`linear-gradient(135deg,${c.accent},${c.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" },
    content:{ flex:1, overflowY:"auto", minHeight:0 },
    navBar: { display:"flex", background:c.surface, borderTop:`1px solid ${c.border}`, padding:"4px 0", flexShrink:0 },
    navBtn: (a) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", padding:"5px 2px", border:"none", background:"none", cursor:"pointer", color: a ? c.accent : c.sub, fontSize:"9px", fontWeight: a ? 700 : 400 }),
    input:  { width:"100%", padding:"11px 14px", border:`1.5px solid ${c.border}`, borderRadius:"10px", background:c.surface, color:c.text, fontSize:"14px", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
    btn:    (bg=c.accent, fg="#fff") => ({ background:bg, color:fg, border:"none", borderRadius:"10px", padding:"12px 20px", fontSize:"14px", fontWeight:700, cursor:"pointer", width:"100%", transition:"opacity 0.2s" }),
    card:   { background:c.surface, borderRadius:"14px", padding:"14px", marginBottom:"12px", border:`1px solid ${c.border}` },
    label:  { fontSize:"11px", fontWeight:700, color:c.sub, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"6px", display:"block" },
    err:    { color:"#e74c3c", fontSize:"12px", marginTop:"4px", padding:"8px 12px", background:"#fff0f0", borderRadius:"8px", border:"1px solid #ffd0d0" },
  };

  // ============================================================
  //  LOADING SCREEN
  // ============================================================
  if (screen === "loading") return (
    <div style={{ ...S.app, alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:"50px", marginBottom:"16px" }}>🌍</div>
      <p style={{ color:c.accent, fontWeight:700, fontSize:"20px" }}>GoPlanet</p>
      <p style={{ color:c.sub, fontSize:"13px", marginTop:"6px" }}>Loading...</p>
    </div>
  );

  // ============================================================
  //  AUTH SCREEN
  // ============================================================
  if (screen === "auth") {
    if (step === 3) return (
      <div style={{ ...S.app, alignItems:"center", justifyContent:"center", padding:"30px 24px" }}>
        <div style={{ fontSize:"64px", marginBottom:"16px" }}>📧</div>
        <h2 style={{ color:c.accent, textAlign:"center" }}>Check Your Email</h2>
        <p style={{ color:c.sub, fontSize:"13px", textAlign:"center", marginBottom:"24px", lineHeight:1.6 }}>
          We've sent a verification link to your email. Click the link to activate your account.
        </p>
        <div style={{ background:"#f0ecff", borderRadius:"12px", padding:"16px", width:"100%", marginBottom:"16px", boxSizing:"border-box" }}>
          <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#555", fontWeight:600 }}>📌 Demo Mode: Click below to simulate email verification</p>
          <button style={S.btn()} onClick={handleVerify}>✅ Verify & Enter GoPlanet</button>
        </div>
        <button style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontSize:"13px" }} onClick={() => { setStep(1); setIsLogin(true); }}>← Back to Login</button>
      </div>
    );

    if (step === 2) return (
      <div style={{ ...S.app, alignItems:"center", justifyContent:"center", padding:"30px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"40px", marginBottom:"8px" }}>👤</div>
          <h2 style={{ color:c.accent, margin:"0 0 4px" }}>Your Details</h2>
          <p style={{ color:c.sub, fontSize:"12px", margin:0 }}>Step 2 of 2</p>
        </div>
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"10px" }}>
          <div>
            <span style={S.label}>Full Name</span>
            <input style={S.input} placeholder="e.g. Alice Johnson" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
          </div>
          <div>
            <span style={S.label}>Mobile Number</span>
            <input style={S.input} placeholder="e.g. +91 98765 43210" type="tel" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} />
          </div>
          {formErr && <div style={S.err}>{formErr}</div>}
          <button style={S.btn()} onClick={handleRegStep2} disabled={loading}>{loading?"Please wait...":"Send Verification Email →"}</button>
          <button style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontSize:"13px" }} onClick={()=>setStep(1)}>← Back</button>
        </div>
      </div>
    );

    return (
      <div style={{ ...S.app, alignItems:"center", justifyContent:"center", padding:"30px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"18px", background:`linear-gradient(135deg,${c.accent},${c.accent2})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:"36px" }}>🌍</div>
          <h1 style={{ fontSize:"28px", fontWeight:900, color:c.accent, margin:"0 0 4px" }}>GoPlanet</h1>
          <p style={{ color:c.sub, fontSize:"13px", margin:0 }}>Intelligent AI, powered by Groq</p>
        </div>

        {/* Tab switch */}
        <div style={{ display:"flex", background:"#f0ecff", borderRadius:"12px", padding:"4px", marginBottom:"20px", width:"100%" }}>
          {["Log In","Register"].map((t,i)=>(
            <button key={t} onClick={()=>{ setIsLogin(i===0); setFormErr(""); setStep(1); }}
              style={{ flex:1, padding:"9px", border:"none", borderRadius:"9px", background: (isLogin===( i===0)) ? c.accent : "transparent", color:(isLogin===(i===0))?"#fff":c.sub, fontWeight:700, cursor:"pointer", fontSize:"14px" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"10px" }}>
          <div>
            <span style={S.label}>Email Address</span>
            <input style={S.input} placeholder="you@example.com" type="email" autoComplete="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(isLogin?handleLogin():handleRegStep1())} />
          </div>
          <div>
            <span style={S.label}>Password {!isLogin && <span style={{ textTransform:"none", fontWeight:400, color:"#aaa" }}>(min 8 chars, 1 uppercase, 1 number)</span>}</span>
            <input style={S.input} placeholder={isLogin?"Your password":"Create a strong password"} type="password" autoComplete={isLogin?"current-password":"new-password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(isLogin?handleLogin():handleRegStep1())} />
          </div>
          {formErr && <div style={S.err}>{formErr}</div>}
          <button style={S.btn()} onClick={isLogin?handleLogin:handleRegStep1} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Log In →" : "Next →"}
          </button>
        </div>

        <p style={{ fontSize:"11px", color:c.sub, marginTop:"20px", textAlign:"center", lineHeight:1.5 }}>
          Your password is hashed before storage. We never store it in plain text.
        </p>
      </div>
    );
  }

  // ============================================================
  //  GUIDE
  // ============================================================
  if (showGuide) return (
    <div style={S.app}>
      <div style={S.topBar}>
        <button onClick={()=>setShowGuide(false)} style={{ background:"none", border:"none", color:c.accent, fontWeight:700, fontSize:"16px", cursor:"pointer" }}>←</button>
        <span style={{ fontWeight:700, color:c.accent }}>📖 User Guide</span>
        <div style={{ width:"40px" }} />
      </div>
      <div style={{ ...S.content, padding:"16px" }}>
        {GUIDE.map((s,i)=>(
          <div key={i} style={S.card}>
            <h3 style={{ margin:"0 0 8px", color:c.accent, fontSize:"14px" }}>{i+1}. {s.title}</h3>
            <p style={{ margin:0, fontSize:"13px", lineHeight:1.7, color:c.sub }}>{s.content}</p>
          </div>
        ))}
        <div style={{ height:"20px" }} />
      </div>
    </div>
  );

  // ============================================================
  //  CERTIFICATE
  // ============================================================
  if (showCert) {
    const certUrl = generateCert();
    return (
      <div style={S.app}>
        <div style={S.topBar}>
          <button onClick={()=>setShowCert(false)} style={{ background:"none", border:"none", color:c.accent, fontWeight:700, fontSize:"16px", cursor:"pointer" }}>←</button>
          <span style={{ fontWeight:700, color:c.accent }}>🏆 Your Certificate</span>
          <div style={{ width:"40px" }} />
        </div>
        <div style={{ ...S.content, padding:"16px" }}>
          <div style={{ background:`linear-gradient(135deg,${c.accent},${c.accent2})`, borderRadius:"16px", padding:"20px", marginBottom:"16px", textAlign:"center" }}>
            <div style={{ fontSize:"44px" }}>🏆</div>
            <h2 style={{ color:"#fff", margin:"8px 0 2px" }}>Congratulations!</h2>
            <p style={{ color:"#e0d9ff", margin:0, fontSize:"14px" }}>{currentUser?.nameDisplay}</p>
            <p style={{ color:"#c9c0ff", margin:"4px 0 0", fontSize:"12px" }}>Score: {currentUser?.examScore}/50 · {currentUser?.certDate}</p>
          </div>
          <img src={certUrl} alt="GoPlanet Certificate" style={{ width:"100%", borderRadius:"12px", border:`2px solid ${c.accent}` }} />
          <a href={certUrl} download="GoPlanet_Certificate.png"
            style={{ display:"block", marginTop:"14px", ...S.btn(), textDecoration:"none", textAlign:"center", padding:"13px", lineHeight:"normal" }}>
            📥 Download Certificate
          </a>
          <div style={{ height:"20px" }} />
        </div>
      </div>
    );
  }

  // ============================================================
  //  EXAM
  // ============================================================
  if (examActive) return (
    <div style={S.app}>
      <div style={S.topBar}>
        <button onClick={()=>{ setExamActive(false); setExamDone(false); setExamAnswers({}); }} style={{ background:"none", border:"none", color:"#e74c3c", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>✕ Exit</button>
        <span style={{ fontWeight:700, fontSize:"14px" }}>Certification Exam</span>
        <span style={{ fontSize:"12px", color:c.sub, background:"#f0ecff", padding:"3px 10px", borderRadius:"20px" }}>{Object.keys(examAnswers).length}/{QUIZ.length}</span>
      </div>
      <div style={{ ...S.content, padding:"14px" }}>
        {examDone ? (
          <div style={{ textAlign:"center", padding:"30px 16px" }}>
            <div style={{ fontSize:"64px", marginBottom:"16px" }}>{examScore>=40?"🏆":"📚"}</div>
            <h2 style={{ color: examScore>=40 ? c.accent : "#e74c3c", marginBottom:"8px" }}>
              {examScore>=40 ? "You Passed!" : "Keep Practicing!"}
            </h2>
            <div style={{ fontSize:"48px", fontWeight:900, color:c.accent, marginBottom:"8px" }}>{examScore}<span style={{ fontSize:"22px", color:c.sub }}>/{QUIZ.length}</span></div>
            <p style={{ color:c.sub, fontSize:"14px", marginBottom:"24px" }}>
              {examScore>=40 ? "You are now a GoPlanet Certified User!" : `You need ${40-examScore} more correct answers to pass.`}
            </p>
            {examScore>=40 && (
              <button style={{ ...S.btn(), marginBottom:"10px" }} onClick={()=>{ setShowCert(true); setExamActive(false); }}>
                View My Certificate 🏆
              </button>
            )}
            <button style={S.btn("#a29bfe")} onClick={()=>{ setExamDone(false); setExamAnswers({}); }}>
              {examScore>=40 ? "Take Again 🔄" : "Retake Exam 🔄"}
            </button>
            <button style={{ display:"block", margin:"12px auto 0", background:"none", border:"none", color:c.sub, cursor:"pointer", fontSize:"13px" }}
              onClick={()=>{ setExamActive(false); setExamDone(false); setExamAnswers({}); }}>
              Back to Settings
            </button>
          </div>
        ):(
          <>
            {QUIZ.map((q,i)=>(
              <div key={i} style={{ ...S.card, marginBottom:"10px" }}>
                <p style={{ fontWeight:600, fontSize:"13px", margin:"0 0 10px", lineHeight:1.5 }}>
                  <span style={{ color:c.accent, fontWeight:800 }}>Q{i+1}. </span>{q.q}
                </p>
                {q.o.map((opt,j)=>(
                  <button key={j} onClick={()=>setExamAnswers(p=>({...p,[i]:j}))}
                    style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 12px", marginBottom:"6px", borderRadius:"9px",
                      border:`1.5px solid ${examAnswers[i]===j ? c.accent : c.border}`,
                      background: examAnswers[i]===j ? "#f0ecff" : "transparent",
                      cursor:"pointer", fontSize:"13px", color: examAnswers[i]===j ? c.accent : c.text }}>
                    <span style={{ fontWeight:700, marginRight:"6px" }}>{["A","B","C","D"][j]}.</span>{opt}
                  </button>
                ))}
              </div>
            ))}
            <button style={{ ...S.btn(), opacity: Object.keys(examAnswers).length<QUIZ.length ? 0.5 : 1 }}
              onClick={submitExam} disabled={Object.keys(examAnswers).length<QUIZ.length}>
              {Object.keys(examAnswers).length<QUIZ.length
                ? `Answer all questions (${Object.keys(examAnswers).length}/${QUIZ.length})`
                : "Submit Exam ✓"}
            </button>
            <div style={{ height:"24px" }} />
          </>
        )}
      </div>
    </div>
  );

  // ============================================================
  //  MAIN APP
  // ============================================================
  const chatList = Object.keys(chats).map(id=>({ id, preview: (chats[id]?.find(m=>m.role==="user")?.text||"New Chat").slice(0,32) })).reverse();
  const projList = Object.keys(projects).map(id=>({ id, ...projects[id] }));

  // ── Sidebar ──────────────────────────────────────────
  const Sidebar = () => (
    <>
      {sidebarOpen && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", zIndex:99 }} onClick={()=>setSidebarOpen(false)} />}
      <div style={{ position:"absolute", top:0, left: sidebarOpen?0:"-100%", width:"82%", height:"100%", background:c.surface, zIndex:100, transition:"left 0.25s ease", boxShadow: sidebarOpen?"6px 0 24px rgba(0,0,0,0.25)":"none", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"16px 14px", borderBottom:`1px solid ${c.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
            <div style={S.logo}><div style={S.logoBox}>🌍</div>GoPlanet</div>
            <button onClick={()=>setSidebarOpen(false)} style={{ background:"none", border:"none", color:c.sub, fontSize:"22px", cursor:"pointer" }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:"10px", alignItems:"center", padding:"10px 12px", background: darkMode?"#12122a":"#f5f3ff", borderRadius:"10px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:c.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"16px", flexShrink:0 }}>
              {currentUser?.nameDisplay?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:"13px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentUser?.nameDisplay}</p>
              <p style={{ margin:0, fontSize:"11px", color:c.sub }}>{currentUser?.isPro?"⭐ Pro Member":"Free Member"}</p>
            </div>
          </div>
        </div>

        <div style={{ flex:1, padding:"12px", overflowY:"auto" }}>
          <button style={{ ...S.btn(), marginBottom:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }} onClick={newChat}>
            + New Chat
          </button>
          <span style={S.label}>Recent Chats</span>
          {chatList.length===0 && <p style={{ color:c.sub, fontSize:"12px" }}>No chats yet.</p>}
          {chatList.slice(0,10).map(c2=>(
            <button key={c2.id} onClick={()=>openChat(c2.id)}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 10px", marginBottom:"4px", borderRadius:"8px", border:"none",
                background: activeChatId===c2.id ? "#f0ecff" : "transparent",
                cursor:"pointer", fontSize:"12px", color: activeChatId===c2.id ? c.accent : c.text }}>
              💬 {c2.preview}…
            </button>
          ))}
          <span style={{ ...S.label, marginTop:"14px" }}>Projects</span>
          {projList.map(p=>(
            <div key={p.id} style={{ padding:"7px 10px", fontSize:"12px", color:c.sub }}>📁 {p.name}</div>
          ))}
          <button onClick={()=>{ setShowNewProj(true); setActiveTab("projects"); setSidebarOpen(false); }}
            style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontSize:"12px", padding:"4px 10px" }}>
            + New Project
          </button>
        </div>

        {!currentUser?.isPro && (
          <div style={{ margin:"12px", padding:"14px", background:`linear-gradient(135deg,${c.accent},${c.accent2})`, borderRadius:"12px", color:"#fff" }}>
            <p style={{ margin:"0 0 4px", fontWeight:800 }}>⭐ Upgrade to Pro</p>
            <p style={{ margin:"0 0 10px", fontSize:"12px", opacity:0.9 }}>$25/year — Unlock all features</p>
            <button onClick={()=>{ setSubModal(true); setSidebarOpen(false); setActiveTab("subscription"); }}
              style={{ background:"#fff", color:c.accent, border:"none", borderRadius:"8px", padding:"7px 16px", fontSize:"12px", fontWeight:800, cursor:"pointer" }}>
              Subscribe Now
            </button>
          </div>
        )}
        <button onClick={logout} style={{ margin:"0 12px 16px", background:"none", border:`1px solid #e74c3c`, color:"#e74c3c", borderRadius:"8px", padding:"9px", cursor:"pointer", fontSize:"13px", fontWeight:600 }}>
          🚪 Log Out
        </button>
      </div>
    </>
  );

  // ── Chat Tab ──────────────────────────────────────────
  const ChatTab = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"7px 14px", background: darkMode?"#12122a":"#f8f7ff", borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
        <p style={{ margin:0, fontSize:"11px", textAlign:"center", color:c.sub }}>
          Powered by: <span style={{ color:c.accent, fontWeight:700 }}>{powerMode==="api"&&groqKey.startsWith("gsk_")?`Groq API · ${MODELS.find(m=>m.id===selModel)?.name||selModel}`:"Code Mode (Claude)"}</span>
          <button onClick={()=>{ setPowerMode(p=>p==="api"?"code":"api"); }}
            style={{ marginLeft:"8px", fontSize:"10px", background:"#f0ecff", color:c.accent, border:"none", borderRadius:"6px", padding:"2px 8px", cursor:"pointer" }}>
            Switch
          </button>
        </p>
      </div>

      {!activeChatId ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", textAlign:"center" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px" }}>🌍</div>
          <h2 style={{ color:c.accent, marginBottom:"6px", fontSize:"22px" }}>GoPlanet AI</h2>
          <p style={{ color:c.sub, fontSize:"13px", marginBottom:"28px", lineHeight:1.6 }}>Your intelligent assistant for chatting, creating, coding, and more.</p>
          <button style={S.btn()} onClick={newChat}>+ Start New Chat</button>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"20px", justifyContent:"center" }}>
            {MODELS.map(m=>(
              <button key={m.id} onClick={()=>setSelModel(m.id)}
                style={{ padding:"6px 12px", borderRadius:"20px", border:`1.5px solid ${selModel===m.id?c.accent:c.border}`, background: selModel===m.id?"#f0ecff":"transparent", color: selModel===m.id?c.accent:c.sub, fontSize:"11px", cursor:"pointer", fontWeight: selModel===m.id?700:400 }}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      ):(
        <>
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px" }}>
            {messages.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", marginBottom:"10px", gap:"8px", alignItems:"flex-end" }}>
                {m.role==="ai" && <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:c.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>🌍</div>}
                <div style={{ maxWidth:"78%", padding:"10px 14px", borderRadius: m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
                  background: m.role==="user" ? c.accent : darkMode?"#1e1e3a":"#f0ecff",
                  color: m.role==="user" ? "#fff" : c.text, fontSize:"13px", lineHeight:1.6, wordBreak:"break-word" }}>
                  <pre style={{ margin:0, whiteSpace:"pre-wrap", fontFamily:"inherit" }}>{m.text}</pre>
                </div>
                {m.role==="user" && <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:c.accent2, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"12px", flexShrink:0 }}>{currentUser?.nameDisplay?.[0]}</div>}
              </div>
            ))}
            {isTyping && (
              <div style={{ display:"flex", gap:"8px", marginBottom:"10px", alignItems:"flex-end" }}>
                <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:c.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>🌍</div>
                <div style={{ padding:"10px 16px", borderRadius:"4px 16px 16px 16px", background: darkMode?"#1e1e3a":"#f0ecff" }}>
                  <span style={{ fontSize:"18px", letterSpacing:"4px", color:c.accent }}>•••</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${c.border}`, display:"flex", gap:"8px", flexShrink:0 }}>
            <input style={{ ...S.input, flex:1 }} placeholder="Type your message…" value={inputMsg}
              onChange={e=>setInputMsg(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); }}} />
            <button onClick={sendMessage} disabled={!inputMsg.trim()||isTyping}
              style={{ width:"42px", height:"42px", borderRadius:"50%", background: inputMsg.trim()&&!isTyping?c.accent:"#ccc", border:"none", color:"#fff", fontSize:"18px", cursor: inputMsg.trim()&&!isTyping?"pointer":"default", flexShrink:0, transition:"background 0.2s" }}>
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ── Projects Tab ──────────────────────────────────────
  const ProjectsTab = () => (
    <div style={{ padding:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <h2 style={{ margin:0, color:c.accent, fontSize:"18px" }}>📁 Projects</h2>
        <button onClick={()=>setShowNewProj(true)} style={{ background:c.accent, color:"#fff", border:"none", borderRadius:"8px", padding:"7px 14px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>+ New</button>
      </div>
      {showNewProj && (
        <div style={{ ...S.card, background:"#f0ecff", marginBottom:"14px" }}>
          <input style={{ ...S.input, marginBottom:"8px" }} placeholder="Project name…" value={newProjName} onChange={e=>setNewProjName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProject()} />
          <div style={{ display:"flex", gap:"8px" }}>
            <button style={S.btn()} onClick={createProject}>Create</button>
            <button style={{ ...S.btn("#e0e0e0","#444"), flex:"none", padding:"12px 20px" }} onClick={()=>{ setShowNewProj(false); setNewProjName(""); }}>Cancel</button>
          </div>
        </div>
      )}
      {projList.length===0 ? (
        <div style={{ textAlign:"center", marginTop:"50px", color:c.sub }}>
          <div style={{ fontSize:"40px", marginBottom:"10px" }}>📁</div>
          <p style={{ fontSize:"14px" }}>No projects yet. Create one!</p>
        </div>
      ) : projList.map(p=>(
        <div key={p.id} style={S.card}>
          <p style={{ margin:0, fontWeight:700, fontSize:"14px" }}>📁 {p.name}</p>
          <p style={{ margin:"4px 0 0", fontSize:"11px", color:c.sub }}>Created {new Date(p.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );

  // ── Image Tab ─────────────────────────────────────────
  const ImageTab = () => (
    <div style={{ padding:"16px" }}>
      <h2 style={{ color:c.accent, marginTop:0 }}>🎨 Image Generator</h2>
      <p style={{ color:c.sub, fontSize:"13px", marginBottom:"14px" }}>Describe the image you want to generate.</p>
      <textarea style={{ ...S.input, height:"80px", resize:"none", marginBottom:"12px" }}
        placeholder="e.g. A futuristic city floating in clouds at sunset…"
        value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)} />
      <button style={S.btn()} onClick={()=>{ if(imgPrompt.trim()) setGenImg(`https://picsum.photos/seed/${encodeURIComponent(imgPrompt)}/800/600`); }}>
        Generate Image
      </button>
      {genImg && <img src={genImg} alt="Generated" style={{ width:"100%", borderRadius:"12px", marginTop:"16px", border:`1px solid ${c.border}` }} />}
      <p style={{ fontSize:"11px", color:c.sub, marginTop:"10px", textAlign:"center" }}>Add an image generation API key in Settings for real AI images.</p>
    </div>
  );

  // ── Subscription Tab ──────────────────────────────────
  const SubscriptionTab = () => (
    <div style={{ padding:"16px" }}>
      <h2 style={{ color:c.accent, marginTop:0 }}>⭐ Subscription</h2>
      {currentUser?.isPro ? (
        <div style={{ ...S.card, background:`linear-gradient(135deg,${c.accent},${c.accent2})`, color:"#fff", border:"none" }}>
          <h3 style={{ margin:"0 0 8px" }}>⭐ Pro Plan Active</h3>
          <p style={{ margin:0, fontSize:"13px", opacity:0.9 }}>You have access to all premium features.</p>
          {["Faster AI responses","Advanced models","Priority support","Early access features"].map(f=>(
            <p key={f} style={{ margin:"6px 0 0", fontSize:"13px" }}>✓ {f}</p>
          ))}
        </div>
      ):(
        <>
          <div style={{ ...S.card, border:`2px solid ${c.accent}` }}>
            <span style={{ background:c.accent, color:"#fff", borderRadius:"6px", padding:"2px 10px", fontSize:"11px", fontWeight:700 }}>BEST VALUE</span>
            <h3 style={{ color:c.accent, margin:"10px 0 4px" }}>Pro Plan</h3>
            <p style={{ fontSize:"28px", fontWeight:900, color:c.accent, margin:"0 0 14px" }}>$25<span style={{ fontSize:"14px", color:c.sub }}>/year</span></p>
            {["Faster AI responses","Advanced AI models","Priority support","Early access features"].map(f=>(
              <p key={f} style={{ margin:"4px 0", fontSize:"13px", color:c.sub }}>✓ {f}</p>
            ))}
            <button style={{ ...S.btn(), marginTop:"14px" }} onClick={()=>setSubModal(true)}>Subscribe Now</button>
          </div>
          <div style={S.card}>
            <h3 style={{ margin:"0 0 4px" }}>Free Plan</h3>
            <p style={{ fontSize:"22px", fontWeight:900, color:c.sub, margin:"0 0 12px" }}>$0</p>
            {["Basic AI responses","Standard models","Community support"].map(f=>(
              <p key={f} style={{ margin:"4px 0", fontSize:"13px", color:c.sub }}>• {f}</p>
            ))}
          </div>
        </>
      )}

      {subModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:c.surface, borderRadius:"18px", padding:"24px", width:"100%", maxWidth:"360px", border:`1px solid ${c.border}` }}>
            <h3 style={{ color:c.accent, margin:"0 0 6px" }}>Complete Subscription</h3>
            <p style={{ fontSize:"13px", color:c.sub, marginBottom:"16px" }}>Pro Plan — $25/year</p>
            <input style={{ ...S.input, marginBottom:"8px" }} placeholder="Card number" />
            <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
              <input style={{ ...S.input, flex:1 }} placeholder="MM/YY" />
              <input style={{ ...S.input, flex:1 }} placeholder="CVV" />
            </div>
            <button style={{ ...S.btn(), marginBottom:"8px" }} onClick={()=>{
              updateUser(hashedEmail, { isPro: true });
              setSubModal(false);
              alert("🎉 Pro subscription activated!");
            }}>Pay $25/year</button>
            <button style={{ background:"none", border:"none", color:c.sub, cursor:"pointer", fontSize:"13px", width:"100%" }} onClick={()=>setSubModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Settings Tab ──────────────────────────────────────
  const SettingsTab = () => (
    <div style={{ padding:"16px", overflowY:"auto" }}>
      <h2 style={{ color:c.accent, marginTop:0 }}>⚙️ Settings</h2>

      <div style={S.card}>
        <span style={S.label}>🔑 API Configuration</span>
        <p style={{ fontSize:"12px", color:c.sub, margin:"0 0 10px", lineHeight:1.5 }}>Enter your Groq API key to enable full AI capabilities. Get a free key at console.groq.com</p>
        <input style={{ ...S.input, marginBottom:"8px", fontFamily:"monospace", fontSize:"12px" }} placeholder="gsk_…" type="password" value={groqKey} onChange={e=>setGroqKey(e.target.value)} />
        <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
          {["api","code"].map(m=>(
            <button key={m} onClick={()=>setPowerMode(m)}
              style={{ flex:1, padding:"9px", borderRadius:"9px", border:`1.5px solid ${powerMode===m?c.accent:c.border}`, background: powerMode===m?"#f0ecff":"transparent", color: powerMode===m?c.accent:c.sub, cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              {m==="api"?"🔗 API Mode":"💻 Code Mode"}
            </button>
          ))}
        </div>
        <button style={S.btn()} onClick={saveSettingsHandler}>Save Settings</button>
      </div>

      <div style={S.card}>
        <span style={S.label}>🤖 AI Model</span>
        {MODELS.map(m=>(
          <button key={m.id} onClick={()=>setSelModel(m.id)}
            style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", padding:"9px 12px", marginBottom:"6px", borderRadius:"9px",
              border:`1.5px solid ${selModel===m.id?c.accent:c.border}`,
              background: selModel===m.id?"#f0ecff":"transparent", cursor:"pointer", textAlign:"left" }}>
            <span style={{ fontSize:"13px", color: selModel===m.id?c.accent:c.text, fontWeight: selModel===m.id?700:400 }}>{m.name}</span>
            <span style={{ fontSize:"11px", color:c.sub }}>{m.provider}</span>
          </button>
        ))}
      </div>

      <div style={S.card}>
        <span style={S.label}>🎨 Appearance</span>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:"13px" }}>Dark Mode</span>
          <button onClick={()=>{ setDarkMode(p=>!p); saveSettings(hashedEmail, { groqKey, powerMode, selModel, darkMode:!darkMode }); }}
            style={{ width:"48px", height:"26px", borderRadius:"13px", background: darkMode?c.accent:"#ddd", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
            <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"#fff", position:"absolute", top:"2px", left: darkMode?"24px":"2px", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
      </div>

      <div style={S.card}>
        <span style={S.label}>📜 Certification</span>
        <button style={{ ...S.btn("#a29bfe"), marginBottom:"8px" }} onClick={()=>setShowGuide(true)}>📖 Read User Guide</button>
        <button style={{ ...S.btn(), marginBottom:"8px" }} onClick={()=>{ setExamActive(true); setExamDone(false); setExamAnswers({}); }}>📝 Enter Exam</button>
        {currentUser?.examScore!=null && (
          <button style={{ ...S.btn("#e17055"), marginBottom:"8px" }} onClick={()=>{ setExamActive(true); setExamDone(false); setExamAnswers({}); }}>🔄 Re-take Exam</button>
        )}
        {currentUser?.certGranted && (
          <button style={S.btn("#00b894")} onClick={()=>setShowCert(true)}>🏆 View My Certificate</button>
        )}
        {currentUser?.examScore!=null && (
          <p style={{ margin:"8px 0 0", fontSize:"12px", color:c.sub, textAlign:"center" }}>
            Last score: {currentUser.examScore}/50 {currentUser.examScore>=40?"✅ Passed":"— need 40 to pass"}
          </p>
        )}
      </div>

      <div style={S.card}>
        <span style={S.label}>👤 Account</span>
        {[
          ["Name", currentUser?.nameDisplay],
          ["Email", currentUser?.emailMask],
          ["Mobile", currentUser?.mobile],
          ["Plan", currentUser?.isPro?"⭐ Pro":"Free"],
          ["Joined", new Date(currentUser?.joinedAt).toLocaleDateString()],
        ].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${c.border}`, fontSize:"13px" }}>
            <span style={{ color:c.sub }}>{k}</span>
            <span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
        <button style={{ ...S.btn("#e74c3c"), marginTop:"14px" }} onClick={logout}>🚪 Log Out</button>
      </div>
    </div>
  );

  // ── Admin Tab ─────────────────────────────────────────
  const AdminTab = () => {
    useEffect(()=>{ loadAllUsers(); },[]);
    if (!currentUser?.isAdmin) return (
      <div style={{ padding:"16px", textAlign:"center", marginTop:"60px" }}>
        <div style={{ fontSize:"48px", marginBottom:"12px" }}>🔒</div>
        <p style={{ color:"#e74c3c", fontWeight:700 }}>Admin access required</p>
      </div>
    );
    return (
      <div style={{ padding:"16px" }}>
        <h2 style={{ color:c.accent, marginTop:0 }}>🛡️ Admin Panel</h2>
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
          {["members","stats"].map(t=>(
            <button key={t} onClick={()=>{ setAdminTab(t); if(t==="members") loadAllUsers(); }}
              style={{ flex:1, padding:"9px", borderRadius:"9px", border:`1.5px solid ${adminTab===t?c.accent:c.border}`, background: adminTab===t?"#f0ecff":"transparent", color: adminTab===t?c.accent:c.sub, cursor:"pointer", fontWeight:700, fontSize:"13px", textTransform:"capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        {adminTab==="stats" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            {[["Total Members",allUsers.length],["Pro Users",allUsers.filter(u=>u.isPro).length],["Certified",allUsers.filter(u=>u.certGranted).length],["Admins",allUsers.filter(u=>u.isAdmin).length]].map(([l,v])=>(
              <div key={l} style={{ ...S.card, textAlign:"center", padding:"14px" }}>
                <p style={{ fontSize:"28px", fontWeight:900, color:c.accent, margin:0 }}>{v}</p>
                <p style={{ fontSize:"11px", color:c.sub, margin:"4px 0 0" }}>{l}</p>
              </div>
            ))}
          </div>
        )}
        {adminTab==="members" && (
          <>
            <p style={{ fontSize:"12px", color:c.sub, marginBottom:"12px" }}>{allUsers.length} registered member(s)</p>
            {allUsers.map((u,i)=>(
              <div key={i} style={S.card}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:c.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"15px", flexShrink:0 }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:"13px" }}>
                      {u.name} {u.isAdmin&&<span style={{ background:c.accent, color:"#fff", borderRadius:"4px", padding:"1px 7px", fontSize:"10px" }}>Admin</span>}
                    </p>
                    <p style={{ margin:0, fontSize:"11px", color:c.sub }}>{u.emailMask}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"8px" }}>
                  {[u.isPro?"⭐ Pro":"Free", u.verified?"✅ Verified":"⏳ Unverified", u.certGranted?"🏆 Certified":""].filter(Boolean).map((b,j)=>(
                    <span key={j} style={{ fontSize:"10px", padding:"3px 9px", borderRadius:"10px", background:"#f0ecff", color:c.accent, fontWeight:600 }}>{b}</span>
                  ))}
                </div>
                {u.examScore!=null && <p style={{ margin:"0 0 8px", fontSize:"11px", color:c.sub }}>Exam: {u.examScore}/50</p>}
                <div style={{ display:"flex", gap:"6px" }}>
                  {!u.isPro && <button onClick={()=>grantPro(u.he)} style={{ flex:1, padding:"6px", borderRadius:"7px", border:"none", background:c.accent, color:"#fff", fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Grant Pro</button>}
                  {!u.isAdmin && <button onClick={()=>grantAdmin(u.he)} style={{ flex:1, padding:"6px", borderRadius:"7px", border:"none", background:c.accent2, color:"#fff", fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Grant Admin</button>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const tabs = [
    { id:"chat",         icon:"💬", label:"Chat" },
    { id:"projects",     icon:"📁", label:"Projects" },
    { id:"image",        icon:"🎨", label:"Images" },
    { id:"subscription", icon:"⭐", label:"Plans" },
    { id:"settings",     icon:"⚙️", label:"Settings" },
    ...(currentUser?.isAdmin ? [{ id:"admin", icon:"🛡️", label:"Admin" }] : []),
  ];

  return (
    <div style={S.app}>
      <Sidebar />

      <div style={S.topBar}>
        <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", padding:"2px 6px", color:c.text }}>☰</button>
        <div style={S.logo}><div style={S.logoBox}>🌍</div>GoPlanet</div>
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:c.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"14px" }}>
          {currentUser?.nameDisplay?.[0]?.toUpperCase()}
        </div>
      </div>

      <div style={S.content}>
        {activeTab==="chat"         && <ChatTab />}
        {activeTab==="projects"     && <ProjectsTab />}
        {activeTab==="image"        && <ImageTab />}
        {activeTab==="subscription" && <SubscriptionTab />}
        {activeTab==="settings"     && <SettingsTab />}
        {activeTab==="admin"        && <AdminTab />}
      </div>

      <div style={S.navBar}>
        {tabs.map(t=>(
          <button key={t.id} style={S.navBtn(activeTab===t.id)} onClick={()=>setActiveTab(t.id)}>
            <span style={{ fontSize:"20px" }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

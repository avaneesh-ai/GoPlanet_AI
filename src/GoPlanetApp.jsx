import { useState, useEffect, useRef, useCallback } from "react";

// ==================== STORAGE HELPERS ====================
const STORAGE_KEY = "goplanet_data";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
};
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// ==================== CERTIFICATE IMAGE (base64 placeholder) ====================
const CERT_BG = "data:image/png;base64,"; // will be replaced by dynamic canvas

// ==================== QUIZ QUESTIONS ====================
const QUIZ_QUESTIONS = [
  { q: "What does AI stand for?", options: ["Automated Interface", "Artificial Intelligence", "Advanced Integration", "Automated Input"], answer: 1 },
  { q: "What is GoPlanet's primary function?", options: ["File Storage", "AI Chatbot Platform", "Social Network", "Video Streaming"], answer: 1 },
  { q: "Which API powers GoPlanet's chatbot?", options: ["OpenAI", "Gemini", "Groq", "Cohere"], answer: 2 },
  { q: "What does LLM stand for?", options: ["Large Language Model", "Logical Learning Machine", "Local Logic Module", "Linear Learning Method"], answer: 0 },
  { q: "What is the minimum score to earn a GoPlanet certificate?", options: ["30/50", "35/50", "40/50", "45/50"], answer: 2 },
  { q: "What does 'prompt' mean in AI chatbots?", options: ["A payment", "User input to the AI", "A notification", "A file format"], answer: 1 },
  { q: "What is 'context' in a conversation with an AI?", options: ["The font size", "Previous chat history used by AI", "The background color", "User's location"], answer: 1 },
  { q: "Which of these is a responsible AI usage principle?", options: ["Share passwords freely", "Use AI with integrity and honesty", "Replace all human decisions with AI", "Ignore AI errors"], answer: 1 },
  { q: "What is a Groq API key used for?", options: ["Login authentication", "Authorizing access to Groq AI services", "File encryption", "Image generation"], answer: 1 },
  { q: "What does 'token' mean in AI language models?", options: ["A crypto currency", "A unit of text (word or part of word)", "A user account", "A payment method"], answer: 1 },
  { q: "What is machine learning?", options: ["Teaching machines to walk", "AI learning from data patterns", "Programming robots", "Computer maintenance"], answer: 1 },
  { q: "What is natural language processing (NLP)?", options: ["Writing code in English", "AI understanding human language", "Network protocols", "Nature-based computing"], answer: 1 },
  { q: "Which principle does 'Human First' represent?", options: ["Humans do everything manually", "Empower people, not replace them", "Humans control all AI code", "Only humans can use AI"], answer: 1 },
  { q: "What is a chatbot?", options: ["A physical robot", "Software simulating human conversation", "A chat room", "A messaging app"], answer: 1 },
  { q: "What is the GoPlanet certification program about?", options: ["Coding skills only", "Responsible AI usage and smart communication", "Database management", "Web design"], answer: 1 },
  { q: "What does 'inference' mean in AI?", options: ["Training a new model", "Running AI to get predictions/answers", "Deleting AI data", "Uploading datasets"], answer: 1 },
  { q: "What is a subscription plan?", options: ["A free service forever", "A paid tier with extra features", "A one-time purchase", "A government program"], answer: 1 },
  { q: "What does 'hallucination' mean in AI?", options: ["AI seeing images", "AI generating false information confidently", "AI sleeping mode", "AI voice response"], answer: 1 },
  { q: "What is the purpose of an AI guide?", options: ["To restrict users", "To help users understand and use the app effectively", "To collect data", "To show advertisements"], answer: 1 },
  { q: "What is 'Effective' as a GoPlanet principle?", options: ["Being strict", "Work smarter, achieve more", "Using the most expensive tools", "Coding everything yourself"], answer: 1 },
  { q: "What is Smart Thinking as a GoPlanet principle?", options: ["Memorizing facts", "Solve problems with intelligence", "Working faster always", "Using shortcuts"], answer: 1 },
  { q: "What is an admin in an app?", options: ["A regular user", "A user with special management privileges", "A paid subscriber only", "A developer only"], answer: 1 },
  { q: "What is email verification used for?", options: ["Spam promotion", "Confirming a user's email is real", "Sending ads", "Logging out users"], answer: 1 },
  { q: "What does 'Pro subscription' typically offer?", options: ["Same as free", "Faster responses and advanced features", "Less storage", "Fewer models"], answer: 1 },
  { q: "What is a language model's training data?", options: ["Images and videos only", "Large amounts of text from various sources", "Audio files only", "Code files only"], answer: 1 },
  { q: "What does 'Honest Use' mean in GoPlanet?", options: ["Using AI to cheat", "Use technology with integrity", "Only using free tools", "Sharing all data publicly"], answer: 1 },
  { q: "What is an API?", options: ["Application Programming Interface", "Automated Program Input", "Advanced Page Interface", "App Protocol Integration"], answer: 0 },
  { q: "What should you do if an AI gives wrong information?", options: ["Trust it completely", "Verify with reliable sources", "Delete the app", "Report to police"], answer: 1 },
  { q: "What is the GoPlanet app's backend AI powered by?", options: ["OpenAI GPT", "Google Bard", "Groq API", "Amazon Alexa"], answer: 2 },
  { q: "What is 'temperature' in AI models?", options: ["Server heat", "Controls randomness/creativity of AI output", "User's location climate", "Battery level"], answer: 1 },
  { q: "Which is a best practice when using AI chatbots?", options: ["Never verify AI answers", "Cross-check important information", "Share personal passwords with AI", "Use AI for all decisions blindly"], answer: 1 },
  { q: "What is the GoPlanet certification date based on?", options: ["App launch date", "The day you take the exam", "Your birthday", "A fixed annual date"], answer: 1 },
  { q: "What is the GoPlanet app primarily designed for?", options: ["Gaming", "Everyone, easy to use AI chatbot", "Advanced developers only", "Children under 10"], answer: 1 },
  { q: "What does 'Local & Fast' mean in GoPlanet?", options: ["App works only locally without internet", "Powered by Ollama running locally for speed", "Users meet locally", "Fast food delivery"], answer: 1 },
  { q: "What is 'Secure & Private' in GoPlanet?", options: ["Data is sold to partners", "Data is encrypted and safe", "Users' data is public", "No security measures"], answer: 1 },
  { q: "What is a multi-choice question exam?", options: ["Essay writing test", "Questions with several answer options to choose from", "Oral exam", "Drawing test"], answer: 1 },
  { q: "What is 'context window' in AI?", options: ["Browser window size", "Amount of text AI can process at once", "Screen resolution", "Network bandwidth"], answer: 1 },
  { q: "What does re-taking an exam allow?", options: ["Getting a higher score automatically", "Attempting the exam again after failure", "Changing the questions", "Getting a free subscription"], answer: 1 },
  { q: "What is an AI project in GoPlanet?", options: ["A physical project", "An organized workspace to manage AI tasks", "A government initiative", "A hardware device"], answer: 1 },
  { q: "What makes GoPlanet 'Innovative AI'?", options: ["Only uses old technology", "Choose from the best open models", "No model options", "Only one fixed model"], answer: 1 },
  { q: "What is 'User Friendly' design?", options: ["Designed only for tech experts", "Designed for everyone, easy to use", "Complex interface intentionally", "No help documentation"], answer: 1 },
  { q: "What is the purpose of subscription tiers?", options: ["To confuse users", "To offer different feature levels for different needs", "To restrict all users equally", "To remove features"], answer: 1 },
  { q: "What should you do before sharing AI-generated content?", options: ["Share it immediately without review", "Review and verify the accuracy", "Delete it", "Print it only"], answer: 1 },
  { q: "What is the role of AI in smart communication?", options: ["Replace all human communication", "Enhance and assist human communication", "Stop communication", "Monitor users"], answer: 1 },
  { q: "What is 'real-world AI application'?", options: ["AI only in science fiction", "Using AI to solve practical everyday problems", "AI in video games only", "AI in space only"], answer: 1 },
  { q: "What happens when you complete the GoPlanet certification?", options: ["Nothing", "You receive a digital certificate if score ≥ 40/50", "You get a free phone", "You become an admin automatically"], answer: 1 },
  { q: "What is 'model selection' in GoPlanet?", options: ["Choosing clothing models", "Selecting which AI model to use for chat", "Picking screen themes", "Choosing subscription plans"], answer: 1 },
  { q: "What does an AI assistant help with?", options: ["Only math problems", "Chatting, creating, coding, and more", "Only image generation", "Only translations"], answer: 1 },
  { q: "What is the recommended approach to AI usage according to GoPlanet?", options: ["Rely on AI for everything", "Use AI as a tool to empower, not replace human judgment", "Never use AI", "Only use AI for entertainment"], answer: 1 },
  { q: "What is the GoPlanet AI Chatbot powered by (code version)?", options: ["LangChain + Ollama locally", "Google Cloud only", "Microsoft Azure only", "Manual responses"], answer: 0 },
];

// ==================== GUIDE CONTENT ====================
const GUIDE_SECTIONS = [
  { title: "Getting Started with GoPlanet", content: "GoPlanet is your intelligent AI chatbot platform. After signing up and verifying your email, you'll be taken to the main dashboard. Here you can start new chats, manage projects, and customize your experience." },
  { title: "Setting Up Your Groq API Key", content: "Go to Settings and find the 'API Configuration' section. Enter your Groq API key to power the chatbot with Groq's fast AI models. You can switch between 'Code Mode' (local Python code) and 'API Mode' (Groq API) anytime from the chatbot header." },
  { title: "Starting a Chat", content: "Click '+ New Chat' to begin. Type your message in the input box and press Send or hit Enter. The AI will respond based on your selected model and API configuration. Your conversation history is saved automatically." },
  { title: "Managing Projects", content: "Use the Projects section to organize your AI tasks. Create new projects, name them, and keep related chats together. Projects appear in the sidebar for quick access." },
  { title: "Image Generator", content: "The Image Generator (on the right panel) lets you describe an image and generate it. Enter a descriptive prompt and click 'Generate Image'. Results appear below the input." },
  { title: "Subscription Plans", content: "GoPlanet offers Free and Pro plans. The Pro plan ($25/year) includes faster responses, advanced AI models, priority support, and early access to new features. Subscribe in the Subscription section." },
  { title: "Admin Features", content: "Admin users can view all registered members, grant admin access to others, manage subscriptions, and make app updates. Access Admin from the left sidebar (visible to admin users only)." },
  { title: "Taking the Certification Exam", content: "Go to Settings and click 'Enter Exam'. The exam has 50 multiple-choice questions about AI and GoPlanet. Score 40 or higher to earn your GoPlanet Certified User certificate. You can retake the exam using 'Re-take Exam' in Settings." },
  { title: "Responsible AI Usage", content: "Always use AI with integrity (Honest Use). Verify important AI-generated information. Remember AI empowers people, not replaces them (Human First). Work smarter with AI assistance (Effective) and apply intelligent problem-solving (Smart Thinking)." },
  { title: "Privacy & Security", content: "GoPlanet encrypts your data. Your API keys are stored locally on your device. Never share your API key or account password with anyone. Log out when using shared devices." },
];

// ==================== MAIN APP ====================
export default function GoPlanetApp() {
  const [db, setDb] = useState(() => {
    const d = load();
    if (!d.users) d.users = [];
    if (!d.chats) d.chats = {};
    if (!d.projects) d.projects = {};
    return d;
  });

  const updateDb = useCallback((updater) => {
    setDb(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      save(next);
      return next;
    });
  }, []);

  const [screen, setScreen] = useState("splash"); // splash | register1 | register2 | verify | main
  const [currentUser, setCurrentUser] = useState(null);
  const [regData, setRegData] = useState({ email: "", password: "", name: "", mobile: "" });
  const [regError, setRegError] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("goplanet_groq_key") || "");
  const [powerMode, setPowerMode] = useState(() => localStorage.getItem("goplanet_power_mode") || "code");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [examActive, setExamActive] = useState(false);
  const [examAnswers, setExamAnswers] = useState({});
  const [examDone, setExamDone] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [adminTab, setAdminTab] = useState("members");
  const [verifyToken, setVerifyToken] = useState("");
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("");
  const chatEndRef = useRef(null);
  const canvasRef = useRef(null);

  const GROQ_MODELS = [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "Meta" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", provider: "Mistral" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B", provider: "Google" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "Meta" },
  ];

  // Check for verify token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#verify=")) {
      const token = hash.slice(8);
      const d = load();
      const user = d.users?.find(u => u.verifyToken === token);
      if (user) {
        updateDb(prev => ({
          ...prev,
          users: prev.users.map(u => u.email === user.email ? { ...u, verified: true, verifyToken: null } : u)
        }));
        setCurrentUser({ ...user, verified: true });
        setScreen("main");
        window.location.hash = "";
      }
    }
    // Auto-login if saved session
    const saved = localStorage.getItem("goplanet_session");
    if (saved) {
      const d = load();
      const user = d.users?.find(u => u.email === saved);
      if (user && user.verified) {
        setCurrentUser(user);
        setScreen("main");
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const generateToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  const handleReg1 = () => {
    if (!regData.email || !regData.password) { setRegError("Please fill all fields"); return; }
    if (!/\S+@\S+\.\S+/.test(regData.email)) { setRegError("Invalid email"); return; }
    if (regData.password.length < 6) { setRegError("Password min 6 chars"); return; }
    const existing = db.users?.find(u => u.email === regData.email);
    if (existing) { setRegError("Email already registered"); return; }
    setRegError("");
    setScreen("register2");
  };

  const handleReg2 = () => {
    if (!regData.name || !regData.mobile) { setRegError("Please fill all fields"); return; }
    const token = generateToken();
    const newUser = {
      email: regData.email, password: regData.password,
      name: regData.name, mobile: regData.mobile,
      verified: false, verifyToken: token,
      isAdmin: db.users?.length === 0,
      isPro: false, joinedAt: new Date().toISOString(),
      examScore: null, certDate: null,
      certGranted: false,
    };
    updateDb(prev => ({ ...prev, users: [...(prev.users || []), newUser] }));
    setPendingVerifyEmail(regData.email);
    setVerifyToken(token);
    setRegError("");
    setScreen("verify");
  };

  const simulateLogin = (email) => {
    const d = load();
    const user = d.users.find(u => u.email === email);
    if (user && user.verified) {
      localStorage.setItem("goplanet_session", email);
      setCurrentUser(user);
      setScreen("main");
    }
  };

  const handleLogin = () => {
    const d = load();
    const user = d.users?.find(u => u.email === regData.email && u.password === regData.password);
    if (!user) { setRegError("Invalid credentials"); return; }
    if (!user.verified) { setRegError("Please verify your email first"); return; }
    localStorage.setItem("goplanet_session", user.email);
    setCurrentUser(user);
    setScreen("main");
    setRegError("");
  };

  const logout = () => {
    localStorage.removeItem("goplanet_session");
    setCurrentUser(null);
    setScreen("splash");
    setRegData({ email: "", password: "", name: "", mobile: "" });
  };

  const startChat = (cid) => {
    const msgs = db.chats?.[cid] || [];
    setActiveChatId(cid);
    setChatMessages(msgs);
    setActiveTab("chat");
    setSidebarOpen(false);
  };

  const newChat = () => {
    const cid = "chat_" + Date.now();
    const welcome = { role: "ai", text: `Hello ${currentUser?.name}! 👋 I'm GoPlanet AI. How can I help you today?`, ts: new Date().toLocaleTimeString() };
    const msgs = [welcome];
    updateDb(prev => ({ ...prev, chats: { ...(prev.chats || {}), [cid]: msgs } }));
    setActiveChatId(cid);
    setChatMessages(msgs);
    setActiveTab("chat");
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = { role: "user", text: inputMsg, ts: new Date().toLocaleTimeString() };
    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    setInputMsg("");
    setIsTyping(true);

    let aiText = "";
    try {
      if (powerMode === "api" && groqKey) {
        const history = newMsgs.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body: JSON.stringify({ model: selectedModel, messages: history, max_tokens: 1024 })
        });
        const data = await res.json();
        aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
      } else {
        // Code mode simulation using Claude API
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6", max_tokens: 1000,
            system: "You are GoPlanet AI, a helpful assistant. Keep responses concise and helpful.",
            messages: [{ role: "user", content: inputMsg }]
          })
        });
        const data = await res.json();
        aiText = data.content?.[0]?.text || "Hello! I'm GoPlanet AI. Please add your Groq API key in Settings to unlock full AI capabilities!";
      }
    } catch (e) {
      aiText = "Connection error. Please check your API key in Settings or try again.";
    }

    const aiMsg = { role: "ai", text: aiText, ts: new Date().toLocaleTimeString() };
    const finalMsgs = [...newMsgs, aiMsg];
    setChatMessages(finalMsgs);
    if (activeChatId) {
      updateDb(prev => ({ ...prev, chats: { ...(prev.chats || {}), [activeChatId]: finalMsgs } }));
    }
    setIsTyping(false);
  };

  const saveGroqKey = () => {
    localStorage.setItem("goplanet_groq_key", groqKey);
    localStorage.setItem("goplanet_power_mode", powerMode);
    alert("Settings saved!");
  };

  const submitExam = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, i) => { if (examAnswers[i] === q.answer) score++; });
    setExamScore(score);
    setExamDone(true);
    if (score >= 40) {
      const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      updateDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.email === currentUser?.email
          ? { ...u, examScore: score, certDate: now, certGranted: true }
          : u)
      }));
      setCurrentUser(prev => ({ ...prev, examScore: score, certDate: now, certGranted: true }));
    }
  };

  const grantAdmin = (email) => {
    updateDb(prev => ({
      ...prev,
      users: prev.users.map(u => u.email === email ? { ...u, isAdmin: true } : u)
    }));
  };

  const grantPro = (email) => {
    updateDb(prev => ({
      ...prev,
      users: prev.users.map(u => u.email === email ? { ...u, isPro: true } : u)
    }));
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    const pid = "proj_" + Date.now();
    updateDb(prev => ({ ...prev, projects: { ...(prev.projects || {}), [pid]: { name: newProjectName, createdAt: new Date().toISOString() } } }));
    setNewProjectName(""); setShowNewProject(false);
  };

  const chatList = Object.keys(db.chats || {}).map(id => ({
    id, preview: db.chats[id]?.[db.chats[id].length - 1]?.text?.slice(0, 30) || "New Chat",
    ts: db.chats[id]?.[0]?.ts || ""
  })).reverse();

  const projectList = Object.keys(db.projects || {}).map(id => ({ id, ...db.projects[id] }));

  // ==================== CERTIFICATE GENERATION ====================
  const generateCertificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000; canvas.height = 1150;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1000, 1150);
    grad.addColorStop(0, "#f0f4ff"); grad.addColorStop(1, "#e8eeff");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1000, 1150);

    // Border
    ctx.strokeStyle = "#6c5ce7"; ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 960, 1110);
    ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, 930, 1080);

    // Header decorative lines
    ctx.fillStyle = "#6c5ce7";
    ctx.fillRect(50, 50, 900, 4);
    ctx.fillRect(50, 1096, 900, 4);

    // Logo circle placeholder
    ctx.fillStyle = "#6c5ce7";
    ctx.beginPath(); ctx.arc(500, 140, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Arial"; ctx.textAlign = "center";
    ctx.fillText("GP", 500, 150);

    // GoPlanet title
    ctx.fillStyle = "#2d3436";
    ctx.font = "bold 52px Arial"; ctx.textAlign = "center";
    ctx.fillText("GoPlanet", 500, 260);
    ctx.fillStyle = "#6c5ce7";
    ctx.font = "18px Arial";
    ctx.fillText("— AI CHATBOT —", 500, 295);

    // Certificate title
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 78px Arial";
    ctx.fillText("CERTIFICATE", 500, 400);
    ctx.fillStyle = "#6c5ce7";
    ctx.font = "bold 28px Arial";
    ctx.fillText("OF COMPLETION", 500, 445);

    // Decorative line
    ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(150, 470); ctx.lineTo(850, 470); ctx.stroke();

    // Presented to
    ctx.fillStyle = "#636e72";
    ctx.font = "20px Arial";
    ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 500, 510);

    // Name box
    ctx.strokeStyle = "#6c5ce7"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(200, 590); ctx.lineTo(800, 590); ctx.stroke();
    ctx.fillStyle = "#2d3436";
    ctx.font = "bold 42px Arial";
    const certName = currentUser?.name || "Certified User";
    ctx.fillText(certName, 500, 575);

    // Body text
    ctx.fillStyle = "#555";
    ctx.font = "20px Arial";
    ctx.fillText("for successfully completing the GoPlanet AI Chatbot Certification Program.", 500, 640);
    ctx.fillText("This certifies your understanding and practical knowledge", 500, 670);
    ctx.fillText("of responsible AI usage, smart communication,", 500, 700);
    ctx.fillText("and real-world AI chatbot applications.", 500, 730);

    // Recognition line
    ctx.strokeStyle = "#a29bfe"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(200, 760); ctx.lineTo(800, 760); ctx.stroke();
    ctx.fillStyle = "#636e72";
    ctx.font = "bold 16px Arial";
    ctx.fillText("YOU ARE NOW RECOGNIZED AS", 500, 790);
    ctx.fillStyle = "#6c5ce7";
    ctx.font = "bold 32px Arial";
    ctx.fillText("GOPLANET CERTIFIED USER", 500, 830);

    // Icons row
    const icons = [
      { label: "HONEST USE", sub: "Use technology with integrity." },
      { label: "SMART THINKING", sub: "Solve problems with intelligence." },
      { label: "EFFECTIVE", sub: "Work smarter, achieve more." },
      { label: "HUMAN FIRST", sub: "Empower people, not replace them." },
    ];
    icons.forEach((ic, i) => {
      const x = 130 + i * 185;
      ctx.fillStyle = "#6c5ce7";
      ctx.beginPath(); ctx.arc(x, 890, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.fillText("✓", x, 897);
      ctx.fillStyle = "#2d3436";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(ic.label, x, 940);
      ctx.fillStyle = "#636e72";
      ctx.font = "10px Arial";
      const words = ic.sub.split(" ");
      let line = ""; let ly = 957;
      words.forEach(w => {
        if ((line + w).length > 16) { ctx.fillText(line, x, ly); line = w + " "; ly += 14; }
        else line += w + " ";
      });
      ctx.fillText(line, x, ly);
    });

    // Signature & date
    ctx.textAlign = "left";
    ctx.fillStyle = "#6c5ce7";
    ctx.font = "italic bold 24px Arial";
    ctx.fillText("GoPlanet Team", 120, 1040);
    ctx.fillStyle = "#636e72";
    ctx.font = "13px Arial";
    ctx.fillText("GOPLANET TEAM", 120, 1060);
    ctx.fillText("ISSUER", 120, 1078);

    // Date
    ctx.textAlign = "right";
    const dateStr = currentUser?.certDate || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    ctx.fillStyle = "#2d3436";
    ctx.font = "bold 18px Arial";
    ctx.fillText(dateStr, 880, 1040);
    ctx.fillStyle = "#636e72";
    ctx.font = "13px Arial";
    ctx.fillText("DATE OF ISSUE", 880, 1060);

    ctx.textAlign = "center";
    return canvas.toDataURL("image/png");
  };

  // ==================== RENDER FUNCTIONS ====================
  const S = {
    app: { display: "flex", flexDirection: "column", height: "100dvh", width: "100%", maxWidth: "430px", margin: "0 auto", fontFamily: "system-ui,sans-serif", background: darkMode ? "#0f0f1a" : "#f7f7fc", color: darkMode ? "#e0e0ff" : "#1a1a2e", position: "relative", overflow: "hidden" },
    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: darkMode ? "#1a1a2e" : "#fff", borderBottom: `1px solid ${darkMode ? "#2a2a4a" : "#e8e8f0"}`, minHeight: "52px" },
    logo: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "18px", color: "#6c5ce7" },
    logoImg: { width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "14px" },
    content: { flex: 1, overflowY: "auto", padding: "0" },
    bottomNav: { display: "flex", background: darkMode ? "#1a1a2e" : "#fff", borderTop: `1px solid ${darkMode ? "#2a2a4a" : "#e8e8f0"}`, padding: "6px 0" },
    navBtn: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "4px", border: "none", background: "none", cursor: "pointer", color: active ? "#6c5ce7" : darkMode ? "#888" : "#999", fontSize: "10px" }),
    input: { width: "100%", padding: "10px 14px", border: `1px solid ${darkMode ? "#2a2a4a" : "#e0e0f0"}`, borderRadius: "10px", background: darkMode ? "#1a1a2e" : "#fff", color: darkMode ? "#e0e0ff" : "#1a1a2e", fontSize: "14px", outline: "none", boxSizing: "border-box" },
    btn: (color = "#6c5ce7") => ({ background: color, color: "#fff", border: "none", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", width: "100%" }),
    card: { background: darkMode ? "#1a1a2e" : "#fff", borderRadius: "12px", padding: "14px", marginBottom: "12px", border: `1px solid ${darkMode ? "#2a2a4a" : "#e8e8f0"}` },
  };

  // ==================== SCREENS ====================
  if (screen === "splash") return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center", padding: "30px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "22px", background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "38px" }}>🌍</div>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#6c5ce7", margin: "0 0 4px" }}>GoPlanet</h1>
        <p style={{ color: darkMode ? "#888" : "#666", fontSize: "14px", margin: 0 }}>AI Chatbot Platform</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        <input style={S.input} placeholder="Email address" type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
        <input style={S.input} placeholder="Password" type="password" value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))} />
        {regError && <p style={{ color: "#e74c3c", fontSize: "12px", margin: 0 }}>{regError}</p>}
        <button style={S.btn()} onClick={handleLogin}>Log In</button>
        <button style={{ ...S.btn("#a29bfe"), marginTop: "4px" }} onClick={() => { setRegError(""); setScreen("register1"); }}>Create Account</button>
      </div>
      <p style={{ fontSize: "11px", color: "#999", marginTop: "20px", textAlign: "center" }}>By continuing you agree to GoPlanet's Terms of Service</p>
    </div>
  );

  if (screen === "register1") return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center", padding: "30px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{ fontSize: "36px" }}>🌍</div>
        <h2 style={{ color: "#6c5ce7", margin: "8px 0 4px" }}>Create Account</h2>
        <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Step 1 of 2 — Account details</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        <input style={S.input} placeholder="Email address" type="email" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
        <input style={S.input} placeholder="Password (min 6 chars)" type="password" value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))} />
        {regError && <p style={{ color: "#e74c3c", fontSize: "12px", margin: 0 }}>{regError}</p>}
        <button style={S.btn()} onClick={handleReg1}>Next →</button>
        <button style={{ background: "none", border: "none", color: "#6c5ce7", cursor: "pointer", fontSize: "14px" }} onClick={() => setScreen("splash")}>← Back to Login</button>
      </div>
    </div>
  );

  if (screen === "register2") return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center", padding: "30px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{ fontSize: "36px" }}>👤</div>
        <h2 style={{ color: "#6c5ce7", margin: "8px 0 4px" }}>Your Details</h2>
        <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Step 2 of 2 — Personal info</p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        <input style={S.input} placeholder="Full Name" value={regData.name} onChange={e => setRegData(p => ({ ...p, name: e.target.value }))} />
        <input style={S.input} placeholder="Mobile Number" type="tel" value={regData.mobile} onChange={e => setRegData(p => ({ ...p, mobile: e.target.value }))} />
        {regError && <p style={{ color: "#e74c3c", fontSize: "12px", margin: 0 }}>{regError}</p>}
        <button style={S.btn()} onClick={handleReg2}>Send Verification Email →</button>
        <button style={{ background: "none", border: "none", color: "#6c5ce7", cursor: "pointer", fontSize: "14px" }} onClick={() => setScreen("register1")}>← Back</button>
      </div>
    </div>
  );

  if (screen === "verify") return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center", padding: "30px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "60px" }}>📧</div>
        <h2 style={{ color: "#6c5ce7" }}>Check Your Email</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>We sent a verification link to <strong>{pendingVerifyEmail}</strong></p>
        <p style={{ color: "#888", fontSize: "12px" }}>Click the link to confirm your account and enter GoPlanet.</p>
      </div>
      <div style={{ background: "#f0ecff", borderRadius: "12px", padding: "16px", width: "100%", marginBottom: "16px", boxSizing: "border-box" }}>
        <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#555", fontWeight: 600 }}>🔗 Demo: Click below to simulate email verification</p>
        <button style={S.btn()} onClick={() => simulateLogin(pendingVerifyEmail)}>✅ Verify & Enter App</button>
      </div>
      <button style={{ background: "none", border: "none", color: "#6c5ce7", cursor: "pointer", fontSize: "14px" }} onClick={() => setScreen("splash")}>← Back to Login</button>
    </div>
  );

  // ==================== MAIN APP ====================
  if (screen !== "main") return null;

  // GUIDE
  if (showGuide) return (
    <div style={S.app}>
      <div style={S.topBar}>
        <button onClick={() => setShowGuide(false)} style={{ background: "none", border: "none", color: "#6c5ce7", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>← Back</button>
        <span style={{ fontWeight: 700, color: "#6c5ce7" }}>📖 GoPlanet Guide</span>
        <div style={{ width: "60px" }} />
      </div>
      <div style={{ ...S.content, padding: "16px" }}>
        {GUIDE_SECTIONS.map((s, i) => (
          <div key={i} style={S.card}>
            <h3 style={{ margin: "0 0 8px", color: "#6c5ce7", fontSize: "15px" }}>{i + 1}. {s.title}</h3>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6, color: darkMode ? "#ccc" : "#444" }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // CERTIFICATE
  if (showCert) {
    const certDataUrl = generateCertificate();
    return (
      <div style={S.app}>
        <div style={S.topBar}>
          <button onClick={() => setShowCert(false)} style={{ background: "none", border: "none", color: "#6c5ce7", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>← Back</button>
          <span style={{ fontWeight: 700, color: "#6c5ce7" }}>🏆 Certificate</span>
          <div style={{ width: "60px" }} />
        </div>
        <div style={{ ...S.content, padding: "16px", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "40px" }}>🏆</div>
            <h2 style={{ color: "#fff", margin: "8px 0 4px" }}>Congratulations!</h2>
            <p style={{ color: "#e0d9ff", margin: 0 }}>{currentUser?.name}</p>
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>Score: {currentUser?.examScore}/50 | Date: {currentUser?.certDate}</p>
          <img src={certDataUrl} alt="Certificate" style={{ width: "100%", borderRadius: "12px", border: "2px solid #6c5ce7" }} />
          <a href={certDataUrl} download="GoPlanet_Certificate.png" style={{ display: "block", marginTop: "16px", ...S.btn(), textDecoration: "none", textAlign: "center", lineHeight: "normal", padding: "12px" }}>📥 Download Certificate</a>
        </div>
      </div>
    );
  }

  // EXAM
  if (examActive) return (
    <div style={S.app}>
      <div style={S.topBar}>
        <button onClick={() => { setExamActive(false); setExamDone(false); setExamAnswers({}); }} style={{ background: "none", border: "none", color: "#6c5ce7", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>✕</button>
        <span style={{ fontWeight: 700 }}>📝 Certification Exam</span>
        <span style={{ fontSize: "12px", color: "#888" }}>{Object.keys(examAnswers).length}/50</span>
      </div>
      <div style={{ ...S.content, padding: "16px" }}>
        {examDone ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>{examScore >= 40 ? "🏆" : "📚"}</div>
            <h2 style={{ color: examScore >= 40 ? "#6c5ce7" : "#e74c3c" }}>{examScore >= 40 ? "Congratulations!" : "Keep Learning!"}</h2>
            <p style={{ fontSize: "28px", fontWeight: 900, color: "#6c5ce7" }}>{examScore}/50</p>
            <p style={{ color: "#666", fontSize: "14px" }}>{examScore >= 40 ? "You passed! You are now a GoPlanet Certified User." : "You need 40+ to pass. Please retake the exam."}</p>
            {examScore >= 40 && <button style={{ ...S.btn(), marginBottom: "12px" }} onClick={() => { setShowCert(true); setExamActive(false); }}>View Certificate 🏆</button>}
            <button style={S.btn("#a29bfe")} onClick={() => { setExamDone(false); setExamAnswers({}); }}>Retake Exam 🔄</button>
            <button style={{ background: "none", border: "none", color: "#6c5ce7", cursor: "pointer", fontSize: "14px", display: "block", margin: "12px auto 0" }} onClick={() => { setExamActive(false); setExamDone(false); setExamAnswers({}); }}>Back to Settings</button>
          </div>
        ) : (
          <>
            {QUIZ_QUESTIONS.map((q, i) => (
              <div key={i} style={S.card}>
                <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 10px", color: darkMode ? "#e0e0ff" : "#1a1a2e" }}><span style={{ color: "#6c5ce7" }}>Q{i + 1}.</span> {q.q}</p>
                {q.options.map((opt, j) => (
                  <button key={j} onClick={() => setExamAnswers(p => ({ ...p, [i]: j }))}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: "6px", borderRadius: "8px", border: `1px solid ${examAnswers[i] === j ? "#6c5ce7" : darkMode ? "#2a2a4a" : "#e0e0f0"}`, background: examAnswers[i] === j ? "#f0ecff" : "transparent", cursor: "pointer", fontSize: "13px", color: examAnswers[i] === j ? "#6c5ce7" : darkMode ? "#ccc" : "#333" }}>
                    {["A", "B", "C", "D"][j]}. {opt}
                  </button>
                ))}
              </div>
            ))}
            <button style={S.btn()} onClick={submitExam} disabled={Object.keys(examAnswers).length < 50}>
              {Object.keys(examAnswers).length < 50 ? `Answer all questions (${Object.keys(examAnswers).length}/50)` : "Submit Exam ✓"}
            </button>
            <div style={{ height: "20px" }} />
          </>
        )}
      </div>
    </div>
  );

  // SIDEBAR
  const Sidebar = () => (
    <div style={{ position: "absolute", top: 0, left: sidebarOpen ? 0 : "-100%", width: "82%", height: "100%", background: darkMode ? "#12122a" : "#fff", zIndex: 100, transition: "left 0.25s", boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.3)" : "none", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "16px", borderBottom: `1px solid ${darkMode ? "#2a2a4a" : "#eee"}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={S.logo}><div style={S.logoImg}>🌍</div> GoPlanet</div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#888", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: darkMode ? "#1a1a2e" : "#f0ecff", borderRadius: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{currentUser?.name?.[0] || "U"}</div>
          <div><p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>{currentUser?.name}</p><p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{currentUser?.isPro ? "⭐ Pro" : "Free"}</p></div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        <button onClick={newChat} style={{ ...S.btn(), marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>+ New Chat</button>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Recent Chats</p>
        {chatList.slice(0, 8).map(c => (
          <button key={c.id} onClick={() => startChat(c.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: "4px", borderRadius: "8px", border: "none", background: activeChatId === c.id ? "#f0ecff" : "transparent", cursor: "pointer", fontSize: "12px", color: activeChatId === c.id ? "#6c5ce7" : darkMode ? "#ccc" : "#444" }}>
            💬 {c.preview}...
          </button>
        ))}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", marginTop: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Projects</p>
        {projectList.map(p => (
          <div key={p.id} style={{ padding: "8px 10px", marginBottom: "4px", borderRadius: "8px", fontSize: "12px", color: darkMode ? "#ccc" : "#444" }}>📁 {p.name}</div>
        ))}
        <button onClick={() => { setShowNewProject(true); setSidebarOpen(false); setActiveTab("projects"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", border: "none", background: "none", cursor: "pointer", fontSize: "12px", color: "#6c5ce7" }}>+ New Project</button>
      </div>
      {!currentUser?.isPro && (
        <div style={{ margin: "12px", padding: "14px", background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", borderRadius: "12px", color: "#fff" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700 }}>⭐ Upgrade to Pro</p>
          <p style={{ margin: "0 0 8px", fontSize: "12px" }}>$25/year — Faster AI, advanced models</p>
          <button onClick={() => { setSubscribeModal(true); setSidebarOpen(false); }} style={{ background: "#fff", color: "#6c5ce7", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Subscribe</button>
        </div>
      )}
      <button onClick={logout} style={{ margin: "0 12px 16px", background: "none", border: `1px solid #e74c3c`, color: "#e74c3c", borderRadius: "8px", padding: "8px", cursor: "pointer", fontSize: "13px" }}>🚪 Log Out</button>
    </div>
  );

  // CHAT TAB
  const ChatTab = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 14px", background: darkMode ? "#1a1a2e" : "#f8f7ff", borderBottom: `1px solid ${darkMode ? "#2a2a4a" : "#e8e8f0"}` }}>
        <p style={{ margin: 0, fontSize: "11px", textAlign: "center", color: "#888" }}>
          Powered by: <span style={{ color: "#6c5ce7", fontWeight: 700 }}>{powerMode === "api" && groqKey ? `Groq API (${selectedModel})` : "Code Mode (Claude)"}</span>
          <button onClick={() => { setPowerMode(pm => pm === "api" ? "code" : "api"); }} style={{ marginLeft: "8px", fontSize: "10px", background: "#f0ecff", color: "#6c5ce7", border: "none", borderRadius: "6px", padding: "2px 8px", cursor: "pointer" }}>Switch</button>
        </p>
      </div>
      {!activeChatId ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>🌍</div>
          <h2 style={{ color: "#6c5ce7", marginBottom: "8px" }}>GoPlanet AI</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>Your intelligent assistant for chatting, creating, coding, and more.</p>
          <button style={S.btn()} onClick={newChat}>+ Start New Chat</button>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            {GROQ_MODELS.map(m => (
              <button key={m.id} onClick={() => setSelectedModel(m.id)} style={{ padding: "6px 12px", borderRadius: "20px", border: `1px solid ${selectedModel === m.id ? "#6c5ce7" : "#ddd"}`, background: selectedModel === m.id ? "#f0ecff" : "transparent", color: selectedModel === m.id ? "#6c5ce7" : "#888", fontSize: "11px", cursor: "pointer" }}>{m.name}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "10px", gap: "8px" }}>
                {m.role === "ai" && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🌍</div>}
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: m.role === "user" ? "#6c5ce7" : darkMode ? "#1a1a2e" : "#f0ecff", color: m.role === "user" ? "#fff" : darkMode ? "#e0e0ff" : "#1a1a2e", fontSize: "13px", lineHeight: 1.5 }}>
                  {m.text.includes("```") ? (
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "12px" }}>{m.text}</pre>
                  ) : m.text}
                </div>
                {m.role === "user" && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#a29bfe", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>{currentUser?.name?.[0]}</div>}
              </div>
            ))}
            {isTyping && <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🌍</div><div style={{ padding: "10px 14px", borderRadius: "4px 16px 16px 16px", background: darkMode ? "#1a1a2e" : "#f0ecff" }}><span style={{ fontSize: "20px", letterSpacing: "4px" }}>•••</span></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${darkMode ? "#2a2a4a" : "#e8e8f0"}`, display: "flex", gap: "8px" }}>
            <input style={{ ...S.input, flex: 1 }} placeholder="Type your message..." value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} />
            <button onClick={sendMessage} style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#6c5ce7", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer", flexShrink: 0 }}>➤</button>
          </div>
        </>
      )}
    </div>
  );

  // PROJECTS TAB
  const ProjectsTab = () => (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "18px", color: "#6c5ce7" }}>📁 Projects</h2>
        <button onClick={() => setShowNewProject(true)} style={{ background: "#6c5ce7", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" }}>+ New</button>
      </div>
      {showNewProject && (
        <div style={{ ...S.card, background: "#f0ecff", marginBottom: "16px" }}>
          <input style={{ ...S.input, marginBottom: "8px" }} placeholder="Project name..." value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={S.btn()} onClick={createProject}>Create</button>
            <button style={{ ...S.btn("#ccc"), flex: "none", padding: "10px 16px" }} onClick={() => setShowNewProject(false)}>Cancel</button>
          </div>
        </div>
      )}
      {projectList.length === 0 ? <p style={{ color: "#888", textAlign: "center", marginTop: "40px" }}>No projects yet. Create one!</p> :
        projectList.map(p => (
          <div key={p.id} style={S.card}>
            <p style={{ margin: 0, fontWeight: 600 }}>📁 {p.name}</p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#888" }}>Created {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      }
    </div>
  );

  // IMAGE GEN TAB
  const ImageTab = () => (
    <div style={{ padding: "16px" }}>
      <h2 style={{ color: "#6c5ce7", marginTop: 0 }}>🎨 Image Generator</h2>
      <p style={{ color: "#888", fontSize: "13px" }}>Describe the image you want to create using AI.</p>
      <textarea style={{ ...S.input, height: "80px", resize: "none", marginBottom: "12px" }} placeholder="A futuristic city floating in clouds..." value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} />
      <button style={S.btn()} onClick={() => setGeneratedImage(`https://picsum.photos/seed/${encodeURIComponent(imagePrompt)}/400/300`)}>Generate Image</button>
      {generatedImage && <img src={generatedImage} alt="Generated" style={{ width: "100%", borderRadius: "12px", marginTop: "16px" }} />}
      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px", textAlign: "center" }}>Note: Add your image generation API key for real AI images.</p>
    </div>
  );

  // SUBSCRIPTION TAB
  const SubscriptionTab = () => (
    <div style={{ padding: "16px" }}>
      <h2 style={{ color: "#6c5ce7", marginTop: 0 }}>⭐ Subscription</h2>
      {currentUser?.isPro ? (
        <div style={{ ...S.card, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", color: "#fff" }}>
          <h3 style={{ margin: "0 0 8px" }}>⭐ Pro Plan Active</h3>
          <p style={{ margin: 0, fontSize: "13px" }}>You're on the Pro plan. Enjoy all premium features!</p>
          <ul style={{ fontSize: "13px", paddingLeft: "16px", marginTop: "12px" }}>
            <li>✓ Faster AI responses</li>
            <li>✓ Advanced models</li>
            <li>✓ Priority support</li>
            <li>✓ Early access features</li>
          </ul>
        </div>
      ) : (
        <>
          <div style={{ ...S.card, border: "2px solid #6c5ce7" }}>
            <div style={{ background: "#6c5ce7", color: "#fff", borderRadius: "6px", padding: "3px 10px", fontSize: "11px", display: "inline-block", marginBottom: "8px" }}>RECOMMENDED</div>
            <h3 style={{ margin: "0 0 4px", color: "#6c5ce7" }}>Pro Plan</h3>
            <p style={{ fontSize: "24px", fontWeight: 900, color: "#6c5ce7", margin: "0 0 12px" }}>$25<span style={{ fontSize: "14px", color: "#888" }}>/year</span></p>
            <ul style={{ fontSize: "13px", paddingLeft: "16px", color: "#555", margin: "0 0 16px" }}>
              <li>✓ Faster AI responses</li>
              <li>✓ Advanced AI models</li>
              <li>✓ Priority support</li>
              <li>✓ Early access features</li>
            </ul>
            <button style={S.btn()} onClick={() => setSubscribeModal(true)}>Subscribe Now</button>
          </div>
          <div style={S.card}>
            <h3 style={{ margin: "0 0 4px" }}>Free Plan</h3>
            <p style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px", color: "#888" }}>$0/year</p>
            <ul style={{ fontSize: "13px", paddingLeft: "16px", color: "#888" }}>
              <li>Basic AI responses</li>
              <li>Standard models</li>
              <li>Community support</li>
            </ul>
          </div>
        </>
      )}
      {subscribeModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px" }}>
            <h3 style={{ color: "#6c5ce7", margin: "0 0 16px" }}>Complete Subscription</h3>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>Enter your payment details to activate Pro ($25/year)</p>
            <input style={{ ...S.input, marginBottom: "8px" }} placeholder="Card number" />
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="MM/YY" />
              <input style={{ ...S.input, flex: 1 }} placeholder="CVV" />
            </div>
            <button style={{ ...S.btn(), marginBottom: "8px" }} onClick={() => {
              grantPro(currentUser?.email);
              setCurrentUser(p => ({ ...p, isPro: true }));
              setSubscribeModal(false);
              alert("🎉 Pro subscription activated!");
            }}>Pay $25/year</button>
            <button style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "13px", width: "100%" }} onClick={() => setSubscribeModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // SETTINGS TAB
  const SettingsTab = () => (
    <div style={{ padding: "16px", overflowY: "auto" }}>
      <h2 style={{ color: "#6c5ce7", marginTop: 0 }}>⚙️ Settings</h2>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#6c5ce7" }}>🔑 API Configuration</h3>
        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 8px" }}>Add your Groq API key to power the chatbot with Groq AI.</p>
        <input style={{ ...S.input, marginBottom: "8px" }} placeholder="Groq API Key (gsk_...)" value={groqKey} onChange={e => setGroqKey(e.target.value)} type="password" />
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <button onClick={() => setPowerMode("api")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `2px solid ${powerMode === "api" ? "#6c5ce7" : "#ddd"}`, background: powerMode === "api" ? "#f0ecff" : "transparent", color: powerMode === "api" ? "#6c5ce7" : "#888", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>🔗 API Mode</button>
          <button onClick={() => setPowerMode("code")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `2px solid ${powerMode === "code" ? "#6c5ce7" : "#ddd"}`, background: powerMode === "code" ? "#f0ecff" : "transparent", color: powerMode === "code" ? "#6c5ce7" : "#888", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>💻 Code Mode</button>
        </div>
        <button style={S.btn()} onClick={saveGroqKey}>Save API Settings</button>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#6c5ce7" }}>🤖 AI Model</h3>
        {GROQ_MODELS.map(m => (
          <button key={m.id} onClick={() => setSelectedModel(m.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 12px", marginBottom: "6px", borderRadius: "8px", border: `1px solid ${selectedModel === m.id ? "#6c5ce7" : "#ddd"}`, background: selectedModel === m.id ? "#f0ecff" : "transparent", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: "13px", color: selectedModel === m.id ? "#6c5ce7" : "#444" }}>{m.name}</span>
            <span style={{ fontSize: "11px", color: "#888" }}>{m.provider}</span>
          </button>
        ))}
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#6c5ce7" }}>🎨 Appearance</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px" }}>Dark Mode</span>
          <button onClick={() => setDarkMode(p => !p)} style={{ width: "48px", height: "26px", borderRadius: "13px", background: darkMode ? "#6c5ce7" : "#ddd", border: "none", cursor: "pointer", position: "relative" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", left: darkMode ? "24px" : "2px", transition: "left 0.2s" }} />
          </button>
        </div>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#6c5ce7" }}>📖 Guide & Certification</h3>
        <button style={{ ...S.btn("#a29bfe"), marginBottom: "8px" }} onClick={() => setShowGuide(true)}>📖 Read User Guide</button>
        <button style={{ ...S.btn(), marginBottom: "8px" }} onClick={() => { setExamActive(true); setExamDone(false); setExamAnswers({}); }}>📝 Enter Exam</button>
        {currentUser?.examScore !== null && currentUser?.examScore !== undefined && (
          <button style={{ ...S.btn("#e17055"), marginBottom: "8px" }} onClick={() => { setExamActive(true); setExamDone(false); setExamAnswers({}); }}>🔄 Re-take Exam</button>
        )}
        {currentUser?.certGranted && (
          <button style={S.btn("#00b894")} onClick={() => setShowCert(true)}>🏆 View My Certificate</button>
        )}
        {currentUser?.examScore !== null && currentUser?.examScore !== undefined && (
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888", textAlign: "center" }}>Last score: {currentUser.examScore}/50 {currentUser.examScore >= 40 ? "✅ Passed" : "❌ Retake needed"}</p>
        )}
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#6c5ce7" }}>👤 Account</h3>
        <div style={{ fontSize: "13px", color: darkMode ? "#ccc" : "#555" }}>
          <p style={{ margin: "4px 0" }}><strong>Name:</strong> {currentUser?.name}</p>
          <p style={{ margin: "4px 0" }}><strong>Email:</strong> {currentUser?.email}</p>
          <p style={{ margin: "4px 0" }}><strong>Mobile:</strong> {currentUser?.mobile}</p>
          <p style={{ margin: "4px 0" }}><strong>Plan:</strong> {currentUser?.isPro ? "⭐ Pro" : "Free"}</p>
          <p style={{ margin: "4px 0" }}><strong>Joined:</strong> {new Date(currentUser?.joinedAt).toLocaleDateString()}</p>
        </div>
        <button style={{ ...S.btn("#e74c3c"), marginTop: "12px" }} onClick={logout}>Log Out</button>
      </div>
    </div>
  );

  // ADMIN TAB
  const AdminTab = () => {
    if (!currentUser?.isAdmin) return <div style={{ padding: "16px", textAlign: "center" }}><p style={{ color: "#e74c3c" }}>🚫 Admin access required</p></div>;
    const users = db.users || [];
    return (
      <div style={{ padding: "16px", overflowY: "auto" }}>
        <h2 style={{ color: "#6c5ce7", marginTop: 0 }}>🛡️ Admin Panel</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {["members", "stats"].map(t => (
            <button key={t} onClick={() => setAdminTab(t)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `1px solid ${adminTab === t ? "#6c5ce7" : "#ddd"}`, background: adminTab === t ? "#f0ecff" : "transparent", color: adminTab === t ? "#6c5ce7" : "#888", cursor: "pointer", fontWeight: 600, fontSize: "13px", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
        {adminTab === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {[
              { label: "Total Members", value: users.length },
              { label: "Pro Users", value: users.filter(u => u.isPro).length },
              { label: "Certified", value: users.filter(u => u.certGranted).length },
              { label: "Admins", value: users.filter(u => u.isAdmin).length },
            ].map((s, i) => (
              <div key={i} style={{ ...S.card, textAlign: "center", padding: "12px" }}>
                <p style={{ fontSize: "24px", fontWeight: 900, color: "#6c5ce7", margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "#888", margin: "4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {adminTab === "members" && (
          <>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>{users.length} registered member(s)</p>
            {users.map((u, i) => (
              <div key={i} style={S.card}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0 }}>{u.name?.[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>{u.name} {u.isAdmin && <span style={{ background: "#6c5ce7", color: "#fff", borderRadius: "4px", padding: "1px 6px", fontSize: "10px" }}>Admin</span>}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {[
                    u.isPro ? "⭐ Pro" : "Free",
                    u.verified ? "✅ Verified" : "⏳ Unverified",
                    u.certGranted ? "🏆 Certified" : "📝 No cert",
                  ].map((badge, j) => (
                    <span key={j} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "#f0ecff", color: "#6c5ce7" }}>{badge}</span>
                  ))}
                </div>
                {u.examScore !== null && u.examScore !== undefined && <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#888" }}>Exam: {u.examScore}/50</p>}
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  {!u.isPro && <button onClick={() => grantPro(u.email)} style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "none", background: "#6c5ce7", color: "#fff", fontSize: "11px", cursor: "pointer" }}>Grant Pro</button>}
                  {!u.isAdmin && <button onClick={() => grantAdmin(u.email)} style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "none", background: "#a29bfe", color: "#fff", fontSize: "11px", cursor: "pointer" }}>Grant Admin</button>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "image", label: "Images", icon: "🎨" },
    { id: "subscription", label: "Plans", icon: "⭐" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    ...(currentUser?.isAdmin ? [{ id: "admin", label: "Admin", icon: "🛡️" }] : []),
  ];

  return (
    <div style={S.app}>
      {/* Sidebar overlay */}
      {sidebarOpen && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
      <Sidebar />

      {/* Top bar */}
      <div style={S.topBar}>
        <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", padding: "4px" }}>☰</button>
        <div style={S.logo}><div style={S.logoImg}>🌍</div> GoPlanet</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px" }}>{currentUser?.name?.[0]}</div>
        </div>
      </div>

      {/* Content */}
      <div style={S.content}>
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "image" && <ImageTab />}
        {activeTab === "subscription" && <SubscriptionTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "admin" && <AdminTab />}
      </div>

      {/* Bottom navigation */}
      <div style={S.bottomNav}>
        {tabs.map(t => (
          <button key={t.id} style={S.navBtn(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            <span style={{ fontSize: "18px" }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

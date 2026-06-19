import { useState, useEffect, useRef } from "react";

// ─── Persistent storage helpers ───────────────────────────
const DB = {
  get: (k, fallback = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const SESS = "gp_session";
const UIDX = "gp_user_index";
const uKey = (id) => `gp_user_${id}`;
const cKey = (id) => `gp_chats_${id}`;
const pKey = (id) => `gp_projs_${id}`;

// ─── Simple hash (no crypto dep needed for IDs) ──────────
const uid = (email) => btoa(encodeURIComponent(email.toLowerCase().trim())).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);

// ─── Quiz ─────────────────────────────────────────────────
const QUIZ = [
  {q:"What does AI stand for?",o:["Automated Interface","Artificial Intelligence","Advanced Integration","Automated Input"],a:1},
  {q:"What is GoPlanet's primary function?",o:["File Storage","AI Chatbot Platform","Social Network","Video Streaming"],a:1},
  {q:"Which API powers GoPlanet's chatbot?",o:["OpenAI","Gemini","Groq","Cohere"],a:2},
  {q:"What does LLM stand for?",o:["Large Language Model","Logical Learning Machine","Local Logic Module","Linear Learning Method"],a:0},
  {q:"Minimum score to earn a GoPlanet certificate?",o:["30/50","35/50","40/50","45/50"],a:2},
  {q:"What does 'prompt' mean in AI chatbots?",o:["A payment","User input to the AI","A notification","A file format"],a:1},
  {q:"What is 'context' in an AI conversation?",o:["The font size","Previous chat history used by AI","The background colour","User's location"],a:1},
  {q:"Which is a responsible AI usage principle?",o:["Share passwords freely","Use AI with integrity","Replace all human decisions","Ignore AI errors"],a:1},
  {q:"What is a Groq API key used for?",o:["Login authentication","Authorising access to Groq AI services","File encryption","Image generation"],a:1},
  {q:"What does 'token' mean in AI language models?",o:["A crypto currency","A unit of text","A user account","A payment method"],a:1},
  {q:"What is machine learning?",o:["Teaching machines to walk","AI learning from data patterns","Programming robots","Computer maintenance"],a:1},
  {q:"What is NLP?",o:["Writing code in English","AI understanding human language","Network protocols","Nature-based computing"],a:1},
  {q:"What does 'Human First' represent?",o:["Humans do everything manually","Empower people, not replace them","Humans control all AI code","Only humans can use AI"],a:1},
  {q:"What is a chatbot?",o:["A physical robot","Software simulating human conversation","A chat room","A messaging app"],a:1},
  {q:"What is the GoPlanet certification about?",o:["Coding only","Responsible AI usage & smart communication","Database management","Web design"],a:1},
  {q:"What does 'inference' mean in AI?",o:["Training a new model","Running AI to get predictions","Deleting AI data","Uploading datasets"],a:1},
  {q:"What is a subscription plan?",o:["A free service forever","A paid tier with extra features","A one-time purchase","A government program"],a:1},
  {q:"What does 'hallucination' mean in AI?",o:["AI seeing images","AI generating false info confidently","AI sleeping mode","AI voice response"],a:1},
  {q:"Purpose of an AI guide?",o:["To restrict users","Help users understand the app","To collect data","Show advertisements"],a:1},
  {q:"What is 'Effective' as a GoPlanet principle?",o:["Being strict","Work smarter, achieve more","Using expensive tools","Coding everything yourself"],a:1},
  {q:"What is Smart Thinking as a GoPlanet principle?",o:["Memorising facts","Solve problems with intelligence","Working faster always","Using shortcuts"],a:1},
  {q:"What is an admin in an app?",o:["A regular user","A user with special management privileges","A paid subscriber only","A developer only"],a:1},
  {q:"What does 'Pro subscription' typically offer?",o:["Same as free","Faster responses and advanced features","Less storage","Fewer models"],a:1},
  {q:"What is a language model's training data?",o:["Images and videos only","Large amounts of text from various sources","Audio files only","Code files only"],a:1},
  {q:"What does 'Honest Use' mean in GoPlanet?",o:["Using AI to cheat","Use technology with integrity","Only using free tools","Sharing all data publicly"],a:1},
  {q:"What is an API?",o:["Application Programming Interface","Automated Program Input","Advanced Page Interface","App Protocol Integration"],a:0},
  {q:"What to do if AI gives wrong info?",o:["Trust it completely","Verify with reliable sources","Delete the app","Report to police"],a:1},
  {q:"GoPlanet's backend AI is powered by?",o:["OpenAI GPT","Google Bard","Groq API","Amazon Alexa"],a:2},
  {q:"What is 'temperature' in AI models?",o:["Server heat","Controls randomness/creativity of AI output","User's location climate","Battery level"],a:1},
  {q:"Best practice when using AI chatbots?",o:["Never verify AI answers","Cross-check important information","Share personal passwords with AI","Use AI blindly"],a:1},
  {q:"GoPlanet certification date is based on?",o:["App launch date","The day you take the exam","Your birthday","A fixed annual date"],a:1},
  {q:"GoPlanet is primarily designed for?",o:["Gaming","Everyone — easy to use AI chatbot","Advanced developers only","Children under 10"],a:1},
  {q:"What is 'Secure & Private' in GoPlanet?",o:["Data is sold to partners","Data is encrypted and safe","Users' data is public","No security measures"],a:1},
  {q:"What is a multiple-choice question exam?",o:["Essay writing","Questions with several answer options","Oral exam","Drawing test"],a:1},
  {q:"What is 'context window' in AI?",o:["Browser window size","Amount of text AI can process at once","Screen resolution","Network bandwidth"],a:1},
  {q:"What does re-taking an exam allow?",o:["Getting a higher score automatically","Attempting the exam again after failure","Changing the questions","Getting a free subscription"],a:1},
  {q:"What is an AI project in GoPlanet?",o:["A physical project","An organised workspace to manage AI tasks","A government initiative","A hardware device"],a:1},
  {q:"What makes GoPlanet 'Innovative AI'?",o:["Only uses old technology","Choose from the best open models","No model options","Only one fixed model"],a:1},
  {q:"What is 'User Friendly' design?",o:["Designed only for tech experts","Designed for everyone, easy to use","Complex interface intentionally","No help documentation"],a:1},
  {q:"Purpose of subscription tiers?",o:["To confuse users","Offer different feature levels","Restrict all users equally","To remove features"],a:1},
  {q:"What to do before sharing AI-generated content?",o:["Share immediately without review","Review and verify the accuracy","Delete it","Print it only"],a:1},
  {q:"Role of AI in smart communication?",o:["Replace all human communication","Enhance and assist human communication","Stop communication","Monitor users"],a:1},
  {q:"What is 'real-world AI application'?",o:["AI only in science fiction","Using AI to solve practical everyday problems","AI in video games only","AI in space only"],a:1},
  {q:"What happens after completing GoPlanet certification?",o:["Nothing","Receive a digital certificate if score ≥ 40/50","Get a free phone","Become an admin automatically"],a:1},
  {q:"What is 'model selection' in GoPlanet?",o:["Choosing clothing models","Selecting which AI model to use for chat","Picking screen themes","Choosing subscription plans"],a:1},
  {q:"What does an AI assistant help with?",o:["Only math problems","Chatting, creating, coding, and more","Only image generation","Only translations"],a:1},
  {q:"Recommended approach to AI usage per GoPlanet?",o:["Rely on AI for everything","Use AI as a tool to empower, not replace human judgment","Never use AI","Only for entertainment"],a:1},
  {q:"GoPlanet AI Chatbot powered by (code version)?",o:["LangChain + Ollama locally","Google Cloud only","Microsoft Azure only","Manual responses"],a:0},
  {q:"What is 'Local & Fast' in GoPlanet?",o:["Works only locally without internet","Powered by Ollama running locally for speed","Users meet locally","Fast food delivery"],a:1},
  {q:"Which principle says 'Empower people, not replace them'?",o:["Honest Use","Smart Thinking","Effective","Human First"],a:3},
];

// ─── Guide ────────────────────────────────────────────────
const GUIDE = [
  {t:"Getting Started",c:"Welcome to GoPlanet! After logging in you land on the AI Chat dashboard. Tap '+ New Chat' to start chatting, manage projects, or explore settings. Your session stays active so you don't need to log in every time."},
  {t:"Setting Up Your Groq API Key",c:"Go to Settings → API Configuration. Paste your Groq API key (starts with gsk_) to power the chatbot with fast Groq AI models. You can switch between API Mode (Groq) and Code Mode at any time from the chatbot header."},
  {t:"Starting a Chat",c:"Tap '+ New Chat' to begin. Type your message and press Send or hit Enter. The AI responds instantly. All your conversations are saved automatically."},
  {t:"Managing Projects",c:"Use the Projects tab to organise your AI work. Create named workspaces to keep related chats and tasks together."},
  {t:"Image Generator",c:"Tap the Images tab, describe the image you want, and tap Generate. Connect an image generation API key in Settings for real AI images."},
  {t:"Subscription Plans",c:"GoPlanet offers Free and Pro ($25/year) plans. Pro unlocks faster responses, advanced AI models, priority support, and early access to new features."},
  {t:"Admin Features",c:"The first registered user automatically becomes Admin. Admins can view all members, grant Pro or Admin access, and manage the platform from the Admin tab."},
  {t:"Certification Exam (Optional)",c:"Go to Settings → Enter Exam. The exam is completely optional. Answer 50 multiple-choice questions on AI and GoPlanet topics. Score 40 or more to earn your certificate with your registered name and today's date printed on it."},
  {t:"Responsible AI Usage",c:"Use AI with integrity (Honest Use). Always verify important AI-generated information. AI empowers people — it doesn't replace human judgment (Human First). Work smarter (Effective) and think critically (Smart Thinking)."},
  {t:"Privacy & Security",c:"GoPlanet keeps your data on your device. Your API key is stored only locally. Never share your account details with anyone. Log out when using shared devices."},
];

// ─── Certificate generator ────────────────────────────────
function makeCert(name, score, dateStr) {
  const W = 1000, H = 1120;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");

  // BG
  const bg = c.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#f0f4ff"); bg.addColorStop(1,"#e4e8ff");
  c.fillStyle = bg; c.fillRect(0,0,W,H);

  // Corner glows
  [[0,0],[W,0],[0,H],[W,H]].forEach(([x,y])=>{
    const cg = c.createRadialGradient(x,y,0,x,y,180);
    cg.addColorStop(0,"rgba(108,92,231,0.12)"); cg.addColorStop(1,"rgba(108,92,231,0)");
    c.fillStyle=cg; c.fillRect(0,0,W,H);
  });

  // Borders
  c.strokeStyle="#6c5ce7"; c.lineWidth=8; c.strokeRect(18,18,964,1084);
  c.strokeStyle="#a29bfe"; c.lineWidth=2.5; c.strokeRect(34,34,932,1052);

  // Top/bottom accent lines
  c.fillStyle="#6c5ce7"; c.fillRect(60,58,880,3);
  c.fillStyle="#6c5ce7"; c.fillRect(60,1056,880,3);

  // Logo circle
  const lg = c.createRadialGradient(500,130,5,500,130,55);
  lg.addColorStop(0,"#a29bfe"); lg.addColorStop(1,"#6c5ce7");
  c.fillStyle=lg; c.beginPath(); c.arc(500,130,55,0,Math.PI*2); c.fill();
  c.font="42px serif"; c.textAlign="center"; c.fillText("🌍",500,145);

  // GoPlanet heading
  c.fillStyle="#1a1a2e"; c.font="bold 50px Arial"; c.fillText("GoPlanet",500,240);
  c.fillStyle="#6c5ce7"; c.font="bold 16px Arial"; c.fillText("— AI CHATBOT —",500,270);

  // Certificate title
  c.fillStyle="#1a1a2e"; c.font="bold 72px Arial"; c.fillText("CERTIFICATE",500,366);
  c.fillStyle="#6c5ce7"; c.font="bold 26px Arial"; c.fillText("OF COMPLETION",500,408);

  // Decorative divider
  c.strokeStyle="#a29bfe"; c.lineWidth=1.5;
  c.beginPath(); c.moveTo(160,432); c.lineTo(840,432); c.stroke();

  // Presented to
  c.fillStyle="#777"; c.font="15px Arial";
  c.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO",500,468);

  // Recipient name — the star of the show
  c.fillStyle="#1a1a2e"; c.font="bold 46px Arial";
  c.fillText(name,500,548);
  // Underline
  const nw = c.measureText(name).width;
  c.strokeStyle="#6c5ce7"; c.lineWidth=2.5;
  c.beginPath(); c.moveTo(500-nw/2,562); c.lineTo(500+nw/2,562); c.stroke();

  // Body text
  c.fillStyle="#555"; c.font="17px Arial";
  c.fillText("for successfully completing the GoPlanet AI Chatbot Certification Program.",500,608);
  c.fillText("This certifies your understanding and practical knowledge of",500,636);
  c.fillText("responsible AI usage, smart communication, and real-world AI applications.",500,664);

  // Score pill
  c.fillStyle="#ede9ff";
  c.beginPath(); c.roundRect(410,676,180,38,19); c.fill();
  c.fillStyle="#6c5ce7"; c.font="bold 15px Arial";
  c.fillText(`Score: ${score} / 50`,500,700);

  // Second divider
  c.strokeStyle="#a29bfe"; c.lineWidth=1;
  c.beginPath(); c.moveTo(160,730); c.lineTo(840,730); c.stroke();
  c.fillStyle="#777"; c.font="bold 13px Arial";
  c.fillText("YOU ARE NOW RECOGNISED AS",500,758);
  c.fillStyle="#6c5ce7"; c.font="bold 30px Arial";
  c.fillText("GOPLANET CERTIFIED USER",500,798);

  // Laurel branches (simple lines)
  [[-1,1]].forEach(([dir])=>{
    c.strokeStyle="#a29bfe"; c.lineWidth=1.5;
    for(let i=0;i<5;i++){
      const bx=370+dir*i*18, by=830+i*8;
      c.beginPath(); c.moveTo(bx,by); c.lineTo(bx-dir*16,by-10); c.stroke();
    }
  });

  // 4 principle icons
  [
    {icon:"🛡️",l:"HONEST USE",s:"Use technology with integrity."},
    {icon:"🧠",l:"SMART THINKING",s:"Solve problems intelligently."},
    {icon:"⚡",l:"EFFECTIVE",s:"Work smarter, achieve more."},
    {icon:"❤️",l:"HUMAN FIRST",s:"Empower people, not replace."},
  ].forEach((p,i)=>{
    const x=130+i*185;
    c.fillStyle="#6c5ce7"; c.beginPath(); c.arc(x,860,30,0,Math.PI*2); c.fill();
    c.font="22px serif"; c.fillText(p.icon,x,869);
    c.fillStyle="#1a1a2e"; c.font="bold 10px Arial"; c.fillText(p.l,x,908);
    c.fillStyle="#666"; c.font="9.5px Arial"; c.fillText(p.s,x,922);
  });

  // Medal
  c.fillStyle="#1a1a2e"; c.beginPath(); c.arc(500,990,40,0,Math.PI*2); c.fill();
  c.strokeStyle="#f9ca24"; c.lineWidth=5; c.beginPath(); c.arc(500,990,40,0,Math.PI*2); c.stroke();
  c.font="30px serif"; c.fillText("🏆",500,1000);
  c.fillStyle="#6c5ce7"; c.fillRect(488,1028,10,22);
  c.fillStyle="#a29bfe"; c.fillRect(502,1028,10,22);

  // Signature
  c.textAlign="left";
  c.fillStyle="#6c5ce7"; c.font="italic bold 23px Georgia"; c.fillText("GoPlanet Team",108,1003);
  c.fillStyle="#888"; c.font="11px Arial"; c.fillText("GOPLANET TEAM  |  ISSUER",108,1020);

  // Date
  c.textAlign="right";
  c.fillStyle="#1a1a2e"; c.font="bold 15px Arial"; c.fillText(dateStr,892,1003);
  c.fillStyle="#888"; c.font="11px Arial"; c.fillText("DATE OF ISSUE",892,1020);

  return cv.toDataURL("image/png");
}

// ═══════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════
export default function GoPlanetApp() {
  // ─── Auth state ─────────────────────────────────────────
  const [page, setPage]       = useState("boot"); // boot|login|register|main
  const [regStep, setRegStep] = useState(1);       // 1=email+pw, 2=name+mobile
  const [form, setForm]       = useState({email:"",password:"",name:"",mobile:""});
  const [authErr, setAuthErr] = useState("");
  const [userId, setUserId]   = useState(null);
  const [user, setUser]       = useState(null);

  // ─── App state ───────────────────────────────────────────
  const [tab, setTab]           = useState("chat");
  const [sidebarOpen, setSidebar] = useState(false);
  const [dark, setDark]         = useState(false);
  const [groqKey, setGroqKey]   = useState("");
  const [powerMode, setPower]   = useState("code"); // code|api
  const [selModel, setModel]    = useState("llama-3.3-70b-versatile");
  const [chats, setChats]       = useState({});
  const [activeChat, setActive] = useState(null);
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [projects, setProjects] = useState({});
  const [newProj, setNewProj]   = useState("");
  const [imgPrompt, setImgPrompt] = useState("");
  const [genImg, setGenImg]     = useState(null);
  const [subModal, setSubModal] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTab, setAdminTab] = useState("members");

  // ─── Cert/Exam state ────────────────────────────────────
  const [examScreen, setExamScreen] = useState(null); // null|guide|exam|result|cert
  const [examName, setExamName]     = useState("");
  const [examEmail, setExamEmail]   = useState("");
  const [examErr, setExamErr]       = useState("");
  const [answers, setAnswers]       = useState({});
  const [examScore, setExamScore]   = useState(0);
  const [certUrl, setCertUrl]       = useState("");
  const [certDate, setCertDate]     = useState("");

  const chatBottom = useRef(null);
  const ACCENT = "#6c5ce7", ACCENT2 = "#a29bfe";
  const BG     = dark ? "#0f0f1a" : "#f7f7fc";
  const SURF   = dark ? "#1a1a2e" : "#ffffff";
  const BORDER = dark ? "#2a2a4a" : "#e8e8f0";
  const TEXT   = dark ? "#e0e0ff" : "#1a1a2e";
  const MUTED  = dark ? "#8888bb" : "#777788";

  const MODELS = [
    {id:"llama-3.3-70b-versatile", name:"Llama 3.3 70B", tag:"Meta"},
    {id:"mixtral-8x7b-32768",      name:"Mixtral 8x7B",  tag:"Mistral"},
    {id:"gemma2-9b-it",            name:"Gemma 2 9B",    tag:"Google"},
    {id:"llama-3.1-8b-instant",    name:"Llama 3.1 8B",  tag:"Meta"},
  ];

  // ─── Boot: restore session ───────────────────────────────
  useEffect(()=>{
    const sess = DB.get(SESS);
    if(sess){
      const u = DB.get(uKey(sess));
      if(u){ restoreUser(sess,u); return; }
    }
    setPage("login");
  },[]);

  useEffect(()=>{ chatBottom.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  function restoreUser(id,u){
    setUserId(id); setUser(u);
    setChats(DB.get(cKey(id),{}));
    setProjects(DB.get(pKey(id),{}));
    const s = DB.get(`gp_sett_${id}`,{});
    if(s.groqKey) setGroqKey(s.groqKey);
    if(s.powerMode) setPower(s.powerMode);
    if(s.selModel) setModel(s.selModel);
    if(s.dark !== undefined) setDark(s.dark);
    setPage("main");
  }

  function saveUser(id,u){ DB.set(uKey(id),u); }
  function patchUser(patch){
    const u2 = {...user,...patch};
    setUser(u2); saveUser(userId,u2);
  }
  function saveChats(id,c){ DB.set(cKey(id),c); }
  function saveProjects(id,p){ DB.set(pKey(id),p); }
  function saveSettings(patch){
    const cur = DB.get(`gp_sett_${userId}`,{});
    DB.set(`gp_sett_${userId}`,{...cur,...patch});
  }

  // ─── AUTH ────────────────────────────────────────────────
  function handleLogin(){
    setAuthErr("");
    if(!form.email||!form.password){ setAuthErr("Please fill all fields."); return; }
    const id = uid(form.email);
    const u  = DB.get(uKey(id));
    if(!u){ setAuthErr("No account found. Please register."); return; }
    if(u.password !== btoa(form.password)){ setAuthErr("Incorrect password."); return; }
    DB.set(SESS,id);
    restoreUser(id,u);
  }

  function handleReg1(){
    setAuthErr("");
    if(!form.email||!form.password){ setAuthErr("Please fill all fields."); return; }
    if(!/\S+@\S+\.\S+/.test(form.email)){ setAuthErr("Enter a valid email."); return; }
    if(form.password.length<6){ setAuthErr("Password must be at least 6 characters."); return; }
    const id = uid(form.email);
    if(DB.get(uKey(id))){ setAuthErr("Email already registered. Please log in."); return; }
    setRegStep(2);
  }

  function handleReg2(){
    setAuthErr("");
    if(!form.name.trim()||!form.mobile.trim()){ setAuthErr("Please fill all fields."); return; }
    const id  = uid(form.email);
    const idx = DB.get(UIDX,[]);
    const isFirst = idx.length===0;
    const u = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      password: btoa(form.password),
      isAdmin: isFirst,
      isPro: false,
      joinedAt: new Date().toISOString(),
      examScore: null, certDate: null, certGranted: false,
    };
    saveUser(id,u);
    if(!idx.includes(id)) DB.set(UIDX,[...idx,id]);
    DB.set(SESS,id);
    restoreUser(id,u);
  }

  function logout(){
    DB.set(SESS,null);
    setUserId(null); setUser(null); setChats({}); setProjects({});
    setMsgs([]); setActive(null); setPage("login");
    setForm({email:"",password:"",name:"",mobile:""});
    setRegStep(1); setExamScreen(null);
  }

  // ─── CHAT ────────────────────────────────────────────────
  function newChat(){
    const id = "c"+Date.now();
    const welcome = {role:"ai",text:`Hello ${user?.name}! 👋 I'm GoPlanet AI. How can I help you today?`,ts:new Date().toLocaleTimeString()};
    const updated = {...chats,[id]:[welcome]};
    setChats(updated); saveChats(userId,updated);
    setActive(id); setMsgs([welcome]);
    setTab("chat"); setSidebar(false);
  }

  function openChat(id){
    setActive(id); setMsgs(chats[id]||[]); setTab("chat"); setSidebar(false);
  }

  async function sendMsg(){
    if(!input.trim()||!activeChat) return;
    const userMsg={role:"user",text:input.trim(),ts:new Date().toLocaleTimeString()};
    const withUser=[...msgs,userMsg];
    setMsgs(withUser); setInput(""); setTyping(true);
    let aiText="";
    try{
      if(powerMode==="api"&&groqKey.startsWith("gsk_")){
        const history=withUser.slice(-10).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
        const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${groqKey}`},
          body:JSON.stringify({model:selModel,messages:history,max_tokens:1024}),
        });
        if(!res.ok) throw new Error("Groq "+res.status);
        const d=await res.json();
        aiText=d.choices?.[0]?.message?.content||"No response.";
      } else {
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
            system:"You are GoPlanet AI, a helpful and friendly assistant. Keep responses clear and concise.",
            messages:[{role:"user",content:input.trim()}]}),
        });
        const d=await res.json();
        aiText=d.content?.[0]?.text||"Please add your Groq API key in Settings to unlock full AI responses.";
      }
    } catch(e){
      aiText=powerMode==="api"?"⚠️ Groq API error — check your key in Settings.":"⚠️ Connection issue. Please try again.";
    }
    const aiMsg={role:"ai",text:aiText,ts:new Date().toLocaleTimeString()};
    const final=[...withUser,aiMsg];
    setMsgs(final); setTyping(false);
    const updated={...chats,[activeChat]:final};
    setChats(updated); saveChats(userId,updated);
  }

  // ─── PROJECTS ────────────────────────────────────────────
  function createProject(){
    if(!newProj.trim()) return;
    const id="p"+Date.now();
    const updated={...projects,[id]:{name:newProj.trim(),createdAt:new Date().toISOString()}};
    setProjects(updated); saveProjects(userId,updated); setNewProj("");
  }

  // ─── ADMIN ───────────────────────────────────────────────
  function loadAdminUsers(){
    const idx=DB.get(UIDX,[]);
    const list=idx.map(id=>{
      const u=DB.get(uKey(id));
      return u?{id,name:u.name,email:u.email,isPro:u.isPro,isAdmin:u.isAdmin,examScore:u.examScore,certGranted:u.certGranted,joinedAt:u.joinedAt}:null;
    }).filter(Boolean);
    setAdminUsers(list);
  }
  function grantPro(id){
    const u=DB.get(uKey(id)); if(!u) return;
    DB.set(uKey(id),{...u,isPro:true}); loadAdminUsers();
    if(id===userId) patchUser({isPro:true});
  }
  function grantAdmin(id){
    const u=DB.get(uKey(id)); if(!u) return;
    DB.set(uKey(id),{...u,isAdmin:true}); loadAdminUsers();
    if(id===userId) patchUser({isAdmin:true});
  }

  // ─── EXAM ────────────────────────────────────────────────
  function startExam(){
    setExamErr("");
    if(!examName.trim()){ setExamErr("Please enter your full name."); return; }
    if(!examEmail.trim()||!/\S+@\S+\.\S+/.test(examEmail)){ setExamErr("Please enter a valid email."); return; }
    setAnswers({}); setExamScreen("exam");
  }
  function submitExam(){
    let s=0;
    QUIZ.forEach((q,i)=>{ if(answers[i]===q.a) s++; });
    const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    setExamScore(s); setCertDate(today);
    if(s>=40){
      const url=makeCert(examName.trim(),s,today);
      setCertUrl(url);
      patchUser({examScore:s,certDate:today,certGranted:true});
    } else {
      patchUser({examScore:s});
    }
    setExamScreen("result");
  }

  // ════════════════════════════════════════════════════════
  //  STYLES
  // ════════════════════════════════════════════════════════
  const S={
    wrap:  {display:"flex",flexDirection:"column",height:"100dvh",width:"100%",maxWidth:"430px",margin:"0 auto",
             background:BG,color:TEXT,fontFamily:"system-ui,sans-serif",position:"relative",overflow:"hidden"},
    top:   {display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",height:"52px",
             background:SURF,borderBottom:`1px solid ${BORDER}`,flexShrink:0,zIndex:5},
    body:  {flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",minHeight:0},
    nav:   {display:"flex",background:SURF,borderTop:`1px solid ${BORDER}`,flexShrink:0},
    navBtn:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"6px 2px",
                  border:"none",background:"none",cursor:"pointer",color:a?ACCENT:MUTED,fontSize:"9px",fontWeight:a?700:400}),
    card:  {background:SURF,borderRadius:"12px",padding:"14px",marginBottom:"12px",border:`1px solid ${BORDER}`},
    inp:   {width:"100%",padding:"11px 13px",border:`1.5px solid ${BORDER}`,borderRadius:"10px",
             background:SURF,color:TEXT,fontSize:"14px",outline:"none",boxSizing:"border-box"},
    btn:   (bg=ACCENT,fg="#fff")=>({background:bg,color:fg,border:"none",borderRadius:"10px",
                                    padding:"12px",fontSize:"14px",fontWeight:700,cursor:"pointer",width:"100%"}),
    lbl:   {fontSize:"11px",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.7px",
             marginBottom:"5px",display:"block"},
    err:   {color:"#e74c3c",fontSize:"12px",padding:"8px 12px",background:"#fff0f0",borderRadius:"8px",
             border:"1px solid #ffd0d0",marginTop:"4px"},
    logoRow:{display:"flex",alignItems:"center",gap:"7px",fontWeight:900,fontSize:"18px",color:ACCENT},
    logoBox:{width:"30px",height:"30px",borderRadius:"8px",
             background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
             display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px"},
  };

  // ════════════════════════════════════════════════════════
  //  BOOT
  // ════════════════════════════════════════════════════════
  if(page==="boot") return(
    <div style={{...S.wrap,alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"52px",marginBottom:"14px"}}>🌍</div>
      <p style={{color:ACCENT,fontWeight:800,fontSize:"22px",margin:0}}>GoPlanet</p>
      <p style={{color:MUTED,fontSize:"13px",marginTop:"6px"}}>Loading…</p>
    </div>
  );

  // ════════════════════════════════════════════════════════
  //  LOGIN
  // ════════════════════════════════════════════════════════
  if(page==="login"||page==="register") return(
    <div style={{...S.wrap,overflowY:"auto",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <div style={{width:"72px",height:"72px",borderRadius:"20px",
          background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 12px",fontSize:"38px"}}>🌍</div>
        <h1 style={{margin:"0 0 4px",fontSize:"26px",fontWeight:900,color:ACCENT}}>GoPlanet</h1>
        <p style={{margin:0,color:MUTED,fontSize:"13px"}}>Intelligent AI, powered by Groq</p>
      </div>

      {/* Tab switch */}
      <div style={{display:"flex",background:"#f0ecff",borderRadius:"12px",padding:"4px",marginBottom:"20px",width:"100%"}}>
        {["Log In","Register"].map((t,i)=>(
          <button key={t} onClick={()=>{setPage(i===0?"login":"register");setAuthErr("");setRegStep(1);}}
            style={{flex:1,padding:"9px",border:"none",borderRadius:"9px",
              background:(page==="login")===(i===0)?ACCENT:"transparent",
              color:(page==="login")===(i===0)?"#fff":MUTED,
              fontWeight:700,cursor:"pointer",fontSize:"14px"}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"10px"}}>
        {/* Register step indicator */}
        {page==="register"&&(
          <p style={{color:MUTED,fontSize:"12px",textAlign:"center",margin:"0 0 4px"}}>
            Step {regStep} of 2 — {regStep===1?"Account details":"Personal info"}
          </p>
        )}

        {(page==="login"||regStep===1)&&<>
          <div><span style={S.lbl}>Email</span>
            <input style={S.inp} type="email" placeholder="you@example.com" value={form.email}
              onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&(page==="login"?handleLogin():handleReg1())}/>
          </div>
          <div><span style={S.lbl}>Password</span>
            <input style={S.inp} type="password" placeholder={page==="register"?"Min 6 characters":"Your password"} value={form.password}
              onChange={e=>setForm(p=>({...p,password:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&(page==="login"?handleLogin():handleReg1())}/>
          </div>
        </>}

        {page==="register"&&regStep===2&&<>
          <div><span style={S.lbl}>Full Name</span>
            <input style={S.inp} placeholder="e.g. Alice Johnson" value={form.name}
              onChange={e=>setForm(p=>({...p,name:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&handleReg2()}/>
          </div>
          <div><span style={S.lbl}>Mobile Number</span>
            <input style={S.inp} type="tel" placeholder="+91 98765 43210" value={form.mobile}
              onChange={e=>setForm(p=>({...p,mobile:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&handleReg2()}/>
          </div>
        </>}

        {authErr&&<div style={S.err}>{authErr}</div>}

        {page==="login"&&
          <button style={S.btn()} onClick={handleLogin}>Log In →</button>}
        {page==="register"&&regStep===1&&
          <button style={S.btn()} onClick={handleReg1}>Next →</button>}
        {page==="register"&&regStep===2&&<>
          <button style={S.btn()} onClick={handleReg2}>Create Account ✓</button>
          <button style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:"13px"}}
            onClick={()=>setRegStep(1)}>← Back</button>
        </>}
      </div>

      <p style={{fontSize:"11px",color:MUTED,marginTop:"20px",textAlign:"center"}}>
        No email verification needed — just register and start.
      </p>
    </div>
  );

  // ════════════════════════════════════════════════════════
  //  EXAM OVERLAY SCREENS
  // ════════════════════════════════════════════════════════
  if(examScreen==="guide") return(
    <div style={{...S.wrap}}>
      <div style={{...S.top}}>
        <button onClick={()=>setExamScreen(null)} style={{background:"none",border:"none",color:ACCENT,fontWeight:800,fontSize:"17px",cursor:"pointer"}}>←</button>
        <span style={{fontWeight:800,color:ACCENT}}>📖 User Guide</span>
        <div style={{width:"40px"}}/>
      </div>
      <div style={{...S.body,padding:"16px"}}>
        {GUIDE.map((g,i)=>(
          <div key={i} style={S.card}>
            <p style={{margin:"0 0 7px",fontWeight:700,fontSize:"14px",color:ACCENT}}>{i+1}. {g.t}</p>
            <p style={{margin:0,fontSize:"13px",color:MUTED,lineHeight:1.7}}>{g.c}</p>
          </div>
        ))}
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  if(examScreen==="entry") return(
    <div style={{...S.wrap}}>
      <div style={{...S.top}}>
        <button onClick={()=>setExamScreen(null)} style={{background:"none",border:"none",color:ACCENT,fontWeight:800,fontSize:"17px",cursor:"pointer"}}>←</button>
        <span style={{fontWeight:800,color:ACCENT}}>📝 Certification Exam</span>
        <div style={{width:"40px"}}/>
      </div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"24px 16px",background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,borderRadius:"16px",marginBottom:"20px",color:"#fff"}}>
          <div style={{fontSize:"48px",marginBottom:"10px"}}>📜</div>
          <h2 style={{margin:"0 0 6px",fontSize:"20px"}}>GoPlanet Certification</h2>
          <p style={{margin:0,fontSize:"13px",opacity:0.9}}>50 questions · Score 40+ to earn your certificate</p>
        </div>
        <div style={S.card}>
          <p style={{margin:"0 0 12px",fontWeight:700,fontSize:"14px",color:ACCENT}}>ℹ️ Before you begin</p>
          {[
            "Your name will appear exactly as you type it on the certificate.",
            "Score 40 or above out of 50 to earn a downloadable certificate.",
            "Today's date will be auto-printed on the certificate.",
            "You can retake the exam anytime from Settings.",
          ].map((t,i)=>(
            <p key={i} style={{margin:"0 0 8px",fontSize:"13px",color:MUTED,lineHeight:1.5}}>✅ {t}</p>
          ))}
        </div>
        <div style={S.card}>
          <p style={{margin:"0 0 14px",fontWeight:700,fontSize:"14px",color:ACCENT}}>👤 Your Details</p>
          <div style={{marginBottom:"10px"}}>
            <span style={S.lbl}>Full Name (appears on certificate) *</span>
            <input style={S.inp} placeholder="e.g. Alice Johnson" value={examName}
              onChange={e=>setExamName(e.target.value)}/>
          </div>
          <div style={{marginBottom:"12px"}}>
            <span style={S.lbl}>Email Address *</span>
            <input style={S.inp} type="email" placeholder="e.g. alice@example.com" value={examEmail}
              onChange={e=>setExamEmail(e.target.value)}/>
          </div>
          {examErr&&<div style={S.err}>{examErr}</div>}
          <button style={S.btn()} onClick={startExam}>Start Exam →</button>
        </div>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  if(examScreen==="exam"){
    const done=Object.keys(answers).length;
    const pct=Math.round(done/QUIZ.length*100);
    return(
      <div style={{...S.wrap}}>
        <div style={{...S.top,flexDirection:"column",height:"auto",padding:"10px 14px",gap:"8px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
            <button onClick={()=>setExamScreen("entry")} style={{background:"none",border:"none",color:"#e74c3c",fontWeight:700,fontSize:"13px",cursor:"pointer"}}>✕ Exit</button>
            <span style={{fontWeight:700,fontSize:"14px"}}>Certification Exam</span>
            <span style={{fontSize:"12px",color:ACCENT,background:"#f0ecff",padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{done}/{QUIZ.length}</span>
          </div>
          <div style={{width:"100%",height:"5px",background:BORDER,borderRadius:"3px",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${ACCENT},${ACCENT2})`,borderRadius:"3px",transition:"width 0.3s"}}/>
          </div>
        </div>
        <div style={{...S.body,padding:"14px"}}>
          {QUIZ.map((q,i)=>(
            <div key={i} style={{...S.card,border:answers[i]!==undefined?`1.5px solid ${ACCENT2}`:undefined}}>
              <p style={{fontWeight:700,fontSize:"13px",margin:"0 0 10px",lineHeight:1.6}}>
                <span style={{color:ACCENT,fontWeight:900}}>Q{i+1}. </span>{q.q}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {q.o.map((opt,j)=>(
                  <button key={j} onClick={()=>setAnswers(p=>({...p,[i]:j}))}
                    style={{textAlign:"left",padding:"9px 12px",borderRadius:"8px",
                      border:`1.5px solid ${answers[i]===j?ACCENT:BORDER}`,
                      background:answers[i]===j?"#f0ecff":"transparent",
                      cursor:"pointer",fontSize:"13px",
                      color:answers[i]===j?ACCENT:TEXT,
                      fontWeight:answers[i]===j?700:400}}>
                    <span style={{fontWeight:800,marginRight:"6px",color:answers[i]===j?ACCENT:MUTED}}>{["A","B","C","D"][j]}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{position:"sticky",bottom:"12px",marginTop:"4px"}}>
            <button style={{...S.btn(done<QUIZ.length?"#ccc":ACCENT),
              boxShadow:done>=QUIZ.length?"0 4px 18px rgba(108,92,231,0.4)":"none"}}
              disabled={done<QUIZ.length} onClick={submitExam}>
              {done<QUIZ.length?`Answer all questions (${done}/${QUIZ.length} done)`:"Submit Exam ✓"}
            </button>
          </div>
          <div style={{height:"24px"}}/>
        </div>
      </div>
    );
  }

  if(examScreen==="result"){
    const passed=examScore>=40;
    return(
      <div style={{...S.wrap}}>
        <div style={{...S.top}}>
          <div style={{width:"40px"}}/>
          <span style={{fontWeight:800,color:ACCENT}}>Exam Result</span>
          <div style={{width:"40px"}}/>
        </div>
        <div style={{...S.body,padding:"16px"}}>
          <div style={{textAlign:"center",padding:"28px 16px",borderRadius:"16px",marginBottom:"18px",color:"#fff",
            background:passed?`linear-gradient(135deg,${ACCENT},${ACCENT2})`:"linear-gradient(135deg,#e17055,#d63031)"}}>
            <div style={{fontSize:"56px",marginBottom:"10px"}}>{passed?"🏆":"📚"}</div>
            <h2 style={{margin:"0 0 6px"}}>{passed?"Congratulations!":"Almost There!"}</h2>
            <p style={{margin:"0 0 14px",opacity:0.9,fontSize:"14px"}}>{examName}</p>
            <div style={{display:"inline-block",background:"rgba(255,255,255,0.2)",borderRadius:"14px",padding:"10px 28px"}}>
              <span style={{fontSize:"38px",fontWeight:900}}>{examScore}</span>
              <span style={{fontSize:"16px",opacity:0.8}}> / 50</span>
            </div>
            <p style={{margin:"10px 0 0",fontSize:"13px",opacity:0.85}}>
              {passed?"You are now a GoPlanet Certified User!":`Need ${40-examScore} more correct answer${40-examScore===1?"":"s"} to pass.`}
            </p>
          </div>

          <div style={{...S.card,marginBottom:"14px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",textAlign:"center"}}>
              {[["✅ Correct",examScore,"#00b894"],["❌ Wrong",50-examScore,"#e74c3c"],["📊 Score",`${Math.round(examScore/50*100)}%`,ACCENT]].map(([l,v,col],i)=>(
                <div key={i}>
                  <p style={{fontSize:"22px",fontWeight:900,color:col,margin:0}}>{v}</p>
                  <p style={{fontSize:"11px",color:MUTED,margin:"3px 0 0"}}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {passed&&<>
            <div style={{...S.card,border:`2px solid ${ACCENT}`,background:"#f9f7ff",marginBottom:"12px"}}>
              <p style={{margin:"0 0 4px",fontWeight:700,color:ACCENT,fontSize:"14px"}}>🎉 Your certificate is ready!</p>
              <p style={{margin:0,fontSize:"13px",color:MUTED,lineHeight:1.6}}>Name: <strong>{examName}</strong> · Date: <strong>{certDate}</strong></p>
            </div>
            <button style={{...S.btn(),marginBottom:"10px"}} onClick={()=>setExamScreen("cert")}>View Certificate 🏆</button>
            <a href={certUrl} download={`GoPlanet_Certificate_${examName.replace(/\s+/g,"_")}.png`}
              style={{display:"block",...S.btn("#00b894"),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"12px",marginBottom:"10px"}}>
              📥 Download Certificate
            </a>
          </>}

          {!passed&&<div style={{...S.card,background:"#fff8f0",border:"1px solid #ffd0b0",marginBottom:"12px"}}>
            <p style={{margin:"0 0 4px",fontWeight:700,color:"#e17055",fontSize:"14px"}}>💡 You can do it!</p>
            <p style={{margin:0,fontSize:"13px",color:MUTED}}>Review the guide and retake. You need just {40-examScore} more!</p>
          </div>}

          <button style={S.btn(ACCENT2)} onClick={()=>{setAnswers({});setExamScreen("exam");}}>🔄 Retake Exam</button>
          <button style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:"13px",display:"block",margin:"14px auto 0",fontWeight:600}}
            onClick={()=>setExamScreen(null)}>← Back to Settings</button>
          <div style={{height:"20px"}}/>
        </div>
      </div>
    );
  }

  if(examScreen==="cert") return(
    <div style={{...S.wrap}}>
      <div style={{...S.top}}>
        <button onClick={()=>setExamScreen("result")} style={{background:"none",border:"none",color:ACCENT,fontWeight:800,fontSize:"17px",cursor:"pointer"}}>←</button>
        <span style={{fontWeight:800,color:ACCENT}}>🏆 Certificate</span>
        <div style={{width:"40px"}}/>
      </div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"18px",background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,borderRadius:"14px",marginBottom:"14px",color:"#fff"}}>
          <div style={{fontSize:"36px",marginBottom:"6px"}}>🏆</div>
          <h3 style={{margin:"0 0 3px"}}>GoPlanet Certified User</h3>
          <p style={{margin:"0 0 2px",fontWeight:700}}>{examName}</p>
          <p style={{margin:0,fontSize:"12px",opacity:0.85}}>{examScore}/50 · {certDate}</p>
        </div>
        <img src={certUrl} alt="Certificate" style={{width:"100%",borderRadius:"12px",border:`2px solid ${ACCENT}`,display:"block",marginBottom:"12px"}}/>
        <a href={certUrl} download={`GoPlanet_Certificate_${examName.replace(/\s+/g,"_")}.png`}
          style={{display:"block",...S.btn(),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"13px",marginBottom:"10px"}}>
          📥 Download Certificate
        </a>
        <button style={S.btn(ACCENT2)} onClick={()=>{setAnswers({});setExamScreen("exam");}}>🔄 Retake Exam</button>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════
  //  MAIN APP
  // ════════════════════════════════════════════════════════
  const chatList=Object.keys(chats).map(id=>({
    id,
    preview:(chats[id]?.find(m=>m.role==="user")?.text||"New Chat").slice(0,30),
  })).reverse();
  const projList=Object.keys(projects).map(id=>({id,...projects[id]}));

  const TABS=[
    {id:"chat",   icon:"💬",label:"Chat"},
    {id:"projects",icon:"📁",label:"Projects"},
    {id:"image",  icon:"🎨",label:"Images"},
    {id:"plans",  icon:"⭐",label:"Plans"},
    {id:"settings",icon:"⚙️",label:"Settings"},
    ...(user?.isAdmin?[{id:"admin",icon:"🛡️",label:"Admin"}]:[]),
  ];

  // Sidebar
  const Sidebar=()=>(
    <>
      {sidebarOpen&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",zIndex:99}} onClick={()=>setSidebar(false)}/>}
      <div style={{position:"absolute",top:0,left:sidebarOpen?0:"-100%",width:"82%",maxWidth:"320px",height:"100%",
        background:SURF,zIndex:100,transition:"left 0.25s",boxShadow:sidebarOpen?"5px 0 24px rgba(0,0,0,0.2)":"none",
        display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Sidebar header */}
        <div style={{padding:"14px",borderBottom:`1px solid ${BORDER}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={S.logoRow}><div style={S.logoBox}>🌍</div>GoPlanet</div>
            <button onClick={()=>setSidebar(false)} style={{background:"none",border:"none",color:MUTED,fontSize:"22px",cursor:"pointer"}}>✕</button>
          </div>
          {/* User card */}
          <div style={{display:"flex",gap:"10px",alignItems:"center",padding:"10px 12px",
            background:dark?"#12122a":"#f5f3ff",borderRadius:"10px"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",background:ACCENT,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontWeight:800,fontSize:"16px",flexShrink:0}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{minWidth:0}}>
              <p style={{margin:0,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</p>
              <p style={{margin:0,fontSize:"11px",color:MUTED}}>{user?.isPro?"⭐ Pro Member":"Free Member"}</p>
            </div>
          </div>
        </div>

        {/* Sidebar content */}
        <div style={{flex:1,padding:"12px",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <button style={{...S.btn(),marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}} onClick={newChat}>
            + New Chat
          </button>

          <p style={S.lbl}>Recent Chats</p>
          {chatList.length===0&&<p style={{fontSize:"12px",color:MUTED}}>No chats yet.</p>}
          {chatList.slice(0,8).map(c=>(
            <button key={c.id} onClick={()=>openChat(c.id)}
              style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",marginBottom:"4px",
                borderRadius:"8px",border:"none",
                background:activeChat===c.id?"#f0ecff":"transparent",
                cursor:"pointer",fontSize:"12px",color:activeChat===c.id?ACCENT:TEXT}}>
              💬 {c.preview}…
            </button>
          ))}

          <p style={{...S.lbl,marginTop:"14px"}}>Projects</p>
          {projList.map(p=>(
            <div key={p.id} style={{padding:"7px 10px",fontSize:"12px",color:MUTED}}>📁 {p.name}</div>
          ))}
          <button onClick={()=>{setTab("projects");setSidebar(false);}}
            style={{background:"none",border:"none",color:ACCENT,cursor:"pointer",fontSize:"12px",padding:"4px 10px"}}>
            + New Project
          </button>
        </div>

        {/* Pro upsell */}
        {!user?.isPro&&(
          <div style={{margin:"12px",padding:"14px",
            background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,
            borderRadius:"12px",color:"#fff"}}>
            <p style={{margin:"0 0 3px",fontWeight:800}}>⭐ Upgrade to Pro</p>
            <p style={{margin:"0 0 10px",fontSize:"12px",opacity:0.9}}>$25/year — Unlock all features</p>
            <button onClick={()=>{setSubModal(true);setSidebar(false);setTab("plans");}}
              style={{background:"#fff",color:ACCENT,border:"none",borderRadius:"8px",
                padding:"7px 16px",fontSize:"12px",fontWeight:800,cursor:"pointer"}}>
              Subscribe Now
            </button>
          </div>
        )}

        <button onClick={logout}
          style={{margin:"0 12px 14px",background:"none",border:`1px solid #e74c3c`,
            color:"#e74c3c",borderRadius:"8px",padding:"9px",cursor:"pointer",fontSize:"13px",fontWeight:600}}>
          🚪 Log Out
        </button>
      </div>
    </>
  );

  // Chat tab
  const ChatTab=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Power mode badge */}
      <div style={{padding:"6px 14px",background:dark?"#12122a":"#f8f7ff",borderBottom:`1px solid ${BORDER}`,flexShrink:0}}>
        <p style={{margin:0,fontSize:"11px",textAlign:"center",color:MUTED}}>
          Powered by:{" "}
          <span style={{color:ACCENT,fontWeight:700}}>
            {powerMode==="api"&&groqKey.startsWith("gsk_")
              ?`Groq API · ${MODELS.find(m=>m.id===selModel)?.name||selModel}`
              :"Code Mode"}
          </span>
          <button onClick={()=>{const nm=powerMode==="api"?"code":"api";setPower(nm);saveSettings({powerMode:nm});}}
            style={{marginLeft:"8px",fontSize:"10px",background:"#f0ecff",color:ACCENT,
              border:"none",borderRadius:"6px",padding:"2px 8px",cursor:"pointer"}}>
            Switch
          </button>
        </p>
      </div>

      {!activeChat?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:"60px",marginBottom:"14px"}}>🌍</div>
          <h2 style={{color:ACCENT,marginBottom:"6px",fontSize:"22px"}}>GoPlanet AI</h2>
          <p style={{color:MUTED,fontSize:"13px",marginBottom:"24px",lineHeight:1.6}}>
            Your intelligent assistant for chatting, creating, coding, and more.
          </p>
          <button style={S.btn()} onClick={newChat}>+ Start New Chat</button>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"20px",justifyContent:"center"}}>
            {MODELS.map(m=>(
              <button key={m.id} onClick={()=>{setModel(m.id);saveSettings({selModel:m.id});}}
                style={{padding:"6px 12px",borderRadius:"20px",
                  border:`1.5px solid ${selModel===m.id?ACCENT:BORDER}`,
                  background:selModel===m.id?"#f0ecff":"transparent",
                  color:selModel===m.id?ACCENT:MUTED,
                  fontSize:"11px",cursor:"pointer",fontWeight:selModel===m.id?700:400}}>
                {m.name}
              </button>
            ))}
          </div>
        </div>
      ):(
        <>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 14px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",
                marginBottom:"10px",gap:"8px",alignItems:"flex-end"}}>
                {m.role==="ai"&&(
                  <div style={{width:"28px",height:"28px",borderRadius:"50%",background:ACCENT,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}}>🌍</div>
                )}
                <div style={{maxWidth:"78%",padding:"10px 13px",
                  borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
                  background:m.role==="user"?ACCENT:dark?"#1e1e3a":"#f0ecff",
                  color:m.role==="user"?"#fff":TEXT,fontSize:"13px",lineHeight:1.6,wordBreak:"break-word"}}>
                  <pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{m.text}</pre>
                </div>
                {m.role==="user"&&(
                  <div style={{width:"28px",height:"28px",borderRadius:"50%",background:ACCENT2,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#fff",fontWeight:800,fontSize:"12px",flexShrink:0}}>
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
            ))}
            {typing&&(
              <div style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"flex-end"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:ACCENT,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>🌍</div>
                <div style={{padding:"10px 16px",borderRadius:"4px 16px 16px 16px",
                  background:dark?"#1e1e3a":"#f0ecff"}}>
                  <span style={{fontSize:"18px",letterSpacing:"4px",color:ACCENT}}>•••</span>
                </div>
              </div>
            )}
            <div ref={chatBottom}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:"8px",flexShrink:0}}>
            <input style={{...S.inp,flex:1}} placeholder="Type your message…" value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}/>
            <button onClick={sendMsg} disabled={!input.trim()||typing}
              style={{width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,
                background:input.trim()&&!typing?ACCENT:"#ccc",
                border:"none",color:"#fff",fontSize:"18px",cursor:input.trim()&&!typing?"pointer":"default"}}>
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Projects tab
  const ProjectsTab=()=>{
    const [showForm,setShowForm]=useState(false);
    return(
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <h2 style={{margin:0,color:ACCENT,fontSize:"18px"}}>📁 Projects</h2>
          <button onClick={()=>setShowForm(true)}
            style={{background:ACCENT,color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>
            + New
          </button>
        </div>
        {showForm&&(
          <div style={{...S.card,background:"#f0ecff",marginBottom:"14px"}}>
            <input style={{...S.inp,marginBottom:"8px"}} placeholder="Project name…" value={newProj}
              onChange={e=>setNewProj(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProject()}/>
            <div style={{display:"flex",gap:"8px"}}>
              <button style={S.btn()} onClick={createProject}>Create</button>
              <button style={{...S.btn("#e0e0e0","#444"),flex:"none",padding:"12px 20px"}} onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {projList.length===0?(
          <div style={{textAlign:"center",marginTop:"50px",color:MUTED}}>
            <div style={{fontSize:"40px",marginBottom:"10px"}}>📁</div>
            <p style={{fontSize:"14px"}}>No projects yet. Create one!</p>
          </div>
        ):projList.map(p=>(
          <div key={p.id} style={S.card}>
            <p style={{margin:0,fontWeight:700,fontSize:"14px"}}>📁 {p.name}</p>
            <p style={{margin:"4px 0 0",fontSize:"11px",color:MUTED}}>Created {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  };

  // Image tab
  const ImageTab=()=>(
    <div style={{padding:"16px"}}>
      <h2 style={{color:ACCENT,marginTop:0}}>🎨 Image Generator</h2>
      <p style={{color:MUTED,fontSize:"13px",marginBottom:"14px"}}>Describe the image you want to generate.</p>
      <textarea style={{...S.inp,height:"80px",resize:"none",marginBottom:"12px"}}
        placeholder="e.g. A futuristic city floating in clouds…"
        value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)}/>
      <button style={S.btn()} onClick={()=>{if(imgPrompt.trim()) setGenImg(`https://picsum.photos/seed/${encodeURIComponent(imgPrompt)}/800/600`);}}>
        Generate Image
      </button>
      {genImg&&<img src={genImg} alt="Generated" style={{width:"100%",borderRadius:"12px",marginTop:"14px",border:`1px solid ${BORDER}`}}/>}
      <p style={{fontSize:"11px",color:MUTED,marginTop:"10px",textAlign:"center"}}>Connect an image generation API for real AI images.</p>
    </div>
  );

  // Plans tab
  const PlansTab=()=>(
    <div style={{padding:"16px"}}>
      <h2 style={{color:ACCENT,marginTop:0}}>⭐ Subscription Plans</h2>
      {user?.isPro?(
        <div style={{...S.card,background:`linear-gradient(135deg,${ACCENT},${ACCENT2})`,color:"#fff",border:"none"}}>
          <h3 style={{margin:"0 0 8px"}}>⭐ Pro Plan Active</h3>
          <p style={{margin:0,fontSize:"13px",opacity:0.9}}>You have full access to all premium features.</p>
          {["Faster AI responses","Advanced AI models","Priority support","Early access features"].map(f=>(
            <p key={f} style={{margin:"6px 0 0",fontSize:"13px"}}>✓ {f}</p>
          ))}
        </div>
      ):(
        <>
          <div style={{...S.card,border:`2px solid ${ACCENT}`}}>
            <span style={{background:ACCENT,color:"#fff",borderRadius:"6px",padding:"2px 10px",fontSize:"11px",fontWeight:700}}>BEST VALUE</span>
            <h3 style={{color:ACCENT,margin:"10px 0 4px"}}>Pro Plan</h3>
            <p style={{fontSize:"28px",fontWeight:900,color:ACCENT,margin:"0 0 14px"}}>$25<span style={{fontSize:"14px",color:MUTED}}>/year</span></p>
            {["Faster AI responses","Advanced AI models","Priority support","Early access features"].map(f=>(
              <p key={f} style={{margin:"4px 0",fontSize:"13px",color:MUTED}}>✓ {f}</p>
            ))}
            <button style={{...S.btn(),marginTop:"14px"}} onClick={()=>setSubModal(true)}>Subscribe Now</button>
          </div>
          <div style={S.card}>
            <h3 style={{margin:"0 0 4px"}}>Free Plan</h3>
            <p style={{fontSize:"22px",fontWeight:900,color:MUTED,margin:"0 0 10px"}}>$0</p>
            {["Basic AI responses","Standard models","Community support"].map(f=>(
              <p key={f} style={{margin:"4px 0",fontSize:"13px",color:MUTED}}>• {f}</p>
            ))}
          </div>
        </>
      )}

      {subModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div style={{background:SURF,borderRadius:"18px",padding:"24px",width:"100%",maxWidth:"360px",border:`1px solid ${BORDER}`}}>
            <h3 style={{color:ACCENT,margin:"0 0 6px"}}>Complete Subscription</h3>
            <p style={{fontSize:"13px",color:MUTED,marginBottom:"16px"}}>Pro Plan — $25/year</p>
            <input style={{...S.inp,marginBottom:"8px"}} placeholder="Card number"/>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
              <input style={{...S.inp,flex:1}} placeholder="MM/YY"/>
              <input style={{...S.inp,flex:1}} placeholder="CVV"/>
            </div>
            <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{
              patchUser({isPro:true}); setSubModal(false);
              alert("🎉 Pro activated!");
            }}>Pay $25/year</button>
            <button style={{background:"none",border:"none",color:MUTED,cursor:"pointer",fontSize:"13px",width:"100%"}}
              onClick={()=>setSubModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  // Settings tab
  const SettingsTab=()=>(
    <div style={{padding:"16px"}}>
      <h2 style={{color:ACCENT,marginTop:0}}>⚙️ Settings</h2>

      <div style={S.card}>
        <span style={S.lbl}>🔑 Groq API Key</span>
        <p style={{fontSize:"12px",color:MUTED,margin:"0 0 8px",lineHeight:1.5}}>
          Get a free key at console.groq.com and paste it below to power the chatbot with Groq AI.
        </p>
        <input style={{...S.inp,fontFamily:"monospace",fontSize:"12px",marginBottom:"8px"}}
          type="password" placeholder="gsk_…" value={groqKey}
          onChange={e=>setGroqKey(e.target.value)}/>
        <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
          {["api","code"].map(m=>(
            <button key={m} onClick={()=>{setPower(m);saveSettings({powerMode:m});}}
              style={{flex:1,padding:"9px",borderRadius:"9px",
                border:`1.5px solid ${powerMode===m?ACCENT:BORDER}`,
                background:powerMode===m?"#f0ecff":"transparent",
                color:powerMode===m?ACCENT:MUTED,cursor:"pointer",fontSize:"12px",fontWeight:700}}>
              {m==="api"?"🔗 API Mode":"💻 Code Mode"}
            </button>
          ))}
        </div>
        <button style={S.btn()} onClick={()=>{saveSettings({groqKey,powerMode});alert("✅ Saved!");}}>
          Save API Settings
        </button>
      </div>

      <div style={S.card}>
        <span style={S.lbl}>🤖 AI Model</span>
        {MODELS.map(m=>(
          <button key={m.id} onClick={()=>{setModel(m.id);saveSettings({selModel:m.id});}}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",
              padding:"9px 12px",marginBottom:"6px",borderRadius:"9px",
              border:`1.5px solid ${selModel===m.id?ACCENT:BORDER}`,
              background:selModel===m.id?"#f0ecff":"transparent",
              cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:"13px",color:selModel===m.id?ACCENT:TEXT,fontWeight:selModel===m.id?700:400}}>{m.name}</span>
            <span style={{fontSize:"11px",color:MUTED}}>{m.tag}</span>
          </button>
        ))}
      </div>

      <div style={S.card}>
        <span style={S.lbl}>🎨 Appearance</span>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:"13px"}}>Dark Mode</span>
          <button onClick={()=>{setDark(d=>{saveSettings({dark:!d});return !d;});}}
            style={{width:"48px",height:"26px",borderRadius:"13px",
              background:dark?ACCENT:"#ddd",border:"none",cursor:"pointer",
              position:"relative",transition:"background 0.2s"}}>
            <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"#fff",
              position:"absolute",top:"2px",left:dark?"24px":"2px",
              transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
          </button>
        </div>
      </div>

      <div style={S.card}>
        <span style={S.lbl}>📜 Certification (Optional)</span>
        <p style={{fontSize:"12px",color:MUTED,margin:"0 0 10px",lineHeight:1.5}}>
          Test your knowledge of AI and GoPlanet. Score 40/50 or above to earn a downloadable certificate with your name on it.
        </p>
        <button style={{...S.btn(ACCENT2),marginBottom:"8px"}} onClick={()=>setExamScreen("guide")}>
          📖 Read User Guide
        </button>
        <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{
          setExamName(user?.name||""); setExamEmail(user?.email||"");
          setExamErr(""); setExamScreen("entry");
        }}>
          📝 Enter Exam
        </button>
        {user?.examScore!=null&&(
          <button style={{...S.btn("#e17055"),marginBottom:"8px"}} onClick={()=>{
            setExamName(user?.name||""); setExamEmail(user?.email||"");
            setAnswers({}); setExamErr(""); setExamScreen("entry");
          }}>
            🔄 Re-take Exam
          </button>
        )}
        {user?.certGranted&&(
          <button style={S.btn("#00b894")} onClick={()=>{
            if(!certUrl){
              const url=makeCert(user.name,user.examScore,user.certDate);
              setCertUrl(url); setCertDate(user.certDate); setExamName(user.name); setExamScore(user.examScore);
            }
            setExamScreen("cert");
          }}>
            🏆 View My Certificate
          </button>
        )}
        {user?.examScore!=null&&(
          <p style={{margin:"8px 0 0",fontSize:"12px",color:MUTED,textAlign:"center"}}>
            Last score: {user.examScore}/50 {user.examScore>=40?"✅ Passed":"— need 40 to pass"}
          </p>
        )}
      </div>

      <div style={S.card}>
        <span style={S.lbl}>👤 Account</span>
        {[["Name",user?.name],["Email",user?.email],["Mobile",user?.mobile],
          ["Plan",user?.isPro?"⭐ Pro":"Free"],
          ["Joined",user?.joinedAt?new Date(user.joinedAt).toLocaleDateString():"—"]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",
            padding:"6px 0",borderBottom:`1px solid ${BORDER}`,fontSize:"13px"}}>
            <span style={{color:MUTED}}>{k}</span>
            <span style={{fontWeight:600}}>{v||"—"}</span>
          </div>
        ))}
        <button style={{...S.btn("#e74c3c"),marginTop:"14px"}} onClick={logout}>🚪 Log Out</button>
      </div>
    </div>
  );

  // Admin tab
  const AdminTab=()=>{
    useEffect(()=>{ if(user?.isAdmin) loadAdminUsers(); },[]);
    if(!user?.isAdmin) return(
      <div style={{padding:"16px",textAlign:"center",marginTop:"60px"}}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>🔒</div>
        <p style={{color:"#e74c3c",fontWeight:700}}>Admin access required</p>
      </div>
    );
    return(
      <div style={{padding:"16px"}}>
        <h2 style={{color:ACCENT,marginTop:0}}>🛡️ Admin Panel</h2>
        <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
          {["members","stats"].map(t=>(
            <button key={t} onClick={()=>{setAdminTab(t);if(t==="members")loadAdminUsers();}}
              style={{flex:1,padding:"9px",borderRadius:"9px",
                border:`1.5px solid ${adminTab===t?ACCENT:BORDER}`,
                background:adminTab===t?"#f0ecff":"transparent",
                color:adminTab===t?ACCENT:MUTED,cursor:"pointer",fontWeight:700,
                fontSize:"13px",textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>

        {adminTab==="stats"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            {[["Total",adminUsers.length],["Pro",adminUsers.filter(u=>u.isPro).length],
              ["Certified",adminUsers.filter(u=>u.certGranted).length],
              ["Admins",adminUsers.filter(u=>u.isAdmin).length]].map(([l,v])=>(
              <div key={l} style={{...S.card,textAlign:"center",padding:"14px"}}>
                <p style={{fontSize:"30px",fontWeight:900,color:ACCENT,margin:0}}>{v}</p>
                <p style={{fontSize:"11px",color:MUTED,margin:"4px 0 0"}}>{l} Members</p>
              </div>
            ))}
          </div>
        )}

        {adminTab==="members"&&(
          <>
            <p style={{fontSize:"12px",color:MUTED,marginBottom:"12px"}}>{adminUsers.length} registered member(s)</p>
            {adminUsers.map((u,i)=>(
              <div key={i} style={S.card}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:ACCENT,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#fff",fontWeight:800,fontSize:"15px",flexShrink:0}}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:0,fontWeight:700,fontSize:"13px"}}>
                      {u.name}{" "}
                      {u.isAdmin&&<span style={{background:ACCENT,color:"#fff",borderRadius:"4px",padding:"1px 7px",fontSize:"10px"}}>Admin</span>}
                    </p>
                    <p style={{margin:0,fontSize:"11px",color:MUTED,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
                  {[u.isPro?"⭐ Pro":"Free",u.certGranted?"🏆 Certified":""].filter(Boolean).map((b,j)=>(
                    <span key={j} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"10px",background:"#f0ecff",color:ACCENT,fontWeight:600}}>{b}</span>
                  ))}
                </div>
                {u.examScore!=null&&<p style={{margin:"0 0 8px",fontSize:"11px",color:MUTED}}>Exam: {u.examScore}/50</p>}
                <div style={{display:"flex",gap:"6px"}}>
                  {!u.isPro&&<button onClick={()=>grantPro(u.id)}
                    style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:ACCENT,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>
                    Grant Pro
                  </button>}
                  {!u.isAdmin&&<button onClick={()=>grantAdmin(u.id)}
                    style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:ACCENT2,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>
                    Grant Admin
                  </button>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return(
    <div style={S.wrap}>
      <Sidebar/>

      {/* Top bar */}
      <div style={S.top}>
        <button onClick={()=>setSidebar(p=>!p)}
          style={{background:"none",border:"none",fontSize:"22px",cursor:"pointer",color:TEXT,padding:"2px 6px"}}>
          ☰
        </button>
        <div style={S.logoRow}>
          <div style={S.logoBox}>🌍</div>
          GoPlanet
        </div>
        <div style={{width:"34px",height:"34px",borderRadius:"50%",background:ACCENT,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"#fff",fontWeight:800,fontSize:"14px"}}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Tab content */}
      <div style={S.body}>
        {tab==="chat"     &&<ChatTab/>}
        {tab==="projects" &&<ProjectsTab/>}
        {tab==="image"    &&<ImageTab/>}
        {tab==="plans"    &&<PlansTab/>}
        {tab==="settings" &&<SettingsTab/>}
        {tab==="admin"    &&<AdminTab/>}
      </div>

      {/* Bottom nav */}
      <div style={S.nav}>
        {TABS.map(t=>(
          <button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}>
            <span style={{fontSize:"20px"}}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import{useState,useEffect,useRef,useCallback}from"react";
import L from"./logoData.js";

// ─── Secure Per-User Storage ─────────────────────────────────
// Every key is namespaced per user ID. No cross-user data leakage.
// API keys stored ONLY in private settings key, never in user object.
const DB={
  g:(k,d=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  s:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  d:(k)=>{try{localStorage.removeItem(k);}catch{}},
};
const SESS="gp_sess",UIDX="gp_uidx";
const uK=id=>"gp_u_"+id, cK=id=>"gp_c_"+id, pK=id=>"gp_p_"+id, sK=id=>"gp_s_"+id;
const mkId=e=>btoa(encodeURIComponent(e.toLowerCase().trim())).replace(/[^a-zA-Z0-9]/g,"").slice(0,24);
const now=()=>new Date().toLocaleTimeString();

// ─── 50 Quiz Questions ───────────────────────────────────────
const QUIZ=[
  {q:"What does AI stand for?",o:["Automated Interface","Artificial Intelligence","Advanced Integration","Automated Input"],a:1},
  {q:"What is GoPlanet's primary function?",o:["File Storage","AI Chatbot Platform","Social Network","Video Streaming"],a:1},
  {q:"Which API powers GoPlanet's chatbot?",o:["OpenAI","Gemini","Groq","Cohere"],a:2},
  {q:"What does LLM stand for?",o:["Large Language Model","Logical Learning Machine","Local Logic Module","Linear Learning Method"],a:0},
  {q:"Minimum score to earn a GoPlanet certificate?",o:["30/50","35/50","40/50","45/50"],a:2},
  {q:"What does 'prompt' mean in AI?",o:["A payment","User input to the AI","A notification","A file format"],a:1},
  {q:"What is 'context' in an AI conversation?",o:["Font size","Previous chat history","Background colour","User location"],a:1},
  {q:"Which is a responsible AI principle?",o:["Share passwords","Use AI with integrity","Replace human decisions","Ignore errors"],a:1},
  {q:"What is a Groq API key used for?",o:["Login","Access to Groq AI services","File encryption","Image generation"],a:1},
  {q:"What does 'token' mean in AI?",o:["Cryptocurrency","A unit of text","A user account","A payment method"],a:1},
  {q:"What is machine learning?",o:["Teaching machines to walk","AI learning from data","Programming robots","Computer maintenance"],a:1},
  {q:"What is NLP?",o:["Code in English","AI understanding human language","Network protocols","Nature computing"],a:1},
  {q:"What does 'Human First' mean?",o:["Humans do everything","Empower people, not replace them","Humans control AI","Only humans use AI"],a:1},
  {q:"What is a chatbot?",o:["A physical robot","Software simulating conversation","A chat room","A messaging app"],a:1},
  {q:"What is GoPlanet certification about?",o:["Coding only","Responsible AI usage","Database management","Web design"],a:1},
  {q:"What does 'inference' mean in AI?",o:["Training a model","Running AI to get answers","Deleting data","Uploading datasets"],a:1},
  {q:"What is a subscription plan?",o:["Free service forever","Paid tier with extra features","One-time purchase","Government program"],a:1},
  {q:"What does 'hallucination' mean in AI?",o:["AI seeing images","AI generating false info","AI sleeping","AI voice response"],a:1},
  {q:"Purpose of a user guide?",o:["To restrict users","Help users understand the app","Collect data","Show ads"],a:1},
  {q:"What is 'Effective' in GoPlanet?",o:["Being strict","Work smarter, achieve more","Using expensive tools","Coding everything"],a:1},
  {q:"What is 'Smart Thinking' in GoPlanet?",o:["Memorising facts","Solve problems with intelligence","Working faster","Using shortcuts"],a:1},
  {q:"What is an admin?",o:["A regular user","User with management privileges","Paid subscriber only","Developer only"],a:1},
  {q:"What does Pro subscription offer?",o:["Same as free","Faster responses and more features","Less storage","Fewer models"],a:1},
  {q:"What is a language model's training data?",o:["Images only","Large amounts of text","Audio files","Code files"],a:1},
  {q:"What does 'Honest Use' mean?",o:["Using AI to cheat","Use technology with integrity","Only free tools","Sharing all data"],a:1},
  {q:"What is an API?",o:["Application Programming Interface","Automated Program Input","Advanced Page Interface","App Protocol Integration"],a:0},
  {q:"What to do if AI gives wrong info?",o:["Trust it completely","Verify with reliable sources","Delete the app","Report to police"],a:1},
  {q:"GoPlanet's chatbot is powered by?",o:["Facebook AI","Google Bard","Groq API","Amazon Alexa"],a:2},
  {q:"What is 'temperature' in AI?",o:["Server heat","Controls randomness of output","User's climate","Battery level"],a:1},
  {q:"Best practice with AI chatbots?",o:["Never verify answers","Cross-check important info","Share passwords","Use blindly"],a:1},
  {q:"Certification date is based on?",o:["App launch date","The day you take the exam","Your birthday","A fixed annual date"],a:1},
  {q:"GoPlanet is designed for?",o:["Gaming","Everyone — easy AI chatbot","Developers only","Children under 10"],a:1},
  {q:"What is 'Secure & Private'?",o:["Data sold to partners","Data encrypted and safe","Data is public","No security"],a:1},
  {q:"What is a multiple-choice exam?",o:["Essay writing","Questions with answer options","Oral exam","Drawing test"],a:1},
  {q:"What is 'context window' in AI?",o:["Browser window size","Amount of text AI processes","Screen resolution","Network bandwidth"],a:1},
  {q:"What does re-taking an exam allow?",o:["Higher score automatically","Attempting again after failure","Changing questions","Free subscription"],a:1},
  {q:"What is an AI project in GoPlanet?",o:["Physical project","Organised workspace for AI tasks","Government initiative","Hardware device"],a:1},
  {q:"What makes GoPlanet 'Innovative AI'?",o:["Uses old technology","Choose from best open models","No model options","One fixed model"],a:1},
  {q:"What is 'User Friendly' design?",o:["For tech experts","Designed for everyone","Complex on purpose","No help docs"],a:1},
  {q:"Purpose of subscription tiers?",o:["To confuse users","Offer different feature levels","Restrict all users","Remove features"],a:1},
  {q:"What to do before sharing AI content?",o:["Share immediately","Review and verify accuracy","Delete it","Print it"],a:1},
  {q:"Role of AI in communication?",o:["Replace human communication","Enhance and assist humans","Stop communication","Monitor users"],a:1},
  {q:"What is a real-world AI application?",o:["AI in fiction","AI solving everyday problems","AI in games only","AI in space"],a:1},
  {q:"After completing GoPlanet certification?",o:["Nothing","Receive certificate if score >= 40","Get a free phone","Become admin automatically"],a:1},
  {q:"What is model selection in GoPlanet?",o:["Choosing clothing","Selecting which AI model to use","Picking themes","Choosing plans"],a:1},
  {q:"What does an AI assistant help with?",o:["Only math","Chatting, creating, coding, and more","Only images","Only translations"],a:1},
  {q:"Recommended approach to AI usage?",o:["Rely on AI for everything","Use AI as a tool, not replace judgment","Never use AI","Entertainment only"],a:1},
  {q:"What is voice mode in GoPlanet?",o:["Music player","Speaking to and hearing from AI","Phone call","Video chat"],a:1},
  {q:"What is Groq in GoPlanet?",o:["Social network","Fast AI inference API","Storage service","Payment gateway"],a:1},
  {q:"Which principle says 'Empower people, not replace them'?",o:["Honest Use","Smart Thinking","Effective","Human First"],a:3},
];

// ─── Guide chapters ──────────────────────────────────────────
const GUIDE=[
  {icon:"🚀",title:"Getting Started",color:"#6c5ce7",steps:[{h:"Register",b:"Create your account with email, password, full name, and mobile number."},{h:"Log In",b:"Sign in — your session persists automatically."},{h:"Start Chatting",b:"Tap + New Chat to begin your first AI conversation."},{h:"Navigate",b:"Use the sidebar (desktop) or bottom bar (mobile) to switch sections."}],tip:"Your data saves automatically. Nothing is lost when you close the app.",note:"No email verification required. Register and start immediately."},
  {icon:"🔑",title:"Setting Up Your API Keys",color:"#e17055",steps:[{h:"Visit Groq",b:"Go to console.groq.com and create a free account to get your Groq API key."},{h:"Visit OpenAI",b:"Go to platform.openai.com to get your OpenAI API key (optional)."},{h:"Save Keys",b:"Go to ⚙️ Settings → API Keys, paste your key(s), and tap Save."},{h:"Choose Provider",b:"Select Groq or OpenAI as your AI provider in Settings."}],tip:"Your API keys are stored ONLY on your device — never sent to any server or visible to other users.",note:"Without an API key the chatbot will not respond. This is a one-time setup."},
  {icon:"💬",title:"Using the AI Chatbot",color:"#00b894",steps:[{h:"New Chat",b:"Tap + New Chat from the sidebar or welcome screen."},{h:"Type & Send",b:"Type your message and press Enter or tap the send button."},{h:"Voice Mode",b:"Tap 🎤 to speak. The AI listens and replies aloud."},{h:"Chat History",b:"All chats are saved in the sidebar. Tap any to continue."}],tip:"Switch AI models anytime from the model selector.",note:"Your conversations stay private on your device only."},
  {icon:"📁",title:"Managing Projects",color:"#fdcb6e",steps:[{h:"Open Projects",b:"Tap the 📁 Projects section in the sidebar."},{h:"Create Project",b:"Tap + New, enter a name, and tap Create."},{h:"Organise",b:"Use projects to group related AI tasks and ideas."},{h:"Access Anytime",b:"All projects are saved and available every time you open the app."}],tip:"Create separate projects for Work, Personal, Creative Writing, Research, etc.",note:"Projects are stored locally on your device."},
  {icon:"🎨",title:"Image Generator",color:"#a29bfe",steps:[{h:"Open Images",b:"Tap 🎨 Images in the sidebar or bottom nav."},{h:"Write Prompt",b:"Describe the image you want — be as detailed as possible."},{h:"Generate",b:"Tap Generate Image and wait for the result."},{h:"Try Again",b:"Edit your prompt and generate again."}],tip:"More detail = better results.",note:"Connect an image generation API key in Settings for real AI-generated images."},
  {icon:"⭐",title:"Subscription Plans",color:"#f9ca24",steps:[{h:"Free Plan",b:"Basic AI responses using standard models."},{h:"Pro Plan",b:"$25/year — faster responses, advanced models, priority support."},{h:"Advance Plan",b:"$50/year — very fast AI, very advanced models, all early access features."},{h:"Subscribe",b:"Go to Plans, tap Subscribe Now, and complete the payment."}],tip:"Advance Plan gives you the fastest and most powerful AI experience.",note:"Admins can grant Pro or Advance to any user from the Admin Panel."},
  {icon:"🛡️",title:"Admin Panel",color:"#e84393",steps:[{h:"Who is Admin?",b:"A user becomes Admin ONLY by scoring 40+ on the certification exam OR by being granted admin by an existing admin."},{h:"Admin Tab",b:"Admins see a 🛡️ Admin section in the sidebar."},{h:"View Members",b:"See all registered users, their exam scores, Pro and certification status."},{h:"Grant Access",b:"Tap Grant Pro, Grant Advance, or Grant Admin to upgrade any user."}],tip:"Admin access is earned — not automatic. Score 40 or above on the exam to unlock it.",note:"No user gets admin at registration. It requires passing the exam or manual grant."},
  {icon:"📜",title:"Certification Exam",color:"#6c5ce7",steps:[{h:"Optional",b:"The exam is optional. Go to ⚙️ Settings → Certification."},{h:"Read the Guide",b:"Read all 10 chapters before attempting the exam."},{h:"Enter Your Name",b:"Your full name will appear exactly as typed on the certificate."},{h:"Answer 50 Qs",b:"Answer all 50 multiple-choice questions about AI and GoPlanet."},{h:"Score 40+",b:"Score 40 or above to earn your downloadable certificate."},{h:"Download",b:"Your certificate shows your registered name and exact exam date."}],tip:"You can retake the exam anytime from Settings.",note:"Certificate issued ONLY for scores of 40 or above. Scoring 40+ also grants Admin access."},
  {icon:"🎤",title:"Voice Mode",color:"#00cec9",steps:[{h:"Enable",b:"Go to ⚙️ Settings → Voice Mode and toggle it on."},{h:"Tap Mic",b:"In any chat, tap the 🎤 button next to the input box."},{h:"Speak Clearly",b:"Speak your question — GoPlanet AI listens and transcribes it."},{h:"AI Speaks Back",b:"The AI replies in text AND reads the response aloud."}],tip:"Use voice mode hands-free while cooking, driving, or doing other tasks.",note:"Voice mode requires microphone permission. Works best in Chrome or Edge."},
  {icon:"🔒",title:"Privacy & Security",color:"#636e72",steps:[{h:"API Key Safety",b:"Your API keys are stored ONLY on your device. Never sent to GoPlanet servers."},{h:"User Isolation",b:"Each user's data is completely separate. No cross-user data leakage possible."},{h:"Local Storage",b:"All chats, projects, and settings are stored locally on your device only."},{h:"Log Out",b:"Always log out on shared devices to protect your account."}],tip:"If you suspect your API key was compromised, revoke it immediately at the provider's website.",note:"GoPlanet never collects or transmits your personal data or API keys to any server."},
];

// ─── Certificate Generator ───────────────────────────────────
function makeCert(name,score,dateStr,logo){
  return new Promise(res=>{
    const W=1050,H=1200,cv=document.createElement("canvas");
    cv.width=W;cv.height=H;
    const c=cv.getContext("2d");
    const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#f8f8ff");bg.addColorStop(1,"#eaeaff");
    c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.strokeStyle="rgba(108,92,231,0.06)";c.lineWidth=1.5;
    for(let i=0;i<12;i++){c.beginPath();c.moveTo(-60,200+i*85);for(let x=0;x<=W+100;x+=12)c.lineTo(x-60,200+i*85+Math.sin(x*0.016)*38);c.stroke();}
    c.fillStyle="rgba(108,92,231,0.13)";
    for(let r=0;r<10;r++)for(let cc=0;cc<7;cc++){c.beginPath();c.arc(W-52-cc*17,65+r*17,2.5,0,Math.PI*2);c.fill();}
    const sg=c.createLinearGradient(0,0,0,H);sg.addColorStop(0,"#280070");sg.addColorStop(0.4,"#6c5ce7");sg.addColorStop(0.7,"#5020b8");sg.addColorStop(1,"#280070");
    c.fillStyle=sg;c.fillRect(0,0,20,H);c.fillRect(W-20,0,20,H);
    const bg2=c.createLinearGradient(0,0,W,0);bg2.addColorStop(0,"#280070");bg2.addColorStop(0.5,"#6c5ce7");bg2.addColorStop(1,"#280070");
    c.fillStyle=bg2;c.fillRect(0,H-20,W,20);
    const bl=c.createRadialGradient(0,H,0,0,H,260);bl.addColorStop(0,"rgba(60,0,190,0.6)");bl.addColorStop(1,"rgba(60,0,190,0)");c.fillStyle=bl;c.fillRect(0,H-260,300,260);
    const br=c.createRadialGradient(W,H,0,W,H,300);br.addColorStop(0,"rgba(20,60,210,0.55)");br.addColorStop(1,"rgba(20,60,210,0)");c.fillStyle=br;c.fillRect(W-300,H-300,300,300);
    c.strokeStyle="rgba(100,140,255,0.15)";c.lineWidth=3;for(let i=0;i<7;i++){c.beginPath();c.moveTo(W-10,H-10);c.lineTo(W-10-i*50,H-160-i*28);c.stroke();}
    c.strokeStyle="#5228b8";c.lineWidth=3.5;c.strokeRect(22,22,W-44,H-44);c.strokeStyle="#a29bfe";c.lineWidth=2;c.strokeRect(32,32,W-64,H-64);
    [[40,40],[W-40,40],[40,H-40],[W-40,H-40]].forEach(([x,y])=>{const s=22;c.strokeStyle="#8866cc";c.lineWidth=2.5;c.beginPath();c.moveTo(x,y+s);c.lineTo(x,y);c.lineTo(x+s,y);c.stroke();c.beginPath();c.moveTo(x-s,y);c.lineTo(x,y);c.lineTo(x,y-s);c.stroke();});
    const draw=()=>{
      c.textAlign="center";
      c.fillStyle="#1535ff";c.font="bold 56px Arial,sans-serif";c.fillText("GoPlanet",W/2,325);
      c.strokeStyle="#666";c.lineWidth=1;c.beginPath();c.moveTo(308,344);c.lineTo(412,344);c.stroke();c.beginPath();c.moveTo(638,344);c.lineTo(742,344);c.stroke();
      c.fillStyle="#555";c.font="14px Arial,sans-serif";c.fillText("AI CHATBOT",W/2,350);
      c.fillStyle="#060818";c.font="bold 92px Georgia,serif";c.fillText("CERTIFICATE",W/2,450);
      c.strokeStyle="#6c5ce7";c.lineWidth=2.5;c.beginPath();c.moveTo(118,480);c.lineTo(310,480);c.stroke();c.beginPath();c.moveTo(740,480);c.lineTo(932,480);c.stroke();
      c.fillStyle="#6c5ce7";c.beginPath();c.arc(115,480,4.5,0,Math.PI*2);c.fill();c.beginPath();c.arc(935,480,4.5,0,Math.PI*2);c.fill();
      c.font="bold 23px Arial,sans-serif";c.fillText("OF COMPLETION",W/2,490);
      c.fillStyle="#777";c.font="14px Arial,sans-serif";c.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO",W/2,530);
      c.strokeStyle="#6c5ce7";c.lineWidth=1.5;c.setLineDash([2,8]);c.beginPath();c.moveTo(118,546);c.lineTo(932,546);c.stroke();c.setLineDash([]);
      c.fillStyle="#6c5ce7";c.beginPath();c.arc(115,546,5,0,Math.PI*2);c.fill();c.beginPath();c.arc(935,546,5,0,Math.PI*2);c.fill();
      c.fillStyle="#080820";c.font="bold 52px Georgia,serif";c.fillText(name,W/2,618);
      const nw=c.measureText(name).width;c.strokeStyle="#6c5ce7";c.lineWidth=2.5;c.beginPath();c.moveTo(W/2-nw/2,632);c.lineTo(W/2+nw/2,632);c.stroke();
      c.fillStyle="#444";c.font="16px Arial,sans-serif";
      ["for successfully completing the GoPlanet AI Chatbot Certification Program.","This certifies your understanding and practical knowledge","of responsible AI usage, smart communication,","and real-world AI chatbot applications."].forEach((l,i)=>c.fillText(l,W/2,668+i*27));
      c.fillStyle="#ede9ff";c.beginPath();const bx=410,by=742,bw=230,bh=40,rb=20;c.moveTo(bx+rb,by);c.lineTo(bx+bw-rb,by);c.arcTo(bx+bw,by,bx+bw,by+rb,rb);c.lineTo(bx+bw,by+bh-rb);c.arcTo(bx+bw,by+bh,bx+bw-rb,by+bh,rb);c.lineTo(bx+rb,by+bh);c.arcTo(bx,by+bh,bx,by+bh-rb,rb);c.lineTo(bx,by+rb);c.arcTo(bx,by,bx+rb,by,rb);c.closePath();c.fill();
      c.fillStyle="#6c5ce7";c.font="bold 16px Arial,sans-serif";c.fillText("Score: "+score+" / 50",W/2,768);
      c.strokeStyle="#6c5ce7";c.lineWidth=1;c.beginPath();c.moveTo(188,804);c.lineTo(392,804);c.stroke();c.beginPath();c.moveTo(658,804);c.lineTo(862,804);c.stroke();
      c.fillStyle="#666";c.font="bold 14px Arial,sans-serif";c.fillText("YOU ARE NOW RECOGNIZED AS",W/2,812);
      c.fillStyle="#4a20b0";c.font="bold 34px Arial,sans-serif";c.fillText("GOPLANET CERTIFIED USER",W/2,855);
      const lau=(sx,sy,dir)=>{c.strokeStyle="#7a56bf";c.lineWidth=1.8;for(let i=0;i<7;i++){const a=(dir===1?-0.5:Math.PI+0.5)+i*dir*0.22,ln=17+i*2.5,bx2=sx+dir*i*10,by2=sy-i*7;c.beginPath();c.moveTo(bx2,by2);c.lineTo(bx2+Math.cos(a)*ln,by2+Math.sin(a)*ln);c.stroke();}};
      lau(195,878,1);lau(855,878,-1);
      const PR=[{l:"HONEST USE",s:"Use technology\nwith integrity.",col:"#1535ff"},{l:"SMART THINKING",s:"Solve problems\nwith intelligence.",col:"#5228c0"},{l:"EFFECTIVE",s:"Work smarter,\nachieve more.",col:"#0099cc"},{l:"HUMAN FIRST",s:"Empower people,\nnot replace them.",col:"#7030a0"}];
      const IC=["✅","🧠","💬","❤️"];const iY=920,iSp=192,iSt=W/2-iSp*1.5;
      PR.forEach((p,i)=>{const x=iSt+i*iSp;const cg=c.createRadialGradient(x,iY,5,x,iY,36);cg.addColorStop(0,p.col+"cc");cg.addColorStop(1,p.col+"33");c.fillStyle=cg;c.beginPath();c.arc(x,iY,36,0,Math.PI*2);c.fill();c.strokeStyle=p.col+"88";c.lineWidth=2;c.beginPath();c.arc(x,iY,36,0,Math.PI*2);c.stroke();c.font="26px serif";c.fillText(IC[i],x,iY+10);if(i<3){c.fillStyle="#ccc";c.beginPath();c.arc(x+iSp/2,iY,4,0,Math.PI*2);c.fill();}c.fillStyle="#1a1a2e";c.font="bold 11px Arial,sans-serif";c.fillText(p.l,x,iY+60);c.fillStyle="#666";c.font="11px Arial,sans-serif";p.s.split("\n").forEach((ln,li)=>c.fillText(ln,x,iY+76+li*16));});
      c.textAlign="left";c.fillStyle="#4a20b0";c.font="italic 30px Georgia,serif";c.fillText("GoPlanet Team",88,1098);c.fillStyle="#444";c.font="bold 11px Arial,sans-serif";c.fillText("GOPLANET TEAM",88,1118);c.fillStyle="#888";c.font="11px Arial,sans-serif";c.fillText("ISSUER",88,1132);
      c.textAlign="center";c.fillStyle="#0a0a1e";c.beginPath();c.arc(W/2,1108,48,0,Math.PI*2);c.fill();c.strokeStyle="#f9ca24";c.lineWidth=5.5;c.beginPath();c.arc(W/2,1108,48,0,Math.PI*2);c.stroke();c.font="36px serif";c.fillText("🤖",W/2,1121);c.fillStyle="#5228c0";c.fillRect(W/2-12,1154,10,28);c.fillStyle="#a29bfe";c.fillRect(W/2+2,1154,10,28);c.fillStyle="#f9ca24";c.font="13px serif";[[W/2-62,1082],[W/2+62,1082],[W/2-66,1118],[W/2+66,1118]].forEach(([x,y])=>c.fillText("★",x,y));
      c.textAlign="right";c.strokeStyle="#6c5ce7";c.lineWidth=1.5;c.strokeRect(W-220,1080,168,72);c.font="22px serif";c.fillStyle="#6c5ce7";c.fillText("📅",W-194,1108);c.fillStyle="#080820";c.font="bold 15px Arial,sans-serif";c.fillText(dateStr,W-72,1110);c.fillStyle="#6c5ce7";c.font="bold 11px Arial,sans-serif";c.fillText("DATE OF ISSUE",W-72,1130);
    };
    const img=new Image();img.onload=()=>{c.drawImage(img,W/2-85,28,170,170);draw();res(cv.toDataURL("image/png"));};img.onerror=()=>{draw();res(cv.toDataURL("image/png"));};img.src=logo;
  });
}

// ════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════
export default function App(){
  const[page,setPage]=useState("boot");
  const[regStep,setReg]=useState(1);
  const[form,setForm]=useState({email:"",pw:"",name:"",mob:""});
  const[authErr,setAErr]=useState("");
  const[uid,setUid]=useState(null);
  const[user,setUser]=useState(null);
  const[tab,setTab]=useState("chat");
  const[sideOpen,setSideOpen]=useState(false);
  const[dark,setDark]=useState(false);
  const[groqKey,setGroqKey]=useState("");
  const[openaiKey,setOpenaiKey]=useState("");
  const[aiProvider,setAiProvider]=useState("groq");
  const[model,setModel]=useState("llama-3.3-70b-versatile");
  const[chats,setChats]=useState({});
  const[activeChat,setActiveChat]=useState(null);
  const[msgs,setMsgs]=useState([]);
  const[inp,setInp]=useState("");
  const[typing,setTyping]=useState(false);
  const[voiceOn,setVoiceOn]=useState(false);
  const[listening,setListening]=useState(false);
  const[speaking,setSpeaking]=useState(false);
  const[projs,setProjs]=useState({});
  const[newP,setNewP]=useState("");
  const[showPF,setShowPF]=useState(false);
  const[imgPrompt,setImgPrompt]=useState("");
  const[genImg,setGenImg]=useState(null);
  const[genLoad,setGenLoad]=useState(false);
  const[subModal,setSubModal]=useState(null);
  const[allUsers,setAllUsers]=useState([]);
  const[adminTab,setAdminTab]=useState("members");
  const[exScreen,setExScreen]=useState(null);
  const[exName,setExName]=useState("");
  const[exEmail,setExEmail]=useState("");
  const[exErr,setExErr]=useState("");
  const[exAns,setExAns]=useState({});
  const[exScore,setExScore]=useState(0);
  const[certUrl,setCertUrl]=useState("");
  const[certDate,setCertDate]=useState("");
  const[certLoad,setCertLoad]=useState(false);
  const[gIdx,setGIdx]=useState(0);

  const botRef=useRef(null);
  const recRef=useRef(null);
  const inputRef=useRef(null);
  const msgsR=useRef([]);
  useEffect(()=>{msgsR.current=msgs;},[msgs]);

  // Detect desktop vs mobile
  const isDesktop=typeof window!=="undefined"&&window.innerWidth>=900;
  const[desktop,setDesktop]=useState(isDesktop);
  useEffect(()=>{
    const fn=()=>setDesktop(window.innerWidth>=900);
    window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);
  },[]);

  const AC="#6c5ce7",AC2="#a29bfe",GOLD="#f9ca24",GREEN="#00b894",RED="#e74c3c",CYAN="#00cec9";
  const BG=dark?"#0f0f1a":"#f4f4f9";
  const SU=dark?"#1a1a2e":"#ffffff";
  const SU2=dark?"#141428":"#f8f8ff";
  const BO=dark?"#2a2a4a":"#e0e0ee";
  const TX=dark?"#e8e8ff":"#1a1a2e";
  const MU=dark?"#7777aa":"#666688";
  const SB=dark?"#12122a":"#f0eeff";

  const GROQ_MODELS=[
    {id:"llama-3.3-70b-versatile",n:"Llama 3.3 70B",t:"Meta · Fast"},
    {id:"mixtral-8x7b-32768",n:"Mixtral 8x7B",t:"Mistral"},
    {id:"gemma2-9b-it",n:"Gemma 2 9B",t:"Google"},
    {id:"llama-3.1-8b-instant",n:"Llama 3.1 8B",t:"Meta · Instant"},
  ];
  const OPENAI_MODELS=[
    {id:"gpt-4o",n:"GPT-4o",t:"OpenAI · Latest"},
    {id:"gpt-4o-mini",n:"GPT-4o Mini",t:"OpenAI · Fast"},
    {id:"gpt-4-turbo",n:"GPT-4 Turbo",t:"OpenAI · Advanced"},
    {id:"gpt-3.5-turbo",n:"GPT-3.5 Turbo",t:"OpenAI · Economy"},
  ];
  const ALL_MODELS=aiProvider==="groq"?GROQ_MODELS:OPENAI_MODELS;

  // Boot
  useEffect(()=>{
    const s=DB.g(SESS);if(s){const u=DB.g(uK(s));if(u){doLoad(s,u);return;}}
    setPage("login");
  },[]);
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  function doLoad(id,u){
    setUid(id);setUser(u);setChats(DB.g(cK(id),{}));setProjs(DB.g(pK(id),{}));
    const sk=DB.g(sK(id),{});
    if(sk.groqKey)setGroqKey(sk.groqKey);
    if(sk.openaiKey)setOpenaiKey(sk.openaiKey);
    if(sk.aiProvider)setAiProvider(sk.aiProvider);
    if(sk.model)setModel(sk.model);
    if(sk.dark!==undefined)setDark(sk.dark);
    if(sk.voiceOn!==undefined)setVoiceOn(sk.voiceOn);
    setPage("main");
  }
  function pU(id,patch){const u2={...DB.g(uK(id))||{},...patch};DB.s(uK(id),u2);setUser(u2);}
  function sSett(patch){DB.s(sK(uid),{...DB.g(sK(uid),{}),...patch});}

  // AUTH
  function doLogin(){
    setAErr("");if(!form.email||!form.pw){setAErr("Please fill all fields.");return;}
    const id=mkId(form.email);const u=DB.g(uK(id));
    if(!u){setAErr("No account found. Please register.");return;}
    if(u.pw!==btoa(form.pw)){setAErr("Incorrect password.");return;}
    DB.s(SESS,id);doLoad(id,u);
  }
  function doR1(){
    setAErr("");if(!form.email||!form.pw){setAErr("Please fill all fields.");return;}
    if(!/\S+@\S+\.\S+/.test(form.email)){setAErr("Enter a valid email.");return;}
    if(form.pw.length<6){setAErr("Password must be at least 6 characters.");return;}
    if(DB.g(uK(mkId(form.email)))){setAErr("Email already registered. Please log in.");return;}
    setReg(2);
  }
  function doR2(){
    setAErr("");if(!form.name.trim()||!form.mob.trim()){setAErr("Please fill all fields.");return;}
    const id=mkId(form.email);const idx=DB.g(UIDX,[]);
    const u={name:form.name.trim(),email:form.email.toLowerCase().trim(),mob:form.mob.trim(),pw:btoa(form.pw),
      isAdmin:false,isPro:false,isAdvance:false,joined:new Date().toISOString(),
      examScore:null,certDate:null,certGranted:false,deviceType:form.device||"mobile"};
    DB.s(uK(id),u);if(!idx.includes(id))DB.s(UIDX,[...idx,id]);DB.s(SESS,id);doLoad(id,u);
  }
  function doLogout(){
    DB.d(SESS);setUid(null);setUser(null);setChats({});setProjs({});setMsgs([]);setActiveChat(null);
    setGroqKey("");setOpenaiKey("");setCertUrl("");setForm({email:"",pw:"",name:"",mob:""});
    setReg(1);setExScreen(null);setPage("login");
  }

  // VOICE
  const startListen=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice not supported. Use Chrome or Edge.");return;}
    const r=new SR();r.lang="en-US";r.interimResults=false;r.maxAlternatives=1;
    r.onstart=()=>setListening(true);r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.onresult=e=>{const t=e.results[0][0].transcript;setInp(t);setListening(false);setTimeout(()=>doSend(t),200);};
    recRef.current=r;r.start();
  },[]);
  const stopListen=()=>{recRef.current?.stop();setListening(false);};
  const spk=(text)=>{
    if(!window.speechSynthesis)return;window.speechSynthesis.cancel();
    const u2=new SpeechSynthesisUtterance(text.slice(0,500));u2.rate=0.95;u2.pitch=1;
    u2.onstart=()=>setSpeaking(true);u2.onend=()=>setSpeaking(false);u2.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(u2);
  };
  const stopSpk=()=>{window.speechSynthesis?.cancel();setSpeaking(false);};

  // CHAT
  async function doSend(override){
    const text=(override||inp).trim();if(!text||!activeChat)return;
    const sk=DB.g(sK(uid),{});
    const provider=sk.aiProvider||aiProvider;
    const key=provider==="openai"?(sk.openaiKey||openaiKey):(sk.groqKey||groqKey);
    if(!key){
      setMsgs(p=>[...p,{role:"ai",text:"⚠️ No API key set. Go to ⚙️ Settings → API Keys to add your key.",ts:now()}]);return;
    }
    const um={role:"user",text,ts:now()};
    const cur=msgsR.current;const next=[...cur,um];
    msgsR.current=next;setMsgs(next);setInp("");setTyping(true);
    requestAnimationFrame(()=>inputRef.current?.focus());
    let ai="";
    try{
      const hist=next.slice(-12).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const useModel=sk.model||model;
      const url=provider==="openai"?"https://api.openai.com/v1/chat/completions":"https://api.groq.com/openai/v1/chat/completions";
      const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:useModel,messages:hist,max_tokens:1024})});
      if(!r.ok){const e=await r.json();throw new Error(e.error?.message||"Error "+r.status);}
      const d=await r.json();ai=d.choices?.[0]?.message?.content||"No response received.";
    }catch(e){ai="⚠️ "+e.message;}
    const am={role:"ai",text:ai,ts:now()};
    const final=[...next,am];msgsR.current=final;
    setMsgs(final);setTyping(false);
    const ch={...chats,[activeChat]:final};setChats(ch);DB.s(cK(uid),ch);
    if(voiceOn)spk(ai);
    requestAnimationFrame(()=>inputRef.current?.focus());
  }
  function newChat(){
    const id="c"+Date.now();
    const wm={role:"ai",text:"Hello "+user?.name+"! 👋 I'm GoPlanet AI. How can I help you today?",ts:now()};
    const ch={...chats,[id]:[wm]};setChats(ch);DB.s(cK(uid),ch);
    setActiveChat(id);setMsgs([wm]);msgsR.current=[wm];setTab("chat");setSideOpen(false);
    setTimeout(()=>inputRef.current?.focus(),150);
  }
  function openChat(id){const m=chats[id]||[];setActiveChat(id);setMsgs(m);msgsR.current=m;setTab("chat");setSideOpen(false);setTimeout(()=>inputRef.current?.focus(),150);}

  // PROJECTS
  function createProj(){if(!newP.trim())return;const id="p"+Date.now();const p={...projs,[id]:{name:newP.trim(),created:new Date().toISOString()}};setProjs(p);DB.s(pK(uid),p);setNewP("");setShowPF(false);}

  // ADMIN
  const loadAllUsers=useCallback(()=>{
    const idx=DB.g(UIDX,[]);
    setAllUsers(idx.map(id=>{const u=DB.g(uK(id));return u?{id,...u}:null;}).filter(Boolean));
  },[]);
  function grantPro(id){const u=DB.g(uK(id));if(!u)return;const n={...u,isPro:true,isAdvance:false};DB.s(uK(id),n);if(id===uid)setUser(n);loadAllUsers();}
  function grantAdvance(id){const u=DB.g(uK(id));if(!u)return;const n={...u,isPro:true,isAdvance:true};DB.s(uK(id),n);if(id===uid)setUser(n);loadAllUsers();}
  function grantAdmin(id){const u=DB.g(uK(id));if(!u)return;const n={...u,isAdmin:true};DB.s(uK(id),n);if(id===uid)setUser(n);loadAllUsers();}

  // EXAM
  function startExam(){
    setExErr("");if(!exName.trim()){setExErr("Please enter your full name.");return;}
    if(!exEmail.trim()||!/\S+@\S+\.\S+/.test(exEmail)){setExErr("Please enter a valid email.");return;}
    setExAns({});setExScreen("exam");
  }
  async function submitExam(){
    let s=0;QUIZ.forEach((q,i)=>{if(exAns[i]===q.a)s++;});
    const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    setExScore(s);setCertDate(today);
    if(s>=40){
      setCertLoad(true);const url=await makeCert(exName.trim(),s,today,L);setCertUrl(url);setCertLoad(false);
      pU(mkId(user.email),{examScore:s,certDate:today,certGranted:true,certName:exName.trim(),isAdmin:true});
    }else{pU(mkId(user.email),{examScore:s});}
    setExScreen("result");
  }

  // plan badge
  const planBadge=()=>{if(user?.isAdvance)return{label:"⚡ Advance",bg:"#ff6b35"};if(user?.isPro)return{label:"⭐ Pro",bg:AC};return{label:"Free",bg:MU};};

  // ─── STYLES ─────────────────────────────────────────────
  const S={
    app:{display:"flex",height:"100dvh",width:"100%",background:BG,color:TX,fontFamily:"system-ui,sans-serif",overflow:"hidden"},
    // Sidebar
    sidebar:{width:desktop?220:280,background:SU,borderRight:"1px solid "+BO,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"},
    sideItem:(a)=>({display:"flex",alignItems:"center",gap:"10px",padding:"10px 16px",borderRadius:"10px",margin:"1px 8px",cursor:"pointer",background:a?(dark?"#2a2a5a":"#ede9ff"):"transparent",color:a?AC:TX,fontWeight:a?700:400,fontSize:"14px",border:"none",width:"calc(100% - 16px)",textAlign:"left"}),
    // Main area
    main:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},
    topbar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",height:"54px",background:SU,borderBottom:"1px solid "+BO,flexShrink:0},
    body:{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",minHeight:0},
    // Bottom nav (mobile only)
    bottomNav:{display:"flex",background:SU,borderTop:"1px solid "+BO,padding:"2px 0 4px"},
    navBtn:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"1px",padding:"5px 2px",border:"none",background:"none",cursor:"pointer",color:a?AC:MU,fontSize:"9px",fontWeight:a?700:400}),
    card:{background:SU,borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1px solid "+BO},
    inp:(ex={})=>({width:"100%",padding:"11px 13px",border:"1.5px solid "+BO,borderRadius:"10px",background:SU,color:TX,fontSize:"14px",outline:"none",boxSizing:"border-box",...ex}),
    btn:(bg=AC,fg="#fff",ex={})=>({background:bg,color:fg,border:"none",borderRadius:"10px",padding:"12px",fontSize:"14px",fontWeight:700,cursor:"pointer",width:"100%",...ex}),
    lbl:{fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:"5px",display:"block"},
    err:{color:RED,fontSize:"12px",padding:"8px 12px",background:"#fff0f0",borderRadius:"8px",border:"1px solid #ffd0d0",marginTop:"4px"},
  };

  // ─── BOOT ───────────────────────────────────────────────
  if(page==="boot")return(<div style={{...S.app,alignItems:"center",justifyContent:"center",flexDirection:"column"}}><img src={L} style={{width:"90px",height:"90px",objectFit:"contain",marginBottom:"16px"}} alt=""/><p style={{color:AC,fontWeight:900,fontSize:"24px",margin:0}}>GoPlanet</p><p style={{color:MU,fontSize:"13px",marginTop:"6px"}}>Loading…</p></div>);

  // ─── AUTH (responsive: desktop wide, mobile single-column) ──
  if(page==="login"||page==="register"){
    const isMob=!desktop;
    return(
      <div style={{...S.app,flexDirection:"column",alignItems:"center",justifyContent:"center",padding:isMob?"20px":"0",background:dark?"#0f0f1a":BG}}>
        {!isMob&&<div style={{display:"flex",width:"100%",height:"100%",alignItems:"stretch"}}>
          {/* Desktop: left hero panel */}
          <div style={{flex:"0 0 420px",background:"linear-gradient(135deg,#4a2fbf,"+AC+")",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px"}}>
            <img src={L} style={{width:"100px",height:"100px",objectFit:"contain",marginBottom:"24px"}} alt=""/>
            <h1 style={{color:"#fff",fontSize:"32px",fontWeight:900,textAlign:"center",margin:"0 0 12px"}}>GoPlanet AI</h1>
            <p style={{color:"rgba(255,255,255,0.85)",fontSize:"15px",textAlign:"center",lineHeight:1.6,margin:"0 0 32px"}}>Your intelligent AI chatbot powered by Groq & OpenAI</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%"}}>
              {["🔒 Secure & Private","⚡ Fast AI Responses","🤖 Multiple AI Models","🌍 For Everyone"].map(f=>(
                <div key={f} style={{background:"rgba(255,255,255,0.12)",borderRadius:"10px",padding:"12px",color:"#fff",fontSize:"13px",textAlign:"center"}}>{f}</div>
              ))}
            </div>
          </div>
          {/* Desktop: right form panel */}
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",background:SU}}>
            <div style={{width:"100%",maxWidth:"400px"}}>
              <AuthForm/>
            </div>
          </div>
        </div>}
        {isMob&&(
          <div style={{width:"100%",maxWidth:"420px",display:"flex",flexDirection:"column",alignItems:"center"}}>
            <img src={L} style={{width:"80px",height:"80px",objectFit:"contain",marginBottom:"12px"}} alt=""/>
            <h1 style={{color:AC,fontWeight:900,fontSize:"26px",margin:"0 0 4px"}}>GoPlanet</h1>
            <p style={{color:MU,fontSize:"13px",marginBottom:"28px"}}>AI Chatbot · Powered by Groq & OpenAI</p>
            <div style={{width:"100%"}}>
              <AuthForm/>
            </div>
          </div>
        )}
      </div>
    );
  }

  function AuthForm(){
    return(<>
      <div style={{display:"flex",background:dark?"#2a2a4a":"#f0ecff",borderRadius:"12px",padding:"4px",marginBottom:"22px"}}>
        {["Log In","Register"].map((t,i)=>(<button key={t} onClick={()=>{setPage(i===0?"login":"register");setAErr("");setReg(1);}} style={{flex:1,padding:"10px",border:"none",borderRadius:"9px",background:(page==="login")===(i===0)?AC:"transparent",color:(page==="login")===(i===0)?"#fff":MU,fontWeight:700,cursor:"pointer",fontSize:"14px"}}>{t}</button>))}
      </div>
      {page==="register"&&<p style={{color:MU,fontSize:"12px",textAlign:"center",margin:"0 0 14px"}}>Step {regStep} of 2 — {regStep===1?"Account Details":"Personal Info"}</p>}
      <div style={{display:"flex",flexDirection:"column",gap:"11px"}}>
        {(page==="login"||regStep===1)&&<>
          <div><span style={S.lbl}>Email Address</span><input style={S.inp()} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?doLogin():doR1())}/></div>
          <div><span style={S.lbl}>Password</span><input style={S.inp()} type="password" placeholder={page==="register"?"Min 6 characters":"Your password"} value={form.pw} onChange={e=>setForm(p=>({...p,pw:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?doLogin():doR1())}/></div>
        </>}
        {page==="register"&&regStep===2&&<>
          <div><span style={S.lbl}>Full Name</span><input style={S.inp()} placeholder="e.g. Alice Johnson" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
          <div><span style={S.lbl}>Mobile Number</span><input style={S.inp()} type="tel" placeholder="+91 98765 43210" value={form.mob} onChange={e=>setForm(p=>({...p,mob:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doR2()}/></div>
          <div><span style={S.lbl}>Device Type</span>
            <div style={{display:"flex",gap:"8px"}}>
              {["mobile","desktop"].map(d=>(<button key={d} onClick={()=>setForm(p=>({...p,device:d}))} style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid "+(form.device===d?AC:BO),background:form.device===d?"#f0ecff":"transparent",color:form.device===d?AC:TX,fontWeight:form.device===d?700:400,cursor:"pointer",fontSize:"13px"}}>{d==="mobile"?"📱 Mobile":"💻 Desktop / Laptop"}</button>))}
            </div>
          </div>
        </>}
        {authErr&&<div style={S.err}>{authErr}</div>}
        {page==="login"&&<button style={S.btn()} onClick={doLogin}>Log In →</button>}
        {page==="register"&&regStep===1&&<button style={S.btn()} onClick={doR1}>Next →</button>}
        {page==="register"&&regStep===2&&<><button style={S.btn()} onClick={doR2}>Create Account ✓</button><button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",marginTop:"4px"}} onClick={()=>setReg(1)}>← Back</button></>}
        {page==="login"&&<p style={{textAlign:"center",fontSize:"13px",color:MU,marginTop:"8px"}}>New to GoPlanet? <button onClick={()=>{setPage("register");setAErr("");setReg(1);}} style={{background:"none",border:"none",color:AC,cursor:"pointer",fontWeight:700,fontSize:"13px"}}>Create an account</button></p>}
      </div>
    </>);
  }

  // ─── GUIDE ─────────────────────────────────────────────
  if(exScreen==="guide"){
    const g=GUIDE[gIdx];
    return(
      <div style={{...S.app,flexDirection:"column"}}>
        <div style={{...S.topbar,justifyContent:"space-between"}}>
          <button onClick={()=>{setExScreen(null);setGIdx(0);}} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button>
          <span style={{fontWeight:800,color:AC,fontSize:"15px"}}>📖 User Guide</span>
          <span style={{fontSize:"12px",color:MU,background:SU2,padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{gIdx+1}/{GUIDE.length}</span>
        </div>
        <div style={{height:"4px",background:BO,flexShrink:0}}><div style={{height:"100%",width:((gIdx+1)/GUIDE.length*100)+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",transition:"width 0.3s"}}/></div>
        <div style={{flex:1,overflowY:"auto",padding:desktop?"24px 10%":"0"}}>
          <div style={{background:"linear-gradient(135deg,"+g.color+"28,"+g.color+"06)",padding:"22px 20px 16px",borderBottom:"1px solid "+BO}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"58px",height:"58px",borderRadius:"16px",background:g.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"30px",flexShrink:0,boxShadow:"0 4px 16px "+g.color+"44"}}>{g.icon}</div>
              <div><p style={{margin:0,fontSize:"11px",color:g.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.2px"}}>Chapter {gIdx+1} of {GUIDE.length}</p><h2 style={{margin:"3px 0 0",fontSize:"20px",color:TX,fontWeight:800}}>{g.title}</h2></div>
            </div>
          </div>
          <div style={{padding:"16px 20px 80px"}}>
            <p style={{margin:"0 0 8px",fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"1px"}}>Step by Step</p>
            <div style={{...S.card,padding:0,overflow:"hidden"}}>
              {g.steps.map((st,i)=>(<div key={i} style={{display:"flex",gap:"14px",padding:"13px 15px",borderBottom:i<g.steps.length-1?"1px solid "+BO:"none",background:i%2===0?(dark?"rgba(255,255,255,0.02)":"#fafaff"):"transparent"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,"+g.color+","+g.color+"99)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"13px",flexShrink:0,marginTop:"2px"}}>{i+1}</div>
                <div><p style={{margin:"0 0 3px",fontWeight:700,fontSize:"13px",color:TX}}>{st.h}</p><p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>{st.b}</p></div>
              </div>))}
            </div>
            <div style={{background:g.color+"18",border:"1.5px solid "+g.color+"55",borderRadius:"12px",padding:"13px 15px",marginBottom:"12px"}}><p style={{margin:"0 0 5px",fontSize:"12px",fontWeight:800,color:g.color,textTransform:"uppercase",letterSpacing:"0.5px"}}>💡 Pro Tip</p><p style={{margin:0,fontSize:"13px",color:TX,lineHeight:1.65}}>{g.tip}</p></div>
            <div style={{background:dark?"#1a1a30":"#f0f0ff",border:"1px solid "+BO,borderRadius:"10px",padding:"11px 14px",marginBottom:"20px"}}><p style={{margin:"0 0 3px",fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.5px"}}>📌 Important Note</p><p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>{g.note}</p></div>
            <div style={{display:"flex",gap:"10px",marginBottom:"16px"}}>
              <button disabled={gIdx===0} onClick={()=>setGIdx(p=>p-1)} style={{...S.btn(gIdx===0?"#ddd":SU,gIdx===0?MU:AC,{flex:1,padding:"11px",fontSize:"13px",border:"1.5px solid "+(gIdx===0?BO:AC),opacity:gIdx===0?0.5:1})}}>← Prev</button>
              {gIdx<GUIDE.length-1?<button style={S.btn(AC,"#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>setGIdx(p=>p+1)}>Next →</button>:<button style={S.btn(GREEN,"#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>{setGIdx(0);setExScreen(null);}}>✓ Done!</button>}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"5px",flexWrap:"wrap"}}>
              {GUIDE.map((_,i)=>(<button key={i} title={GUIDE[i].title} onClick={()=>setGIdx(i)} style={{width:i===gIdx?24:8,height:"8px",borderRadius:"4px",border:"none",background:i===gIdx?AC:i<gIdx?AC2:BO,cursor:"pointer",transition:"all 0.25s",padding:0}}/>))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXAM ENTRY ─────────────────────────────────────────
  if(exScreen==="entry")return(
    <div style={{...S.app,flexDirection:"column"}}>
      <div style={S.topbar}><button onClick={()=>setExScreen(null)} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>📝 Certification Exam</span><div style={{width:"40px"}}/></div>
      <div style={{flex:1,overflowY:"auto",padding:desktop?"32px 25%":"16px"}}>
        <div style={{textAlign:"center",padding:"24px 16px 20px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"16px",marginBottom:"18px",color:"#fff"}}><div style={{fontSize:"48px",marginBottom:"10px"}}>📜</div><h2 style={{margin:"0 0 6px",fontSize:"20px"}}>GoPlanet Certification</h2><p style={{margin:0,fontSize:"13px",opacity:0.9}}>50 Questions · Score 40+ to earn certificate + Admin access</p></div>
        <div style={{...S.card,marginBottom:"14px"}}>{["Your exact name will appear on the certificate.","Score 40+ out of 50 to earn a downloadable certificate.","Today's exact date is auto-printed on the certificate.","Scoring 40+ also grants you Admin access.","You can retake the exam anytime from Settings."].map((t,i)=>(<div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px"}}><span style={{color:GREEN,fontWeight:700,flexShrink:0}}>✓</span><span style={{fontSize:"13px",color:MU,lineHeight:1.5}}>{t}</span></div>))}</div>
        <div style={S.card}>
          <p style={{margin:"0 0 12px",fontWeight:700,color:AC,fontSize:"14px"}}>👤 Your Details</p>
          <div style={{marginBottom:"10px"}}><span style={S.lbl}>Full Name (appears on certificate) *</span><input style={S.inp()} placeholder="e.g. Alice Johnson" value={exName} onChange={e=>setExName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&document.getElementById("exE2")?.focus()}/></div>
          <div style={{marginBottom:"12px"}}><span style={S.lbl}>Email Address *</span><input id="exE2" style={S.inp()} type="email" placeholder="alice@example.com" value={exEmail} onChange={e=>setExEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startExam()}/></div>
          {exErr&&<div style={S.err}>{exErr}</div>}
          <button style={S.btn()} onClick={startExam}>Start Exam →</button>
        </div>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // ─── EXAM ─────────────────────────────────────────────
  if(exScreen==="exam"){
    const done=Object.keys(exAns).length,pct=Math.round(done/QUIZ.length*100);
    return(
      <div style={{...S.app,flexDirection:"column"}}>
        <div style={{background:SU,borderBottom:"1px solid "+BO,flexShrink:0,padding:"10px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
            <button onClick={()=>setExScreen("entry")} style={{background:"none",border:"none",color:RED,fontWeight:700,fontSize:"13px",cursor:"pointer"}}>✕ Exit</button>
            <span style={{fontWeight:700,fontSize:"14px"}}>Certification Exam</span>
            <span style={{fontSize:"12px",color:AC,background:SU2,padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{done}/{QUIZ.length}</span>
          </div>
          <div style={{height:"5px",background:BO,borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",borderRadius:"3px",transition:"width 0.3s"}}/></div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:desktop?"16px 20%":"12px 14px"}}>
          {QUIZ.map((q,i)=>(<div key={i} style={{...S.card,border:exAns[i]!==undefined?"1.5px solid "+AC2:"1px solid "+BO}}>
            <p style={{fontWeight:700,fontSize:"13px",margin:"0 0 10px",lineHeight:1.6}}><span style={{color:AC,fontWeight:900}}>Q{i+1}. </span>{q.q}</p>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {q.o.map((opt,j)=>(<button key={j} onClick={()=>setExAns(p=>({...p,[i]:j}))} style={{textAlign:"left",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid "+(exAns[i]===j?AC:BO),background:exAns[i]===j?"#f0ecff":"transparent",cursor:"pointer",fontSize:"13px",color:exAns[i]===j?AC:TX,fontWeight:exAns[i]===j?700:400}}><span style={{fontWeight:800,marginRight:"6px",color:exAns[i]===j?AC:MU}}>{["A","B","C","D"][j]}.</span>{opt}</button>))}
            </div>
          </div>))}
          <div style={{position:"sticky",bottom:"12px"}}><button disabled={done<QUIZ.length||certLoad} onClick={submitExam} style={{...S.btn(done<QUIZ.length?"#ccc":AC),boxShadow:done>=QUIZ.length?"0 4px 18px rgba(108,92,231,0.4)":"none"}}>{certLoad?"Generating certificate…":done<QUIZ.length?`Answer all questions (${done}/${QUIZ.length} done)`:"Submit Exam ✓"}</button></div>
          <div style={{height:"24px"}}/>
        </div>
      </div>
    );
  }

  // ─── RESULT ─────────────────────────────────────────────
  if(exScreen==="result"){
    const passed=exScore>=40;
    return(
      <div style={{...S.app,flexDirection:"column"}}>
        <div style={S.topbar}><div style={{width:"40px"}}/><span style={{fontWeight:800,color:AC}}>Exam Result</span><div style={{width:"40px"}}/></div>
        <div style={{flex:1,overflowY:"auto",padding:desktop?"32px 25%":"16px"}}>
          <div style={{textAlign:"center",padding:"28px 16px",borderRadius:"16px",marginBottom:"16px",color:"#fff",background:passed?"linear-gradient(135deg,"+AC+","+AC2+")":"linear-gradient(135deg,#e17055,#d63031)"}}>
            <div style={{fontSize:"56px",marginBottom:"10px"}}>{passed?"🏆":"📚"}</div>
            <h2 style={{margin:"0 0 6px"}}>{passed?"Congratulations!":"Almost There!"}</h2>
            <p style={{margin:"0 0 14px",opacity:0.9,fontSize:"14px"}}>{exName}</p>
            <div style={{display:"inline-block",background:"rgba(255,255,255,0.2)",borderRadius:"14px",padding:"10px 28px"}}><span style={{fontSize:"38px",fontWeight:900}}>{exScore}</span><span style={{fontSize:"16px",opacity:0.8}}> / 50</span></div>
            <p style={{margin:"10px 0 0",fontSize:"13px",opacity:0.85}}>{passed?"You are now a GoPlanet Certified User + Admin!":"Need "+(40-exScore)+" more correct answer"+(40-exScore===1?"":"s")+" to pass."}</p>
          </div>
          <div style={{...S.card,marginBottom:"14px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",textAlign:"center"}}>{[["✅",exScore,"Correct",GREEN],["❌",50-exScore,"Wrong",RED],["📊",Math.round(exScore/50*100)+"%","Score",AC]].map(([ic,v,l,col])=>(<div key={l}><p style={{fontSize:"22px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MU,margin:"3px 0 0"}}>{ic} {l}</p></div>))}</div></div>
          {passed&&<><div style={{...S.card,border:"2px solid "+AC,background:"#f9f7ff",marginBottom:"12px"}}><p style={{margin:"0 0 4px",fontWeight:700,color:AC,fontSize:"14px"}}>🎉 Your certificate is ready!</p><p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>Name: <strong>{exName}</strong> · Date: <strong>{certDate}</strong></p></div><button style={{...S.btn(),marginBottom:"10px"}} onClick={()=>setExScreen("cert")}>View Certificate 🏆</button><a href={certUrl} download={"GoPlanet_Cert_"+exName.replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn(GREEN),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"12px",marginBottom:"10px"}}>📥 Download Certificate</a></>}
          {!passed&&<div style={{...S.card,background:"#fff8f0",border:"1px solid #ffd0b0",marginBottom:"12px"}}><p style={{margin:"0 0 4px",fontWeight:700,color:"#e17055",fontSize:"14px"}}>💡 You can do it!</p><p style={{margin:0,fontSize:"13px",color:MU}}>Read the guide carefully and retry. Only {40-exScore} more correct answers needed!</p></div>}
          <button style={S.btn(AC2)} onClick={()=>{setExAns({});setExScreen("exam");}}>🔄 Retake Exam</button>
          <button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",display:"block",margin:"14px auto 0",fontWeight:600}} onClick={()=>setExScreen(null)}>← Back to Settings</button>
          <div style={{height:"20px"}}/>
        </div>
      </div>
    );
  }

  // ─── CERT VIEW ──────────────────────────────────────────
  if(exScreen==="cert")return(
    <div style={{...S.app,flexDirection:"column"}}>
      <div style={S.topbar}><button onClick={()=>setExScreen("result")} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>🏆 My Certificate</span><div style={{width:"40px"}}/></div>
      <div style={{flex:1,overflowY:"auto",padding:desktop?"32px 25%":"16px"}}>
        <div style={{textAlign:"center",padding:"18px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"14px",marginBottom:"14px",color:"#fff"}}><div style={{fontSize:"34px",marginBottom:"6px"}}>🏆</div><h3 style={{margin:"0 0 3px"}}>GoPlanet Certified User</h3><p style={{margin:"0 0 2px",fontWeight:700,fontSize:"15px"}}>{user?.certName||exName}</p><p style={{margin:0,fontSize:"12px",opacity:0.85}}>{user?.examScore||exScore}/50 · {user?.certDate||certDate}</p></div>
        <img src={certUrl} alt="Certificate" style={{width:"100%",borderRadius:"12px",border:"2px solid "+AC,display:"block",marginBottom:"12px"}}/>
        <a href={certUrl} download={"GoPlanet_Cert_"+(user?.certName||exName).replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn(),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"13px",marginBottom:"10px"}}>📥 Download Certificate</a>
        <button style={S.btn(AC2)} onClick={()=>{setExAns({});setExName(user?.name||"");setExEmail(user?.email||"");setExScreen("entry");}}>🔄 Retake Exam</button>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════
  // MAIN APP — Responsive layout
  // Desktop: permanent sidebar + main content
  // Mobile: slide-out sidebar + bottom nav
  // ════════════════════════════════════════════════════════
  const chatList=Object.keys(chats).map(id=>({id,preview:(chats[id]?.find(m=>m.role==="user")?.text||"New Chat").slice(0,36),ts:chats[id]?.[chats[id].length-1]?.ts||""})).reverse();
  const projList=Object.keys(projs).map(id=>({id,...projs[id]}));
  const pb=planBadge();

  const NAV_ITEMS=[
    {id:"chat",icon:"💬",label:"AI Chatbot"},
    {id:"projects",icon:"📁",label:"Projects"},
    {id:"image",icon:"🎨",label:"Image Generator"},
    {id:"plans",icon:"⭐",label:"Subscription"},
    {id:"settings",icon:"⚙️",label:"Settings"},
    ...(user?.isAdmin?[{id:"admin",icon:"🛡️",label:"Admin"}]:[]),
  ];
  const MOB_NAV=[
    {id:"chat",icon:"💬",label:"Chat"},
    {id:"projects",icon:"📁",label:"Projects"},
    {id:"image",icon:"🎨",label:"Images"},
    {id:"plans",icon:"⭐",label:"Plans"},
    {id:"settings",icon:"⚙️",label:"More"},
  ];

  // Sidebar content (shared between desktop permanent and mobile drawer)
  function SidebarContent(){
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"16px 16px 12px",borderBottom:"1px solid "+BO,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
            <img src={L} style={{width:"32px",height:"32px",objectFit:"contain"}} alt=""/>
            <span style={{fontWeight:900,fontSize:"17px",color:AC}}>GoPlanet</span>
          </div>
          {/* User card */}
          <div style={{display:"flex",gap:"10px",alignItems:"center",padding:"10px 12px",background:SU2,borderRadius:"10px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"16px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{minWidth:0,flex:1}}>
              <p style={{margin:0,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</p>
              <span style={{fontSize:"10px",padding:"1px 7px",borderRadius:"8px",background:pb.bg,color:"#fff",fontWeight:700}}>{pb.label}</span>
            </div>
          </div>
        </div>
        {/* Nav items */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 0",WebkitOverflowScrolling:"touch"}}>
          {NAV_ITEMS.map(it=>(<button key={it.id} style={S.sideItem(tab===it.id)} onClick={()=>{setTab(it.id);setSideOpen(false);}}>
            <span style={{fontSize:"16px"}}>{it.icon}</span>{it.label}
          </button>))}
          <div style={{height:"1px",background:BO,margin:"8px 12px"}}/>
          <p style={{fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.7px",padding:"4px 16px 6px"}}>Recent Chats</p>
          {chatList.length===0&&<p style={{fontSize:"12px",color:MU,padding:"0 16px"}}>No chats yet.</p>}
          {chatList.slice(0,8).map(c=>(<button key={c.id} onClick={()=>openChat(c.id)} style={{...S.sideItem(activeChat===c.id),flexDirection:"column",alignItems:"flex-start",gap:"2px",padding:"8px 14px"}}>
            <span style={{fontSize:"12px",fontWeight:activeChat===c.id?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:"100%"}}>{c.preview}…</span>
            <span style={{fontSize:"10px",color:MU}}>{c.ts}</span>
          </button>))}
          {chatList.length>0&&<button onClick={()=>{setTab("chat");setSideOpen(false);}} style={{...S.sideItem(false),fontSize:"12px",color:AC}}>View All Chats →</button>}
          <div style={{height:"1px",background:BO,margin:"8px 12px"}}/>
          <p style={{fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.7px",padding:"4px 16px 6px"}}>Projects</p>
          {projList.slice(0,4).map(p=>(<div key={p.id} style={{padding:"7px 16px",fontSize:"12px",color:MU}}>📁 {p.name}</div>))}
        </div>
        {/* Upgrade banner */}
        {!user?.isAdvance&&<div style={{margin:"10px",padding:"14px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"12px",color:"#fff",flexShrink:0}}>
          <p style={{margin:"0 0 2px",fontWeight:800,fontSize:"13px"}}>⚡ Upgrade to Advance</p>
          <p style={{margin:"0 0 10px",fontSize:"11px",opacity:0.9}}>$50/year · Fastest AI + All features</p>
          <button onClick={()=>{setSubModal("advance");setTab("plans");setSideOpen(false);}} style={{background:"#fff",color:AC,border:"none",borderRadius:"8px",padding:"6px 14px",fontSize:"12px",fontWeight:800,cursor:"pointer",width:"100%"}}>Upgrade Now</button>
        </div>}
        <button onClick={doLogout} style={{margin:"0 10px 12px",background:"none",border:"1px solid "+RED,color:RED,borderRadius:"8px",padding:"9px",cursor:"pointer",fontSize:"13px",fontWeight:600,flexShrink:0}}>🚪 Log Out</button>
      </div>
    );
  }

  // ─── CHAT TAB ───────────────────────────────────────────
  function ChatTab(){
    const providerLabel=aiProvider==="openai"?"OpenAI":"Groq";
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        {!activeChat?(
          <div style={{flex:1,overflowY:"auto",padding:desktop?"24px":"16px"}}>
            <h2 style={{margin:"0 0 4px",fontSize:"22px",fontWeight:800}}>Hello, {user?.name?.split(" ")[0]}! 👋</h2>
            <p style={{margin:"0 0 20px",color:MU,fontSize:"14px"}}>How can I help you today?</p>
            <p style={{margin:"0 0 10px",fontSize:"12px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.7px"}}>Choose AI Model</p>
            <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"16px"}}>
              {ALL_MODELS.map(m=>(<button key={m.id} onClick={()=>{setModel(m.id);sSett({model:m.id});}} style={{flexShrink:0,padding:"10px 14px",borderRadius:"10px",border:"1.5px solid "+(model===m.id?AC:BO),background:model===m.id?"#f0ecff":SU,cursor:"pointer",textAlign:"left",minWidth:"120px"}}>
                <p style={{margin:0,fontWeight:700,fontSize:"13px",color:model===m.id?AC:TX}}>{m.n}</p>
                <p style={{margin:0,fontSize:"10px",color:MU}}>{m.t}</p>
              </button>))}
            </div>
            <button style={{...S.btn(),marginBottom:"24px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}} onClick={newChat}>+ New Chat</button>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}><p style={{margin:0,fontWeight:700,fontSize:"15px"}}>Chats</p><button onClick={newChat} style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",fontWeight:700}}>See All</button></div>
            {chatList.slice(0,5).map(c=>(<button key={c.id} onClick={()=>openChat(c.id)} style={{display:"flex",alignItems:"center",gap:"12px",width:"100%",padding:"12px 14px",marginBottom:"6px",borderRadius:"12px",border:"1px solid "+BO,background:SU,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,"+AC+","+AC2+")",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:"16px"}}>💬</span></div>
              <div style={{flex:1,minWidth:0}}><p style={{margin:"0 0 2px",fontWeight:600,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.preview}…</p><p style={{margin:0,fontSize:"11px",color:MU}}>{c.ts}</p></div>
            </button>))}
            {chatList.length===0&&<div style={{textAlign:"center",padding:"30px",color:MU,background:SU,borderRadius:"12px",border:"1px solid "+BO}}><p style={{fontSize:"32px",marginBottom:"8px"}}>💬</p><p>No chats yet. Start one above!</p></div>}
            {/* Projects row */}
            {projList.length>0&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"20px 0 10px"}}><p style={{margin:0,fontWeight:700,fontSize:"15px"}}>Projects</p><button onClick={()=>setTab("projects")} style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",fontWeight:700}}>See All</button></div>
            <div style={{display:"flex",gap:"10px",overflowX:"auto",paddingBottom:"8px"}}>
              {projList.slice(0,4).map(p=>(<div key={p.id} style={{flexShrink:0,padding:"12px",background:SU,border:"1px solid "+BO,borderRadius:"12px",minWidth:"130px"}}>
                <div style={{fontSize:"24px",marginBottom:"6px"}}>📁</div>
                <p style={{margin:"0 0 2px",fontWeight:600,fontSize:"12px"}}>{p.name}</p>
                <p style={{margin:0,fontSize:"10px",color:MU}}>Updated {new Date(p.created).toLocaleDateString()}</p>
              </div>))}
            </div></>}
            {/* Upgrade banner */}
            {!user?.isAdvance&&<div style={{margin:"20px 0 0",padding:"16px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"14px",color:"#fff",display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{fontSize:"28px"}}>👑</div>
              <div style={{flex:1}}><p style={{margin:"0 0 3px",fontWeight:800,fontSize:"14px"}}>{user?.isPro?"⭐ GoPlanet Pro":"GoPlanet Pro"}</p><p style={{margin:"0 0 4px",fontSize:"12px",opacity:0.9}}>{user?.isPro?"Upgrade to Advance — $50/year":"$25 / year"}</p><p style={{margin:0,fontSize:"11px",opacity:0.8}}>Faster responses · Advanced models · Early access</p></div>
              <button onClick={()=>{setTab("plans");}} style={{background:"#fff",color:AC,border:"none",borderRadius:"10px",padding:"8px 16px",fontWeight:800,fontSize:"13px",cursor:"pointer",flexShrink:0}}>Upgrade Now</button>
            </div>}
          </div>
        ):(
          <>
            <div style={{padding:"8px 14px",background:SU,borderBottom:"1px solid "+BO,flexShrink:0,display:"flex",alignItems:"center",gap:"10px"}}>
              <button onClick={()=>setActiveChat(null)} style={{background:"none",border:"none",color:MU,fontSize:"18px",cursor:"pointer",lineHeight:1}}>←</button>
              <p style={{margin:0,fontSize:"12px",color:MU,flex:1,textAlign:"center"}}>Powered by <span style={{color:AC,fontWeight:700}}>{providerLabel} · {ALL_MODELS.find(m=>m.id===model)?.n||model}</span></p>
            </div>
            <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 14px"}}>
              {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:"10px",gap:"8px",alignItems:"flex-end"}}>
                {m.role==="ai"&&<img src={L} style={{width:"28px",height:"28px",objectFit:"contain",flexShrink:0,borderRadius:"50%",background:"#000"}} alt=""/>}
                <div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",background:m.role==="user"?AC:dark?"#1e1e3a":"#f0ecff",color:m.role==="user"?"#fff":TX,fontSize:"13px",lineHeight:1.6,wordBreak:"break-word"}}>
                  <pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{m.text}</pre>
                </div>
                {m.role==="user"&&<div style={{width:"28px",height:"28px",borderRadius:"50%",background:AC2,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"12px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>}
              </div>))}
              {typing&&<div style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"flex-end"}}><img src={L} style={{width:"28px",height:"28px",objectFit:"contain",borderRadius:"50%",background:"#000"}} alt=""/><div style={{padding:"10px 16px",borderRadius:"4px 16px 16px 16px",background:dark?"#1e1e3a":"#f0ecff"}}><span style={{fontSize:"18px",letterSpacing:"4px",color:AC}}>•••</span></div></div>}
              <div ref={botRef}/>
            </div>
            <div style={{padding:"10px 12px",borderTop:"1px solid "+BO,display:"flex",gap:"8px",flexShrink:0,alignItems:"center",background:SU}}>
              <button onClick={()=>{if(speaking){stopSpk();return;}if(listening){stopListen();return;}startListen();}} style={{width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,border:"none",cursor:"pointer",background:listening?"#e74c3c":speaking?CYAN:voiceOn?GREEN:"#e8e8f0",color:voiceOn||listening||speaking?"#fff":"#666",fontSize:"16px",transition:"background 0.2s"}}>{listening?"⏹":speaking?"🔊":"🎤"}</button>
              <input ref={inputRef} style={{...S.inp(),flex:1,minWidth:0}} placeholder={listening?"Listening…":"Type your message…"} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend();}}}/>
              <button onClick={()=>doSend()} disabled={!inp.trim()||typing} style={{width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,border:"none",background:inp.trim()&&!typing?AC:"#ccc",color:"#fff",fontSize:"18px",cursor:inp.trim()&&!typing?"pointer":"default"}}>➤</button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── PROJECTS TAB ───────────────────────────────────────
  function ProjectsTab(){
    return(<div style={{padding:desktop?"24px":"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}><h2 style={{margin:0,color:AC,fontSize:"18px"}}>📁 Projects</h2><button onClick={()=>setShowPF(true)} style={{background:AC,color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>+ New</button></div>
      {showPF&&<div style={{...S.card,background:SU2,marginBottom:"14px"}}><input style={{...S.inp(),marginBottom:"8px"}} placeholder="Project name…" value={newP} onChange={e=>setNewP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProj()} autoFocus/><div style={{display:"flex",gap:"8px"}}><button style={S.btn()} onClick={createProj}>Create</button><button style={{...S.btn("#ddd",dark?"#eee":"#444"),flex:"none",padding:"12px 20px"}} onClick={()=>{setShowPF(false);setNewP("");}}>Cancel</button></div></div>}
      {projList.length===0?<div style={{textAlign:"center",marginTop:"50px",color:MU}}><div style={{fontSize:"44px",marginBottom:"10px"}}>📁</div><p>No projects yet.</p></div>:<div style={{display:desktop?"grid":"flex",gridTemplateColumns:desktop?"repeat(auto-fill,minmax(200px,1fr))":"",flexDirection:"column",gap:"10px"}}>
        {projList.map(p=>(<div key={p.id} style={S.card}><p style={{margin:0,fontWeight:700,fontSize:"14px"}}>📁 {p.name}</p><p style={{margin:"4px 0 0",fontSize:"11px",color:MU}}>Created {new Date(p.created).toLocaleDateString()}</p></div>))}
      </div>}
    </div>);
  }

  // ─── IMAGE TAB ─────────────────────────────────────────
  function ImageTab(){
    return(<div style={{padding:desktop?"24px":"16px"}}>
      <h2 style={{color:AC,marginTop:0}}>🎨 Image Generator</h2>
      <p style={{color:MU,fontSize:"13px",marginBottom:"14px"}}>Describe the image you want to generate.</p>
      <textarea style={{...S.inp(),height:"80px",resize:"none",marginBottom:"12px"}} placeholder="e.g. A futuristic city floating in clouds at sunset…" value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)}/>
      <button style={S.btn()} onClick={()=>{if(imgPrompt.trim()){setGenLoad(true);setTimeout(()=>{setGenImg("https://picsum.photos/seed/"+encodeURIComponent(imgPrompt)+"/800/600");setGenLoad(false);},1200);}}}>{genLoad?"Generating…":"✨ Generate Image"}</button>
      {genImg&&<img src={genImg} alt="Generated" style={{width:"100%",borderRadius:"12px",marginTop:"14px",border:"1px solid "+BO}}/>}
    </div>);
  }

  // ─── PLANS TAB ─────────────────────────────────────────
  function PlansTab(){
    const plans=[
      {id:"free",name:"Free Plan",price:"$0",period:"forever",badge:null,features:["Basic AI responses","Standard models","Community support"],color:MU,btnLabel:null},
      {id:"pro",name:"Pro Plan",price:"$25",period:"/year",badge:"POPULAR",features:["Faster AI responses","Advanced AI models","Priority support","Early access features"],color:AC,btnLabel:"Subscribe to Pro"},
      {id:"advance",name:"Advance Plan",price:"$50",period:"/year",badge:"BEST",features:["Very fast AI responses","Very advanced AI models","Priority support","Early access to every feature","Exclusive AI models","Highest response priority"],color:"#ff6b35",btnLabel:"Subscribe to Advance"},
    ];
    return(<div style={{padding:desktop?"24px":"16px"}}>
      <h2 style={{color:AC,marginTop:0}}>⭐ Subscription Plans</h2>
      {user?.isAdvance&&<div style={{...S.card,background:"linear-gradient(135deg,#ff6b35,#ff9f43)",color:"#fff",border:"none",marginBottom:"16px"}}><h3 style={{margin:"0 0 6px"}}>⚡ Advance Plan Active</h3>{["Very fast AI responses","Very advanced AI models","Priority support","Early access to every feature"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px"}}>✓ {f}</p>)}</div>}
      {!user?.isAdvance&&user?.isPro&&<div style={{...S.card,background:"linear-gradient(135deg,"+AC+","+AC2+")",color:"#fff",border:"none",marginBottom:"16px"}}><h3 style={{margin:"0 0 6px"}}>⭐ Pro Plan Active — Upgrade available!</h3>{["Faster responses","Advanced models","Priority support"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px"}}>✓ {f}</p>)}</div>}
      <div style={{display:desktop?"grid":"flex",gridTemplateColumns:desktop?"repeat(3,1fr)":"",flexDirection:"column",gap:"14px"}}>
        {plans.map(pl=>(<div key={pl.id} style={{...S.card,border:"2px solid "+(pl.id==="advance"?"#ff6b35":pl.id==="pro"?AC:BO),position:"relative"}}>
          {pl.badge&&<span style={{position:"absolute",top:"-1px",right:"12px",background:pl.id==="advance"?"#ff6b35":AC,color:"#fff",borderRadius:"0 0 8px 8px",padding:"2px 10px",fontSize:"10px",fontWeight:700}}>{pl.badge}</span>}
          <h3 style={{color:pl.color,margin:"0 0 4px"}}>{pl.name}</h3>
          <p style={{fontSize:"28px",fontWeight:900,color:pl.color,margin:"0 0 12px"}}>{pl.price}<span style={{fontSize:"14px",color:MU}}>{pl.period}</span></p>
          {pl.features.map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px",color:MU}}>✓ {f}</p>)}
          {pl.btnLabel&&<button style={{...S.btn(pl.id==="advance"?"#ff6b35":AC),marginTop:"14px"}} onClick={()=>setSubModal(pl.id)}>{pl.btnLabel}</button>}
        </div>))}
      </div>
      {subModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:SU,borderRadius:"18px",padding:"24px",width:"100%",maxWidth:"400px",border:"1px solid "+BO}}>
          <h3 style={{color:AC,margin:"0 0 4px"}}>Complete Subscription</h3>
          <p style={{fontSize:"13px",color:MU,marginBottom:"16px"}}>{subModal==="advance"?"Advance Plan — $50/year":"Pro Plan — $25/year"}</p>
          <input style={{...S.inp(),marginBottom:"8px"}} placeholder="Card number"/>
          <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}><input style={{...S.inp(),flex:1}} placeholder="MM/YY"/><input style={{...S.inp(),flex:1}} placeholder="CVV"/></div>
          <button style={{...S.btn(subModal==="advance"?"#ff6b35":AC),marginBottom:"8px"}} onClick={()=>{pU(uid,{isPro:true,isAdvance:subModal==="advance"});setSubModal(null);alert("🎉 "+(subModal==="advance"?"Advance":"Pro")+" activated!");}}>Pay {subModal==="advance"?"$50":"$25"}/year</button>
          <button style={{background:"none",border:"none",color:MU,cursor:"pointer",fontSize:"13px",width:"100%"}} onClick={()=>setSubModal(null)}>Cancel</button>
        </div>
      </div>}
    </div>);
  }

  // ─── SETTINGS TAB ──────────────────────────────────────
  function SettingsTab(){
    return(<div style={{padding:desktop?"24px":"16px"}}>
      <h2 style={{color:AC,marginTop:0}}>⚙️ Settings</h2>
      {/* API Keys */}
      <div style={S.card}>
        <span style={S.lbl}>🔑 API Keys</span>
        <p style={{fontSize:"12px",color:MU,margin:"0 0 12px",lineHeight:1.5}}>Your API keys are stored ONLY on this device. Never visible to any other user or server.</p>
        {/* Groq Key */}
        <p style={{margin:"0 0 5px",fontSize:"13px",fontWeight:700,color:TX}}>Groq API Key</p>
        <input style={{...S.inp(),fontFamily:"monospace",fontSize:"12px",marginBottom:"8px"}} type="password" placeholder="gsk_…" value={groqKey} onChange={e=>setGroqKey(e.target.value)}/>
        {/* OpenAI Key */}
        <p style={{margin:"0 0 5px",fontSize:"13px",fontWeight:700,color:TX}}>OpenAI API Key (Optional)</p>
        <input style={{...S.inp(),fontFamily:"monospace",fontSize:"12px",marginBottom:"12px"}} type="password" placeholder="sk-…" value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)}/>
        {/* Provider choice */}
        <p style={{margin:"0 0 6px",fontSize:"13px",fontWeight:700,color:TX}}>AI Provider</p>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
          {[{id:"groq",label:"⚡ Groq (Free)"},{id:"openai",label:"🤖 OpenAI"}].map(p=>(<button key={p.id} onClick={()=>{setAiProvider(p.id);sSett({aiProvider:p.id});setModel(p.id==="groq"?GROQ_MODELS[0].id:OPENAI_MODELS[0].id);sSett({model:p.id==="groq"?GROQ_MODELS[0].id:OPENAI_MODELS[0].id});}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"1.5px solid "+(aiProvider===p.id?AC:BO),background:aiProvider===p.id?"#f0ecff":"transparent",color:aiProvider===p.id?AC:TX,fontWeight:aiProvider===p.id?700:400,cursor:"pointer",fontSize:"13px"}}>{p.label}</button>))}
        </div>
        <button style={S.btn()} onClick={()=>{sSett({groqKey,openaiKey});alert("✅ API keys saved!");}}>Save API Keys</button>
      </div>
      {/* AI Model */}
      <div style={S.card}>
        <span style={S.lbl}>🤖 AI Model</span>
        {ALL_MODELS.map(m=>(<button key={m.id} onClick={()=>{setModel(m.id);sSett({model:m.id});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"9px 12px",marginBottom:"6px",borderRadius:"9px",border:"1.5px solid "+(model===m.id?AC:BO),background:model===m.id?"#f0ecff":"transparent",cursor:"pointer",textAlign:"left"}}><span style={{fontSize:"13px",color:model===m.id?AC:TX,fontWeight:model===m.id?700:400}}>{m.n}</span><span style={{fontSize:"11px",color:MU}}>{m.t}</span></button>))}
      </div>
      {/* Appearance */}
      <div style={S.card}>
        <span style={S.lbl}>🎨 Appearance</span>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:"13px"}}>Dark Mode</span>
          <button onClick={()=>setDark(d=>{sSett({dark:!d});return !d;})} style={{width:"48px",height:"26px",borderRadius:"13px",background:dark?AC:"#ddd",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
            <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:dark?"24px":"2px",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
          </button>
        </div>
      </div>
      {/* Voice */}
      <div style={S.card}>
        <span style={S.lbl}>🎤 Voice Mode</span>
        <p style={{fontSize:"12px",color:MU,margin:"0 0 10px",lineHeight:1.5}}>Speak to GoPlanet AI and hear responses aloud. Requires microphone permission.</p>
        <button style={S.btn(voiceOn?GREEN:AC2)} onClick={()=>{setVoiceOn(v=>{sSett({voiceOn:!v});return !v;})}}>{voiceOn?"🎤 Voice Mode ON — Tap to Disable":"🎤 Enable Voice Mode"}</button>
      </div>
      {/* Install app */}
      <div style={S.card}>
        <span style={S.lbl}>📱 Install App</span>
        <p style={{fontSize:"12px",color:MU,margin:"0 0 10px",lineHeight:1.5}}>Install GoPlanet AI on your device for the best experience. Works on any device — mobile, tablet, or desktop.</p>
        <div style={{background:SU2,borderRadius:"10px",padding:"12px",fontSize:"12px",color:TX,lineHeight:1.7}}>
          <p style={{margin:"0 0 6px",fontWeight:700}}>📱 Mobile (iOS/Android):</p>
          <p style={{margin:"0 0 10px",color:MU}}>Tap Share → "Add to Home Screen"</p>
          <p style={{margin:"0 0 6px",fontWeight:700}}>💻 Desktop (Chrome/Edge):</p>
          <p style={{margin:0,color:MU}}>Click the install icon (⊕) in the browser address bar</p>
        </div>
      </div>
      {/* Certification */}
      <div style={S.card}>
        <span style={S.lbl}>📜 Certification (Optional)</span>
        <p style={{fontSize:"12px",color:MU,margin:"0 0 10px",lineHeight:1.5}}>Score 40/50 or above to earn a certificate and gain Admin access.</p>
        <button style={{...S.btn(AC2),marginBottom:"8px"}} onClick={()=>{setGIdx(0);setExScreen("guide");}}>📖 Read User Guide</button>
        <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{setExName(user?.name||"");setExEmail(user?.email||"");setExErr("");setExScreen("entry");}}>📝 Enter Exam</button>
        {user?.examScore!=null&&<button style={{...S.btn("#e17055"),marginBottom:"8px"}} onClick={()=>{setExName(user?.name||"");setExEmail(user?.email||"");setExAns({});setExErr("");setExScreen("entry");}}>🔄 Re-take Exam</button>}
        {user?.certGranted&&<button style={S.btn(GREEN)} onClick={async()=>{if(!certUrl){setCertLoad(true);const url=await makeCert(user.certName||user.name,user.examScore,user.certDate,L);setCertUrl(url);setCertDate(user.certDate);setExName(user.certName||user.name);setExScore(user.examScore);setCertLoad(false);}setExScreen("cert");}}>{certLoad?"Loading…":"🏆 View My Certificate"}</button>}
        {user?.examScore!=null&&<p style={{margin:"8px 0 0",fontSize:"12px",color:MU,textAlign:"center"}}>Last score: {user.examScore}/50 {user.examScore>=40?"✅ Passed":"— need 40+ to pass"}</p>}
      </div>
      {/* Account */}
      <div style={S.card}>
        <span style={S.lbl}>👤 Account</span>
        {[["Name",user?.name],["Email",user?.email],["Mobile",user?.mob],["Plan",user?.isAdvance?"⚡ Advance":user?.isPro?"⭐ Pro":"Free"],["Role",user?.isAdmin?"🛡️ Admin":"User"],["Device",user?.deviceType||"—"],["Joined",user?.joined?new Date(user.joined).toLocaleDateString():"—"]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BO,fontSize:"13px"}}><span style={{color:MU}}>{k}</span><span style={{fontWeight:600}}>{v||"—"}</span></div>))}
        <button style={{...S.btn(RED),marginTop:"14px"}} onClick={doLogout}>🚪 Log Out</button>
      </div>
    </div>);
  }

  // ─── ADMIN TAB ─────────────────────────────────────────
  function AdminTab(){
    useEffect(()=>{if(user?.isAdmin)loadAllUsers();},[]);
    if(!user?.isAdmin)return(<div style={{padding:"32px 16px",textAlign:"center"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🔒</div><p style={{color:RED,fontWeight:700,fontSize:"16px"}}>Admin access required.</p><p style={{color:MU,fontSize:"13px"}}>Score 40+ on the certification exam to become an Admin.</p></div>);
    const total=allUsers.length;
    const activeCount=allUsers.filter(u=>u.joined&&(Date.now()-new Date(u.joined).getTime())<30*24*3600*1000).length;
    const proCount=allUsers.filter(u=>u.isPro).length;
    const advCount=allUsers.filter(u=>u.isAdvance).length;
    const certCount=allUsers.filter(u=>u.certGranted).length;
    const adminCount=allUsers.filter(u=>u.isAdmin).length;
    const revenue=(proCount*25+advCount*50);
    return(<div style={{padding:desktop?"24px":"16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}><h2 style={{margin:0,color:AC,fontSize:"18px"}}>🛡️ Admin Dashboard</h2><span style={{background:GOLD,color:"#000",borderRadius:"20px",padding:"3px 12px",fontSize:"11px",fontWeight:700}}>👑 Admin</span></div>
      {/* Tabs */}
      <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
        {["members","stats"].map(t=>(<button key={t} onClick={()=>{setAdminTab(t);if(t==="members")loadAllUsers();}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"1.5px solid "+(adminTab===t?AC:BO),background:adminTab===t?"#f0ecff":"transparent",color:adminTab===t?AC:MU,cursor:"pointer",fontWeight:700,fontSize:"13px",textTransform:"capitalize"}}>{t==="stats"?"📊 Stats":"👥 Members"}</button>))}
      </div>
      {/* STATS TAB */}
      {adminTab==="stats"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
          {[["Total Users",total,AC],["Active Users",activeCount,GREEN],["Subscriptions",proCount+advCount,"#ff6b35"],["Revenue","$"+revenue,GOLD]].map(([l,v,col])=>(<div key={l} style={{...S.card,textAlign:"center",padding:"16px",borderTop:"3px solid "+col}}><p style={{fontSize:"28px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MU,margin:"4px 0 0"}}>{l}</p></div>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
          {[["Pro Members",proCount,AC],["Advance Members",advCount,"#ff6b35"],["Certified",certCount,GREEN],["Admins",adminCount,"#e84393"]].map(([l,v,col])=>(<div key={l} style={{...S.card,textAlign:"center",padding:"14px",borderTop:"3px solid "+col}}><p style={{fontSize:"24px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MU,margin:"4px 0 0"}}>{l}</p></div>))}
        </div>
        {/* Recent users */}
        <div style={S.card}>
          <p style={{margin:"0 0 12px",fontWeight:700,fontSize:"14px",color:AC}}>👥 Recent Users</p>
          {allUsers.slice(0,6).map((u,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:i<Math.min(5,allUsers.length-1)?"1px solid "+BO:"none"}}>
            <div style={{width:"32px",height:"32px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"13px",flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}><p style={{margin:0,fontSize:"13px",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p><p style={{margin:0,fontSize:"11px",color:MU}}>{u.joined?new Date(u.joined).toLocaleDateString():"—"}</p></div>
            <span style={{fontSize:"10px",padding:"2px 8px",borderRadius:"8px",background:u.isAdvance?"#ff6b35":u.isPro?AC:"#eee",color:u.isPro||u.isAdvance?"#fff":MU,fontWeight:600}}>{u.isAdvance?"Advance":u.isPro?"Pro":"Free"}</span>
          </div>))}
        </div>
      </>}
      {/* MEMBERS TAB */}
      {adminTab==="members"&&<>
        <p style={{fontSize:"12px",color:MU,marginBottom:"12px"}}>{total} registered member(s)</p>
        {allUsers.map((u,i)=>(<div key={i} style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"15px",flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:0,fontWeight:700,fontSize:"13px"}}>{u.name} {u.isAdmin&&<span style={{background:AC,color:"#fff",borderRadius:"4px",padding:"1px 7px",fontSize:"10px"}}>Admin</span>}</p>
              <p style={{margin:0,fontSize:"11px",color:MU,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
            {[u.isAdvance?"⚡ Advance":u.isPro?"⭐ Pro":"Free Plan",u.certGranted?"🏆 Certified":""].filter(Boolean).map((b,j)=>(<span key={j} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"10px",background:j===0&&(u.isPro||u.isAdvance)?"#f0ecff":"#f0f0f0",color:j===0&&u.isPro?AC:j===0&&u.isAdvance?"#ff6b35":MU,fontWeight:600}}>{b}</span>))}
          </div>
          {u.examScore!=null&&<p style={{margin:"0 0 8px",fontSize:"11px",color:MU}}>Exam: {u.examScore}/50 {u.examScore>=40?"✅":"❌"}</p>}
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {!u.isPro&&!u.isAdvance&&<button onClick={()=>grantPro(u.id)} style={{flex:1,padding:"6px 8px",borderRadius:"7px",border:"none",background:AC,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Pro</button>}
            {!u.isAdvance&&<button onClick={()=>grantAdvance(u.id)} style={{flex:1,padding:"6px 8px",borderRadius:"7px",border:"none",background:"#ff6b35",color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Advance</button>}
            {!u.isAdmin&&<button onClick={()=>grantAdmin(u.id)} style={{flex:1,padding:"6px 8px",borderRadius:"7px",border:"none",background:AC2,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Admin</button>}
          </div>
        </div>))}
      </>}
    </div>);
  }

  // ─── MAIN RENDER ───────────────────────────────────────
  const tabContent=()=>{
    if(tab==="chat")return <ChatTab/>;
    if(tab==="projects")return <ProjectsTab/>;
    if(tab==="image")return <ImageTab/>;
    if(tab==="plans")return <PlansTab/>;
    if(tab==="settings")return <SettingsTab/>;
    if(tab==="admin")return <AdminTab/>;
    return null;
  };

  if(desktop){
    // ─── DESKTOP LAYOUT ─────────────────────────────────
    return(
      <div style={{...S.app}}>
        {/* Permanent left sidebar */}
        <div style={{...S.sidebar}}>
          <SidebarContent/>
        </div>
        {/* Main content */}
        <div style={S.main}>
          {/* Top bar */}
          <div style={S.topbar}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"14px",fontWeight:700,color:TX}}>{NAV_ITEMS.find(n=>n.id===tab)?.label||"GoPlanet"}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"6px",background:SU2,padding:"5px 12px",borderRadius:"20px"}}>
                <span style={{fontSize:"14px"}}>☀️</span>
                <button onClick={()=>setDark(d=>{sSett({dark:!d});return !d;})} style={{width:"38px",height:"20px",borderRadius:"10px",background:dark?AC:"#ddd",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                  <div style={{width:"16px",height:"16px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:dark?"20px":"2px",transition:"left 0.2s"}}/>
                </button>
                <span style={{fontSize:"11px",color:MU}}>Dark</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",background:SU2,padding:"6px 14px",borderRadius:"20px"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"13px"}}>{user?.name?.[0]?.toUpperCase()}</div>
                <span style={{fontSize:"13px",fontWeight:600}}>Hello, {user?.name?.split(" ")[0]}</span>
              </div>
            </div>
          </div>
          {/* Content body */}
          <div style={S.body}>{tabContent()}</div>
        </div>
      </div>
    );
  }else{
    // ─── MOBILE LAYOUT ──────────────────────────────────
    return(
      <div style={{...S.app,flexDirection:"column",maxWidth:"480px",margin:"0 auto"}}>
        {/* Mobile sidebar overlay */}
        {sideOpen&&<div style={{position:"fixed",inset:0,zIndex:99,display:"flex"}}>
          <div style={{width:"82%",maxWidth:"320px",background:SU,zIndex:100,boxShadow:"6px 0 28px rgba(0,0,0,0.22)",display:"flex",flexDirection:"column",overflow:"hidden",height:"100%"}}>
            <SidebarContent/>
          </div>
          <div style={{flex:1,background:"rgba(0,0,0,0.45)"}} onClick={()=>setSideOpen(false)}/>
        </div>}
        {/* Mobile topbar */}
        <div style={S.topbar}>
          <button onClick={()=>setSideOpen(p=>!p)} style={{background:"none",border:"none",fontSize:"22px",cursor:"pointer",color:TX,padding:"2px 6px"}}>☰</button>
          <div style={{display:"flex",alignItems:"center",gap:"8px",fontWeight:900,fontSize:"17px",color:AC}}>
            <img src={L} style={{width:"28px",height:"28px",objectFit:"contain"}} alt=""/>GoPlanet
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <button onClick={()=>setDark(d=>{sSett({dark:!d});return !d;})} style={{background:"none",border:"none",fontSize:"18px",cursor:"pointer"}}>{dark?"🌙":"☀️"}</button>
            <div style={{width:"32px",height:"32px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"13px"}}>{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>
        {/* Content */}
        <div style={S.body}>{tabContent()}</div>
        {/* Bottom nav */}
        <div style={S.bottomNav}>
          {MOB_NAV.map(t=>(<button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}><span style={{fontSize:"20px"}}>{t.icon}</span><span>{t.label}</span></button>))}
        </div>
      </div>
    );
  }
}

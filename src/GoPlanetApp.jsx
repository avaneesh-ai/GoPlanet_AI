import{useState,useEffect,useRef,useCallback}from"react";
import L from"./logoData.js";

/* ── Storage ─────────────────────────────────────────── */
const DB={
  g:(k,d=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  s:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  d:(k)=>{try{localStorage.removeItem(k);}catch{}},
};
const SESS="gp_s",UIDX="gp_i";
const uK=id=>"gp_u"+id,cK=id=>"gp_c"+id,pK=id=>"gp_p"+id,sK=id=>"gp_k"+id;
const mkId=e=>btoa(encodeURIComponent(e.toLowerCase().trim())).replace(/[^a-zA-Z0-9]/g,"").slice(0,24);

/* ── Quiz 50 questions ───────────────────────────────── */
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
  {q:"GoPlanet's chatbot is powered by?",o:["OpenAI GPT","Google Bard","Groq API","Amazon Alexa"],a:2},
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

/* ── Guide 10 chapters ───────────────────────────────── */
const GUIDE=[
  {icon:"🚀",title:"Getting Started",color:"#6c5ce7",
   steps:[{h:"Register",b:"Create your account with email, password, full name, and mobile number."},{h:"Log In",b:"Sign in — your session persists automatically. No need to log in again."},{h:"Start Chatting",b:"You land on the Chat screen. Tap + New Chat to begin your first AI conversation."},{h:"Navigate",b:"Use the bottom navigation: Chat, Projects, Images, Plans, Settings."}],
   tip:"Your data saves automatically every time. Nothing is lost when you close the app.",
   note:"No email verification required. Register and start immediately."},
  {icon:"🔑",title:"Setting Up Your API Key",color:"#e17055",
   steps:[{h:"Visit Groq",b:"Go to console.groq.com and create a free account."},{h:"Create Key",b:"Click API Keys and create a new key — it starts with gsk_."},{h:"Save Key",b:"Go to ⚙️ Settings, paste your key in the API Key field, and tap Save."},{h:"Ready",b:"The chatbot is now powered by Groq's ultra-fast AI models."}],
   tip:"Your API key is stored ONLY on your device. It is NEVER sent to GoPlanet servers or visible to any other user.",
   note:"Without a Groq API key the chatbot will not respond. This is a one-time setup."},
  {icon:"💬",title:"Using the AI Chatbot",color:"#00b894",
   steps:[{h:"New Chat",b:"Tap + New Chat from the sidebar or the welcome screen."},{h:"Type & Send",b:"Type your message and press Enter or tap the send button. The AI replies instantly."},{h:"Voice Mode",b:"Tap the 🎤 microphone to speak. The AI listens, understands, and replies aloud."},{h:"Chat History",b:"All your chats are saved in the sidebar. Tap any to continue where you left off."}],
   tip:"Switch AI models (Llama, Mixtral, Gemma) anytime from the model selector on the welcome screen.",
   note:"The chatbot uses your Groq API key. Your conversations stay private on your device only."},
  {icon:"📁",title:"Managing Projects",color:"#fdcb6e",
   steps:[{h:"Open Projects",b:"Tap the 📁 Projects tab in the bottom navigation."},{h:"Create Project",b:"Tap + New, enter a project name, and tap Create."},{h:"Organise",b:"Use projects to group related AI tasks, chats, and ideas together."},{h:"Access Anytime",b:"All projects are saved and available every time you open the app."}],
   tip:"Create separate projects for Work, Personal, Creative Writing, Research, etc.",
   note:"Projects are stored locally on your device."},
  {icon:"🎨",title:"Image Generator",color:"#a29bfe",
   steps:[{h:"Open Images",b:"Tap the 🎨 Images tab in the bottom navigation."},{h:"Write Prompt",b:"Describe the image you want — be as detailed as possible."},{h:"Generate",b:"Tap Generate Image and wait a moment for the result."},{h:"Try Again",b:"Not satisfied? Edit your prompt and generate again."}],
   tip:"More detail = better results. Example: 'A glowing robot on a purple alien planet at sunset, cinematic lighting, 4K.'",
   note:"Connect an image generation API key in Settings for real AI-generated images."},
  {icon:"⭐",title:"Subscription Plans",color:"#f9ca24",
   steps:[{h:"Free Plan",b:"Basic AI responses using standard models. Great for getting started."},{h:"Pro Plan",b:"$25/year — faster responses, advanced models, priority support, early access."},{h:"Subscribe",b:"Go to ⭐ Plans tab, tap Subscribe Now, and complete the payment."},{h:"Admin Grant",b:"An admin can also grant you Pro access directly from the Admin Panel."}],
   tip:"Pro unlocks the fastest and most capable AI models for much better quality responses.",
   note:"Admins can grant Pro to any user manually from the Admin Panel."},
  {icon:"🛡️",title:"Admin Panel",color:"#e84393",
   steps:[{h:"Who is Admin?",b:"A user becomes Admin ONLY by scoring 40+ on the certification exam, OR by being granted admin by an existing admin."},{h:"Admin Tab",b:"Admins see a 🛡️ Admin tab in the bottom navigation bar."},{h:"View Members",b:"See all registered users, their exam scores, Pro status, and certification status."},{h:"Grant Access",b:"Tap Grant Pro or Grant Admin to upgrade any user instantly."}],
   tip:"Admin access is earned — not automatic. Score 40 or above on the exam to unlock it.",
   note:"No user gets admin automatically at registration. It requires passing the exam or manual grant."},
  {icon:"📜",title:"Certification Exam (Optional)",color:"#6c5ce7",
   steps:[{h:"Optional",b:"The exam is completely optional. Go to ⚙️ Settings and scroll down to Certification."},{h:"Read the Guide",b:"Read all 10 chapters of this guide before attempting the exam."},{h:"Enter Your Name",b:"Your full name will appear exactly as typed on your certificate."},{h:"Answer 50 Qs",b:"Answer all 50 multiple-choice questions about AI and GoPlanet."},{h:"Score 40+",b:"Score 40 or above out of 50 to earn your downloadable certificate."},{h:"Download",b:"Your certificate shows your registered name and the exact date you took the exam."}],
   tip:"You can retake the exam anytime from Settings. Your best attempt is always saved.",
   note:"Certificate is issued ONLY for scores of 40 or above. Scoring 40+ also grants Admin access."},
  {icon:"🎤",title:"Voice Mode",color:"#00cec9",
   steps:[{h:"Enable",b:"Go to ⚙️ Settings → Voice Mode and toggle it on."},{h:"Tap Mic",b:"In any chat, tap the 🎤 button next to the text input box."},{h:"Speak Clearly",b:"Speak your question — GoPlanet AI listens and transcribes it automatically."},{h:"AI Speaks Back",b:"The AI replies in text AND reads the response aloud to you."}],
   tip:"Use voice mode hands-free while cooking, driving, or doing other tasks.",
   note:"Voice mode requires microphone permission in your browser. Works best in Chrome or Edge."},
  {icon:"🔒",title:"Privacy & Security",color:"#636e72",
   steps:[{h:"API Key Safety",b:"Your Groq API key is stored ONLY on your device. It is never sent to GoPlanet servers."},{h:"User Isolation",b:"Each user's data is stored separately. No user can see another user's data or API key."},{h:"Local Storage",b:"All chats, projects, and settings are stored locally on your device only."},{h:"Log Out",b:"Always log out when using a shared device to protect your account."}],
   tip:"If you suspect your API key was compromised, revoke it immediately at console.groq.com.",
   note:"GoPlanet never collects or transmits your personal data or API keys to any server."},
];

/* ── Certificate generator ────────────────────────────── */
function makeCert(name,score,dateStr,logo){
  return new Promise(res=>{
    const W=1050,H=1200,cv=document.createElement("canvas");
    cv.width=W;cv.height=H;
    const c=cv.getContext("2d");
    // BG
    const bg=c.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,"#f8f8ff");bg.addColorStop(1,"#eaeaff");
    c.fillStyle=bg;c.fillRect(0,0,W,H);
    // Wave lines
    c.strokeStyle="rgba(108,92,231,0.06)";c.lineWidth=1.5;
    for(let i=0;i<12;i++){c.beginPath();c.moveTo(-60,200+i*85);for(let x=0;x<=W+100;x+=12)c.lineTo(x-60,200+i*85+Math.sin(x*0.016)*38);c.stroke();}
    // Dot matrix
    c.fillStyle="rgba(108,92,231,0.13)";
    for(let r=0;r<10;r++)for(let cc=0;cc<7;cc++){c.beginPath();c.arc(W-52-cc*17,65+r*17,2.5,0,Math.PI*2);c.fill();}
    // Side bars
    const sg=c.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,"#280070");sg.addColorStop(0.4,"#6c5ce7");sg.addColorStop(0.7,"#5020b8");sg.addColorStop(1,"#280070");
    c.fillStyle=sg;c.fillRect(0,0,20,H);c.fillRect(W-20,0,20,H);
    // Bottom bar
    const bg2=c.createLinearGradient(0,0,W,0);
    bg2.addColorStop(0,"#280070");bg2.addColorStop(0.5,"#6c5ce7");bg2.addColorStop(1,"#280070");
    c.fillStyle=bg2;c.fillRect(0,H-20,W,20);
    // Glows
    const bl=c.createRadialGradient(0,H,0,0,H,260);bl.addColorStop(0,"rgba(60,0,190,0.6)");bl.addColorStop(1,"rgba(60,0,190,0)");c.fillStyle=bl;c.fillRect(0,H-260,300,260);
    const br=c.createRadialGradient(W,H,0,W,H,300);br.addColorStop(0,"rgba(20,60,210,0.55)");br.addColorStop(1,"rgba(20,60,210,0)");c.fillStyle=br;c.fillRect(W-300,H-300,300,300);
    c.strokeStyle="rgba(100,140,255,0.15)";c.lineWidth=3;
    for(let i=0;i<7;i++){c.beginPath();c.moveTo(W-10,H-10);c.lineTo(W-10-i*50,H-160-i*28);c.stroke();}
    // Border
    c.strokeStyle="#5228b8";c.lineWidth=3.5;c.strokeRect(22,22,W-44,H-44);
    c.strokeStyle="#a29bfe";c.lineWidth=2;c.strokeRect(32,32,W-64,H-64);
    // Corner ornaments
    [[40,40],[W-40,40],[40,H-40],[W-40,H-40]].forEach(([x,y])=>{
      const s=22;c.strokeStyle="#8866cc";c.lineWidth=2.5;
      c.beginPath();c.moveTo(x,y+s);c.lineTo(x,y);c.lineTo(x+s,y);c.stroke();
      c.beginPath();c.moveTo(x-s,y);c.lineTo(x,y);c.lineTo(x,y-s);c.stroke();
    });
    const drawContent=()=>{
      c.textAlign="center";
      // GoPlanet
      c.fillStyle="#1535ff";c.font="bold 56px Arial,sans-serif";c.fillText("GoPlanet",W/2,325);
      c.strokeStyle="#666";c.lineWidth=1;
      c.beginPath();c.moveTo(308,344);c.lineTo(412,344);c.stroke();
      c.beginPath();c.moveTo(638,344);c.lineTo(742,344);c.stroke();
      c.fillStyle="#555";c.font="14px Arial,sans-serif";c.fillText("AI CHATBOT",W/2,350);
      // CERTIFICATE
      c.fillStyle="#060818";c.font="bold 92px Georgia,serif";c.fillText("CERTIFICATE",W/2,450);
      // OF COMPLETION
      c.strokeStyle="#6c5ce7";c.lineWidth=2.5;
      c.beginPath();c.moveTo(118,480);c.lineTo(310,480);c.stroke();
      c.beginPath();c.moveTo(740,480);c.lineTo(932,480);c.stroke();
      c.fillStyle="#6c5ce7";c.beginPath();c.arc(115,480,4.5,0,Math.PI*2);c.fill();c.beginPath();c.arc(935,480,4.5,0,Math.PI*2);c.fill();
      c.font="bold 23px Arial,sans-serif";c.fillText("OF COMPLETION",W/2,490);
      // Presented to
      c.fillStyle="#777";c.font="14px Arial,sans-serif";c.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO",W/2,530);
      // Dotted line
      c.strokeStyle="#6c5ce7";c.lineWidth=1.5;c.setLineDash([2,8]);c.beginPath();c.moveTo(118,546);c.lineTo(932,546);c.stroke();c.setLineDash([]);
      c.fillStyle="#6c5ce7";c.beginPath();c.arc(115,546,5,0,Math.PI*2);c.fill();c.beginPath();c.arc(935,546,5,0,Math.PI*2);c.fill();
      // NAME — large, centred
      c.fillStyle="#080820";c.font="bold 52px Georgia,serif";c.fillText(name,W/2,618);
      const nw=c.measureText(name).width;
      c.strokeStyle="#6c5ce7";c.lineWidth=2.5;c.beginPath();c.moveTo(W/2-nw/2,632);c.lineTo(W/2+nw/2,632);c.stroke();
      // Body
      c.fillStyle="#444";c.font="16px Arial,sans-serif";
      ["for successfully completing the GoPlanet AI Chatbot Certification Program.",
       "This certifies your understanding and practical knowledge",
       "of responsible AI usage, smart communication,",
       "and real-world AI chatbot applications."].forEach((l,i)=>c.fillText(l,W/2,668+i*27));
      // Score badge
      c.fillStyle="#ede9ff";c.beginPath();
      const bx=410,by=742,bw=230,bh=40,rb=20;
      c.moveTo(bx+rb,by);c.lineTo(bx+bw-rb,by);c.arcTo(bx+bw,by,bx+bw,by+rb,rb);c.lineTo(bx+bw,by+bh-rb);c.arcTo(bx+bw,by+bh,bx+bw-rb,by+bh,rb);c.lineTo(bx+rb,by+bh);c.arcTo(bx,by+bh,bx,by+bh-rb,rb);c.lineTo(bx,by+rb);c.arcTo(bx,by,bx+rb,by,rb);c.closePath();c.fill();
      c.fillStyle="#6c5ce7";c.font="bold 16px Arial,sans-serif";c.fillText("Score: "+score+" / 50",W/2,768);
      // RECOGNIZED AS
      c.strokeStyle="#6c5ce7";c.lineWidth=1;
      c.beginPath();c.moveTo(188,804);c.lineTo(392,804);c.stroke();c.beginPath();c.moveTo(658,804);c.lineTo(862,804);c.stroke();
      c.fillStyle="#666";c.font="bold 14px Arial,sans-serif";c.fillText("YOU ARE NOW RECOGNIZED AS",W/2,812);
      c.fillStyle="#4a20b0";c.font="bold 34px Arial,sans-serif";c.fillText("GOPLANET CERTIFIED USER",W/2,855);
      // Laurels
      const lau=(sx,sy,dir)=>{c.strokeStyle="#7a56bf";c.lineWidth=1.8;for(let i=0;i<7;i++){const a=(dir===1?-0.5:Math.PI+0.5)+i*dir*0.22,ln=17+i*2.5,bx=sx+dir*i*10,by=sy-i*7;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+Math.cos(a)*ln,by+Math.sin(a)*ln);c.stroke();}};
      lau(195,878,1);lau(855,878,-1);
      // 4 principle icons
      const PR=[{l:"HONEST USE",s:"Use technology\nwith integrity.",col:"#1535ff"},{l:"SMART THINKING",s:"Solve problems\nwith intelligence.",col:"#5228c0"},{l:"EFFECTIVE",s:"Work smarter,\nachieve more.",col:"#0099cc"},{l:"HUMAN FIRST",s:"Empower people,\nnot replace them.",col:"#7030a0"}];
      const IC=["✅","🧠","💬","❤️"];
      const iY=920,iSp=192,iSt=W/2-iSp*1.5;
      PR.forEach((p,i)=>{
        const x=iSt+i*iSp;
        const cg=c.createRadialGradient(x,iY,5,x,iY,36);cg.addColorStop(0,p.col+"cc");cg.addColorStop(1,p.col+"33");
        c.fillStyle=cg;c.beginPath();c.arc(x,iY,36,0,Math.PI*2);c.fill();
        c.strokeStyle=p.col+"88";c.lineWidth=2;c.beginPath();c.arc(x,iY,36,0,Math.PI*2);c.stroke();
        c.font="26px serif";c.fillText(IC[i],x,iY+10);
        if(i<3){c.fillStyle="#ccc";c.beginPath();c.arc(x+iSp/2,iY,4,0,Math.PI*2);c.fill();}
        c.fillStyle="#1a1a2e";c.font="bold 11px Arial,sans-serif";c.fillText(p.l,x,iY+60);
        c.fillStyle="#666";c.font="11px Arial,sans-serif";
        p.s.split("\n").forEach((ln,li)=>c.fillText(ln,x,iY+76+li*16));
      });
      // Signature
      c.textAlign="left";
      c.fillStyle="#4a20b0";c.font="italic 30px Georgia,serif";c.fillText("GoPlanet Team",88,1098);
      c.fillStyle="#444";c.font="bold 11px Arial,sans-serif";c.fillText("GOPLANET TEAM",88,1118);
      c.fillStyle="#888";c.font="11px Arial,sans-serif";c.fillText("ISSUER",88,1132);
      // Medal
      c.textAlign="center";
      c.fillStyle="#0a0a1e";c.beginPath();c.arc(W/2,1108,48,0,Math.PI*2);c.fill();
      c.strokeStyle="#f9ca24";c.lineWidth=5.5;c.beginPath();c.arc(W/2,1108,48,0,Math.PI*2);c.stroke();
      c.strokeStyle="#f9ca2480";c.lineWidth=2;c.beginPath();c.arc(W/2,1108,40,0,Math.PI*2);c.stroke();
      c.font="36px serif";c.fillText("🤖",W/2,1121);
      c.fillStyle="#5228c0";c.fillRect(W/2-12,1154,10,28);c.fillStyle="#a29bfe";c.fillRect(W/2+2,1154,10,28);
      c.fillStyle="#f9ca24";c.font="13px serif";
      [[W/2-62,1082],[W/2+62,1082],[W/2-66,1118],[W/2+66,1118]].forEach(([x,y])=>c.fillText("★",x,y));
      // Date
      c.textAlign="right";
      c.strokeStyle="#6c5ce7";c.lineWidth=1.5;c.strokeRect(W-220,1080,168,72);
      c.font="22px serif";c.fillStyle="#6c5ce7";c.fillText("📅",W-194,1108);
      c.fillStyle="#080820";c.font="bold 15px Arial,sans-serif";c.fillText(dateStr,W-72,1110);
      c.fillStyle="#6c5ce7";c.font="bold 11px Arial,sans-serif";c.fillText("DATE OF ISSUE",W-72,1130);
    };
    const img=new Image();
    img.onload=()=>{c.drawImage(img,W/2-85,28,170,170);drawContent();res(cv.toDataURL("image/png"));};
    img.onerror=()=>{drawContent();res(cv.toDataURL("image/png"));};
    img.src=logo;
  });
}

/* ════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════ */
export default function App(){
  const[page,setPage]=useState("boot");
  const[regStep,setReg]=useState(1);
  const[form,setForm]=useState({email:"",pw:"",name:"",mob:""});
  const[authErr,setAErr]=useState("");
  const[uid,setUid]=useState(null);
  const[user,setUser]=useState(null);
  const[tab,setTab]=useState("chat");
  const[sb,setSb]=useState(false);
  const[dark,setDark]=useState(false);
  const[apiKey,setApiKey]=useState("");
  const[model,setModel]=useState("llama-3.3-70b-versatile");
  const[chats,setChats]=useState({});
  const[ac,setAc]=useState(null);
  const[msgs,setMsgs]=useState([]);
  const[inp,setInp]=useState("");
  const[typing,setTyping]=useState(false);
  const[voiceOn,setVoiceOn]=useState(false);
  const[listening,setListening]=useState(false);
  const[speaking,setSpeaking]=useState(false);
  const[projs,setProjs]=useState({});
  const[newP,setNewP]=useState("");
  const[showPF,setShowPF]=useState(false);
  const[imgP,setImgP]=useState("");
  const[genImg,setGenImg]=useState(null);
  const[genLoad,setGenLoad]=useState(false);
  const[subM,setSubM]=useState(false);
  const[admins,setAdmins]=useState([]);
  const[aTab,setATab]=useState("members");
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
  // Use ref for latest msgs so async callbacks always see current state
  const msgsR=useRef([]);
  useEffect(()=>{msgsR.current=msgs;},[msgs]);

  const AC="#6c5ce7",AC2="#a29bfe";
  const BG=dark?"#0f0f1a":"#f7f7fc",SU=dark?"#1a1a2e":"#fff",BO=dark?"#2a2a4a":"#e8e8f0",TX=dark?"#e0e0ff":"#1a1a2e",MU=dark?"#8888bb":"#777788";
  const MODS=[{id:"llama-3.3-70b-versatile",n:"Llama 3.3 70B",t:"Meta"},{id:"mixtral-8x7b-32768",n:"Mixtral 8x7B",t:"Mistral"},{id:"gemma2-9b-it",n:"Gemma 2 9B",t:"Google"},{id:"llama-3.1-8b-instant",n:"Llama 3.1 8B",t:"Meta"}];

  useEffect(()=>{
    const s=DB.g(SESS);
    if(s){const u=DB.g(uK(s));if(u){loadU(s,u);return;}}
    setPage("login");
  },[]);
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  function loadU(id,u){
    setUid(id);setUser(u);setChats(DB.g(cK(id),{}));setProjs(DB.g(pK(id),{}));
    const sk=DB.g(sK(id),{});
    if(sk.apiKey)setApiKey(sk.apiKey);
    if(sk.model)setModel(sk.model);
    if(sk.dark!==undefined)setDark(sk.dark);
    setPage("main");
  }
  function pU(id,patch){const u={...DB.g(uK(id))||{},...patch};DB.s(uK(id),u);setUser(u);}
  function sSett(patch){DB.s(sK(uid),{...DB.g(sK(uid),{}),...patch});}

  // AUTH
  function doLogin(){
    setAErr("");if(!form.email||!form.pw){setAErr("Please fill all fields.");return;}
    const id=mkId(form.email);const u=DB.g(uK(id));
    if(!u){setAErr("No account found. Please register.");return;}
    if(u.pw!==btoa(form.pw)){setAErr("Incorrect password.");return;}
    DB.s(SESS,id);loadU(id,u);
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
    // ADMIN = false always on registration. Only earned via exam score >= 40
    const u={name:form.name.trim(),email:form.email.toLowerCase().trim(),mob:form.mob.trim(),pw:btoa(form.pw),isAdmin:false,isPro:false,joined:new Date().toISOString(),examScore:null,certDate:null,certGranted:false};
    DB.s(uK(id),u);if(!idx.includes(id))DB.s(UIDX,[...idx,id]);DB.s(SESS,id);loadU(id,u);
  }
  function doLogout(){
    DB.d(SESS);setUid(null);setUser(null);setChats({});setProjs({});setMsgs([]);setAc(null);
    setApiKey("");setCertUrl("");setForm({email:"",pw:"",name:"",mob:""});setReg(1);setExScreen(null);
    setPage("login");
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
    const u=new SpeechSynthesisUtterance(text.slice(0,500));u.rate=0.95;u.pitch=1;
    u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const stopSpk=()=>{window.speechSynthesis?.cancel();setSpeaking(false);};

  // CHAT — inputRef stays focused, msgsR tracks latest messages
  async function doSend(override){
    const text=(override||inp).trim();if(!text||!ac)return;
    const key=DB.g(sK(uid),{}).apiKey||apiKey;
    if(!key||!key.startsWith("gsk_")){
      const e={role:"ai",text:"⚠️ No Groq API key set. Go to ⚙️ Settings → API Key to add your key.",ts:new Date().toLocaleTimeString()};
      setMsgs(p=>[...p,e]);return;
    }
    const um={role:"user",text,ts:new Date().toLocaleTimeString()};
    const cur=msgsR.current;const next=[...cur,um];
    msgsR.current=next;setMsgs(next);setInp("");setTyping(true);
    // KEY FIX — re-focus input immediately, no re-click needed
    requestAnimationFrame(()=>inputRef.current?.focus());
    let ai="";
    try{
      const hist=next.slice(-12).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
        body:JSON.stringify({model,messages:hist,max_tokens:1024})
      });
      if(!r.ok){const e=await r.json();throw new Error(e.error?.message||"Error "+r.status);}
      const d=await r.json();ai=d.choices?.[0]?.message?.content||"No response received.";
    }catch(e){ai="⚠️ "+e.message;}
    const am={role:"ai",text:ai,ts:new Date().toLocaleTimeString()};
    const final=[...next,am];msgsR.current=final;
    setMsgs(final);setTyping(false);
    const ch={...chats,[ac]:final};setChats(ch);DB.s(cK(uid),ch);
    if(voiceOn)spk(ai);
    // Re-focus after AI response too
    requestAnimationFrame(()=>inputRef.current?.focus());
  }

  function newChat(){
    const id="c"+Date.now();
    const wm={role:"ai",text:"Hello "+user?.name+"! 👋 I'm GoPlanet AI. How can I help you today?",ts:new Date().toLocaleTimeString()};
    const ch={...chats,[id]:[wm]};setChats(ch);DB.s(cK(uid),ch);
    setAc(id);setMsgs([wm]);msgsR.current=[wm];setTab("chat");setSb(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  }
  function openChat(id){const m=chats[id]||[];setAc(id);setMsgs(m);msgsR.current=m;setTab("chat");setSb(false);setTimeout(()=>inputRef.current?.focus(),100);}

  // PROJECTS
  function createProj(){if(!newP.trim())return;const id="p"+Date.now();const p={...projs,[id]:{name:newP.trim(),created:new Date().toISOString()}};setProjs(p);DB.s(pK(uid),p);setNewP("");setShowPF(false);}

  // ADMIN
  const loadAdmins=useCallback(()=>{const idx=DB.g(UIDX,[]);setAdmins(idx.map(id=>{const u=DB.g(uK(id));return u?{id,...u}:null;}).filter(Boolean));},[]);
  function grantPro(id){const u=DB.g(uK(id));if(!u)return;const n={...u,isPro:true};DB.s(uK(id),n);if(id===uid)setUser(n);loadAdmins();}
  function grantAdmin(id){const u=DB.g(uK(id));if(!u)return;const n={...u,isAdmin:true};DB.s(uK(id),n);if(id===uid)setUser(n);loadAdmins();}

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
      setCertLoad(true);
      const url=await makeCert(exName.trim(),s,today,L);
      setCertUrl(url);setCertLoad(false);
      // Grant cert + admin when 40+
      pU(mkId(user.email),{examScore:s,certDate:today,certGranted:true,certName:exName.trim(),isAdmin:true});
    }else{
      pU(mkId(user.email),{examScore:s});
    }
    setExScreen("result");
  }

  // STYLES
  const S={
    wrap:{display:"flex",flexDirection:"column",height:"100dvh",width:"100%",maxWidth:"520px",margin:"0 auto",background:BG,color:TX,fontFamily:"system-ui,sans-serif",position:"relative",overflow:"hidden"},
    top:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",height:"54px",background:SU,borderBottom:"1px solid "+BO,flexShrink:0,zIndex:5},
    body:{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",minHeight:0},
    nav:{display:"flex",background:SU,borderTop:"1px solid "+BO,flexShrink:0,padding:"2px 0 4px"},
    nb:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"5px 2px",border:"none",background:"none",cursor:"pointer",color:a?AC:MU,fontSize:"9px",fontWeight:a?700:400}),
    card:{background:SU,borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1px solid "+BO},
    inp:{width:"100%",padding:"11px 13px",border:"1.5px solid "+BO,borderRadius:"10px",background:SU,color:TX,fontSize:"14px",outline:"none",boxSizing:"border-box"},
    btn:(bg=AC,fg="#fff",ex={})=>({background:bg,color:fg,border:"none",borderRadius:"10px",padding:"12px",fontSize:"14px",fontWeight:700,cursor:"pointer",width:"100%",...ex}),
    lbl:{fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:"5px",display:"block"},
    err:{color:"#e74c3c",fontSize:"12px",padding:"8px 12px",background:"#fff0f0",borderRadius:"8px",border:"1px solid #ffd0d0",marginTop:"4px"},
    lr:{display:"flex",alignItems:"center",gap:"8px",fontWeight:900,fontSize:"18px",color:AC},
  };

  // BOOT
  if(page==="boot")return(<div style={{...S.wrap,alignItems:"center",justifyContent:"center"}}><img src={L} alt="GoPlanet" style={{width:"100px",height:"100px",objectFit:"contain",marginBottom:"16px"}}/><p style={{color:AC,fontWeight:900,fontSize:"26px",margin:0}}>GoPlanet</p><p style={{color:MU,fontSize:"13px",marginTop:"8px"}}>Loading…</p></div>);

  // AUTH
  if(page==="login"||page==="register")return(
    <div style={{...S.wrap,overflowY:"auto",alignItems:"center",justifyContent:"center",padding:"28px 22px"}}>
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <img src={L} alt="GoPlanet" style={{width:"90px",height:"90px",objectFit:"contain",marginBottom:"12px"}}/>
        <h1 style={{margin:"0 0 4px",fontSize:"28px",fontWeight:900,color:AC}}>GoPlanet</h1>
        <p style={{margin:0,color:MU,fontSize:"13px"}}>Intelligent AI · Powered by Groq</p>
      </div>
      <div style={{display:"flex",background:"#f0ecff",borderRadius:"12px",padding:"4px",marginBottom:"22px",width:"100%"}}>
        {["Log In","Register"].map((t,i)=>(<button key={t} onClick={()=>{setPage(i===0?"login":"register");setAErr("");setReg(1);}} style={{flex:1,padding:"10px",border:"none",borderRadius:"9px",background:(page==="login")===(i===0)?AC:"transparent",color:(page==="login")===(i===0)?"#fff":MU,fontWeight:700,cursor:"pointer",fontSize:"14px"}}>{t}</button>))}
      </div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
        {page==="register"&&<p style={{color:MU,fontSize:"12px",textAlign:"center",margin:"0 0 4px"}}>Step {regStep} of 2 — {regStep===1?"Account Details":"Personal Info"}</p>}
        {(page==="login"||regStep===1)&&<>
          <div><span style={S.lbl}>Email</span><input style={S.inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?doLogin():doR1())}/></div>
          <div><span style={S.lbl}>Password</span><input style={S.inp} type="password" placeholder={page==="register"?"Min 6 characters":"Your password"} value={form.pw} onChange={e=>setForm(p=>({...p,pw:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?doLogin():doR1())}/></div>
        </>}
        {page==="register"&&regStep===2&&<>
          <div><span style={S.lbl}>Full Name</span><input style={S.inp} placeholder="e.g. Alice Johnson" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&document.getElementById("mi")?.focus()}/></div>
          <div><span style={S.lbl}>Mobile Number</span><input id="mi" style={S.inp} type="tel" placeholder="+91 98765 43210" value={form.mob} onChange={e=>setForm(p=>({...p,mob:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doR2()}/></div>
        </>}
        {authErr&&<div style={S.err}>{authErr}</div>}
        {page==="login"&&<button style={S.btn()} onClick={doLogin}>Log In →</button>}
        {page==="register"&&regStep===1&&<button style={S.btn()} onClick={doR1}>Next →</button>}
        {page==="register"&&regStep===2&&<><button style={S.btn()} onClick={doR2}>Create Account ✓</button><button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px"}} onClick={()=>setReg(1)}>← Back</button></>}
      </div>
    </div>
  );

  // GUIDE — paged, PDF-style with steps, tip box, note box, progress bar, chapter dots
  if(exScreen==="guide"){
    const g=GUIDE[gIdx];
    return(
      <div style={S.wrap}>
        <div style={S.top}>
          <button onClick={()=>{setExScreen(null);setGIdx(0);}} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button>
          <span style={{fontWeight:800,color:AC,fontSize:"15px"}}>📖 User Guide</span>
          <span style={{fontSize:"12px",color:MU,background:"#f0ecff",padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{gIdx+1}/{GUIDE.length}</span>
        </div>
        <div style={{height:"4px",background:BO,flexShrink:0}}><div style={{height:"100%",width:((gIdx+1)/GUIDE.length*100)+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",transition:"width 0.3s"}}/></div>
        <div style={{...S.body}}>
          <div style={{background:"linear-gradient(135deg,"+g.color+"28,"+g.color+"06)",padding:"22px 20px 16px",borderBottom:"1px solid "+BO}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"58px",height:"58px",borderRadius:"16px",background:g.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"30px",flexShrink:0,boxShadow:"0 4px 16px "+g.color+"44"}}>{g.icon}</div>
              <div><p style={{margin:0,fontSize:"11px",color:g.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.2px"}}>Chapter {gIdx+1} of {GUIDE.length}</p><h2 style={{margin:"3px 0 0",fontSize:"20px",color:TX,fontWeight:800}}>{g.title}</h2></div>
            </div>
          </div>
          <div style={{padding:"16px 18px 100px"}}>
            <p style={{margin:"0 0 8px",fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"1px"}}>Step by Step</p>
            <div style={{background:SU,borderRadius:"14px",border:"1px solid "+BO,overflow:"hidden",marginBottom:"14px"}}>
              {g.steps.map((st,i)=>(
                <div key={i} style={{display:"flex",gap:"14px",padding:"13px 15px",borderBottom:i<g.steps.length-1?"1px solid "+BO:"none",background:i%2===0?(dark?"rgba(255,255,255,0.02)":"#fafaff"):"transparent"}}>
                  <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,"+g.color+","+g.color+"aa)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"13px",flexShrink:0,marginTop:"2px"}}>{i+1}</div>
                  <div><p style={{margin:"0 0 3px",fontWeight:700,fontSize:"13px",color:TX}}>{st.h}</p><p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>{st.b}</p></div>
                </div>
              ))}
            </div>
            <div style={{background:g.color+"18",border:"1.5px solid "+g.color+"55",borderRadius:"12px",padding:"13px 15px",marginBottom:"12px"}}>
              <p style={{margin:"0 0 5px",fontSize:"12px",fontWeight:800,color:g.color,textTransform:"uppercase",letterSpacing:"0.5px"}}>💡 Pro Tip</p>
              <p style={{margin:0,fontSize:"13px",color:TX,lineHeight:1.65}}>{g.tip}</p>
            </div>
            <div style={{background:dark?"#1a1a30":"#f0f0ff",border:"1px solid "+BO,borderRadius:"10px",padding:"11px 14px",marginBottom:"20px"}}>
              <p style={{margin:"0 0 3px",fontSize:"11px",fontWeight:700,color:MU,textTransform:"uppercase",letterSpacing:"0.5px"}}>📌 Important Note</p>
              <p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>{g.note}</p>
            </div>
            <div style={{display:"flex",gap:"10px",marginBottom:"16px"}}>
              <button disabled={gIdx===0} onClick={()=>setGIdx(p=>p-1)} style={{...S.btn(gIdx===0?"#ddd":SU,gIdx===0?MU:AC,{flex:1,padding:"11px",fontSize:"13px",border:"1.5px solid "+(gIdx===0?BO:AC),opacity:gIdx===0?0.5:1})}}>← Prev</button>
              {gIdx<GUIDE.length-1?<button style={S.btn(AC,"#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>setGIdx(p=>p+1)}>Next →</button>:<button style={S.btn("#00b894","#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>{setGIdx(0);setExScreen(null);}}>✓ Done!</button>}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"5px",flexWrap:"wrap"}}>
              {GUIDE.map((_,i)=>(<button key={i} title={GUIDE[i].title} onClick={()=>setGIdx(i)} style={{width:i===gIdx?24:8,height:"8px",borderRadius:"4px",border:"none",background:i===gIdx?AC:i<gIdx?AC2:BO,cursor:"pointer",transition:"all 0.25s",padding:0}}/>))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXAM ENTRY
  if(exScreen==="entry")return(
    <div style={S.wrap}>
      <div style={S.top}><button onClick={()=>setExScreen(null)} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>📝 Certification Exam</span><div style={{width:"40px"}}/></div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"24px 16px 20px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"16px",marginBottom:"18px",color:"#fff"}}>
          <div style={{fontSize:"52px",marginBottom:"10px"}}>📜</div>
          <h2 style={{margin:"0 0 6px",fontSize:"20px"}}>GoPlanet Certification</h2>
          <p style={{margin:0,fontSize:"13px",opacity:0.9}}>50 Questions · Score 40+ to earn certificate + Admin access</p>
        </div>
        <div style={{...S.card,marginBottom:"14px"}}>
          {["Your exact name will appear on the certificate.","Score 40 or above out of 50 to earn a downloadable certificate.","Today's exact date is auto-printed on the certificate.","Scoring 40+ also grants you Admin access.","You can retake the exam anytime from Settings."].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px"}}>
              <span style={{color:"#00b894",fontWeight:700,flexShrink:0}}>✓</span><span style={{fontSize:"13px",color:MU,lineHeight:1.5}}>{t}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <p style={{margin:"0 0 12px",fontWeight:700,color:AC,fontSize:"14px"}}>👤 Your Details</p>
          <div style={{marginBottom:"10px"}}><span style={S.lbl}>Full Name (appears on certificate) *</span>
            <input style={S.inp} placeholder="e.g. Alice Johnson" value={exName} onChange={e=>setExName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&document.getElementById("exE")?.focus()}/>
          </div>
          <div style={{marginBottom:"12px"}}><span style={S.lbl}>Email Address *</span>
            <input id="exE" style={S.inp} type="email" placeholder="alice@example.com" value={exEmail} onChange={e=>setExEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startExam()}/>
          </div>
          {exErr&&<div style={S.err}>{exErr}</div>}
          <button style={S.btn()} onClick={startExam}>Start Exam →</button>
        </div>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // EXAM
  if(exScreen==="exam"){
    const done=Object.keys(exAns).length,pct=Math.round(done/QUIZ.length*100);
    return(
      <div style={S.wrap}>
        <div style={{background:SU,borderBottom:"1px solid "+BO,flexShrink:0,padding:"10px 14px",zIndex:5}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
            <button onClick={()=>setExScreen("entry")} style={{background:"none",border:"none",color:"#e74c3c",fontWeight:700,fontSize:"13px",cursor:"pointer"}}>✕ Exit</button>
            <span style={{fontWeight:700,fontSize:"14px"}}>Certification Exam</span>
            <span style={{fontSize:"12px",color:AC,background:"#f0ecff",padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{done}/{QUIZ.length}</span>
          </div>
          <div style={{height:"5px",background:BO,borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",borderRadius:"3px",transition:"width 0.3s"}}/></div>
        </div>
        <div style={{...S.body,padding:"12px 14px"}}>
          {QUIZ.map((q,i)=>(
            <div key={i} style={{...S.card,border:exAns[i]!==undefined?"1.5px solid "+AC2:"1px solid "+BO}}>
              <p style={{fontWeight:700,fontSize:"13px",margin:"0 0 10px",lineHeight:1.6}}><span style={{color:AC,fontWeight:900}}>Q{i+1}. </span>{q.q}</p>
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {q.o.map((opt,j)=>(
                  <button key={j} onClick={()=>setExAns(p=>({...p,[i]:j}))} style={{textAlign:"left",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid "+(exAns[i]===j?AC:BO),background:exAns[i]===j?"#f0ecff":"transparent",cursor:"pointer",fontSize:"13px",color:exAns[i]===j?AC:TX,fontWeight:exAns[i]===j?700:400}}>
                    <span style={{fontWeight:800,marginRight:"6px",color:exAns[i]===j?AC:MU}}>{["A","B","C","D"][j]}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{position:"sticky",bottom:"12px"}}>
            <button disabled={done<QUIZ.length||certLoad} onClick={submitExam} style={{...S.btn(done<QUIZ.length?"#ccc":AC),boxShadow:done>=QUIZ.length?"0 4px 18px rgba(108,92,231,0.4)":"none"}}>
              {certLoad?"Generating certificate…":done<QUIZ.length?`Answer all questions (${done}/${QUIZ.length} done)`:"Submit Exam ✓"}
            </button>
          </div>
          <div style={{height:"24px"}}/>
        </div>
      </div>
    );
  }

  // RESULT
  if(exScreen==="result"){
    const passed=exScore>=40;
    return(
      <div style={S.wrap}>
        <div style={S.top}><div style={{width:"40px"}}/><span style={{fontWeight:800,color:AC}}>Exam Result</span><div style={{width:"40px"}}/></div>
        <div style={{...S.body,padding:"16px"}}>
          <div style={{textAlign:"center",padding:"28px 16px",borderRadius:"16px",marginBottom:"16px",color:"#fff",background:passed?"linear-gradient(135deg,"+AC+","+AC2+")":"linear-gradient(135deg,#e17055,#d63031)"}}>
            <div style={{fontSize:"56px",marginBottom:"10px"}}>{passed?"🏆":"📚"}</div>
            <h2 style={{margin:"0 0 6px"}}>{passed?"Congratulations!":"Almost There!"}</h2>
            <p style={{margin:"0 0 14px",opacity:0.9,fontSize:"14px"}}>{exName}</p>
            <div style={{display:"inline-block",background:"rgba(255,255,255,0.2)",borderRadius:"14px",padding:"10px 28px"}}><span style={{fontSize:"38px",fontWeight:900}}>{exScore}</span><span style={{fontSize:"16px",opacity:0.8}}> / 50</span></div>
            <p style={{margin:"10px 0 0",fontSize:"13px",opacity:0.85}}>{passed?"You are now a GoPlanet Certified User + Admin!":"Need "+(40-exScore)+" more correct answer"+(40-exScore===1?"":"s")+" to pass."}</p>
          </div>
          <div style={{...S.card,marginBottom:"14px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",textAlign:"center"}}>
              {[["✅",exScore,"Correct","#00b894"],["❌",50-exScore,"Wrong","#e74c3c"],["📊",Math.round(exScore/50*100)+"%","Score",AC]].map(([ic,v,l,col])=>(
                <div key={l}><p style={{fontSize:"22px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MU,margin:"3px 0 0"}}>{ic} {l}</p></div>
              ))}
            </div>
          </div>
          {passed&&<>
            <div style={{...S.card,border:"2px solid "+AC,background:"#f9f7ff",marginBottom:"12px"}}>
              <p style={{margin:"0 0 4px",fontWeight:700,color:AC,fontSize:"14px"}}>🎉 Your certificate is ready!</p>
              <p style={{margin:0,fontSize:"13px",color:MU,lineHeight:1.6}}>Name: <strong>{exName}</strong> · Date: <strong>{certDate}</strong></p>
            </div>
            <button style={{...S.btn(),marginBottom:"10px"}} onClick={()=>setExScreen("cert")}>View Certificate 🏆</button>
            <a href={certUrl} download={"GoPlanet_Cert_"+exName.replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn("#00b894"),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"12px",marginBottom:"10px"}}>📥 Download Certificate</a>
          </>}
          {!passed&&<div style={{...S.card,background:"#fff8f0",border:"1px solid #ffd0b0",marginBottom:"12px"}}>
            <p style={{margin:"0 0 4px",fontWeight:700,color:"#e17055",fontSize:"14px"}}>💡 You can do it!</p>
            <p style={{margin:0,fontSize:"13px",color:MU}}>Read the guide carefully and retry. Only {40-exScore} more correct answers needed!</p>
          </div>}
          <button style={S.btn(AC2)} onClick={()=>{setExAns({});setExScreen("exam");}}>🔄 Retake Exam</button>
          <button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",display:"block",margin:"14px auto 0",fontWeight:600}} onClick={()=>setExScreen(null)}>← Back to Settings</button>
          <div style={{height:"20px"}}/>
        </div>
      </div>
    );
  }

  // CERT VIEW
  if(exScreen==="cert")return(
    <div style={S.wrap}>
      <div style={S.top}><button onClick={()=>setExScreen("result")} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>🏆 My Certificate</span><div style={{width:"40px"}}/></div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"18px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"14px",marginBottom:"14px",color:"#fff"}}>
          <div style={{fontSize:"34px",marginBottom:"6px"}}>🏆</div>
          <h3 style={{margin:"0 0 3px"}}>GoPlanet Certified User</h3>
          <p style={{margin:"0 0 2px",fontWeight:700,fontSize:"15px"}}>{user?.certName||exName}</p>
          <p style={{margin:0,fontSize:"12px",opacity:0.85}}>{user?.examScore||exScore}/50 · {user?.certDate||certDate}</p>
        </div>
        <img src={certUrl} alt="Certificate" style={{width:"100%",borderRadius:"12px",border:"2px solid "+AC,display:"block",marginBottom:"12px"}}/>
        <a href={certUrl} download={"GoPlanet_Cert_"+(user?.certName||exName).replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn(),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"13px",marginBottom:"10px"}}>📥 Download Certificate</a>
        <button style={S.btn(AC2)} onClick={()=>{setExAns({});setExName(user?.name||"");setExEmail(user?.email||"");setExScreen("entry");}}>🔄 Retake Exam</button>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // MAIN APP
  const chatList=Object.keys(chats).map(id=>({id,preview:(chats[id]?.find(m=>m.role==="user")?.text||"New Chat").slice(0,34)})).reverse();
  const projList=Object.keys(projs).map(id=>({id,...projs[id]}));
  const TABS=[{id:"chat",icon:"💬",label:"Chat"},{id:"projects",icon:"📁",label:"Projects"},{id:"image",icon:"🎨",label:"Images"},{id:"plans",icon:"⭐",label:"Plans"},{id:"settings",icon:"⚙️",label:"Settings"},...(user?.isAdmin?[{id:"admin",icon:"🛡️",label:"Admin"}]:[])];

  const Sidebar=()=>(<>
    {sb&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99}} onClick={()=>setSb(false)}/>}
    <div style={{position:"absolute",top:0,left:sb?0:"-100%",width:"82%",maxWidth:"320px",height:"100%",background:SU,zIndex:100,transition:"left 0.25s ease",boxShadow:sb?"6px 0 28px rgba(0,0,0,0.2)":"none",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 14px 12px",borderBottom:"1px solid "+BO}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div style={S.lr}><img src={L} alt="" style={{width:"30px",height:"30px",objectFit:"contain"}}/>GoPlanet</div>
          <button onClick={()=>setSb(false)} style={{background:"none",border:"none",color:MU,fontSize:"22px",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",padding:"10px 12px",background:dark?"#12122a":"#f5f3ff",borderRadius:"10px"}}>
          <div style={{width:"38px",height:"38px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"16px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{minWidth:0}}>
            <p style={{margin:0,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</p>
            <p style={{margin:0,fontSize:"11px",color:MU}}>{user?.isPro?"⭐ Pro":"Free"}{user?.isAdmin?" · 🛡️ Admin":""}</p>
          </div>
        </div>
      </div>
      <div style={{flex:1,padding:"12px",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        <button style={{...S.btn(),marginBottom:"14px"}} onClick={newChat}>+ New Chat</button>
        <p style={S.lbl}>Recent Chats</p>
        {chatList.length===0&&<p style={{fontSize:"12px",color:MU}}>No chats yet.</p>}
        {chatList.slice(0,10).map(c=>(<button key={c.id} onClick={()=>openChat(c.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",marginBottom:"4px",borderRadius:"8px",border:"none",background:ac===c.id?"#f0ecff":"transparent",cursor:"pointer",fontSize:"12px",color:ac===c.id?AC:TX}}>💬 {c.preview}…</button>))}
        <p style={{...S.lbl,marginTop:"14px"}}>Projects</p>
        {projList.map(p=><div key={p.id} style={{padding:"7px 10px",fontSize:"12px",color:MU}}>📁 {p.name}</div>)}
        <button onClick={()=>{setTab("projects");setSb(false);}} style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"12px",padding:"4px 10px"}}>+ New Project</button>
      </div>
      {!user?.isPro&&<div style={{margin:"12px",padding:"14px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"12px",color:"#fff"}}>
        <p style={{margin:"0 0 3px",fontWeight:800}}>⭐ Upgrade to Pro</p>
        <p style={{margin:"0 0 10px",fontSize:"12px",opacity:0.9}}>$25/year — Unlock all features</p>
        <button onClick={()=>{setSubM(true);setSb(false);setTab("plans");}} style={{background:"#fff",color:AC,border:"none",borderRadius:"8px",padding:"7px 16px",fontSize:"12px",fontWeight:800,cursor:"pointer"}}>Subscribe</button>
      </div>}
      <button onClick={doLogout} style={{margin:"0 12px 14px",background:"none",border:"1px solid #e74c3c",color:"#e74c3c",borderRadius:"8px",padding:"9px",cursor:"pointer",fontSize:"13px",fontWeight:600}}>🚪 Log Out</button>
    </div>
  </>);

  const ChatTab=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"6px 14px",background:dark?"#12122a":"#f8f7ff",borderBottom:"1px solid "+BO,flexShrink:0}}>
        <p style={{margin:0,fontSize:"11px",textAlign:"center",color:MU}}>
          Powered by Groq · <span style={{color:AC,fontWeight:700}}>{MODS.find(m=>m.id===model)?.n||model}</span>
          {voiceOn&&<span style={{color:"#00cec9",fontWeight:700,marginLeft:"8px"}}>🎤 Voice On</span>}
        </p>
      </div>
      {!ac?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
          <img src={L} alt="" style={{width:"90px",height:"90px",objectFit:"contain",marginBottom:"16px"}}/>
          <h2 style={{color:AC,marginBottom:"6px",fontSize:"22px"}}>GoPlanet AI</h2>
          <p style={{color:MU,fontSize:"13px",marginBottom:"24px",lineHeight:1.6}}>Your intelligent assistant powered by Groq.</p>
          <button style={S.btn()} onClick={newChat}>+ Start New Chat</button>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"18px",justifyContent:"center"}}>
            {MODS.map(m=>(<button key={m.id} onClick={()=>{setModel(m.id);sSett({model:m.id});}} style={{padding:"6px 13px",borderRadius:"20px",border:"1.5px solid "+(model===m.id?AC:BO),background:model===m.id?"#f0ecff":"transparent",color:model===m.id?AC:MU,fontSize:"11px",cursor:"pointer",fontWeight:model===m.id?700:400}}>{m.n}</button>))}
          </div>
        </div>
      ):(
        <>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 14px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:"10px",gap:"8px",alignItems:"flex-end"}}>
                {m.role==="ai"&&<img src={L} alt="" style={{width:"28px",height:"28px",objectFit:"contain",flexShrink:0,borderRadius:"50%",background:"#000"}}/>}
                <div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",background:m.role==="user"?AC:dark?"#1e1e3a":"#f0ecff",color:m.role==="user"?"#fff":TX,fontSize:"13px",lineHeight:1.6,wordBreak:"break-word"}}>
                  <pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{m.text}</pre>
                </div>
                {m.role==="user"&&<div style={{width:"28px",height:"28px",borderRadius:"50%",background:AC2,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"12px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>}
              </div>
            ))}
            {typing&&<div style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"flex-end"}}><img src={L} alt="" style={{width:"28px",height:"28px",objectFit:"contain",borderRadius:"50%",background:"#000"}}/><div style={{padding:"10px 16px",borderRadius:"4px 16px 16px 16px",background:dark?"#1e1e3a":"#f0ecff"}}><span style={{fontSize:"18px",letterSpacing:"4px",color:AC}}>•••</span></div></div>}
            <div ref={botRef}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:"1px solid "+BO,display:"flex",gap:"8px",flexShrink:0,alignItems:"center",background:SU}}>
            <button onClick={()=>{if(speaking){stopSpk();return;}if(listening){stopListen();return;}startListen();}}
              style={{width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,border:"none",cursor:"pointer",background:listening?"#e74c3c":speaking?"#00cec9":voiceOn?"#00b894":"#e8e8f0",color:voiceOn||listening||speaking?"#fff":"#666",fontSize:"16px",transition:"background 0.2s"}}>
              {listening?"⏹":speaking?"🔊":"🎤"}
            </button>
            <input
              ref={inputRef}
              style={{...S.inp,flex:1,minWidth:0}}
              placeholder={listening?"Listening…":"Type your message…"}
              value={inp}
              onChange={e=>setInp(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend();}}}
            />
            <button onClick={()=>doSend()} disabled={!inp.trim()||typing}
              style={{width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,border:"none",background:inp.trim()&&!typing?AC:"#ccc",color:"#fff",fontSize:"18px",cursor:inp.trim()&&!typing?"pointer":"default"}}>➤</button>
          </div>
        </>
      )}
    </div>
  );

  const ProjectsTab=()=>(<div style={{padding:"16px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}><h2 style={{margin:0,color:AC,fontSize:"18px"}}>📁 Projects</h2><button onClick={()=>setShowPF(true)} style={{background:AC,color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>+ New</button></div>
    {showPF&&<div style={{...S.card,background:"#f0ecff",marginBottom:"14px"}}>
      <input style={{...S.inp,marginBottom:"8px"}} placeholder="Project name…" value={newP} onChange={e=>setNewP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProj()} autoFocus/>
      <div style={{display:"flex",gap:"8px"}}><button style={S.btn()} onClick={createProj}>Create</button><button style={{...S.btn("#e0e0e0","#444"),flex:"none",padding:"12px 20px"}} onClick={()=>{setShowPF(false);setNewP("");}}>Cancel</button></div>
    </div>}
    {projList.length===0?<div style={{textAlign:"center",marginTop:"50px",color:MU}}><div style={{fontSize:"44px",marginBottom:"10px"}}>📁</div><p>No projects yet.</p></div>:projList.map(p=>(<div key={p.id} style={S.card}><p style={{margin:0,fontWeight:700,fontSize:"14px"}}>📁 {p.name}</p><p style={{margin:"4px 0 0",fontSize:"11px",color:MU}}>Created {new Date(p.created).toLocaleDateString()}</p></div>))}
  </div>);

  const ImageTab=()=>(<div style={{padding:"16px"}}>
    <h2 style={{color:AC,marginTop:0}}>🎨 Image Generator</h2>
    <p style={{color:MU,fontSize:"13px",marginBottom:"14px"}}>Describe the image you want to generate.</p>
    <textarea style={{...S.inp,height:"80px",resize:"none",marginBottom:"12px"}} placeholder="e.g. A futuristic city floating in clouds at sunset…" value={imgP} onChange={e=>setImgP(e.target.value)}/>
    <button style={S.btn()} onClick={()=>{if(imgP.trim()){setGenLoad(true);setTimeout(()=>{setGenImg("https://picsum.photos/seed/"+encodeURIComponent(imgP)+"/800/600");setGenLoad(false);},1200);}}}>{genLoad?"Generating…":"Generate Image"}</button>
    {genImg&&<img src={genImg} alt="Generated" style={{width:"100%",borderRadius:"12px",marginTop:"14px",border:"1px solid "+BO}}/>}
  </div>);

  const PlansTab=()=>(<div style={{padding:"16px"}}>
    <h2 style={{color:AC,marginTop:0}}>⭐ Subscription Plans</h2>
    {user?.isPro?(<div style={{...S.card,background:"linear-gradient(135deg,"+AC+","+AC2+")",color:"#fff",border:"none"}}><h3 style={{margin:"0 0 8px"}}>⭐ Pro Plan Active</h3>{["Faster AI responses","Advanced AI models","Priority support","Early access"].map(f=><p key={f} style={{margin:"5px 0 0",fontSize:"13px"}}>✓ {f}</p>)}</div>):(<>
      <div style={{...S.card,border:"2px solid "+AC}}>
        <span style={{background:AC,color:"#fff",borderRadius:"6px",padding:"2px 10px",fontSize:"11px",fontWeight:700}}>BEST VALUE</span>
        <h3 style={{color:AC,margin:"10px 0 4px"}}>Pro Plan</h3>
        <p style={{fontSize:"28px",fontWeight:900,color:AC,margin:"0 0 12px"}}>$25<span style={{fontSize:"14px",color:MU}}>/year</span></p>
        {["Faster AI responses","Advanced AI models","Priority support","Early access"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px",color:MU}}>✓ {f}</p>)}
        <button style={{...S.btn(),marginTop:"14px"}} onClick={()=>setSubM(true)}>Subscribe Now</button>
      </div>
      <div style={S.card}><h3 style={{margin:"0 0 4px"}}>Free Plan</h3><p style={{fontSize:"22px",fontWeight:900,color:MU,margin:"0 0 10px"}}>$0</p>{["Basic AI responses","Standard models","Community support"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px",color:MU}}>• {f}</p>)}</div>
    </>)}
    {subM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{background:SU,borderRadius:"18px",padding:"24px",width:"100%",maxWidth:"360px",border:"1px solid "+BO}}>
        <h3 style={{color:AC,margin:"0 0 6px"}}>Complete Subscription</h3>
        <p style={{fontSize:"13px",color:MU,marginBottom:"16px"}}>Pro Plan — $25/year</p>
        <input style={{...S.inp,marginBottom:"8px"}} placeholder="Card number"/>
        <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}><input style={{...S.inp,flex:1}} placeholder="MM/YY"/><input style={{...S.inp,flex:1}} placeholder="CVV"/></div>
        <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{pU(uid,{isPro:true});setSubM(false);alert("🎉 Pro activated!");}}>Pay $25/year</button>
        <button style={{background:"none",border:"none",color:MU,cursor:"pointer",fontSize:"13px",width:"100%"}} onClick={()=>setSubM(false)}>Cancel</button>
      </div>
    </div>}
  </div>);

  const SettingsTab=()=>(<div style={{padding:"16px"}}>
    <h2 style={{color:AC,marginTop:0}}>⚙️ Settings</h2>
    <div style={S.card}>
      <span style={S.lbl}>🔑 Groq API Key</span>
      <p style={{fontSize:"12px",color:MU,margin:"0 0 8px",lineHeight:1.5}}>Get your free key at <strong>console.groq.com</strong>. Stored ONLY on this device — never visible to any other user.</p>
      <input style={{...S.inp,fontFamily:"monospace",fontSize:"12px",marginBottom:"8px"}} type="password" placeholder="gsk_…" value={apiKey} onChange={e=>setApiKey(e.target.value)}/>
      <button style={S.btn()} onClick={()=>{sSett({apiKey});alert("✅ API key saved!");}}>Save API Key</button>
    </div>
    <div style={S.card}>
      <span style={S.lbl}>🤖 AI Model</span>
      {MODS.map(m=>(<button key={m.id} onClick={()=>{setModel(m.id);sSett({model:m.id});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"9px 12px",marginBottom:"6px",borderRadius:"9px",border:"1.5px solid "+(model===m.id?AC:BO),background:model===m.id?"#f0ecff":"transparent",cursor:"pointer",textAlign:"left"}}><span style={{fontSize:"13px",color:model===m.id?AC:TX,fontWeight:model===m.id?700:400}}>{m.n}</span><span style={{fontSize:"11px",color:MU}}>{m.t}</span></button>))}
    </div>
    <div style={S.card}>
      <span style={S.lbl}>🎨 Appearance</span>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"13px"}}>Dark Mode</span>
        <button onClick={()=>setDark(d=>{sSett({dark:!d});return !d;})} style={{width:"48px",height:"26px",borderRadius:"13px",background:dark?AC:"#ddd",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
          <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:dark?"24px":"2px",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
        </button>
      </div>
    </div>
    <div style={S.card}>
      <span style={S.lbl}>🎤 Voice Mode</span>
      <p style={{fontSize:"12px",color:MU,margin:"0 0 10px",lineHeight:1.5}}>Speak to GoPlanet AI and hear responses aloud. Requires microphone permission.</p>
      <button style={S.btn(voiceOn?"#00b894":AC2)} onClick={()=>setVoiceOn(v=>!v)}>{voiceOn?"🎤 Voice Mode ON — Tap to Disable":"🎤 Enable Voice Mode"}</button>
    </div>
    <div style={S.card}>
      <span style={S.lbl}>📜 Certification (Optional)</span>
      <p style={{fontSize:"12px",color:MU,margin:"0 0 10px",lineHeight:1.5}}>Score 40/50 or above to earn a certificate and gain Admin access.</p>
      <button style={{...S.btn(AC2),marginBottom:"8px"}} onClick={()=>{setGIdx(0);setExScreen("guide");}}>📖 Read User Guide</button>
      <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{setExName(user?.name||"");setExEmail(user?.email||"");setExErr("");setExScreen("entry");}}>📝 Enter Exam</button>
      {user?.examScore!=null&&<button style={{...S.btn("#e17055"),marginBottom:"8px"}} onClick={()=>{setExName(user?.name||"");setExEmail(user?.email||"");setExAns({});setExErr("");setExScreen("entry");}}>🔄 Re-take Exam</button>}
      {user?.certGranted&&<button style={S.btn("#00b894")} onClick={async()=>{
        if(!certUrl){setCertLoad(true);const url=await makeCert(user.certName||user.name,user.examScore,user.certDate,L);setCertUrl(url);setCertDate(user.certDate);setExName(user.certName||user.name);setExScore(user.examScore);setCertLoad(false);}
        setExScreen("cert");
      }}>{certLoad?"Loading…":"🏆 View My Certificate"}</button>}
      {user?.examScore!=null&&<p style={{margin:"8px 0 0",fontSize:"12px",color:MU,textAlign:"center"}}>Last score: {user.examScore}/50 {user.examScore>=40?"✅ Passed":"— need 40+ to pass"}</p>}
    </div>
    <div style={S.card}>
      <span style={S.lbl}>👤 Account</span>
      {[["Name",user?.name],["Email",user?.email],["Mobile",user?.mob],["Plan",user?.isPro?"⭐ Pro":"Free"],["Role",user?.isAdmin?"🛡️ Admin":"User"],["Joined",user?.joined?new Date(user.joined).toLocaleDateString():"—"]].map(([k,v])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BO,fontSize:"13px"}}><span style={{color:MU}}>{k}</span><span style={{fontWeight:600}}>{v||"—"}</span></div>
      ))}
      <button style={{...S.btn("#e74c3c"),marginTop:"14px"}} onClick={doLogout}>🚪 Log Out</button>
    </div>
  </div>);

  const AdminTab=()=>{
    useEffect(()=>{if(user?.isAdmin)loadAdmins();},[]);
    if(!user?.isAdmin)return(<div style={{padding:"16px",textAlign:"center",marginTop:"60px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🔒</div><p style={{color:"#e74c3c",fontWeight:700}}>Admin access required.</p><p style={{color:MU,fontSize:"13px"}}>Score 40+ on the certification exam to become an Admin.</p></div>);
    return(<div style={{padding:"16px"}}>
      <h2 style={{color:AC,marginTop:0}}>🛡️ Admin Panel</h2>
      <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
        {["members","stats"].map(t=>(<button key={t} onClick={()=>{setATab(t);if(t==="members")loadAdmins();}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"1.5px solid "+(aTab===t?AC:BO),background:aTab===t?"#f0ecff":"transparent",color:aTab===t?AC:MU,cursor:"pointer",fontWeight:700,fontSize:"13px",textTransform:"capitalize"}}>{t}</button>))}
      </div>
      {aTab==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
        {[["Total",admins.length,"#6c5ce7"],["Pro",admins.filter(u=>u.isPro).length,"#f9ca24"],["Certified",admins.filter(u=>u.certGranted).length,"#00b894"],["Admins",admins.filter(u=>u.isAdmin).length,"#e84393"]].map(([l,v,col])=>(
          <div key={l} style={{...S.card,textAlign:"center",padding:"14px",borderTop:"3px solid "+col}}><p style={{fontSize:"30px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MU,margin:"4px 0 0"}}>{l}</p></div>
        ))}
      </div>}
      {aTab==="members"&&<>
        <p style={{fontSize:"12px",color:MU,marginBottom:"12px"}}>{admins.length} registered member(s)</p>
        {admins.map((u,i)=>(<div key={i} style={S.card}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"15px",flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}><p style={{margin:0,fontWeight:700,fontSize:"13px"}}>{u.name} {u.isAdmin&&<span style={{background:AC,color:"#fff",borderRadius:"4px",padding:"1px 7px",fontSize:"10px"}}>Admin</span>}</p><p style={{margin:0,fontSize:"11px",color:MU,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p></div>
          </div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
            {[u.isPro?"⭐ Pro":"Free",u.certGranted?"🏆 Certified":""].filter(Boolean).map((b,j)=>(<span key={j} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"10px",background:"#f0ecff",color:AC,fontWeight:600}}>{b}</span>))}
          </div>
          {u.examScore!=null&&<p style={{margin:"0 0 8px",fontSize:"11px",color:MU}}>Exam: {u.examScore}/50</p>}
          <div style={{display:"flex",gap:"6px"}}>
            {!u.isPro&&<button onClick={()=>grantPro(u.id)} style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:AC,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Pro</button>}
            {!u.isAdmin&&<button onClick={()=>grantAdmin(u.id)} style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:AC2,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Admin</button>}
          </div>
        </div>))}
      </>}
    </div>);
  };

  return(
    <div style={S.wrap}>
      <Sidebar/>
      <div style={S.top}>
        <button onClick={()=>setSb(p=>!p)} style={{background:"none",border:"none",fontSize:"22px",cursor:"pointer",color:TX,padding:"2px 6px"}}>☰</button>
        <div style={S.lr}><img src={L} alt="GoPlanet" style={{width:"30px",height:"30px",objectFit:"contain"}}/>GoPlanet</div>
        <div style={{width:"34px",height:"34px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"14px"}}>{user?.name?.[0]?.toUpperCase()}</div>
      </div>
      <div style={S.body}>
        {tab==="chat"&&<ChatTab/>}
        {tab==="projects"&&<ProjectsTab/>}
        {tab==="image"&&<ImageTab/>}
        {tab==="plans"&&<PlansTab/>}
        {tab==="settings"&&<SettingsTab/>}
        {tab==="admin"&&<AdminTab/>}
      </div>
      <div style={S.nav}>
        {TABS.map(t=>(<button key={t.id} style={S.nb(tab===t.id)} onClick={()=>setTab(t.id)}><span style={{fontSize:"20px"}}>{t.icon}</span><span>{t.label}</span></button>))}
      </div>
    </div>
  );
}

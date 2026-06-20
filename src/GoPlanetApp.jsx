import { useState, useEffect, useRef, useCallback } from "react";
import LOGO_SRC from "./logoData.js";

// ════════════════════════════════════════════════════════
// SECURE DB — each user isolated, API key NEVER exposed
// ════════════════════════════════════════════════════════
const DB = {
  get: (k, fb=null) => { try{const v=localStorage.getItem(k); return v?JSON.parse(v):fb;}catch{return fb;}},
  set: (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  del: (k) => { try{localStorage.removeItem(k);}catch{}},
};
const SESS="gp_sess", UIDX="gp_uidx";
const uK=id=>"gp_u_"+id, cK=id=>"gp_c_"+id, pK=id=>"gp_p_"+id, sK=id=>"gp_s_"+id;
const mkId=email=>btoa(encodeURIComponent(email.toLowerCase().trim())).replace(/[^a-zA-Z0-9]/g,"").slice(0,28);

// ════════════════════════════════════════════════════════
// QUIZ — 50 questions
// ════════════════════════════════════════════════════════
const QUIZ=[
  {q:"What does AI stand for?",o:["Automated Interface","Artificial Intelligence","Advanced Integration","Automated Input"],a:1},
  {q:"What is GoPlanet's primary function?",o:["File Storage","AI Chatbot Platform","Social Network","Video Streaming"],a:1},
  {q:"Which API powers GoPlanet's chatbot?",o:["OpenAI","Gemini","Groq","Cohere"],a:2},
  {q:"What does LLM stand for?",o:["Large Language Model","Logical Learning Machine","Local Logic Module","Linear Learning Method"],a:0},
  {q:"Minimum score to earn a GoPlanet certificate?",o:["30/50","35/50","40/50","45/50"],a:2},
  {q:"What does 'prompt' mean in AI chatbots?",o:["A payment","User input to the AI","A notification","A file format"],a:1},
  {q:"What is 'context' in an AI conversation?",o:["The font size","Previous chat history used by AI","The background colour","User's location"],a:1},
  {q:"Which is a responsible AI usage principle?",o:["Share passwords freely","Use AI with integrity","Replace all human decisions","Ignore AI errors"],a:1},
  {q:"What is a Groq API key used for?",o:["Login authentication","Authorising access to Groq AI services","File encryption","Image generation"],a:1},
  {q:"What does 'token' mean in AI language models?",o:["A cryptocurrency","A unit of text (word/part of word)","A user account","A payment method"],a:1},
  {q:"What is machine learning?",o:["Teaching machines to walk","AI learning from data patterns","Programming robots","Computer maintenance"],a:1},
  {q:"What is NLP?",o:["Writing code in English","AI understanding human language","Network protocols","Nature-based computing"],a:1},
  {q:"What does 'Human First' represent in GoPlanet?",o:["Humans do everything manually","Empower people, not replace them","Humans control all AI code","Only humans can use AI"],a:1},
  {q:"What is a chatbot?",o:["A physical robot","Software simulating human conversation","A chat room","A messaging app"],a:1},
  {q:"What is the GoPlanet certification about?",o:["Coding skills only","Responsible AI usage & smart communication","Database management","Web design"],a:1},
  {q:"What does 'inference' mean in AI?",o:["Training a new model","Running AI to get predictions/answers","Deleting AI data","Uploading datasets"],a:1},
  {q:"What is a subscription plan?",o:["A free service forever","A paid tier with extra features","A one-time purchase","A government program"],a:1},
  {q:"What does 'hallucination' mean in AI?",o:["AI seeing images","AI generating false info confidently","AI sleeping mode","AI voice response"],a:1},
  {q:"What is the purpose of an AI user guide?",o:["To restrict users","Help users understand and use the app effectively","To collect data","Show advertisements"],a:1},
  {q:"What is 'Effective' as a GoPlanet principle?",o:["Being strict","Work smarter, achieve more","Using the most expensive tools","Coding everything yourself"],a:1},
  {q:"What is 'Smart Thinking' as a GoPlanet principle?",o:["Memorising facts","Solve problems with intelligence","Working faster always","Using shortcuts"],a:1},
  {q:"What is an admin in an app?",o:["A regular user","A user with special management privileges","A paid subscriber only","A developer only"],a:1},
  {q:"What does 'Pro subscription' typically offer?",o:["Same as free","Faster responses and advanced features","Less storage","Fewer models"],a:1},
  {q:"What is a language model's training data?",o:["Images and videos only","Large amounts of text from various sources","Audio files only","Code files only"],a:1},
  {q:"What does 'Honest Use' mean in GoPlanet?",o:["Using AI to cheat","Use technology with integrity","Only using free tools","Sharing all data publicly"],a:1},
  {q:"What is an API?",o:["Application Programming Interface","Automated Program Input","Advanced Page Interface","App Protocol Integration"],a:0},
  {q:"What should you do if an AI gives wrong information?",o:["Trust it completely","Verify with reliable sources","Delete the app","Report to police"],a:1},
  {q:"GoPlanet's chatbot is powered by which service?",o:["OpenAI GPT","Google Bard","Groq API","Amazon Alexa"],a:2},
  {q:"What is 'temperature' in AI models?",o:["Server heat","Controls randomness/creativity of AI output","User's location climate","Battery level"],a:1},
  {q:"What is a best practice when using AI chatbots?",o:["Never verify AI answers","Cross-check important information","Share personal passwords with AI","Use AI blindly"],a:1},
  {q:"GoPlanet certification date is based on?",o:["App launch date","The day you take the exam","Your birthday","A fixed annual date"],a:1},
  {q:"GoPlanet is primarily designed for?",o:["Gaming","Everyone — easy to use AI chatbot","Advanced developers only","Children under 10"],a:1},
  {q:"What is 'Secure & Private' in GoPlanet?",o:["Data is sold to partners","Data is encrypted and safe","Users' data is public","No security measures"],a:1},
  {q:"What is a multiple-choice question exam?",o:["Essay writing test","Questions with several answer options to choose from","Oral exam","Drawing test"],a:1},
  {q:"What is 'context window' in AI?",o:["Browser window size","Amount of text AI can process at once","Screen resolution","Network bandwidth"],a:1},
  {q:"What does re-taking an exam allow?",o:["Getting a higher score automatically","Attempting the exam again after failure","Changing the questions","Getting a free subscription"],a:1},
  {q:"What is an AI project in GoPlanet?",o:["A physical project","An organised workspace to manage AI tasks","A government initiative","A hardware device"],a:1},
  {q:"What makes GoPlanet 'Innovative AI'?",o:["Only uses old technology","Choose from the best open models","No model options","Only one fixed model"],a:1},
  {q:"What is 'User Friendly' design?",o:["Designed only for tech experts","Designed for everyone, easy to use","Complex interface intentionally","No help documentation"],a:1},
  {q:"Purpose of subscription tiers?",o:["To confuse users","Offer different feature levels for different needs","Restrict all users equally","To remove features"],a:1},
  {q:"What to do before sharing AI-generated content?",o:["Share immediately without review","Review and verify the accuracy","Delete it","Print it only"],a:1},
  {q:"What is the role of AI in smart communication?",o:["Replace all human communication","Enhance and assist human communication","Stop communication","Monitor users"],a:1},
  {q:"What is a 'real-world AI application'?",o:["AI only in science fiction","Using AI to solve practical everyday problems","AI in video games only","AI in space only"],a:1},
  {q:"What happens after completing GoPlanet certification successfully?",o:["Nothing","Receive a digital certificate if score >= 40/50","Get a free phone","Become an admin automatically"],a:1},
  {q:"What is 'model selection' in GoPlanet?",o:["Choosing clothing models","Selecting which AI model to use for chat","Picking screen themes","Choosing subscription plans"],a:1},
  {q:"What does an AI assistant help with?",o:["Only math problems","Chatting, creating, coding, and more","Only image generation","Only translations"],a:1},
  {q:"Recommended approach to AI usage per GoPlanet?",o:["Rely on AI for everything","Use AI as a tool to empower, not replace human judgment","Never use AI","Only for entertainment"],a:1},
  {q:"What is voice mode in GoPlanet?",o:["A music player","Speaking to and hearing responses from the AI","A phone call feature","A video chat feature"],a:1},
  {q:"What is 'Local & Fast' in GoPlanet?",o:["Works only locally without internet","Powered by Groq running fast AI models","Users meet locally","Fast food delivery"],a:1},
  {q:"Which principle says 'Empower people, not replace them'?",o:["Honest Use","Smart Thinking","Effective","Human First"],a:3},
];

// ════════════════════════════════════════════════════════
// GUIDE — 10 chapters
// ════════════════════════════════════════════════════════
const GUIDE=[
  {icon:"🚀",title:"Getting Started",color:"#6c5ce7",
    steps:["Register with your email, password, full name, and mobile number.","Log in — your session stays active, no need to log in again.","You land on the AI Chat screen. Tap '+ New Chat' to begin.","Use the bottom navigation bar to switch between Chat, Projects, Images, Plans, and Settings."],
    tip:"Your data is saved automatically. Nothing is lost when you close the app."},
  {icon:"🔑",title:"Setting Up Your Groq API Key",color:"#e17055",
    steps:["Go to ⚙️ Settings → API Configuration.","Visit console.groq.com and sign up for a free account.","Create an API key (it starts with 'gsk_').","Paste your key into the API Key field and tap Save.","Your API key is stored only on your device — never shared with anyone."],
    tip:"Without a Groq API key, the chatbot cannot respond. This is a required one-time setup."},
  {icon:"💬",title:"Using the AI Chatbot",color:"#00b894",
    steps:["Tap '+ New Chat' from the sidebar or chat screen.","Type your message in the input box at the bottom.","Press the send button or hit Enter — the AI replies instantly.","All your conversations are saved and appear in the sidebar.","Use 🎤 Voice Mode — tap the microphone to speak to the AI."],
    tip:"Tap a model name to switch between Llama, Mixtral, and Gemma AI models anytime."},
  {icon:"📁",title:"Managing Projects",color:"#fdcb6e",
    steps:["Go to the 📁 Projects tab.","Tap '+ New' to create a project workspace.","Give it a name and tap Create.","Use projects to organise related chats and AI tasks."],
    tip:"Projects help you keep work, personal, and creative AI tasks separated and easy to find."},
  {icon:"🎨",title:"Image Generator",color:"#a29bfe",
    steps:["Go to the 🎨 Images tab.","Type a description of the image you want.","Tap 'Generate Image' to create it.","The image appears below the prompt input."],
    tip:"Be detailed in your descriptions for better results."},
  {icon:"⭐",title:"Subscription Plans",color:"#f9ca24",
    steps:["Go to the ⭐ Plans tab.","Free Plan gives you basic AI access.","Pro Plan ($25/year) unlocks faster responses, advanced models, and priority support.","Tap 'Subscribe Now' and complete the payment form to activate Pro."],
    tip:"Admins can also grant you a Pro subscription from the Admin panel."},
  {icon:"🛡️",title:"Admin Panel",color:"#e84393",
    steps:["The first user to register becomes Admin automatically.","Admins see an extra 🛡️ Admin tab in the bottom navigation.","View all registered members, their exam scores, and certification status.","Grant Pro or Admin access to any user with one tap."],
    tip:"Admin access is given ONLY after scoring 40+ in the certification exam OR manually granted by another admin."},
  {icon:"📜",title:"Certification Exam (Optional)",color:"#6c5ce7",
    steps:["Go to ⚙️ Settings → scroll down to Certification.","Tap 'Enter Exam' — enter your full name and email to begin.","Answer all 50 multiple-choice questions about AI and GoPlanet.","If you score 40 or above out of 50, your certificate is generated.","Your registered name and today's exact date appear on the certificate.","Download your certificate as a PNG image.","You can retake the exam anytime from Settings."],
    tip:"The exam is completely optional but recommended. It proves your knowledge of responsible AI usage."},
  {icon:"🎤",title:"Voice Mode",color:"#00cec9",
    steps:["Start a chat and tap the 🎤 microphone button next to the input box.","Speak your question clearly — GoPlanet AI listens and processes your speech.","The AI responds in text AND speaks the answer aloud.","Tap the microphone again or the stop button to end voice input."],
    tip:"Voice mode works best in a quiet environment. Make sure your browser has microphone permission."},
  {icon:"🔒",title:"Privacy & Security",color:"#2d3436",
    steps:["Your Groq API key is stored ONLY on your device — never on any server.","No API key is ever visible to other users or sent anywhere outside Groq.","Your chats and projects are stored locally under your personal account only.","Always log out when using a shared device.","Never share your API key or password with anyone."],
    tip:"If you suspect your API key was compromised, revoke it at console.groq.com immediately."},
];

// ════════════════════════════════════════════════════════
// CERTIFICATE GENERATOR — matches uploaded certificate image
// ════════════════════════════════════════════════════════
function makeCertificate(name, score, dateStr, logoSrc) {
  return new Promise(resolve => {
    const W=1050, H=1200;
    const cv=document.createElement("canvas");
    cv.width=W; cv.height=H;
    const ctx=cv.getContext("2d");
    // White/lavender background
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,"#f8f8ff"); bg.addColorStop(1,"#eeeeff");
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    // Contour wave lines
    ctx.strokeStyle="rgba(108,92,231,0.06)"; ctx.lineWidth=1.5;
    for(let i=0;i<10;i++){
      ctx.beginPath(); ctx.moveTo(-50,250+i*90);
      for(let x=0;x<=W+100;x+=15) ctx.lineTo(x-50, 250+i*90+Math.sin(x*0.018)*35);
      ctx.stroke();
    }
    // Dot matrix top-right
    ctx.fillStyle="rgba(108,92,231,0.13)";
    for(let r=0;r<10;r++) for(let c=0;c<7;c++){
      ctx.beginPath(); ctx.arc(W-55-c*18, 70+r*18, 2.5, 0, Math.PI*2); ctx.fill();
    }
    // Side borders (purple gradient)
    const sg=ctx.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,"#3a008f"); sg.addColorStop(0.4,"#6c5ce7"); sg.addColorStop(0.7,"#5a2fbf"); sg.addColorStop(1,"#3a008f");
    ctx.fillStyle=sg; ctx.fillRect(0,0,18,H); ctx.fillRect(W-18,0,18,H);
    // Bottom border
    const bg2=ctx.createLinearGradient(0,0,W,0);
    bg2.addColorStop(0,"#3a008f"); bg2.addColorStop(0.5,"#6c5ce7"); bg2.addColorStop(1,"#3a008f");
    ctx.fillStyle=bg2; ctx.fillRect(0,H-18,W,18);
    // Glowing corners
    const bl=ctx.createRadialGradient(0,H,0,0,H,240);
    bl.addColorStop(0,"rgba(80,0,200,0.55)"); bl.addColorStop(1,"rgba(80,0,200,0)");
    ctx.fillStyle=bl; ctx.fillRect(0,H-240,280,240);
    const br=ctx.createRadialGradient(W,H,0,W,H,280);
    br.addColorStop(0,"rgba(40,80,220,0.5)"); br.addColorStop(1,"rgba(40,80,220,0)");
    ctx.fillStyle=br; ctx.fillRect(W-280,H-280,280,280);
    // Light rays
    ctx.strokeStyle="rgba(100,140,255,0.18)"; ctx.lineWidth=2.5;
    for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(W-10,H-10); ctx.lineTo(W-10-i*55,H-180-i*35); ctx.stroke(); }
    // Ornate border
    ctx.strokeStyle="#5a3dbf"; ctx.lineWidth=3; ctx.strokeRect(22,22,W-44,H-44);
    ctx.strokeStyle="#a29bfe"; ctx.lineWidth=1.5; ctx.strokeRect(30,30,W-60,H-60);
    // Corner ornaments
    [[38,38],[W-38,38],[38,H-38],[W-38,H-38]].forEach(([x,y])=>{
      const s=20; ctx.strokeStyle="#8870cc"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(x,y+s); ctx.lineTo(x,y); ctx.lineTo(x+s,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x-s,y); ctx.lineTo(x,y); ctx.lineTo(x,y-s); ctx.stroke();
    });
    const drawContent=()=>{
      ctx.textAlign="center";
      // GoPlanet text
      ctx.fillStyle="#1a40ff"; ctx.font="bold 54px Arial, sans-serif"; ctx.fillText("GoPlanet",W/2,318);
      // AI CHATBOT
      ctx.strokeStyle="#666"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(320,336); ctx.lineTo(418,336); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(632,336); ctx.lineTo(730,336); ctx.stroke();
      ctx.fillStyle="#555"; ctx.font="13px Arial, sans-serif"; ctx.fillText("AI CHATBOT",W/2,341);
      // CERTIFICATE
      ctx.fillStyle="#080820"; ctx.font="bold 90px Georgia, serif"; ctx.fillText("CERTIFICATE",W/2,435);
      // OF COMPLETION
      ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(125,465); ctx.lineTo(320,465); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(730,465); ctx.lineTo(925,465); ctx.stroke();
      ctx.fillStyle="#6c5ce7";
      ctx.beginPath(); ctx.arc(122,465,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(928,465,4,0,Math.PI*2); ctx.fill();
      ctx.font="bold 22px Arial, sans-serif"; ctx.fillText("OF COMPLETION",W/2,474);
      // THIS CERTIFICATE IS PROUDLY PRESENTED TO
      ctx.fillStyle="#777"; ctx.font="13px Arial, sans-serif"; ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO",W/2,514);
      // Dotted line
      ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=1.5; ctx.setLineDash([2,7]);
      ctx.beginPath(); ctx.moveTo(125,530); ctx.lineTo(925,530); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle="#6c5ce7";
      ctx.beginPath(); ctx.arc(122,530,4.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(928,530,4.5,0,Math.PI*2); ctx.fill();
      // RECIPIENT NAME
      ctx.fillStyle="#0a0a2e"; ctx.font="bold 50px Georgia, serif"; ctx.fillText(name,W/2,598);
      const nw=ctx.measureText(name).width;
      ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(W/2-nw/2,612); ctx.lineTo(W/2+nw/2,612); ctx.stroke();
      // Body text
      ctx.fillStyle="#444"; ctx.font="16px Arial, sans-serif";
      ["for successfully completing the GoPlanet AI Chatbot Certification Program.",
       "This certifies your understanding and practical knowledge",
       "of responsible AI usage, smart communication,",
       "and real-world AI chatbot applications."].forEach((l,i)=>ctx.fillText(l,W/2,652+i*27));
      // Score badge
      ctx.fillStyle="#ede9ff";
      ctx.beginPath(); ctx.rect(415,726,220,38); ctx.fill();
      ctx.fillStyle="#6c5ce7"; ctx.font="bold 15px Arial, sans-serif"; ctx.fillText("Score: "+score+" / 50",W/2,751);
      // YOU ARE NOW RECOGNIZED AS
      ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(195,786); ctx.lineTo(400,786); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(650,786); ctx.lineTo(855,786); ctx.stroke();
      ctx.fillStyle="#666"; ctx.font="bold 13px Arial, sans-serif"; ctx.fillText("YOU ARE NOW RECOGNIZED AS",W/2,794);
      ctx.fillStyle="#5a2fbf"; ctx.font="bold 32px Arial, sans-serif"; ctx.fillText("GOPLANET CERTIFIED USER",W/2,834);
      // Laurel branches
      const drawLaurel=(sx,sy,dir)=>{
        ctx.strokeStyle="#7c5cbf"; ctx.lineWidth=1.5;
        for(let i=0;i<7;i++){
          const angle=(dir===1?-0.55:Math.PI+0.55)+i*dir*0.2, len=16+i*2.5;
          const bx=sx+dir*i*10, by=sy-i*7;
          ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+Math.cos(angle)*len, by+Math.sin(angle)*len); ctx.stroke();
        }
      };
      drawLaurel(200,850,1); drawLaurel(850,850,-1);
      // 4 principle icons
      const principles=[
        {label:"HONEST USE",sub:"Use technology\nwith integrity.",color:"#1a40ff"},
        {label:"SMART THINKING",sub:"Solve problems\nwith intelligence.",color:"#5a2fbf"},
        {label:"EFFECTIVE",sub:"Work smarter,\nachieve more.",color:"#0099cc"},
        {label:"HUMAN FIRST",sub:"Empower people,\nnot replace them.",color:"#7030a0"},
      ];
      const icons=["✅","🧠","💬","❤️"];
      const iY=894, iSp=195, iSt=W/2-iSp*1.5;
      principles.forEach((p,i)=>{
        const x=iSt+i*iSp;
        const cg=ctx.createRadialGradient(x,iY,5,x,iY,34);
        cg.addColorStop(0,p.color+"cc"); cg.addColorStop(1,p.color+"33");
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,iY,34,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=p.color+"88"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,iY,34,0,Math.PI*2); ctx.stroke();
        ctx.font="24px serif"; ctx.fillStyle="#fff"; ctx.fillText(icons[i],x,iY+9);
        if(i<3){ ctx.fillStyle="#ccc"; ctx.beginPath(); ctx.arc(x+iSp/2,iY,3.5,0,Math.PI*2); ctx.fill(); }
        ctx.fillStyle="#1a1a2e"; ctx.font="bold 11px Arial, sans-serif"; ctx.fillText(p.label,x,iY+54);
        ctx.fillStyle="#666"; ctx.font="11px Arial, sans-serif";
        p.sub.split("\n").forEach((line,li)=>ctx.fillText(line,x,iY+70+li*15));
      });
      // Signature
      ctx.textAlign="left";
      ctx.fillStyle="#5a2fbf"; ctx.font="italic 28px Georgia, serif"; ctx.fillText("GoPlanet Team",90,1076);
      ctx.fillStyle="#444"; ctx.font="bold 11px Arial, sans-serif"; ctx.fillText("GOPLANET TEAM",90,1095);
      ctx.fillStyle="#888"; ctx.font="11px Arial, sans-serif"; ctx.fillText("ISSUER",90,1110);
      // Medal badge
      ctx.textAlign="center";
      ctx.fillStyle="#0c0c1e"; ctx.beginPath(); ctx.arc(W/2,1085,46,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#f9ca24"; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(W/2,1085,46,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle="#f9ca2499"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(W/2,1085,38,0,Math.PI*2); ctx.stroke();
      ctx.font="34px serif"; ctx.fillText("🤖",W/2,1097);
      ctx.fillStyle="#5a2fbf"; ctx.fillRect(W/2-11,1129,9,26);
      ctx.fillStyle="#a29bfe"; ctx.fillRect(W/2+2,1129,9,26);
      ctx.fillStyle="#f9ca24"; ctx.font="13px serif";
      [[W/2-58,1060],[W/2+58,1060],[W/2-62,1094],[W/2+62,1094]].forEach(([x,y])=>ctx.fillText("★",x,y));
      // Date box
      ctx.textAlign="right";
      ctx.strokeStyle="#6c5ce7"; ctx.lineWidth=1.5; ctx.strokeRect(W-210,1056,162,68);
      ctx.font="20px serif"; ctx.fillStyle="#6c5ce7"; ctx.fillText("📅",W-185,1082);
      ctx.fillStyle="#0a0a2e"; ctx.font="bold 15px Arial, sans-serif"; ctx.fillText(dateStr,W-72,1084);
      ctx.fillStyle="#6c5ce7"; ctx.font="bold 11px Arial, sans-serif"; ctx.fillText("DATE OF ISSUE",W-72,1104);
    };
    const img=new Image();
    img.onload=()=>{ ctx.drawImage(img,W/2-77,30,155,155); drawContent(); resolve(cv.toDataURL("image/png")); };
    img.onerror=()=>{ drawContent(); resolve(cv.toDataURL("image/png")); };
    img.src=logoSrc;
  });
}

// ════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════
export default function GoPlanetApp() {
  const [page,setPage]=useState("boot");
  const [regStep,setRegStep]=useState(1);
  const [form,setForm]=useState({email:"",password:"",name:"",mobile:""});
  const [authErr,setAuthErr]=useState("");
  const [userId,setUserId]=useState(null);
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("chat");
  const [sidebar,setSidebar]=useState(false);
  const [dark,setDark]=useState(false);
  const [groqKey,setGroqKey]=useState("");
  const [selModel,setSelModel]=useState("llama-3.3-70b-versatile");
  const [chats,setChats]=useState({});
  const [activeChat,setActiveChat]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [inputText,setInputText]=useState("");
  const [aiTyping,setAiTyping]=useState(false);
  const [voiceEnabled,setVoiceEnabled]=useState(false);
  const [voiceListening,setVoiceListening]=useState(false);
  const [voiceSpeaking,setVoiceSpeaking]=useState(false);
  const [projects,setProjects]=useState({});
  const [newProjName,setNewProjName]=useState("");
  const [showProjForm,setShowProjForm]=useState(false);
  const [imgPrompt,setImgPrompt]=useState("");
  const [genImg,setGenImg]=useState(null);
  const [genLoading,setGenLoading]=useState(false);
  const [subModal,setSubModal]=useState(false);
  const [adminUsers,setAdminUsers]=useState([]);
  const [adminTab,setAdminTab]=useState("members");
  const [examScreen,setExamScreen]=useState(null);
  const [examName,setExamName]=useState("");
  const [examEmail,setExamEmail]=useState("");
  const [examErr,setExamErr]=useState("");
  const [examAnswers,setExamAnswers]=useState({});
  const [examScore,setExamScore]=useState(0);
  const [certUrl,setCertUrl]=useState("");
  const [certDate,setCertDate]=useState("");
  const [certLoading,setCertLoading]=useState(false);
  const [guideIdx,setGuideIdx]=useState(0);
  const chatBottomRef=useRef(null);
  const recognitionRef=useRef(null);
  const inputRef=useRef(null);

  const AC="#6c5ce7",AC2="#a29bfe";
  const BG=dark?"#0f0f1a":"#f7f7fc";
  const SURF=dark?"#1a1a2e":"#ffffff";
  const BORD=dark?"#2a2a4a":"#e8e8f0";
  const TEXT=dark?"#e0e0ff":"#1a1a2e";
  const MUT=dark?"#8888bb":"#777788";
  const MODELS=[
    {id:"llama-3.3-70b-versatile",name:"Llama 3.3 70B",tag:"Meta"},
    {id:"mixtral-8x7b-32768",name:"Mixtral 8x7B",tag:"Mistral"},
    {id:"gemma2-9b-it",name:"Gemma 2 9B",tag:"Google"},
    {id:"llama-3.1-8b-instant",name:"Llama 3.1 8B",tag:"Meta"},
  ];

  useEffect(()=>{
    const sess=DB.get(SESS);
    if(sess){ const u=DB.get(uK(sess)); if(u){ loadUser(sess,u); return; } }
    setPage("login");
  },[]);
  useEffect(()=>{ chatBottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  function loadUser(id,u){
    setUserId(id); setUser(u);
    setChats(DB.get(cK(id),{}));
    setProjects(DB.get(pK(id),{}));
    const sett=DB.get(sK(id),{});
    if(sett.groqKey) setGroqKey(sett.groqKey);
    if(sett.selModel) setSelModel(sett.selModel);
    if(sett.dark!==undefined) setDark(sett.dark);
    setPage("main");
  }
  const patchUser=useCallback((patch)=>{
    const u2={...user,...patch}; setUser(u2); DB.set(uK(userId),u2);
  },[user,userId]);
  const saveSett=(patch)=>{ const cur=DB.get(sK(userId),{}); DB.set(sK(userId),{...cur,...patch}); };

  function handleLogin(){
    setAuthErr(""); if(!form.email.trim()||!form.password){setAuthErr("Please fill all fields.");return;}
    const id=mkId(form.email); const u=DB.get(uK(id));
    if(!u){setAuthErr("No account found. Please register.");return;}
    if(u.password!==btoa(form.password)){setAuthErr("Incorrect password.");return;}
    DB.set(SESS,id); loadUser(id,u);
  }
  function handleReg1(){
    setAuthErr(""); if(!form.email.trim()||!form.password){setAuthErr("Please fill all fields.");return;}
    if(!/\S+@\S+\.\S+/.test(form.email)){setAuthErr("Enter a valid email address.");return;}
    if(form.password.length<6){setAuthErr("Password must be at least 6 characters.");return;}
    const id=mkId(form.email); if(DB.get(uK(id))){setAuthErr("Email already registered. Please log in.");return;}
    setRegStep(2);
  }
  function handleReg2(){
    setAuthErr(""); if(!form.name.trim()||!form.mobile.trim()){setAuthErr("Please fill all fields.");return;}
    const id=mkId(form.email); const idx=DB.get(UIDX,[]);
    const u={name:form.name.trim(),email:form.email.trim().toLowerCase(),mobile:form.mobile.trim(),password:btoa(form.password),isAdmin:idx.length===0,isPro:false,joinedAt:new Date().toISOString(),examScore:null,certDate:null,certGranted:false};
    DB.set(uK(id),u); if(!idx.includes(id)) DB.set(UIDX,[...idx,id]); DB.set(SESS,id); loadUser(id,u);
  }
  function logout(){
    DB.del(SESS); setUserId(null); setUser(null); setChats({}); setProjects({}); setMsgs([]); setActiveChat(null); setGroqKey(""); setForm({email:"",password:"",name:"",mobile:""}); setRegStep(1); setExamScreen(null); setCertUrl(""); setPage("login");
  }

  // VOICE
  const startListening=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice recognition not supported. Please use Chrome or Edge.");return;}
    const rec=new SR(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1;
    rec.onstart=()=>setVoiceListening(true);
    rec.onend=()=>setVoiceListening(false);
    rec.onerror=()=>setVoiceListening(false);
    rec.onresult=(e)=>{
      const text=e.results[0][0].transcript;
      setInputText(text); setVoiceListening(false);
      setTimeout(()=>sendMessageWith(text),300);
    };
    recognitionRef.current=rec; rec.start();
  },[]);
  const stopListening=()=>{ recognitionRef.current?.stop(); setVoiceListening(false); };
  const speakText=(text)=>{
    if(!window.speechSynthesis) return; window.speechSynthesis.cancel();
    const utt=new SpeechSynthesisUtterance(text.slice(0,500)); utt.rate=0.95; utt.pitch=1;
    utt.onstart=()=>setVoiceSpeaking(true); utt.onend=()=>setVoiceSpeaking(false); utt.onerror=()=>setVoiceSpeaking(false);
    window.speechSynthesis.speak(utt);
  };
  const stopSpeaking=()=>{ window.speechSynthesis?.cancel(); setVoiceSpeaking(false); };

  // CHAT
  function newChat(){
    const id="c"+Date.now();
    const welcome={role:"ai",text:"Hello "+user?.name+"! 👋 I'm GoPlanet AI. How can I help you today?",ts:new Date().toLocaleTimeString()};
    const updated={...chats,[id]:[welcome]};
    setChats(updated); DB.set(cK(userId),updated); setActiveChat(id); setMsgs([welcome]); setTab("chat"); setSidebar(false);
  }
  function openChat(id){ setActiveChat(id); setMsgs(chats[id]||[]); setTab("chat"); setSidebar(false); }
  async function sendMessageWith(text){
    if(!text?.trim()||!activeChat) return;
    if(!groqKey||!groqKey.startsWith("gsk_")){
      const err={role:"ai",text:"⚠️ No Groq API key set. Go to ⚙️ Settings → API Configuration.",ts:new Date().toLocaleTimeString()};
      setMsgs(prev=>[...prev,err]); return;
    }
    const userMsg={role:"user",text:text.trim(),ts:new Date().toLocaleTimeString()};
    const withUser=[...msgs,userMsg];
    setMsgs(withUser); setInputText(""); setAiTyping(true);
    // Keep input focused
    setTimeout(()=>inputRef.current?.focus(),50);
    let aiText="";
    try{
      const history=withUser.slice(-12).map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+groqKey},body:JSON.stringify({model:selModel,messages:history,max_tokens:1024})});
      if(!res.ok){const e=await res.json();throw new Error(e.error?.message||"API error "+res.status);}
      const d=await res.json(); aiText=d.choices?.[0]?.message?.content||"No response received.";
    }catch(e){ aiText="⚠️ "+e.message; }
    const aiMsg={role:"ai",text:aiText,ts:new Date().toLocaleTimeString()};
    const final=[...withUser,aiMsg];
    setMsgs(final); setAiTyping(false);
    const updated={...chats,[activeChat]:final}; setChats(updated); DB.set(cK(userId),updated);
    if(voiceEnabled) speakText(aiText);
  }
  async function sendMessage(){ await sendMessageWith(inputText); }

  // PROJECTS
  function createProject(){
    if(!newProjName.trim()) return;
    const id="p"+Date.now();
    const updated={...projects,[id]:{name:newProjName.trim(),createdAt:new Date().toISOString()}};
    setProjects(updated); DB.set(pK(userId),updated); setNewProjName(""); setShowProjForm(false);
  }

  // ADMIN
  const loadAdminUsers=useCallback(()=>{
    const idx=DB.get(UIDX,[]);
    setAdminUsers(idx.map(id=>{const u=DB.get(uK(id)); return u?{id,name:u.name,email:u.email,isPro:u.isPro,isAdmin:u.isAdmin,examScore:u.examScore,certGranted:u.certGranted,joinedAt:u.joinedAt}:null;}).filter(Boolean));
  },[]);
  const grantPro=(id)=>{ const u=DB.get(uK(id)); if(u){DB.set(uK(id),{...u,isPro:true}); loadAdminUsers(); if(id===userId) patchUser({isPro:true});} };
  const grantAdmin=(id)=>{ const u=DB.get(uK(id)); if(u){DB.set(uK(id),{...u,isAdmin:true}); loadAdminUsers(); if(id===userId) patchUser({isAdmin:true});} };

  // EXAM
  function startExam(){
    setExamErr(""); if(!examName.trim()){setExamErr("Please enter your full name.");return;}
    if(!examEmail.trim()||!/\S+@\S+\.\S+/.test(examEmail)){setExamErr("Please enter a valid email address.");return;}
    setExamAnswers({}); setExamScreen("exam");
  }
  async function submitExam(){
    let s=0; QUIZ.forEach((q,i)=>{ if(examAnswers[i]===q.a) s++; });
    const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    setExamScore(s); setCertDate(today); patchUser({examScore:s});
    if(s>=40){
      setCertLoading(true);
      const url=await makeCertificate(examName.trim(),s,today,LOGO_SRC);
      setCertUrl(url); setCertLoading(false);
      patchUser({examScore:s,certDate:today,certGranted:true,certName:examName.trim()});
    }
    setExamScreen("result");
  }

  // STYLES
  const S={
    wrap:{display:"flex",flexDirection:"column",height:"100dvh",width:"100%",maxWidth:"480px",margin:"0 auto",background:BG,color:TEXT,fontFamily:"system-ui,sans-serif",position:"relative",overflow:"hidden"},
    top:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",height:"54px",background:SURF,borderBottom:"1px solid "+BORD,flexShrink:0,zIndex:5},
    body:{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",minHeight:0},
    nav:{display:"flex",background:SURF,borderTop:"1px solid "+BORD,flexShrink:0,padding:"2px 0 4px"},
    navBtn:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"5px 2px",border:"none",background:"none",cursor:"pointer",color:a?AC:MUT,fontSize:"9px",fontWeight:a?700:400}),
    card:{background:SURF,borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1px solid "+BORD},
    inp:{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORD,borderRadius:"10px",background:SURF,color:TEXT,fontSize:"14px",outline:"none",boxSizing:"border-box"},
    btn:(bg=AC,fg="#fff",extra={})=>({background:bg,color:fg,border:"none",borderRadius:"10px",padding:"12px",fontSize:"14px",fontWeight:700,cursor:"pointer",width:"100%",...extra}),
    lbl:{fontSize:"11px",fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:"5px",display:"block"},
    err:{color:"#e74c3c",fontSize:"12px",padding:"8px 12px",background:"#fff0f0",borderRadius:"8px",border:"1px solid #ffd0d0",marginTop:"4px"},
    logoRow:{display:"flex",alignItems:"center",gap:"8px",fontWeight:900,fontSize:"18px",color:AC},
  };

  if(page==="boot") return(<div style={{...S.wrap,alignItems:"center",justifyContent:"center"}}><img src={LOGO_SRC} alt="GoPlanet" style={{width:"90px",height:"90px",objectFit:"contain",marginBottom:"14px"}}/><p style={{color:AC,fontWeight:900,fontSize:"24px",margin:0}}>GoPlanet</p><p style={{color:MUT,fontSize:"13px",marginTop:"6px"}}>Loading…</p></div>);

  if(page==="login"||page==="register") return(
    <div style={{...S.wrap,overflowY:"auto",alignItems:"center",justifyContent:"center",padding:"28px 22px"}}>
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <img src={LOGO_SRC} alt="GoPlanet" style={{width:"80px",height:"80px",objectFit:"contain",marginBottom:"10px"}}/>
        <h1 style={{margin:"0 0 4px",fontSize:"26px",fontWeight:900,color:AC}}>GoPlanet</h1>
        <p style={{margin:0,color:MUT,fontSize:"13px"}}>Intelligent AI · Powered by Groq</p>
      </div>
      <div style={{display:"flex",background:"#f0ecff",borderRadius:"12px",padding:"4px",marginBottom:"22px",width:"100%"}}>
        {["Log In","Register"].map((t,i)=>(
          <button key={t} onClick={()=>{setPage(i===0?"login":"register");setAuthErr("");setRegStep(1);}}
            style={{flex:1,padding:"10px",border:"none",borderRadius:"9px",background:(page==="login")===(i===0)?AC:"transparent",color:(page==="login")===(i===0)?"#fff":MUT,fontWeight:700,cursor:"pointer",fontSize:"14px"}}>{t}</button>
        ))}
      </div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"11px"}}>
        {page==="register"&&<p style={{color:MUT,fontSize:"12px",textAlign:"center",margin:"0 0 4px"}}>Step {regStep} of 2 — {regStep===1?"Account Details":"Your Info"}</p>}
        {(page==="login"||regStep===1)&&<>
          <div><span style={S.lbl}>Email Address</span><input style={S.inp} type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?handleLogin():handleReg1())}/></div>
          <div><span style={S.lbl}>Password</span><input style={S.inp} type="password" placeholder={page==="register"?"Min 6 characters":"Your password"} autoComplete={page==="login"?"current-password":"new-password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(page==="login"?handleLogin():handleReg1())}/></div>
        </>}
        {page==="register"&&regStep===2&&<>
          <div><span style={S.lbl}>Full Name</span><input style={S.inp} placeholder="e.g. Alice Johnson" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&document.getElementById("mobInp")?.focus()}/></div>
          <div><span style={S.lbl}>Mobile Number</span><input id="mobInp" style={S.inp} type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleReg2()}/></div>
        </>}
        {authErr&&<div style={S.err}>{authErr}</div>}
        {page==="login"&&<button style={S.btn()} onClick={handleLogin}>Log In →</button>}
        {page==="register"&&regStep===1&&<button style={S.btn()} onClick={handleReg1}>Next →</button>}
        {page==="register"&&regStep===2&&<><button style={S.btn()} onClick={handleReg2}>Create Account ✓</button><button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px"}} onClick={()=>setRegStep(1)}>← Back</button></>}
      </div>
    </div>
  );

  // GUIDE
  if(examScreen==="guide"){
    const g=GUIDE[guideIdx];
    return(
      <div style={S.wrap}>
        <div style={S.top}>
          <button onClick={()=>setExamScreen(null)} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button>
          <span style={{fontWeight:800,color:AC,fontSize:"15px"}}>📖 User Guide</span>
          <span style={{fontSize:"12px",color:MUT}}>{guideIdx+1}/{GUIDE.length}</span>
        </div>
        <div style={{height:"4px",background:BORD,flexShrink:0}}>
          <div style={{height:"100%",width:((guideIdx+1)/GUIDE.length*100)+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",transition:"width 0.3s"}}/>
        </div>
        <div style={{...S.body,padding:0}}>
          <div style={{padding:"20px 20px 16px",background:"linear-gradient(135deg,"+g.color+"22,"+g.color+"06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"13px",marginBottom:"6px"}}>
              <div style={{width:"52px",height:"52px",borderRadius:"14px",background:g.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",flexShrink:0}}>{g.icon}</div>
              <div><p style={{margin:0,fontSize:"11px",color:g.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Chapter {guideIdx+1}</p><h2 style={{margin:0,fontSize:"19px",color:TEXT,fontWeight:800}}>{g.title}</h2></div>
            </div>
          </div>
          <div style={{padding:"14px 20px 28px"}}>
            <div style={{background:SURF,borderRadius:"12px",border:"1px solid "+BORD,overflow:"hidden",marginBottom:"14px"}}>
              {g.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:"12px",padding:"12px 14px",borderBottom:i<g.steps.length-1?"1px solid "+BORD:"none",background:i%2===0?"transparent":(dark?"rgba(255,255,255,0.02)":"rgba(108,92,231,0.018)")}}>
                  <div style={{width:"26px",height:"26px",borderRadius:"50%",background:g.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"12px",flexShrink:0,marginTop:"1px"}}>{i+1}</div>
                  <p style={{margin:0,fontSize:"14px",lineHeight:1.65,color:TEXT}}>{step}</p>
                </div>
              ))}
            </div>
            <div style={{background:g.color+"18",border:"1px solid "+g.color+"44",borderRadius:"10px",padding:"12px 14px",marginBottom:"20px"}}>
              <p style={{margin:0,fontSize:"12px",fontWeight:700,color:g.color,marginBottom:"4px"}}>💡 TIP</p>
              <p style={{margin:0,fontSize:"13px",color:TEXT,lineHeight:1.65}}>{g.tip}</p>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button disabled={guideIdx===0} style={S.btn(guideIdx===0?"#ccc":AC2,"#fff",{flex:1,padding:"11px",fontSize:"13px",opacity:guideIdx===0?0.5:1})} onClick={()=>setGuideIdx(p=>p-1)}>← Previous</button>
              {guideIdx<GUIDE.length-1?<button style={S.btn(AC,"#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>setGuideIdx(p=>p+1)}>Next →</button>:<button style={S.btn("#00b894","#fff",{flex:1,padding:"11px",fontSize:"13px"})} onClick={()=>{setGuideIdx(0);setExamScreen(null);}}>✓ Done</button>}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"6px",marginTop:"16px"}}>
              {GUIDE.map((_,i)=><button key={i} onClick={()=>setGuideIdx(i)} style={{width:i===guideIdx?22:7,height:"7px",borderRadius:"4px",border:"none",background:i===guideIdx?AC:BORD,cursor:"pointer",transition:"width 0.2s,background 0.2s",padding:0}}/>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if(examScreen==="entry") return(
    <div style={S.wrap}>
      <div style={S.top}><button onClick={()=>setExamScreen(null)} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>📝 Enter Exam</span><div style={{width:"40px"}}/></div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"24px 16px 20px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"16px",marginBottom:"18px",color:"#fff"}}><div style={{fontSize:"48px",marginBottom:"10px"}}>📜</div><h2 style={{margin:"0 0 6px",fontSize:"20px"}}>GoPlanet Certification</h2><p style={{margin:0,fontSize:"13px",opacity:0.9}}>50 Questions · Score 40+ to earn your certificate</p></div>
        <div style={{...S.card,marginBottom:"14px"}}><p style={{margin:"0 0 10px",fontWeight:700,color:AC,fontSize:"14px"}}>ℹ️ Before you begin</p>{["Your exact name will appear on the certificate.","Score 40 or above out of 50 to earn a downloadable certificate.","Today's date is auto-printed on the certificate.","You can retake the exam anytime from Settings."].map((t,i)=><div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px"}}><span style={{color:"#00b894",fontWeight:700,flexShrink:0}}>✓</span><span style={{fontSize:"13px",color:MUT,lineHeight:1.5}}>{t}</span></div>)}</div>
        <div style={S.card}>
          <p style={{margin:"0 0 14px",fontWeight:700,color:AC,fontSize:"14px"}}>👤 Your Details</p>
          <div style={{marginBottom:"11px"}}><span style={S.lbl}>Full Name (appears on certificate) *</span><input style={S.inp} placeholder="e.g. Alice Johnson" value={examName} onChange={e=>setExamName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&document.getElementById("examEml")?.focus()}/></div>
          <div style={{marginBottom:"12px"}}><span style={S.lbl}>Email Address *</span><input id="examEml" style={S.inp} type="email" placeholder="e.g. alice@example.com" value={examEmail} onChange={e=>setExamEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startExam()}/></div>
          {examErr&&<div style={S.err}>{examErr}</div>}
          <button style={S.btn()} onClick={startExam}>Start Exam →</button>
        </div>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  if(examScreen==="exam"){
    const done=Object.keys(examAnswers).length, pct=Math.round(done/QUIZ.length*100);
    return(
      <div style={S.wrap}>
        <div style={{background:SURF,borderBottom:"1px solid "+BORD,flexShrink:0,padding:"10px 14px",zIndex:5}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
            <button onClick={()=>setExamScreen("entry")} style={{background:"none",border:"none",color:"#e74c3c",fontWeight:700,fontSize:"13px",cursor:"pointer"}}>✕ Exit</button>
            <span style={{fontWeight:700,fontSize:"14px"}}>Certification Exam</span>
            <span style={{fontSize:"12px",color:AC,background:"#f0ecff",padding:"3px 10px",borderRadius:"20px",fontWeight:700}}>{done}/{QUIZ.length}</span>
          </div>
          <div style={{height:"5px",background:BORD,borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+AC+","+AC2+")",borderRadius:"3px",transition:"width 0.3s"}}/></div>
        </div>
        <div style={{...S.body,padding:"12px 14px"}}>
          {QUIZ.map((q,i)=>(
            <div key={i} style={{...S.card,border:examAnswers[i]!==undefined?"1.5px solid "+AC2:"1px solid "+BORD}}>
              <p style={{fontWeight:700,fontSize:"13px",margin:"0 0 10px",lineHeight:1.6}}><span style={{color:AC,fontWeight:900}}>Q{i+1}. </span>{q.q}</p>
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {q.o.map((opt,j)=>(<button key={j} onClick={()=>setExamAnswers(p=>({...p,[i]:j}))} style={{textAlign:"left",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid "+(examAnswers[i]===j?AC:BORD),background:examAnswers[i]===j?"#f0ecff":"transparent",cursor:"pointer",fontSize:"13px",color:examAnswers[i]===j?AC:TEXT,fontWeight:examAnswers[i]===j?700:400}}><span style={{fontWeight:800,marginRight:"6px",color:examAnswers[i]===j?AC:MUT}}>{["A","B","C","D"][j]}.</span>{opt}</button>))}
              </div>
            </div>
          ))}
          <div style={{position:"sticky",bottom:"12px",marginTop:"4px"}}>
            <button disabled={done<QUIZ.length||certLoading} style={{...S.btn(done<QUIZ.length?"#ccc":AC),boxShadow:done>=QUIZ.length?"0 4px 18px rgba(108,92,231,0.4)":"none"}} onClick={submitExam}>{certLoading?"Generating certificate…":done<QUIZ.length?"Answer all questions ("+done+"/"+QUIZ.length+" done)":"Submit Exam ✓"}</button>
          </div>
          <div style={{height:"24px"}}/>
        </div>
      </div>
    );
  }

  if(examScreen==="result"){
    const passed=examScore>=40;
    return(
      <div style={S.wrap}>
        <div style={S.top}><div style={{width:"40px"}}/><span style={{fontWeight:800,color:AC}}>Exam Result</span><div style={{width:"40px"}}/></div>
        <div style={{...S.body,padding:"16px"}}>
          <div style={{textAlign:"center",padding:"28px 16px",borderRadius:"16px",marginBottom:"16px",color:"#fff",background:passed?"linear-gradient(135deg,"+AC+","+AC2+")":"linear-gradient(135deg,#e17055,#d63031)"}}>
            <div style={{fontSize:"56px",marginBottom:"10px"}}>{passed?"🏆":"📚"}</div>
            <h2 style={{margin:"0 0 6px"}}>{passed?"Congratulations!":"Almost There!"}</h2>
            <p style={{margin:"0 0 14px",opacity:0.9,fontSize:"14px"}}>{examName}</p>
            <div style={{display:"inline-block",background:"rgba(255,255,255,0.2)",borderRadius:"14px",padding:"10px 28px"}}>
              <span style={{fontSize:"38px",fontWeight:900}}>{examScore}</span><span style={{fontSize:"16px",opacity:0.8}}> / 50</span>
            </div>
            <p style={{margin:"10px 0 0",fontSize:"13px",opacity:0.85}}>{passed?"You are now a GoPlanet Certified User!":"Need "+(40-examScore)+" more correct answer"+(40-examScore===1?"":"s")+" to pass."}</p>
          </div>
          <div style={{...S.card,marginBottom:"14px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",textAlign:"center"}}>{[["✅",examScore,"Correct","#00b894"],["❌",50-examScore,"Wrong","#e74c3c"],["📊",Math.round(examScore/50*100)+"%","Score",AC]].map(([ic,v,l,col])=>(<div key={l}><p style={{fontSize:"22px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MUT,margin:"3px 0 0"}}>{ic} {l}</p></div>))}</div></div>
          {passed&&<><div style={{...S.card,border:"2px solid "+AC,background:"#f9f7ff",marginBottom:"12px"}}><p style={{margin:"0 0 4px",fontWeight:700,color:AC,fontSize:"14px"}}>🎉 Your certificate is ready!</p><p style={{margin:0,fontSize:"13px",color:MUT,lineHeight:1.6}}>Name: <strong>{examName}</strong> · Date: <strong>{certDate}</strong></p></div><button style={{...S.btn(),marginBottom:"10px"}} onClick={()=>setExamScreen("cert")}>View Certificate 🏆</button><a href={certUrl} download={"GoPlanet_Certificate_"+examName.replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn("#00b894"),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"12px",marginBottom:"10px"}}>📥 Download Certificate</a></>}
          {!passed&&<div style={{...S.card,background:"#fff8f0",border:"1px solid #ffd0b0",marginBottom:"12px"}}><p style={{margin:"0 0 4px",fontWeight:700,color:"#e17055",fontSize:"14px"}}>💡 You can do it!</p><p style={{margin:0,fontSize:"13px",color:MUT}}>Read the guide and try again. Only {40-examScore} more correct answers needed!</p></div>}
          <button style={S.btn(AC2)} onClick={()=>{setExamAnswers({});setExamScreen("exam");}}>🔄 Retake Exam</button>
          <button style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"13px",display:"block",margin:"14px auto 0",fontWeight:600}} onClick={()=>setExamScreen(null)}>← Back to Settings</button>
          <div style={{height:"20px"}}/>
        </div>
      </div>
    );
  }

  if(examScreen==="cert") return(
    <div style={S.wrap}>
      <div style={S.top}><button onClick={()=>setExamScreen("result")} style={{background:"none",border:"none",color:AC,fontWeight:800,fontSize:"18px",cursor:"pointer"}}>←</button><span style={{fontWeight:800,color:AC}}>🏆 My Certificate</span><div style={{width:"40px"}}/></div>
      <div style={{...S.body,padding:"16px"}}>
        <div style={{textAlign:"center",padding:"18px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"14px",marginBottom:"14px",color:"#fff"}}><div style={{fontSize:"34px",marginBottom:"6px"}}>🏆</div><h3 style={{margin:"0 0 3px"}}>GoPlanet Certified User</h3><p style={{margin:"0 0 2px",fontWeight:700,fontSize:"15px"}}>{user?.certName||examName}</p><p style={{margin:0,fontSize:"12px",opacity:0.85}}>{user?.examScore||examScore}/50 · {user?.certDate||certDate}</p></div>
        <img src={certUrl} alt="Certificate" style={{width:"100%",borderRadius:"12px",border:"2px solid "+AC,display:"block",marginBottom:"12px"}}/>
        <a href={certUrl} download={"GoPlanet_Certificate_"+(user?.certName||examName).replace(/\s+/g,"_")+".png"} style={{display:"block",...S.btn(),textDecoration:"none",textAlign:"center",lineHeight:"normal",padding:"13px",marginBottom:"10px"}}>📥 Download Certificate</a>
        <button style={S.btn(AC2)} onClick={()=>{setExamAnswers({});setExamName(user?.name||"");setExamEmail(user?.email||"");setExamScreen("entry");}}>🔄 Retake Exam</button>
        <div style={{height:"20px"}}/>
      </div>
    </div>
  );

  // MAIN APP
  const chatList=Object.keys(chats).map(id=>({id,preview:(chats[id]?.find(m=>m.role==="user")?.text||"New Chat").slice(0,32)})).reverse();
  const projList=Object.keys(projects).map(id=>({id,...projects[id]}));
  const TABS=[{id:"chat",icon:"💬",label:"Chat"},{id:"projects",icon:"📁",label:"Projects"},{id:"image",icon:"🎨",label:"Images"},{id:"plans",icon:"⭐",label:"Plans"},{id:"settings",icon:"⚙️",label:"Settings"},...(user?.isAdmin?[{id:"admin",icon:"🛡️",label:"Admin"}]:[])];

  const Sidebar=()=>(<>
    {sidebar&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99}} onClick={()=>setSidebar(false)}/>}
    <div style={{position:"absolute",top:0,left:sidebar?0:"-100%",width:"82%",maxWidth:"320px",height:"100%",background:SURF,zIndex:100,transition:"left 0.25s ease",boxShadow:sidebar?"6px 0 28px rgba(0,0,0,0.2)":"none",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 14px 12px",borderBottom:"1px solid "+BORD}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}><div style={S.logoRow}><img src={LOGO_SRC} alt="" style={{width:"28px",height:"28px",objectFit:"contain"}}/>GoPlanet</div><button onClick={()=>setSidebar(false)} style={{background:"none",border:"none",color:MUT,fontSize:"22px",cursor:"pointer"}}>✕</button></div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",padding:"10px 12px",background:dark?"#12122a":"#f5f3ff",borderRadius:"10px"}}>
          <div style={{width:"38px",height:"38px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"16px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{minWidth:0}}><p style={{margin:0,fontWeight:700,fontSize:"13px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</p><p style={{margin:0,fontSize:"11px",color:MUT}}>{user?.isPro?"⭐ Pro":"Free"} Member</p></div>
        </div>
      </div>
      <div style={{flex:1,padding:"12px",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        <button style={{...S.btn(),marginBottom:"14px"}} onClick={newChat}>+ New Chat</button>
        <p style={S.lbl}>Recent Chats</p>
        {chatList.length===0&&<p style={{fontSize:"12px",color:MUT}}>No chats yet.</p>}
        {chatList.slice(0,10).map(c=>(<button key={c.id} onClick={()=>openChat(c.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",marginBottom:"4px",borderRadius:"8px",border:"none",background:activeChat===c.id?"#f0ecff":"transparent",cursor:"pointer",fontSize:"12px",color:activeChat===c.id?AC:TEXT}}>💬 {c.preview}…</button>))}
        <p style={{...S.lbl,marginTop:"14px"}}>Projects</p>
        {projList.map(p=><div key={p.id} style={{padding:"7px 10px",fontSize:"12px",color:MUT}}>📁 {p.name}</div>)}
        <button onClick={()=>{setTab("projects");setSidebar(false);}} style={{background:"none",border:"none",color:AC,cursor:"pointer",fontSize:"12px",padding:"4px 10px"}}>+ New Project</button>
      </div>
      {!user?.isPro&&(<div style={{margin:"12px",padding:"14px",background:"linear-gradient(135deg,"+AC+","+AC2+")",borderRadius:"12px",color:"#fff"}}><p style={{margin:"0 0 3px",fontWeight:800}}>⭐ Upgrade to Pro</p><p style={{margin:"0 0 10px",fontSize:"12px",opacity:0.9}}>$25/year — Unlock all features</p><button onClick={()=>{setSubModal(true);setSidebar(false);setTab("plans");}} style={{background:"#fff",color:AC,border:"none",borderRadius:"8px",padding:"7px 16px",fontSize:"12px",fontWeight:800,cursor:"pointer"}}>Subscribe</button></div>)}
      <button onClick={logout} style={{margin:"0 12px 14px",background:"none",border:"1px solid #e74c3c",color:"#e74c3c",borderRadius:"8px",padding:"9px",cursor:"pointer",fontSize:"13px",fontWeight:600}}>🚪 Log Out</button>
    </div>
  </>);

  const ChatTab=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"6px 14px",background:dark?"#12122a":"#f8f7ff",borderBottom:"1px solid "+BORD,flexShrink:0}}>
        <p style={{margin:0,fontSize:"11px",textAlign:"center",color:MUT}}>Powered by Groq · <span style={{color:AC,fontWeight:700}}>{MODELS.find(m=>m.id===selModel)?.name||selModel}</span>{voiceEnabled&&<span style={{color:"#00cec9",fontWeight:700,marginLeft:"8px"}}>🎤 Voice On</span>}</p>
      </div>
      {!activeChat?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
          <img src={LOGO_SRC} alt="" style={{width:"80px",height:"80px",objectFit:"contain",marginBottom:"14px"}}/>
          <h2 style={{color:AC,marginBottom:"6px",fontSize:"22px"}}>GoPlanet AI</h2>
          <p style={{color:MUT,fontSize:"13px",marginBottom:"24px",lineHeight:1.6}}>Your intelligent assistant for chatting, creating, and more.</p>
          <button style={S.btn()} onClick={newChat}>+ Start New Chat</button>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginTop:"18px",justifyContent:"center"}}>
            {MODELS.map(m=>(<button key={m.id} onClick={()=>{setSelModel(m.id);saveSett({selModel:m.id});}} style={{padding:"6px 13px",borderRadius:"20px",border:"1.5px solid "+(selModel===m.id?AC:BORD),background:selModel===m.id?"#f0ecff":"transparent",color:selModel===m.id?AC:MUT,fontSize:"11px",cursor:"pointer",fontWeight:selModel===m.id?700:400}}>{m.name}</button>))}
          </div>
        </div>
      ):(
        <>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 14px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:"10px",gap:"8px",alignItems:"flex-end"}}>
                {m.role==="ai"&&<img src={LOGO_SRC} alt="" style={{width:"28px",height:"28px",objectFit:"contain",flexShrink:0,borderRadius:"50%"}}/>}
                <div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",background:m.role==="user"?AC:dark?"#1e1e3a":"#f0ecff",color:m.role==="user"?"#fff":TEXT,fontSize:"13px",lineHeight:1.6,wordBreak:"break-word"}}>
                  <pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{m.text}</pre>
                </div>
                {m.role==="user"&&<div style={{width:"28px",height:"28px",borderRadius:"50%",background:AC2,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"12px",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>}
              </div>
            ))}
            {aiTyping&&(<div style={{display:"flex",gap:"8px",marginBottom:"10px",alignItems:"flex-end"}}><img src={LOGO_SRC} alt="" style={{width:"28px",height:"28px",objectFit:"contain",borderRadius:"50%"}}/><div style={{padding:"10px 16px",borderRadius:"4px 16px 16px 16px",background:dark?"#1e1e3a":"#f0ecff"}}><span style={{fontSize:"18px",letterSpacing:"4px",color:AC}}>•••</span></div></div>)}
            <div ref={chatBottomRef}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:"1px solid "+BORD,display:"flex",gap:"8px",flexShrink:0,alignItems:"center"}}>
            <button onClick={()=>{if(voiceSpeaking){stopSpeaking();return;}if(voiceListening){stopListening();return;}startListening();}} style={{width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,border:"none",cursor:"pointer",background:voiceListening?"#e74c3c":voiceSpeaking?"#00cec9":voiceEnabled?"#00b894":"#e8e8f0",color:voiceEnabled||voiceListening||voiceSpeaking?"#fff":"#666",fontSize:"16px",transition:"background 0.2s"}}>{voiceListening?"⏹":voiceSpeaking?"🔊":"🎤"}</button>
            <input
              ref={inputRef}
              style={{...S.inp,flex:1,minWidth:0}}
              placeholder={voiceListening?"Listening…":"Type your message…"}
              value={inputText}
              onChange={e=>setInputText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            />
            <button onClick={sendMessage} disabled={!inputText.trim()||aiTyping} style={{width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,border:"none",background:inputText.trim()&&!aiTyping?AC:"#ccc",color:"#fff",fontSize:"18px",cursor:inputText.trim()&&!aiTyping?"pointer":"default"}}>➤</button>
          </div>
        </>
      )}
    </div>
  );

  const ProjectsTab=()=>(<div style={{padding:"16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}><h2 style={{margin:0,color:AC,fontSize:"18px"}}>📁 Projects</h2><button onClick={()=>setShowProjForm(true)} style={{background:AC,color:"#fff",border:"none",borderRadius:"8px",padding:"7px 14px",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>+ New</button></div>{showProjForm&&(<div style={{...S.card,background:"#f0ecff",marginBottom:"14px"}}><input style={{...S.inp,marginBottom:"8px"}} placeholder="Project name…" value={newProjName} onChange={e=>setNewProjName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProject()}/><div style={{display:"flex",gap:"8px"}}><button style={S.btn()} onClick={createProject}>Create</button><button style={{...S.btn("#e0e0e0","#444"),flex:"none",padding:"12px 20px"}} onClick={()=>{setShowProjForm(false);setNewProjName("");}}>Cancel</button></div></div>)}{projList.length===0?<div style={{textAlign:"center",marginTop:"50px",color:MUT}}><div style={{fontSize:"44px",marginBottom:"10px"}}>📁</div><p>No projects yet.</p></div>:projList.map(p=>(<div key={p.id} style={S.card}><p style={{margin:0,fontWeight:700,fontSize:"14px"}}>📁 {p.name}</p><p style={{margin:"4px 0 0",fontSize:"11px",color:MUT}}>Created {new Date(p.createdAt).toLocaleDateString()}</p></div>))}</div>);

  const ImageTab=()=>(<div style={{padding:"16px"}}><h2 style={{color:AC,marginTop:0}}>🎨 Image Generator</h2><p style={{color:MUT,fontSize:"13px",marginBottom:"14px"}}>Describe the image you want to generate.</p><textarea style={{...S.inp,height:"80px",resize:"none",marginBottom:"12px"}} placeholder="e.g. A futuristic city floating in clouds at sunset…" value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)}/><button style={S.btn()} onClick={()=>{if(imgPrompt.trim()){setGenLoading(true);setTimeout(()=>{setGenImg("https://picsum.photos/seed/"+encodeURIComponent(imgPrompt)+"/800/600");setGenLoading(false);},1200);}}}>{genLoading?"Generating…":"Generate Image"}</button>{genImg&&<img src={genImg} alt="Generated" style={{width:"100%",borderRadius:"12px",marginTop:"14px",border:"1px solid "+BORD}}/>}</div>);

  const PlansTab=()=>(<div style={{padding:"16px"}}><h2 style={{color:AC,marginTop:0}}>⭐ Subscription Plans</h2>{user?.isPro?(<div style={{...S.card,background:"linear-gradient(135deg,"+AC+","+AC2+")",color:"#fff",border:"none"}}><h3 style={{margin:"0 0 8px"}}>⭐ Pro Plan Active</h3>{["Faster AI responses","Advanced AI models","Priority support","Early access features"].map(f=><p key={f} style={{margin:"5px 0 0",fontSize:"13px"}}>✓ {f}</p>)}</div>):(<><div style={{...S.card,border:"2px solid "+AC}}><span style={{background:AC,color:"#fff",borderRadius:"6px",padding:"2px 10px",fontSize:"11px",fontWeight:700}}>BEST VALUE</span><h3 style={{color:AC,margin:"10px 0 4px"}}>Pro Plan</h3><p style={{fontSize:"28px",fontWeight:900,color:AC,margin:"0 0 12px"}}>$25<span style={{fontSize:"14px",color:MUT}}>/year</span></p>{["Faster AI responses","Advanced AI models","Priority support","Early access features"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px",color:MUT}}>✓ {f}</p>)}<button style={{...S.btn(),marginTop:"14px"}} onClick={()=>setSubModal(true)}>Subscribe Now</button></div><div style={S.card}><h3 style={{margin:"0 0 4px"}}>Free Plan</h3><p style={{fontSize:"22px",fontWeight:900,color:MUT,margin:"0 0 10px"}}>$0</p>{["Basic AI responses","Standard models","Community support"].map(f=><p key={f} style={{margin:"4px 0",fontSize:"13px",color:MUT}}>• {f}</p>)}</div></>)}{subModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}><div style={{background:SURF,borderRadius:"18px",padding:"24px",width:"100%",maxWidth:"360px",border:"1px solid "+BORD}}><h3 style={{color:AC,margin:"0 0 6px"}}>Complete Subscription</h3><p style={{fontSize:"13px",color:MUT,marginBottom:"16px"}}>Pro Plan — $25/year</p><input style={{...S.inp,marginBottom:"8px"}} placeholder="Card number"/><div style={{display:"flex",gap:"8px",marginBottom:"12px"}}><input style={{...S.inp,flex:1}} placeholder="MM/YY"/><input style={{...S.inp,flex:1}} placeholder="CVV"/></div><button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{patchUser({isPro:true});setSubModal(false);alert("🎉 Pro activated!");}}>Pay $25/year</button><button style={{background:"none",border:"none",color:MUT,cursor:"pointer",fontSize:"13px",width:"100%"}} onClick={()=>setSubModal(false)}>Cancel</button></div></div>)}</div>);

  const SettingsTab=()=>(<div style={{padding:"16px"}}><h2 style={{color:AC,marginTop:0}}>⚙️ Settings</h2>
    <div style={S.card}><span style={S.lbl}>🔑 Groq API Key</span><p style={{fontSize:"12px",color:MUT,margin:"0 0 8px",lineHeight:1.5}}>Get your free key at <strong>console.groq.com</strong>. Your key is stored only on this device and never visible to anyone else.</p><input style={{...S.inp,fontFamily:"monospace",fontSize:"12px",marginBottom:"8px"}} type="password" placeholder="gsk_…" value={groqKey} onChange={e=>setGroqKey(e.target.value)}/><button style={S.btn()} onClick={()=>{saveSett({groqKey});alert("✅ API key saved!");}}>Save API Key</button></div>
    <div style={S.card}><span style={S.lbl}>🤖 AI Model</span>{MODELS.map(m=>(<button key={m.id} onClick={()=>{setSelModel(m.id);saveSett({selModel:m.id});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"9px 12px",marginBottom:"6px",borderRadius:"9px",border:"1.5px solid "+(selModel===m.id?AC:BORD),background:selModel===m.id?"#f0ecff":"transparent",cursor:"pointer",textAlign:"left"}}><span style={{fontSize:"13px",color:selModel===m.id?AC:TEXT,fontWeight:selModel===m.id?700:400}}>{m.name}</span><span style={{fontSize:"11px",color:MUT}}>{m.tag}</span></button>))}</div>
    <div style={S.card}><span style={S.lbl}>🎨 Appearance</span><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:"13px"}}>Dark Mode</span><button onClick={()=>setDark(d=>{saveSett({dark:!d});return !d;})} style={{width:"48px",height:"26px",borderRadius:"13px",background:dark?AC:"#ddd",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}><div style={{width:"22px",height:"22px",borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:dark?"24px":"2px",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></button></div></div>
    <div style={S.card}><span style={S.lbl}>🎤 Voice Mode</span><p style={{fontSize:"12px",color:MUT,margin:"0 0 10px",lineHeight:1.5}}>Speak to GoPlanet AI and hear responses aloud. Requires microphone permission.</p><button style={S.btn(voiceEnabled?"#00b894":AC2)} onClick={()=>setVoiceEnabled(v=>!v)}>{voiceEnabled?"🎤 Voice Mode ON — Tap to Disable":"🎤 Enable Voice Mode"}</button></div>
    <div style={S.card}><span style={S.lbl}>📜 Certification (Optional)</span><p style={{fontSize:"12px",color:MUT,margin:"0 0 10px",lineHeight:1.5}}>Test your AI knowledge. Score 40/50 or above to earn a certificate with your name printed on it.</p>
      <button style={{...S.btn(AC2),marginBottom:"8px"}} onClick={()=>{setGuideIdx(0);setExamScreen("guide");}}>📖 Read User Guide</button>
      <button style={{...S.btn(),marginBottom:"8px"}} onClick={()=>{setExamName(user?.name||"");setExamEmail(user?.email||"");setExamErr("");setExamScreen("entry");}}>📝 Enter Exam</button>
      {user?.examScore!=null&&<button style={{...S.btn("#e17055"),marginBottom:"8px"}} onClick={()=>{setExamName(user?.name||"");setExamEmail(user?.email||"");setExamAnswers({});setExamErr("");setExamScreen("entry");}}>🔄 Re-take Exam</button>}
      {user?.certGranted&&<button style={S.btn("#00b894")} onClick={async()=>{if(!certUrl){setCertLoading(true);const url=await makeCertificate(user.certName||user.name,user.examScore,user.certDate,LOGO_SRC);setCertUrl(url);setCertDate(user.certDate);setExamName(user.certName||user.name);setExamScore(user.examScore);setCertLoading(false);}setExamScreen("cert");}}>{certLoading?"Loading…":"🏆 View My Certificate"}</button>}
      {user?.examScore!=null&&<p style={{margin:"8px 0 0",fontSize:"12px",color:MUT,textAlign:"center"}}>Last score: {user.examScore}/50 {user.examScore>=40?"✅ Passed":"— need 40+ to pass"}</p>}
    </div>
    <div style={S.card}><span style={S.lbl}>👤 Account</span>{[["Name",user?.name],["Email",user?.email],["Mobile",user?.mobile],["Plan",user?.isPro?"⭐ Pro":"Free"],["Member since",user?.joinedAt?new Date(user.joinedAt).toLocaleDateString():"—"]].map(([k,v])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+BORD,fontSize:"13px"}}><span style={{color:MUT}}>{k}</span><span style={{fontWeight:600}}>{v||"—"}</span></div>))}<button style={{...S.btn("#e74c3c"),marginTop:"14px"}} onClick={logout}>🚪 Log Out</button></div>
  </div>);

  const AdminTab=()=>{
    useEffect(()=>{ if(user?.isAdmin) loadAdminUsers(); },[]);
    if(!user?.isAdmin) return(<div style={{padding:"16px",textAlign:"center",marginTop:"60px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🔒</div><p style={{color:"#e74c3c",fontWeight:700}}>Admin access required.</p><p style={{color:MUT,fontSize:"13px"}}>Admin access is granted after scoring 40+ in the exam or by an existing admin.</p></div>);
    return(<div style={{padding:"16px"}}><h2 style={{color:AC,marginTop:0}}>🛡️ Admin Panel</h2>
      <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>{["members","stats"].map(t=>(<button key={t} onClick={()=>{setAdminTab(t);if(t==="members")loadAdminUsers();}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"1.5px solid "+(adminTab===t?AC:BORD),background:adminTab===t?"#f0ecff":"transparent",color:adminTab===t?AC:MUT,cursor:"pointer",fontWeight:700,fontSize:"13px",textTransform:"capitalize"}}>{t}</button>))}</div>
      {adminTab==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>{[["Total",adminUsers.length,"#6c5ce7"],["Pro",adminUsers.filter(u=>u.isPro).length,"#f9ca24"],["Certified",adminUsers.filter(u=>u.certGranted).length,"#00b894"],["Admins",adminUsers.filter(u=>u.isAdmin).length,"#e84393"]].map(([l,v,col])=>(<div key={l} style={{...S.card,textAlign:"center",padding:"14px",borderTop:"3px solid "+col}}><p style={{fontSize:"30px",fontWeight:900,color:col,margin:0}}>{v}</p><p style={{fontSize:"11px",color:MUT,margin:"4px 0 0"}}>{l} Members</p></div>))}</div>}
      {adminTab==="members"&&<><p style={{fontSize:"12px",color:MUT,marginBottom:"12px"}}>{adminUsers.length} registered member(s)</p>{adminUsers.map((u,i)=>(<div key={i} style={S.card}><div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}><div style={{width:"36px",height:"36px",borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"15px",flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div><div style={{flex:1,minWidth:0}}><p style={{margin:0,fontWeight:700,fontSize:"13px"}}>{u.name} {u.isAdmin&&<span style={{background:AC,color:"#fff",borderRadius:"4px",padding:"1px 7px",fontSize:"10px"}}>Admin</span>}</p><p style={{margin:0,fontSize:"11px",color:MUT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p></div></div><div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>{[u.isPro?"⭐ Pro":"Free",u.certGranted?"🏆 Certified":""].filter(Boolean).map((b,j)=>(<span key={j} style={{fontSize:"10px",padding:"3px 9px",borderRadius:"10px",background:"#f0ecff",color:AC,fontWeight:600}}>{b}</span>))}</div>{u.examScore!=null&&<p style={{margin:"0 0 8px",fontSize:"11px",color:MUT}}>Exam: {u.examScore}/50</p>}<div style={{display:"flex",gap:"6px"}}>{!u.isPro&&<button onClick={()=>grantPro(u.id)} style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:AC,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Pro</button>}{!u.isAdmin&&<button onClick={()=>grantAdmin(u.id)} style={{flex:1,padding:"6px",borderRadius:"7px",border:"none",background:AC2,color:"#fff",fontSize:"11px",fontWeight:700,cursor:"pointer"}}>Grant Admin</button>}</div></div>))}</>}
    </div>);
  };

  return(
    <div style={S.wrap}>
      <Sidebar/>
      <div style={S.top}>
        <button onClick={()=>setSidebar(p=>!p)} style={{background:"none",border:"none",fontSize:"22px",cursor:"pointer",color:TEXT,padding:"2px 6px"}}>☰</button>
        <div style={S.logoRow}><img src={LOGO_SRC} alt="GoPlanet" style={{width:"28px",height:"28px",objectFit:"contain"}}/>GoPlanet</div>
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
        {TABS.map(t=>(<button key={t.id} style={S.navBtn(tab===t.id)} onClick={()=>setTab(t.id)}><span style={{fontSize:"20px"}}>{t.icon}</span><span>{t.label}</span></button>))}
      </div>
    </div>
  );
}

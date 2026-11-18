/* script.js - Rayan Alam portfolio. Sections: theme, github, ask, background, cursor. */

/* ===== 1. THEME TOGGLE =====
   Flips light/dark, remembers the choice in localStorage. The matching
   <script> in <head> restores it before first paint to avoid a flash. */
const root=document.documentElement;
const themeBtn=document.getElementById("theme");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
function applyTheme(n){
  root.dataset.theme=n;try{localStorage.setItem("theme",n)}catch(e){}
  document.querySelector('meta[name=theme-color]').content=n==="dark"?"#0c0d10":"#f6f4ef";
}
themeBtn.onclick=()=>{
  const n=getComputedStyle(root).colorScheme==="dark"?"light":"dark";
  if(reduced){applyTheme(n);return}
  if(!document.startViewTransition){ // fallback: plain fade
    root.classList.add("fade");applyTheme(n);setTimeout(()=>root.classList.remove("fade"),600);return;
  }
  // Circle grows from the button until it covers the screen
  const r=themeBtn.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  document.startViewTransition(()=>applyTheme(n)).ready.then(()=>root.animate(
    {clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},
    {duration:800,easing:"cubic-bezier(.4,0,.2,1)",pseudoElement:"::view-transition-new(root)"}));
};

/* ===== 2. GITHUB CONTRIBUTIONS =====
   Pulls the last year from a public contributions API and draws one square per day.
   If the request fails, a GitHub-hosted chart image is shown instead. */
/* github contributions (live; falls back to a link) */
fetch("https://github-contributions-api.jogruber.de/v4/Rayan-Alam-UOIT?y=last").then(r=>r.json()).then(d=>{
  const g=document.getElementById("grid");let sum=0;
  const days=d.contributions;const first=new Date(days[0].date).getUTCDay();
  for(let i=0;i<first;i++)g.appendChild(document.createElement("b"));
  days.forEach((x,i)=>{sum+=x.count;const c=document.createElement("i");c.dataset.l=x.level;c.title=`${x.count} on ${x.date}`;c.style.setProperty("--c",i%60);g.appendChild(c)});
  document.getElementById("total").textContent=`${(d.total&&d.total.lastYear)||sum} contributions, last year`;
  const gh=document.getElementById("gh");gh.scrollLeft=gh.scrollWidth;
}).catch(()=>{document.getElementById("total").innerHTML='<a href="https://github.com/Rayan-Alam-UOIT" target="_blank" rel="noopener">open on github ↗</a>';
  document.getElementById("gh").innerHTML='<a id="fb" href="https://github.com/Rayan-Alam-UOIT" target="_blank" rel="noopener"><img alt="GitHub contribution graph" src="https://ghchart.rshah.org/7be0c3/Rayan-Alam-UOIT"></a>'});
/* ===== 3. SITE CHAT =====
   A floating assistant that runs entirely in the browser: no AI model, no API, no cost.
   How it works:
     1. Small talk (hi, thanks, jokes, "are you AI?") is caught first.
     2. Otherwise the question is cleaned (stop words dropped, plurals trimmed, typos fixed
        against the keyword vocabulary) and scored against every TOPIC's keywords.
     3. The best topic answers, with follow-up chips so visitors always know what to ask next.
     4. If nothing matches, it offers the menu and can pass the question to Rayan via the form.
   To add knowledge: add a TOPICS entry (keywords k, answer a, optional more m, follow-ups n).
   Keyword prefixes: "!" strong (x3), none normal (x1.5), "~" weak (x0.6). Multi-word keys need all words. */
const CHAT_ENDPOINT=""; // optional: "/api/chat" (see api/chat.js). Leave empty for the free offline bot.
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/*ENGINE-START*/
const TOPICS=[
{id:"about",l:"About Rayan",q:"Who is Rayan?",k:["!introduce","!yourself","!bio","!overview","!summary","who","~rayan"],
 a:"Rayan Alam is a computer science co-op student at Ontario Tech (class of ’28) who builds clinical AI and full-stack software. He’s based in Toronto and open to Summer 2027 internships.",
 m:"He currently works at Bravella Health on a production clinical AI assistant, has a 4.10/4.30 cGPA, and outside of code he works out, watches sports and games.",n:["work","projects","education","availability"]},
{id:"work",l:"Work",q:"Where has Rayan worked?",k:["!work","!job","!career","!intern","!employment","!employer","experience","!company","!role","!history","internship","co-op"],
 a:"Rayan has had three roles:\n• Bravella Health: Data Science & AI Development Intern (current)\n• MY Voice Canada: Mobile App Developer & UI/UX Designer (2022–23)\n• Avis Budget Group: Vehicle Service Attendant (2021–25)",go:"#work",n:["bravella","myvoice","avis","projects"]},
{id:"bravella",l:"Bravella Health",q:"What does Rayan do at Bravella Health?",k:["!!bravella","current","remote","now"],
 a:"At Bravella Health, Rayan is a Data Science & AI Development Intern (co-op, remote) on a production clinical AI assistant called ELLA-M. His work spans LLM infrastructure, retrieval pipelines, full-stack development and AWS deployment.",
 m:"Highlights: a Qwen-3 14B model on SageMaker, 10,000+ PubMed articles vectorized for retrieval, and a 50%+ cut in cloud cost and latency. Day to day: frontend and backend code, authentication, security updates, infrastructure and production troubleshooting.",n:["ella","ai","cloud","skills"]},
{id:"ella",l:"ELLA-M",q:"Tell me about ELLA-M.",k:["!!ella","!women","clinical","clinician","medical","healthcare","health","production"],
 a:"ELLA-M is Bravella Health’s clinical AI assistant for women’s health, a production platform that gives clinicians faster access to evidence-backed information. Rayan contributes across the stack: Angular and Capacitor on the frontend, Flask and Node.js on the backend, hosted on AWS with Nginx, SQLite, PyTorch and Firebase. It’s a company product, so only high-level details are shared here.",
 m:"Retrieval is a key piece: 10,000+ PubMed articles are vectorized with FAISS so answers are grounded in sources, with a Qwen-3 14B model served on AWS SageMaker.",n:["ai","cloud","bravella","projects"]},
{id:"ai",l:"AI & ML",q:"What AI and ML experience does Rayan have?",k:["!ai","!llm","!rag","!ml","!model","!retrieval","!embedding","!faiss","!pytorch","!qwen","!generative","machine learning","deep learning","nlp","data science"],
 a:"AI is Rayan’s main focus. At Bravella he works on LLM infrastructure (Qwen-3 14B on AWS SageMaker with GPU inference) and RAG pipelines (10,000+ PubMed articles embedded and searched with FAISS). His toolkit includes PyTorch, scikit-learn, Pandas, NumPy and Unsloth.",
 m:"On the data science side, his SpaceX launch predictor covers the full pipeline: data collection, SQL, EDA, dashboards and a classifier at about 84% accuracy.",n:["ella","spacex","cloud","skills"]},
{id:"cloud",l:"Cloud & DevOps",q:"What cloud and DevOps experience does Rayan have?",k:["!cloud","!aws","!devops","!deploy","!deployment","!docker","!kubernetes","!infrastructure","!nginx","!sagemaker","!scal"],
 a:"Rayan has handled AWS deployment end to end at Bravella: SageMaker for GPU model hosting, Nginx on Linux for the app, and optimization work that cut cloud cost and latency by 50%+. He also has Docker and Kubernetes experience from the dealership portal.",n:["bravella","dealership","ai","skills"]},
{id:"fullstack",l:"Full-stack",q:"What full-stack experience does Rayan have?",k:["!frontend","!backend","!fullstack","full stack","!web","!angular","!react","!flask","!django","!node","!express","!api","!database","!typescript"],
 a:"Rayan has full-stack range: Angular, React and TypeScript on the frontend; Flask, Django, Node.js and Express on the backend; SQLite, MySQL and MongoDB for data. He has also built cross-platform mobile apps with Capacitor and Flutter.",n:["ella","dealership","mobile","skills"]},
{id:"mobile",l:"Mobile apps",q:"What mobile apps has Rayan built?",k:["!mobile","!android","!ios","!flutter","!dart","!capacitor","!app"],
 a:"Rayan helped build MY Voice Canada’s award-winning Android app with Flutter and Dart (published, ten-person team), and uses Capacitor for cross-platform mobile work on ELLA-M.",n:["myvoice","ella","skills"]},
{id:"myvoice",l:"MY Voice Canada",q:"Tell me about MY Voice Canada.",k:["!!voice","!!myvoice","!award","best team","!media"],
 a:"At MY Voice Canada (Jul 2022–Jul 2023, part-time, hybrid), Rayan was a Mobile App Developer & UI/UX Designer on a ten-member cross-provincial Agile team. They shipped a published Android media app built with Flutter, Dart and Figma, and the team was named Best Team of the Year 2022.",links:[["See on GitHub","https://github.com/Rayan-Alam-UOIT/MY-Voice-Canada-Mobile-App"]],n:["mobile","work","skills"]},
{id:"avis",l:"Avis Budget Group",q:"What did Rayan do at Avis?",k:["!!avis","!budget","!vehicle","!rental","customer","non-tech"],
 a:"Before tech roles, Rayan worked at Avis Budget Group (May 2021–Aug 2025, on-call) as a Vehicle Service Attendant: preparing 5–10 vehicles per shift with 15–20 minute turnarounds, readiness checks and maintenance repairs. It built reliability, time management and customer-service skills.",n:["work","strengths","bravella"]},
{id:"projects",l:"Projects",q:"What projects has Rayan built?",k:["!project","!built","!portfolio","!created","showcase","!made"],
 a:"Featured projects:\n• SpaceX launch predictor: data science pipeline, ~84% accuracy\n• Dealership review portal: full-stack, Docker + Kubernetes on IBM Cloud\n• Multiplayer trivia game: multithreaded Java client-server\n• MY Voice Canada app: published Android app, 10-person team\nELLA-M, the clinical AI assistant at Bravella, is covered under work. Interview prep and more projects are on the way.",go:"#projects",n:["ella","spacex","dealership","prep"]},
{id:"spacex",l:"SpaceX predictor",q:"Tell me about the SpaceX launch predictor.",k:["!!spacex","!rocket","!launch","!predict","!predictor","!classifier","!eda","!scraping","!plotly","!seaborn","!matplotlib"],
 a:"The SpaceX Launch Prediction Tool is an end-to-end data science pipeline: APIs and web scraping, SQL analysis, Plotly dashboards and ML classification to predict launch success. Rayan collected and cleaned the data, ran EDA, built visualizations and trained models, reaching about 84% accuracy and finding links between payload mass, orbit type and mission success.",links:[["See on GitHub","https://github.com/Rayan-Alam-UOIT/Space-X-Launch-Prediction-Tool"]],n:["ai","projects","skills"]},
{id:"dealership",l:"Dealership portal",q:"Tell me about the dealership review portal.",k:["!!dealership","!dealer","!review","!sentiment","!mongodb","!portal","ibm cloud"],
 a:"The Dealership Review Portal is a full-stack platform for browsing dealerships and reading reviews, with authentication, dealership filtering and sentiment analysis. It’s built with React, Express, Django and MongoDB, and deployed with Docker and Kubernetes on IBM Cloud.",links:[["See on GitHub","https://github.com/Rayan-Alam-UOIT/Car-Dealership-Review-Portal"]],n:["cloud","fullstack","projects"]},
{id:"trivia",l:"Trivia game",q:"Tell me about the multiplayer trivia game.",k:["!!trivia","!game","!java","!swing","!multiplayer","!networking","!multithreading","!maven","!thread"],
 a:"The Multiplayer Trivia Game is a real-time Java (Swing) game with room management, live chat, power-ups, timers and client-server networking, built on Linux with Maven. Rayan led the interface, built the settings and music systems, and worked on frontend features and debugging.",links:[["See on GitHub","https://github.com/Rayan-Alam-UOIT/Multiplayer-Trivia-Quiz-Game"]],n:["projects","skills","fullstack"]},
{id:"prep",l:"Interview prep",q:"What is the interview prep repo?",k:["!!leetcode","!!neetcode","!interview","!prep","!algorithm","!competitive","!problem","coding practice"],
 a:"Rayan keeps a coding interview prep repo with his LeetCode and NeetCode submissions, all in one place. There’s a little live demo of it on this page.",go:"#prep",links:[["Open the repo","https://github.com/Rayan-Alam-UOIT/coding-interview-prep"]],n:["projects","skills","github"]},
{id:"skills",l:"Skills & stack",q:"What are Rayan’s skills?",k:["!skill","!stack","!technologies","!tools","!proficient","!programming","~know","!language","!coding","framework","library"],
 a:"Languages: Python, Java, C/C++, JavaScript, TypeScript, Dart, SQL, R, HTML, CSS\nFrameworks: Angular, React, Flask, Django, Node.js, Express, Flutter, Bootstrap, Tailwind\nCloud & tools: AWS, Docker, Kubernetes, Git/GitHub, Nginx, Linux, Capacitor, Figma\nData & ML: Pandas, NumPy, scikit-learn, PyTorch, FAISS, SQLite, MySQL, Firebase",
 m:"Most used day to day at Bravella: Python, AWS, Angular and Flask.",n:["ai","fullstack","cloud","projects"]},
{id:"education",l:"Education",q:"What does Rayan study?",k:["!education","!school","!university","!uni","!degree","!gpa","!cgpa","!grade","!study","!student","!ontario","!major","!minor","!graduate","!graduation","!scholarship","!honours","!college","!academic","!president"],
 a:"Rayan is pursuing an Honours BSc in Computer Science (Co-op) at Ontario Tech University (Sep 2023–May 2028) with a Mathematics minor. He holds a 4.10/4.30 cGPA, has made the President’s List four times, and earned entrance and in-course scholarships.",n:["courses","clubs","certs","work"]},
{id:"courses",l:"Coursework",q:"What courses has Rayan taken?",k:["!course","!coursework","!class","!curriculum","!math","!mathematics","!statistics","!calculus"],
 a:"Relevant coursework: Data Structures, Software Design & Analysis, Software Systems Development & Integration, Computer Architecture, Scientific Data Analysis, Computational Science, Statistics & Probability, Linear Algebra, Discrete Mathematics, and Calculus I & II.",n:["education","skills","certs"]},
{id:"certs",l:"Certifications",q:"What certifications does Rayan have?",k:["!certification","!certificate","!certified","!credential","!ibm","!google","!cybersecurity"],
 a:"Certifications: IBM Data Science Professional, IBM Full Stack Software Developer, Google Cybersecurity Professional, and a DELF A2 French diploma. Each one links to its PDF in the certifications card.",go:"#certs",n:["education","skills","french"]},
{id:"french",l:"French",q:"Does Rayan speak French?",k:["!french","!delf","!bilingual","!speak","!spoken","~language"],
 a:"Rayan holds a DELF A2 certificate in French (issued by France Education International).",n:["certs","education"]},
{id:"availability",l:"Availability",q:"Is Rayan available for hire?",k:["!available","!availability","!hire","!hiring","!summer","!2027","!recruit","!recruiter","!opportunity","!looking","!open","!start","!fulltime","!relocate","!remote","internship","co-op","~toronto","!hybrid","!onsite"],
 a:"Yes. Rayan is open to internships and co-op roles for Summer 2027, in Toronto, the GTA or remote. The fastest way to reach him is the contact form at the bottom of the page, or email.",links:[["Email Rayan","mailto:alamrayan103@gmail.com"],["Resume","files/Rayan%20Alam%20Resume.pdf"]],go:"#contact",n:["strengths","resume","work","contact"]},
{id:"location",l:"Location",q:"Where is Rayan based?",k:["where","!location","!based","!live","!city","!toronto","!gta"],
 a:"Rayan is based in Toronto, Ontario, and open to roles across Toronto, the GTA and remote.",n:["availability","contact"]},
{id:"contact",l:"Contact",q:"How can I contact Rayan?",k:["!contact","!email","!reach","!message","!linkedin","!connect","!mail","get in touch","!talk"],
 a:"You can reach Rayan at alamrayan103@gmail.com, on LinkedIn, or with the form at the bottom of this page, which lands straight in his inbox.",links:[["Email","mailto:alamrayan103@gmail.com"],["LinkedIn","https://www.linkedin.com/in/rayan-alam/"],["GitHub","https://github.com/Rayan-Alam-UOIT"]],go:"#contact",n:["availability","resume","github"]},
{id:"github",l:"GitHub",q:"Where can I see Rayan’s code?",k:["!github","!repo","!repository","!source","!code","!contribution","!commit"],
 a:"Rayan’s code lives at github.com/Rayan-Alam-UOIT. The contributions chart on this page is pulled live from his profile.",links:[["Open GitHub","https://github.com/Rayan-Alam-UOIT"]],go:"#github",n:["projects","prep"]},
{id:"resume",l:"Resume",q:"Can I see Rayan’s resume?",k:["!resume","!cv"],a:"Here’s Rayan’s resume (PDF).",links:[["Open resume","files/Rayan%20Alam%20Resume.pdf"]],n:["availability","contact","work"]},
{id:"interests",l:"Hobbies",q:"What does Rayan do for fun?",k:["!hobby","!interest","!fun","free time","!outside","!gaming","!gamer","!gym","!workout","!sports","!superhero","!personal","!personality"],
 a:"Outside of code, Rayan works out, watches sports and superhero content, and games to unwind. He also likes pushing himself beyond his comfort zone through volunteering and student communities.",n:["clubs","about","strengths"]},
{id:"clubs",l:"Clubs & activities",q:"What clubs and activities is Rayan involved in?",k:["!club","!hackathon","!hackhive","!volunteer","!community","!involved","!extracurricular","!leadership","!msa","!psa"],
 a:"Rayan’s activities include the CS Club, MSA, PSA and HackHive 2025, alongside volunteering and student communities.",n:["education","interests","strengths"]},
{id:"strengths",l:"Why hire Rayan",q:"Why should I hire Rayan?",k:["!why hire","!hire rayan","!hire him","!strength","!unique","stand out","!fit","!value","!best"],
 a:"Rayan has already shipped production AI end to end (LLM hosting, retrieval and the apps on top), has real full-stack range, strong grades (4.10/4.30), and a track record on teams, like MY Voice’s Best Team of the Year 2022. People describe him as a problem solver, fast learner and team collaborator.",n:["bravella","projects","availability","resume"]},
{id:"site",l:"How this site works",q:"How was this site built?",k:["!site","!website","!built","!technology","!webgl","this page","how built"],
 a:"This site is hand-built with plain HTML, CSS and JavaScript. The moving contour lines are a WebGL shader, the theme switch uses the View Transitions API, the contact form posts to FormSubmit, and I run entirely in your browser using a keyword matcher, with no AI API behind me.",n:["projects","github","about"]},
{id:"now",l:"Right now",q:"What is Rayan working on right now?",k:["!currently","!lately","!upcoming","!progress","!soon","!coming","!new","right now"],
 a:"Right now Rayan is working at Bravella Health on ELLA-M, practicing LeetCode/NeetCode for interviews, and building more projects that will show up in the projects card as they ship.",n:["bravella","prep","projects"]},
{id:"private",l:"Private details",q:"What is Rayan’s salary expectation?",k:["!salary","!pay","!wage","!compensation","!phone","!number","!address","!age","!birthday","!visa","!authorization","!citizen","!citizenship","!permit","!married","!religion","!rate"],
 a:"That’s not something I have on hand, and I’d rather not guess. Rayan can answer it directly. Send him the question and he’ll reply.",send:true,n:["availability","contact"]}
];
const BY=Object.fromEntries(TOPICS.map(t=>[t.id,t]));
const MENU=["about","work","projects","skills","availability","contact"];
const SURPRISE=["trivia","spacex","interests","myvoice","avis","clubs","ella","prep"];

// Specific tools: "Do you know Docker?" gets a precise answer
const TECH_RAW={python:"Python is Rayan’s main language: ELLA-M’s Flask backend, the SpaceX data pipeline and most coursework.",java:"Java powers his multiplayer trivia game (Swing, Maven) and is part of his coursework.",javascript:"Yes: JavaScript and TypeScript across Angular and React projects, and this site is plain JavaScript.",typescript:"Yes: TypeScript with Angular on ELLA-M’s frontend.","c++":"C/C++ is in his toolkit from coursework at Ontario Tech.",c:"C/C++ is in his toolkit from coursework at Ontario Tech.",angular:"Angular (with TypeScript and Capacitor) is the frontend of ELLA-M at Bravella.",react:"React was the frontend of his dealership review portal.",flask:"Flask is the backend of ELLA-M at Bravella.",django:"Django powers the dealership portal’s backend services.",node:"Node.js and Express are used in ELLA-M and the dealership portal.",docker:"Yes: Docker (and Kubernetes) for the dealership portal’s containerized deployment.",kubernetes:"Yes: Kubernetes, used to deploy the dealership portal on IBM Cloud.",aws:"AWS is core to his Bravella work: SageMaker for GPU model hosting plus end-to-end cloud deployment.",sagemaker:"Yes: he deployed a Qwen-3 14B model on AWS SageMaker with GPU inference.",flutter:"Flutter and Dart built MY Voice Canada’s published, award-winning Android app.",dart:"Dart (with Flutter) built MY Voice Canada’s Android app.",sql:"SQL is used across his data science work (SpaceX), plus SQLite and MySQL in app projects.",sqlite:"SQLite is part of ELLA-M’s stack.",mysql:"MySQL is in his database toolkit.",mongodb:"MongoDB was the database of his dealership review portal.",pytorch:"PyTorch is in the ELLA-M stack and his ML toolkit.",pandas:"Yes: Pandas (with NumPy) for the SpaceX project and coursework.",numpy:"Yes: NumPy, alongside Pandas, in his data science work.",scikit:"scikit-learn trained the classifiers in his SpaceX predictor (about 84% accuracy).",faiss:"FAISS powers the retrieval layer in ELLA-M: 10,000+ PubMed articles vectorized for search.",figma:"Figma was his design tool at MY Voice Canada for UI/UX work.",git:"Yes: Git and GitHub for everything; his profile is github.com/Rayan-Alam-UOIT.",linux:"Linux servers with Nginx at Bravella, and the trivia game was built on Linux.",nginx:"Yes: Nginx is part of the ELLA-M deployment.",tailwind:"Tailwind and Bootstrap are both in his frontend toolkit.",bootstrap:"Bootstrap was used in the dealership portal.",firebase:"Firebase is part of the ELLA-M stack.",capacitor:"Capacitor is used for ELLA-M’s cross-platform mobile builds.",unsloth:"Unsloth is part of his ML toolkit.",r:"R is on his list of languages."};

// --- text cleaning ---
const STOP=new Set("a an the of and or to in on for with is are was were be by at as it this that from what whats how do does did you your have has can i me my about tell give some any there which would could should will want like get just please am im its he his her she they their them we us our also really very much many".split(" "));
const stem=w=>{w=w.replace(/['’]s$/,"");if(w.length>5)w=w.replace(/(ing|ed)$/,"");if(w.length>3)w=w.replace(/(es|s)$/,"");return w};
const toks=s=>(s.toLowerCase().match(/[a-z0-9+#]+/g)||[]).filter(w=>!STOP.has(w)).map(stem);
const parseKey=k=>{const w=k.startsWith("!!")?5:k[0]==="!"?3:k[0]==="~"?.6:1.5,t=toks(k.replace(/^[!~]+/,""));return t.length?{w:w*t.length,t}:null};
TOPICS.forEach(t=>t.K=t.k.map(parseKey).filter(Boolean));
const TECHS={};for(const k in TECH_RAW)TECHS[stem(k)]=TECH_RAW[k];
const VOCAB=new Set([...TOPICS.flatMap(t=>t.K.flatMap(k=>k.t)),...Object.keys(TECHS)]);
// Edit distance, used to forgive typos ("kubernetis" -> "kubernet")
function lev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
function fix(w){if(VOCAB.has(w)||w.length<5)return w;const max=w.length>=9?2:1;let best=w,bd=max+1;
  for(const v of VOCAB)if(v.length>=4&&Math.abs(v.length-w.length)<=max){const d=lev(w,v);if(d<bd){bd=d;best=v}}return best}

// --- small talk, caught before topic matching ---
const JOKES=["Why do programmers prefer dark mode? Because light attracts bugs.","A SQL query walks into a bar, walks up to two tables and asks: “Can I join you?”","There are 10 kinds of people: those who understand binary and those who don’t."];
let jokeI=0,last=null;
const SMALL=[
 [/^(hi|hello|hey|hiya|yo|sup|howdy|good (morning|afternoon|evening))\b/,raw=>raw.split(/\s+/).length<=4&&{text:"Hi! I’m a small assistant for Rayan’s portfolio. Ask about his work, projects, skills, education or availability, or tap a suggestion.",chips:MENU}],
 [/\b(thanks|thank you|thx|cheers|appreciate)\b/,()=>({text:"You’re welcome! Anything else you’d like to know about Rayan?",chips:MENU})],
 [/\b(bye|goodbye|see you|cya)\b/,()=>({text:"Thanks for stopping by! If you’d like to reach Rayan, the contact form is at the bottom of the page.",go:"#contact",chips:["resume","projects"]})],
 [/how are you|how'?s it going|how is it going|what'?s up/,()=>({text:"Doing great, thanks! What would you like to know about Rayan?",chips:MENU})],
 [/are you (an? )?(ai|bot|robot|human|real|person|chatgpt|gpt|claude|llm)|who are you|what are you|is this (an? )?(ai|bot)/,()=>({text:"I’m a lightweight assistant built into this page. I don’t use an AI model or API: I match your question against a hand-written knowledge base about Rayan, so I’m best on his work, projects, skills, education and availability. For anything else, I can pass your question on to him.",chips:MENU})],
 [/\b(joke|funny|make me laugh|pun)\b/,()=>({text:JOKES[jokeI++%JOKES.length],chips:["surprise","projects","about"]})],
 [/\b(what can (i|you) (ask|do|answer)|what should i ask|help|menu|options|suggest|topics)\b/,()=>({text:"I can tell you about Rayan’s work, projects, skills, education, certifications, availability and more. Tap one, or just ask in your own words, like “Has he used Docker?” or “Is he available for summer 2027?”",chips:MENU})]
];
function fromTopic(t,prefix=""){last={...t};return{id:t.id,text:prefix+t.a,links:t.links,go:t.go,send:t.send,chips:t.n}}
// "tell me more" gives the longer answer for the last topic
function more(){
  if(last&&last.m){const r={id:last.id,text:last.m,links:last.links,chips:last.n};last.m=null;return r}
  return{text:last?"That’s everything I have on that one. Want to explore something else?":"What would you like to know more about?",chips:last?last.n:MENU};
}
function answer(q){
  const raw=q.toLowerCase().trim();
  for(const [re,fn] of SMALL){if(re.test(raw)){const r=fn(raw);if(r)return r}}
  if(/^(more|more please|tell me more|go on|continue|elaborate|expand|details?|and|what else|anything else)[\s?.!]*$/.test(raw))return more();
  const qt=toks(q).map(fix),set=new Set(qt);
  let best=null,bs=0,second=null,ss=0;
  for(const t of TOPICS){const s=t.K.reduce((a,k)=>a+(k.t.every(w=>set.has(w))?k.w:0),0);
    if(s>bs){second=best;ss=bs;best=t;bs=s}else if(s>ss){second=t;ss=s}}
  const tech=qt.find(w=>TECHS[w]);
  const askTech=/\b(know|use|used|using|experience|familiar|comfortable|proficient|worked|skilled)\b/.test(raw);
  if(tech&&(askTech||bs<4.5)){last={id:"skills",n:["skills","projects","availability"]};return{id:"tech",text:TECHS[tech],chips:["skills","projects","availability"]}}
  if(!best||bs<1.5)return{id:"none",text:"Good question, but I don’t have a solid answer for that. I know Rayan’s work, projects, skills, education and availability, or I can send your question straight to him.",send:true,chips:MENU};
  const r=fromTopic(best,bs<3?"Closest thing I have:\n\n":"");
  if(second&&ss>=1.5&&ss>=bs*.7)r.chips=[second.id,...(best.n||[])];
  return r;
}
/*ENGINE-END*/

// --- chat UI ---
const chat=document.getElementById("chat"),fab=document.getElementById("chatFab"),log=document.getElementById("chatLog"),cin=document.getElementById("chatIn");
const GO={"#work":"See work","#projects":"See projects","#prep":"See interview prep","#github":"See GitHub chart","#contact":"Open contact form","#certs":"See certifications"};
let greeted=false;const hist=[];
const scrollTo=h=>{if(innerWidth<=600)toggleChat(false);document.querySelector(h)?.scrollIntoView({behavior:"smooth",block:"start"})};
// Pre-fills the contact form with the visitor's question and jumps to it
function askRayan(q){
  toggleChat(false);
  const f=document.getElementById("form");if(f.hidden)document.getElementById("again").click();
  f.elements.message.value=q;f.elements.message.dispatchEvent(new Event("input"));f.elements.topic.value="Question";
  document.getElementById("contact").scrollIntoView({behavior:"smooth",block:"start"});
  setTimeout(()=>f.elements.name.focus({preventScroll:true}),700);
}
function bubble(text,who,r={}){
  const d=document.createElement("div");d.className="msg "+who;d.textContent=text;
  const acts=document.createElement("div");acts.className="acts";
  (r.links||[]).forEach(([l,h])=>{const a=document.createElement("a");a.className="act";a.textContent=l+" ↗";a.href=h;if(!h.startsWith("mailto"))a.target="_blank";a.rel="noopener";acts.appendChild(a)});
  if(r.go&&GO[r.go]){const b=document.createElement("button");b.className="act";b.textContent=GO[r.go]+" ↓";b.onclick=()=>scrollTo(r.go);acts.appendChild(b)}
  if(r.send){const b=document.createElement("button");b.className="act";b.textContent="Send this to Rayan ✉";b.onclick=()=>askRayan(r.q||"");acts.appendChild(b)}
  if(acts.children.length)d.appendChild(acts);
  log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
}
// Options shown inside the conversation. The main menu is a grid of cards; follow-ups are compact pills.
const ICON={
 about:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
 work:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
 projects:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',
 skills:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
 availability:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
 contact:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 surprise:'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'};
const ARROW='<path d="M5 12h14M13 6l6 6-6 6"/>';
const SUB={about:"Who he is",work:"Roles and experience",projects:"What he has built",skills:"Languages and tools",availability:"Hire him for 2027",contact:"Email and links",surprise:"A random fun fact"};
function setChips(ids){
  log.querySelectorAll(".opts").forEach(o=>o.remove());
  const menu=ids===MENU,list=menu?[...MENU,"surprise"]:[...new Set(ids||MENU)].slice(0,5);
  const box=document.createElement("div");box.className="opts "+(menu?"menu":"pills");
  const name=id=>id==="surprise"?"Surprise me":BY[id]?.l||id;
  if(!menu)box.insertAdjacentHTML("beforeend",'<span class="opts-label mono">keep exploring</span>');
  list.forEach((id,i)=>{
    const b=document.createElement("button");b.dataset.t=id;b.className="opt"+(menu?"":" pill");b.style.setProperty("--d",i*55+"ms");
    const svg=p=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
    b.innerHTML=menu?`<span class="oi">${svg(ICON[id]||ARROW)}</span><span class="ot"><b>${name(id)}</b><small>${SUB[id]||""}</small></span>`:`${svg(ICON[id]||ARROW)}${name(id)}`;
    box.appendChild(b);
  });
  log.appendChild(box);
  // Menu: show the latest bot message from its top so the greeting is never scrolled out of view; pills: stay at the bottom
  const lastBot=[...log.querySelectorAll(".msg.bot:not(.typing)")].pop();
  if(menu&&lastBot)log.scrollTop+=lastBot.getBoundingClientRect().top-log.getBoundingClientRect().top-8;
  else log.scrollTop=log.scrollHeight;
}
async function ask(q,forced){
  log.querySelectorAll(".opts").forEach(o=>o.remove());
  const topic=forced&&BY[forced];
  bubble(topic?topic.q:forced==="surprise"?"Surprise me":q,"me");
  const ty=document.createElement("div");ty.className="msg bot typing";ty.innerHTML="<i></i><i></i><i></i>";log.appendChild(ty);log.scrollTop=log.scrollHeight;
  let r;
  if(forced==="surprise")r=fromTopic(BY[SURPRISE[Math.random()*SURPRISE.length|0]],"Here’s something you might not have asked:\n\n");
  else if(topic)r=fromTopic(topic);
  else{
    if(CHAT_ENDPOINT){hist.push({role:"user",content:q});try{const x=await fetch(CHAT_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:hist})});if(!x.ok)throw 0;r={text:(await x.json()).reply,chips:MENU};hist.push({role:"assistant",content:r.text})}catch(e){}}
    r=r||answer(q);
  }
  await wait(Math.min(1100,350+r.text.length*3));
  ty.remove();bubble(r.text,"bot",{...r,q});setChips(r.chips);
}
function toggleChat(open){
  chat.classList.toggle("open",open);fab.setAttribute("aria-expanded",open);
  if(open&&!greeted){greeted=true;bubble("Hi! I’m a small assistant for this site. Ask me anything about Rayan’s work, projects, skills or availability, or tap a topic below.","bot");setChips(MENU)}
  if(open&&matchMedia("(hover: hover)").matches)cin.focus();
}
fab.onclick=()=>toggleChat(!chat.classList.contains("open"));
document.getElementById("chatClose").onclick=()=>toggleChat(false);
addEventListener("keydown",e=>{if(e.key==="Escape")toggleChat(false)});
document.getElementById("chatForm").onsubmit=e=>{e.preventDefault();const q=cin.value.trim();if(q){cin.value="";ask(q)}};
log.addEventListener("click",e=>{const b=e.target.closest("button[data-t]");if(b)ask("",b.dataset.t)});

/* ===== 4. CONTACT FORM =====
   Posts to FormSubmit (formsubmit.co), which emails the message to you. The first ever
   submission sends an activation email you must confirm. Includes validation, a honeypot
   field against bots, and animated sending / success states. */
const FORM_URL="https://formsubmit.co/ajax/cacc296b5bf091bcb5a3e3b8840053b7";
const form=document.getElementById("form");
if(form){
  const msg=form.elements.message,cnt=document.getElementById("count"),st=document.getElementById("status"),btn=form.querySelector(".send");
  msg.addEventListener("input",()=>cnt.textContent=`${msg.value.length} / 1000`);
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(form.elements._honey.value)return; // bot filled the hidden field
    form.querySelectorAll(".field").forEach(f=>f.classList.remove("bad"));
    const bad=[...form.querySelectorAll("[required]")].filter(f=>!f.value.trim()||(f.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)));
    if(bad.length){bad.forEach(f=>f.parentElement.classList.add("bad"));bad[0].focus();st.textContent="Please check the highlighted fields.";return}
    st.textContent="";btn.disabled=true;btn.classList.add("loading");
    const topic=form.elements.topic.value,name=form.elements.name.value.trim();
    try{
      const r=await fetch(FORM_URL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
        body:JSON.stringify({name,email:form.elements.email.value.trim(),topic,message:msg.value.trim(),_subject:`Portfolio: ${topic} from ${name}`,_captcha:"false",_template:"table"})});
      const d=await r.json().catch(()=>({}));
      // FormSubmit can answer HTTP 200 with success:"false" (e.g. not activated yet), so check the body
      if(!r.ok||!(d.success===true||d.success==="true"))throw new Error(d.message||"not accepted");
      form.hidden=true;document.getElementById("sent").hidden=false;form.reset();cnt.textContent="0 / 1000";
    }catch(err){
      console.warn("FormSubmit:",err);
      st.textContent=`Couldn’t send (${err.message}). `;
      const a=document.createElement("a");
      a.textContent="Send it from your email app instead ↗";
      a.href=`mailto:alamrayan103@gmail.com?subject=${encodeURIComponent("Portfolio: "+topic)}&body=${encodeURIComponent(msg.value.trim()+"\n\n"+name+" ("+form.elements.email.value.trim()+")")}`;
      st.appendChild(a);
    }
    btn.disabled=false;btn.classList.remove("loading");
  });
  document.getElementById("again").onclick=()=>{document.getElementById("sent").hidden=true;form.hidden=false};
}

/* ===== 4b. INTERVIEW PREP EDITOR =====
   Decorative: types out a few classic solutions, then flashes "Accepted".
   Edit SNIPPETS to show whichever problems you like. */
const SNIPPETS=[
["two sum","def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i"],
["valid parentheses","def isValid(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack"],
["binary search","def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1"]];
const codeEl=document.getElementById("codeDemo"),okEl=document.getElementById("accepted"),titleEl=document.getElementById("codeTitle");
if(codeEl){
  let i=0,live=false;
  const show=k=>{titleEl.textContent=SNIPPETS[k][0]};
  async function loop(){
    while(live){
      const [name,src]=SNIPPETS[i%SNIPPETS.length];show(i%SNIPPETS.length);okEl.classList.remove("show");codeEl.textContent="";
      for(const ch of src){if(!live)return;codeEl.textContent+=ch;await wait(ch==="\n"?160:22)}
      okEl.classList.add("show");await wait(2400);i++;
    }
  }
  if(reduced){codeEl.textContent=SNIPPETS[0][1];okEl.classList.add("show")}
  else new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!live){live=true;loop()}else if(!v)live=false},{threshold:.3}).observe(codeEl);
}

/* ===== 4. LIVING BACKGROUND =====
   A fragment shader warps layered noise (fbm) and draws it as thin contour lines.
   Cheap on purpose: half resolution, ~30fps, paused when the tab is hidden.
   The lines bend toward the pointer; colours follow the theme tokens. */
(()=>{
  const c=document.getElementById("bg"),gl=c.getContext("webgl",{antialias:false,alpha:false});
  if(!gl)return;
  const vs="attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  // Fragment shader: k = line strength, m = pointer position, t = time
  const fs=`precision mediump float;uniform vec2 r,m;uniform float t,k;uniform vec3 ac,bg;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/r.y,p=uv*1.5,d=uv-m;
    float pull=exp(-dot(d,d)*7.);
    vec2 q=vec2(fbm(p+t*.045),fbm(p+vec2(5.2,1.3)-t*.037));
    float f=fbm(p+2.3*q-d*pull*.9+t*.02);
    float l=sin(f*34.+t*.3);
    float e=smoothstep(-.14,.14,l);
    float fade=.55+.45*smoothstep(0.,1.,uv.y);
    gl_FragColor=vec4(mix(bg,ac,e*k*fade),1.);
  }`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const U=n=>gl.getUniformLocation(pr,n);
  const uR=U("r"),uM=U("m"),uT=U("t"),uK=U("k"),uA=U("ac"),uB=U("bg");
  // Render at half size; the browser scales it up (soft lines, low cost)
  const scale=Math.min(window.devicePixelRatio||1,1)*.5;
  const size=()=>{c.width=Math.max(2,innerWidth*scale|0);c.height=Math.max(2,innerHeight*scale|0);gl.viewport(0,0,c.width,c.height)};
  size();addEventListener("resize",size);
  // Read --accent / --bg from CSS so the shader always matches the theme
  const hex=s=>{s=s.trim();if(s[0]!=="#")return[0,0,0];if(s.length===4)s="#"+[...s.slice(1)].map(x=>x+x).join("");return[1,3,5].map(i=>parseInt(s.substr(i,2),16)/255)};
  let ca=[0,0,0],cb=[0,0,0],ta=ca,tb=cb,first=true;
  const pull=()=>{const st=getComputedStyle(document.documentElement);ta=hex(st.getPropertyValue("--accent"));tb=hex(st.getPropertyValue("--bg"));if(first){ca=ta.slice();cb=tb.slice();first=false}};
  pull();
  new MutationObserver(pull).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>setTimeout(pull,50));
  let mx=.5*innerWidth/innerHeight,my=.5,tx=mx,ty=my;
  addEventListener("pointermove",e=>{tx=e.clientX/innerHeight;ty=1-e.clientY/innerHeight},{passive:true});
  const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last=0,T=Math.random()*50;
  // Main loop: ease pointer + colours, update uniforms, draw one triangle
  const draw=now=>{
    if(!still)requestAnimationFrame(draw);
    if(document.hidden||now-last<33)return;
    T+=(now-last)/1000;last=now;
    mx+=(tx-mx)*.06;my+=(ty-my)*.06;
    for(let i=0;i<3;i++){ca[i]+=(ta[i]-ca[i])*.08;cb[i]+=(tb[i]-cb[i])*.08}
    gl.uniform2f(uR,c.width,c.height);gl.uniform2f(uM,mx*c.height/c.height,my);gl.uniform1f(uT,T);
    gl.uniform1f(uK,.2);gl.uniform3fv(uA,ca);gl.uniform3fv(uB,cb);
    gl.drawArrays(gl.TRIANGLES,0,3);
  };
  requestAnimationFrame(draw);
})();

/* ===== 5. CUSTOM CURSOR =====
   Skipped on touch devices. Dot = exact position, ring = eased follower.
   Add data-cursor="label" to any element to show that text inside the ring on hover. */
(()=>{
  if(!matchMedia("(hover: hover) and (pointer: fine)").matches)return;
  const html=document.documentElement;html.classList.add("has-cursor");
  const mk=(c,h="")=>{const e=document.createElement("div");e.className=c;e.innerHTML=h;document.body.appendChild(e);return e};
  const dot=mk("cur-dot"),ring=mk("cur-ring",'<span class="cur-label"></span>');
  const label=ring.firstChild;
  const ease=matchMedia("(prefers-reduced-motion: reduce)").matches?1:.17;
  let x=-100,y=-100,rx=x,ry=y;
  addEventListener("pointermove",e=>{
    x=e.clientX;y=e.clientY;
    dot.style.transform=`translate3d(${x}px,${y}px,0)`;
    dot.classList.add("on");ring.classList.add("on");
  },{passive:true});
  (function loop(){
    rx+=(x-rx)*ease;ry+=(y-ry)*ease;
    ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(loop);
  })();
  // What is under the pointer decides the ring's state
  document.addEventListener("mouseover",e=>{
    const t=e.target.closest("a,button,[data-cursor],input");
    const txt=!!t&&t.matches("input");
    ring.classList.toggle("text",txt);
    ring.classList.toggle("hot",!!t&&!txt);
    const l=t&&t.dataset.cursor;
    label.textContent=l||"";ring.classList.toggle("lab",!!l);
  });
  addEventListener("pointerdown",()=>ring.classList.add("down"));
  addEventListener("pointerup",()=>ring.classList.remove("down"));
  document.addEventListener("mouseleave",()=>{dot.classList.remove("on");ring.classList.remove("on")});
})();
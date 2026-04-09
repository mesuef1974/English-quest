import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════ AUDIO ENGINE ═══════════════════════ */
let _ctx = null;
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function playTone(freq, duration, type = "sine", vol = 0.3, delay = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// ✅ Correct — happy ascending chime
function sfxCorrect() {
  playTone(523, 0.12, "sine", 0.25, 0);      // C5
  playTone(659, 0.12, "sine", 0.25, 0.1);     // E5
  playTone(784, 0.18, "sine", 0.3, 0.2);      // G5
  playTone(1047, 0.25, "sine", 0.2, 0.3);     // C6
}

// ❌ Wrong — gentle descending buzz
function sfxWrong() {
  playTone(350, 0.15, "square", 0.12, 0);
  playTone(280, 0.2, "square", 0.1, 0.12);
  playTone(220, 0.3, "sawtooth", 0.08, 0.25);
}

// ⭐ Star earned — sparkle
function sfxStar() {
  playTone(880, 0.08, "sine", 0.2, 0);
  playTone(1108, 0.08, "sine", 0.2, 0.07);
  playTone(1318, 0.08, "sine", 0.2, 0.14);
  playTone(1760, 0.15, "sine", 0.25, 0.21);
}

// 🔗 Match — soft click
function sfxMatch() {
  playTone(660, 0.06, "sine", 0.2, 0);
  playTone(880, 0.1, "sine", 0.25, 0.06);
}

// 🏆 Victory fanfare
function sfxVictory() {
  playTone(523, 0.15, "sine", 0.2, 0);
  playTone(659, 0.15, "sine", 0.2, 0.15);
  playTone(784, 0.15, "sine", 0.2, 0.3);
  playTone(1047, 0.3, "sine", 0.3, 0.45);
  playTone(784, 0.1, "sine", 0.15, 0.65);
  playTone(1047, 0.4, "sine", 0.3, 0.75);
}

// 🎉 Perfect score mega fanfare
function sfxPerfect() {
  sfxVictory();
  setTimeout(() => {
    playTone(1318, 0.12, "sine", 0.2, 0);
    playTone(1568, 0.12, "sine", 0.2, 0.1);
    playTone(2093, 0.35, "sine", 0.25, 0.2);
  }, 900);
}

// 👆 Button tap
function sfxTap() {
  playTone(600, 0.04, "sine", 0.1, 0);
}

/* ═══════════════════════ SPEECH ENGINE ═══════════════════════ */
function speak(text, lang = "en-US", rate = 0.85) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate; u.pitch = lang === "ar-SA" ? 1.0 : 1.05; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith(lang.split("-")[0]) && v.localService) || voices.find(v => v.lang.startsWith(lang.split("-")[0]));
    if (v) u.voice = v;
    u.onend = resolve; u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}
function speakEn(t) { return speak(t, "en-US", 0.82); }
function speakAr(t) { return speak(t, "ar-SA", 0.85); }
async function speakBoth(ar, en) { await speakAr(ar); await new Promise(r => setTimeout(r, 350)); await speakEn(en); }

function SpeakerBtn({ text, lang, size = 28, color = "#555", style: xs = {} }) {
  const [p, setP] = useState(false);
  const h = async (e) => { e.stopPropagation(); setP(true); sfxTap(); await speak(text, lang); setP(false); };
  return <button onClick={h} style={{ background: "none", border: "none", cursor: "pointer", fontSize: size, padding: 4, opacity: p ? 1 : 0.6, transition: "all .2s", transform: p ? "scale(1.25)" : "scale(1)", filter: p ? `drop-shadow(0 0 6px ${color})` : "none", ...xs }}>{p ? "🔊" : "🔈"}</button>;
}

function DualSpeaker({ ar, en, color }) {
  return <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 8 }}>
    <SpeakerBtn text={ar} lang="ar-SA" size={22} color={color} />
    <span style={{ fontSize: 11, color: "#ccc" }}>|</span>
    <SpeakerBtn text={en} lang="en-US" size={22} color={color} />
  </div>;
}

/* ═══════════════════════ DATA ═══════════════════════ */
const CATEGORIES = [
  { id: "animals", nameAr: "الحيوانات", nameEn: "Animals", emoji: "🦁", color: "#FF6B35",
    words: [{ en: "Lion", ar: "أسد", emoji: "🦁" },{ en: "Elephant", ar: "فيل", emoji: "🐘" },{ en: "Rabbit", ar: "أرنب", emoji: "🐇" },{ en: "Dolphin", ar: "دلفين", emoji: "🐬" },{ en: "Eagle", ar: "نسر", emoji: "🦅" },{ en: "Butterfly", ar: "فراشة", emoji: "🦋" },{ en: "Turtle", ar: "سلحفاة", emoji: "🐢" },{ en: "Penguin", ar: "بطريق", emoji: "🐧" }] },
  { id: "food", nameAr: "الطعام", nameEn: "Food", emoji: "🍕", color: "#E63946",
    words: [{ en: "Apple", ar: "تفاحة", emoji: "🍎" },{ en: "Bread", ar: "خبز", emoji: "🍞" },{ en: "Cheese", ar: "جبن", emoji: "🧀" },{ en: "Rice", ar: "أرز", emoji: "🍚" },{ en: "Orange", ar: "برتقال", emoji: "🍊" },{ en: "Cake", ar: "كعكة", emoji: "🎂" },{ en: "Banana", ar: "موز", emoji: "🍌" },{ en: "Chicken", ar: "دجاج", emoji: "🍗" }] },
  { id: "colors", nameAr: "الألوان", nameEn: "Colors", emoji: "🎨", color: "#7B2D8E",
    words: [{ en: "Red", ar: "أحمر", emoji: "🔴" },{ en: "Blue", ar: "أزرق", emoji: "🔵" },{ en: "Green", ar: "أخضر", emoji: "🟢" },{ en: "Yellow", ar: "أصفر", emoji: "🟡" },{ en: "Purple", ar: "بنفسجي", emoji: "🟣" },{ en: "Orange", ar: "برتقالي", emoji: "🟠" },{ en: "White", ar: "أبيض", emoji: "⚪" },{ en: "Black", ar: "أسود", emoji: "⚫" }] },
  { id: "body", nameAr: "جسم الإنسان", nameEn: "Body", emoji: "🧍", color: "#2A9D8F",
    words: [{ en: "Head", ar: "رأس", emoji: "🗣️" },{ en: "Hand", ar: "يد", emoji: "✋" },{ en: "Eye", ar: "عين", emoji: "👁️" },{ en: "Ear", ar: "أذن", emoji: "👂" },{ en: "Nose", ar: "أنف", emoji: "👃" },{ en: "Foot", ar: "قدم", emoji: "🦶" },{ en: "Heart", ar: "قلب", emoji: "❤️" },{ en: "Mouth", ar: "فم", emoji: "👄" }] },
  { id: "school", nameAr: "المدرسة", nameEn: "School", emoji: "🏫", color: "#264653",
    words: [{ en: "Book", ar: "كتاب", emoji: "📖" },{ en: "Pen", ar: "قلم", emoji: "🖊️" },{ en: "Teacher", ar: "معلم", emoji: "👨‍🏫" },{ en: "Student", ar: "طالب", emoji: "👨‍🎓" },{ en: "Desk", ar: "مكتب", emoji: "🪑" },{ en: "Clock", ar: "ساعة", emoji: "🕐" },{ en: "Board", ar: "سبورة", emoji: "📋" },{ en: "Bag", ar: "حقيبة", emoji: "🎒" }] },
  { id: "nature", nameAr: "الطبيعة", nameEn: "Nature", emoji: "🌳", color: "#386641",
    words: [{ en: "Sun", ar: "شمس", emoji: "☀️" },{ en: "Moon", ar: "قمر", emoji: "🌙" },{ en: "Star", ar: "نجمة", emoji: "⭐" },{ en: "Tree", ar: "شجرة", emoji: "🌳" },{ en: "Flower", ar: "زهرة", emoji: "🌸" },{ en: "Rain", ar: "مطر", emoji: "🌧️" },{ en: "Cloud", ar: "سحابة", emoji: "☁️" },{ en: "Mountain", ar: "جبل", emoji: "🏔️" }] },
];

const GAME_MODES = [
  { id: "quiz", nameAr: "اختبار الكلمات", emoji: "🧠", desc: "اختر الترجمة الصحيحة — مع نطق + تعزيز صوتي" },
  { id: "match", nameAr: "لعبة التوصيل", emoji: "🔗", desc: "وصّل الكلمة بمعناها — اضغط لتسمع" },
  { id: "spell", nameAr: "تهجئة الكلمات", emoji: "✏️", desc: "استمع واكتب الكلمة بالإنجليزية" },
  { id: "listen", nameAr: "استمع واختر", emoji: "👂", desc: "استمع للنطق الإنجليزي واختر المعنى" },
];

function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

function Confetti({ active }) {
  if (!active) return null;
  return <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:9999 }}>
    {Array.from({length:35},(_,i) => <div key={i} style={{
      position:"absolute",left:`${Math.random()*100}%`,top:"-10px",
      width:6+Math.random()*10,height:6+Math.random()*10,
      backgroundColor:["#FF6B35","#E63946","#7B2D8E","#2A9D8F","#FFD166","#06D6A0","#FF69B4"][i%7],
      borderRadius:Math.random()>.5?"50%":"2px",
      animation:`confettiFall ${1+Math.random()*1.5}s ease-in ${Math.random()*.5}s forwards`,
    }} />)}
  </div>;
}

function StarRating({ score, total }) {
  const pct=total>0?score/total:0;
  const stars=pct>=.9?3:pct>=.6?2:pct>=.3?1:0;
  return <div style={{fontSize:42,letterSpacing:8}}>{[1,2,3].map(s=><span key={s} style={{opacity:s<=stars?1:.2,transition:"all .3s",transform:s<=stars?"scale(1)":"scale(0.8)",display:"inline-block"}}>⭐</span>)}</div>;
}

/* feedback banner component */
function FeedbackBanner({ type, correctEn, correctAr, catColor }) {
  if (!type) return null;
  const isOk = type === "correct";
  return (
    <div style={{
      marginTop: 14, padding: "14px 16px", borderRadius: 14,
      background: isOk
        ? "linear-gradient(135deg, #d4edda, #c3e6cb)"
        : "linear-gradient(135deg, #fff3cd, #ffeeba)",
      border: `2px solid ${isOk ? "#28a74540" : "#ffc10740"}`,
      fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      animation: "slideUp .25s ease-out",
    }}>
      {isOk ? (
        <span style={{ fontWeight: 700 }}>🎉 أحسنت! إجابة صحيحة!</span>
      ) : (
        <>
          <span>❌</span>
          <span>الصواب:</span>
          <strong style={{ fontFamily: "'Fredoka'", color: "#856404" }}>{correctEn}</strong>
          {correctAr && <span style={{ color: "#888" }}>({correctAr})</span>}
          <SpeakerBtn text={correctEn} lang="en-US" size={18} color="#856404" />
        </>
      )}
    </div>
  );
}

/* ═══════════════════ QUIZ ═══════════════════ */
function QuizGame({ words, onFinish, cc }) {
  const [qi,setQi]=useState(0);const [sc,setSc]=useState(0);const [sel,setSel]=useState(null);
  const [opts,setOpts]=useState([]);const [nxt,setNxt]=useState(false);
  const mk=useCallback(i=>{const c=words[i];return shuffle([c,...shuffle(words.filter(w=>w.en!==c.en)).slice(0,3)]);}, [words]);
  useEffect(()=>{setOpts(mk(qi));setSel(null);setNxt(false);setTimeout(()=>speakAr(words[qi].ar),300);},[qi,mk,words]);

  const pick = async(o)=>{
    if(sel)return; sfxTap(); setSel(o.en);
    const ok=o.en===words[qi].en;
    if(ok){ setSc(s=>s+1); sfxCorrect(); await speakEn(o.en); }
    else{ sfxWrong(); await speakEn(words[qi].en); }
    setNxt(true);
  };
  const go=()=>{if(qi+1>=words.length)onFinish(sc);else setQi(i=>i+1);};
  useEffect(()=>{if(nxt&&qi+1>=words.length){const t=setTimeout(()=>onFinish(sc),1600);return()=>clearTimeout(t);}},[nxt,qi,words.length,sc,onFinish]);
  const cur=words[qi], ok=sel===cur.en;

  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,fontSize:13,color:"#999"}}>
      <span>السؤال {qi+1}/{words.length}</span><span>النقاط: {sc}</span>
    </div>
    <div style={{background:`${cc}12`,borderRadius:20,padding:"26px 18px",marginBottom:22}}>
      <div style={{fontSize:54,marginBottom:6}}>{cur.emoji}</div>
      <div style={{fontSize:26,fontWeight:700,color:cc}}>{cur.ar}</div>
      <DualSpeaker ar={cur.ar} en={cur.en} color={cc} />
      <div style={{fontSize:13,color:"#aaa",marginTop:8}}>ما هي الترجمة الإنجليزية؟</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {opts.map(o=>{
        let bg="white",bd="#e0e0e0",cl="#333";
        if(sel){if(o.en===cur.en){bg="#d4edda";bd="#28a745";cl="#155724";}else if(o.en===sel){bg="#f8d7da";bd="#dc3545";cl="#721c24";}}
        return <button key={o.en} onClick={()=>pick(o)} style={{
          padding:"14px 8px",borderRadius:14,border:`2px solid ${bd}`,background:bg,
          cursor:sel?"default":"pointer",fontSize:16,fontWeight:600,color:cl,
          transition:"all .2s",fontFamily:"'Fredoka',sans-serif",
          transform:sel&&o.en===cur.en?"scale(1.05)":"scale(1)",
          display:"flex",alignItems:"center",justifyContent:"center",gap:5,
        }}>{o.emoji} {o.en}{sel&&o.en===cur.en&&<SpeakerBtn text={o.en} lang="en-US" size={16} color="#28a745"/>}</button>;
      })}
    </div>
    {nxt&&qi+1<words.length&&<button onClick={go} style={{marginTop:18,padding:"11px 36px",borderRadius:30,border:"none",background:cc,color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>التالي ←</button>}
    <FeedbackBanner type={sel?(ok?"correct":"wrong"):null} correctEn={cur.en} correctAr={cur.ar} catColor={cc} />
  </div>;
}

/* ═══════════════════ MATCH ═══════════════════ */
function MatchGame({ words, onFinish, cc }) {
  const sub=words.slice(0,6);
  const [ew]=useState(()=>shuffle(sub));const [aw]=useState(()=>shuffle(sub));
  const [selE,setSelE]=useState(null);const [mat,setMat]=useState([]);const [wrg,setWrg]=useState(null);const [sc,setSc]=useState(0);

  const hE=(w)=>{if(mat.includes(w.en))return;sfxTap();setSelE(w);setWrg(null);speakEn(w.en);};
  const hA=async(w)=>{
    if(!selE||mat.includes(w.en))return;
    await speakAr(w.ar);
    if(selE.en===w.en){ sfxMatch(); sfxCorrect(); setMat(m=>[...m,w.en]);setSc(s=>s+1);setSelE(null);setTimeout(()=>speakBoth(w.ar,w.en),200); }
    else{ sfxWrong(); setWrg(w.en);setTimeout(()=>{setWrg(null);setSelE(null);},700); }
  };
  useEffect(()=>{if(mat.length===sub.length){sfxVictory();setTimeout(()=>onFinish(sc),1200);}},[mat,sub.length,sc,onFinish]);

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,fontSize:13,color:"#999"}}>
      <span>وصّل الكلمة بمعناها 🔊</span><span>{mat.length}/{sub.length}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <div style={{fontSize:12,fontWeight:700,color:cc,textAlign:"center"}}>English 🔊</div>
        {ew.map(w=><button key={w.en} onClick={()=>hE(w)} style={{
          padding:"12px 8px",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
          border:`2px solid ${selE?.en===w.en?cc:mat.includes(w.en)?"#28a745":"#e0e0e0"}`,
          background:mat.includes(w.en)?"#d4edda":selE?.en===w.en?`${cc}20`:"white",
          cursor:mat.includes(w.en)?"default":"pointer",fontSize:14,fontWeight:600,
          fontFamily:"'Fredoka'",opacity:mat.includes(w.en)?.5:1,transition:"all .2s",
        }}>{w.emoji} {w.en}{!mat.includes(w.en)&&<span style={{fontSize:12,opacity:.4}}>🔈</span>}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <div style={{fontSize:12,fontWeight:700,color:cc,textAlign:"center"}}>العربية 🔊</div>
        {aw.map(w=><button key={w.ar} onClick={()=>hA(w)} style={{
          padding:"12px 8px",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
          border:`2px solid ${wrg===w.en?"#dc3545":mat.includes(w.en)?"#28a745":"#e0e0e0"}`,
          background:wrg===w.en?"#f8d7da":mat.includes(w.en)?"#d4edda":"white",
          cursor:mat.includes(w.en)?"default":"pointer",fontSize:14,fontWeight:600,
          fontFamily:"'Noto Kufi Arabic'",opacity:mat.includes(w.en)?.5:1,transition:"all .2s",
        }}>{w.emoji} {w.ar}{!mat.includes(w.en)&&<span style={{fontSize:12,opacity:.4}}>🔈</span>}</button>)}
      </div>
    </div>
  </div>;
}

/* ═══════════════════ SPELL ═══════════════════ */
function SpellGame({ words, onFinish, cc }) {
  const [qi,setQi]=useState(0);const [inp,setInp]=useState("");const [sc,setSc]=useState(0);const [fb,setFb]=useState(null);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();setTimeout(()=>speakBoth(words[qi].ar,words[qi].en),300);},[qi,words]);
  const chk=async()=>{
    const ok=inp.trim().toLowerCase()===words[qi].en.toLowerCase();
    if(ok){setSc(s=>s+1);sfxCorrect();}else{sfxWrong();}
    await speakEn(words[qi].en);
    setFb(ok?"correct":"wrong");
    setTimeout(()=>{setFb(null);setInp("");if(qi+1>=words.length)onFinish(sc+(ok?1:0));else setQi(i=>i+1);},1400);
  };
  const cur=words[qi],hint=cur.en[0]+"·".repeat(cur.en.length-1);
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,fontSize:13,color:"#999"}}>
      <span>الكلمة {qi+1}/{words.length}</span><span>النقاط: {sc}</span>
    </div>
    <div style={{background:`${cc}12`,borderRadius:20,padding:"26px 18px",marginBottom:22}}>
      <div style={{fontSize:54,marginBottom:6}}>{cur.emoji}</div>
      <div style={{fontSize:26,fontWeight:700,color:cc}}>{cur.ar}</div>
      <DualSpeaker ar={cur.ar} en={cur.en} color={cc} />
      <div style={{fontSize:18,color:"#bbb",marginTop:10,fontFamily:"'Fredoka'",letterSpacing:5,fontWeight:600}}>{hint}</div>
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
      <input ref={ref} type="text" value={inp} onChange={e=>setInp(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&inp.trim()&&chk()} placeholder="اكتب بالإنجليزية..."
        style={{flex:1,maxWidth:260,padding:"13px 16px",borderRadius:14,
          border:`2px solid ${fb==="correct"?"#28a745":fb==="wrong"?"#dc3545":"#e0e0e0"}`,
          fontSize:18,textAlign:"center",outline:"none",fontFamily:"'Fredoka'",fontWeight:600,
          background:fb==="correct"?"#d4edda":fb==="wrong"?"#f8d7da":"white",transition:"all .3s"}} />
      <button onClick={chk} disabled={!inp.trim()} style={{
        padding:"13px 22px",borderRadius:14,border:"none",
        background:inp.trim()?cc:"#ccc",color:"white",fontSize:15,fontWeight:700,cursor:inp.trim()?"pointer":"default",
      }}>تحقق ✓</button>
    </div>
    <button onClick={()=>{sfxTap();speakBoth(cur.ar,cur.en);}} style={{
      marginTop:12,background:`${cc}12`,border:`1px solid ${cc}30`,borderRadius:30,
      padding:"7px 22px",cursor:"pointer",fontSize:13,color:cc,fontWeight:600,
    }}>🔊 أعد سماع الكلمة</button>
    <FeedbackBanner type={fb} correctEn={cur.en} correctAr={cur.ar} catColor={cc} />
  </div>;
}

/* ═══════════════════ LISTEN & PICK ═══════════════════ */
function ListenGame({ words, onFinish, cc }) {
  const [qi,setQi]=useState(0);const [sc,setSc]=useState(0);const [sel,setSel]=useState(null);
  const [opts,setOpts]=useState([]);const [nxt,setNxt]=useState(false);
  const mk=useCallback(i=>{const c=words[i];return shuffle([c,...shuffle(words.filter(w=>w.en!==c.en)).slice(0,3)]);}, [words]);
  useEffect(()=>{setOpts(mk(qi));setSel(null);setNxt(false);setTimeout(()=>speakEn(words[qi].en),500);},[qi,mk,words]);

  const pick=async(o)=>{
    if(sel)return;sfxTap();setSel(o.en);
    const ok=o.en===words[qi].en;
    if(ok){setSc(s=>s+1);sfxCorrect();await speakBoth(words[qi].ar,words[qi].en);}
    else{sfxWrong();await speakEn(words[qi].en);}
    setNxt(true);
  };
  const go=()=>{if(qi+1>=words.length)onFinish(sc);else setQi(i=>i+1);};
  useEffect(()=>{if(nxt&&qi+1>=words.length){const t=setTimeout(()=>onFinish(sc),1600);return()=>clearTimeout(t);}},[nxt,qi,words.length,sc,onFinish]);
  const cur=words[qi],ok=sel===cur.en;

  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,fontSize:13,color:"#999"}}>
      <span>السؤال {qi+1}/{words.length}</span><span>النقاط: {sc}</span>
    </div>
    <div style={{background:`${cc}12`,borderRadius:20,padding:"30px 18px",marginBottom:22}}>
      <button onClick={()=>{sfxTap();speakEn(cur.en);}} style={{
        width:96,height:96,borderRadius:"50%",border:`3px solid ${cc}`,
        background:`${cc}18`,cursor:"pointer",fontSize:44,
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 14px",transition:"all .3s",
        boxShadow:`0 4px 24px ${cc}25`,animation:"pulse 2s ease-in-out infinite",
      }}>🔊</button>
      <div style={{fontSize:17,fontWeight:700,color:cc}}>استمع واختر المعنى الصحيح</div>
      <div style={{fontSize:12,color:"#aaa",marginTop:4}}>اضغط الزر لسماع الكلمة مرة أخرى</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {opts.map(o=>{
        let bg="white",bd="#e0e0e0",cl="#333";
        if(sel){if(o.en===cur.en){bg="#d4edda";bd="#28a745";cl="#155724";}else if(o.en===sel){bg="#f8d7da";bd="#dc3545";cl="#721c24";}}
        return <button key={o.en} onClick={()=>pick(o)} style={{
          padding:"15px 8px",borderRadius:14,border:`2px solid ${bd}`,background:bg,
          cursor:sel?"default":"pointer",fontSize:16,fontWeight:600,color:cl,
          transition:"all .2s",transform:sel&&o.en===cur.en?"scale(1.05)":"scale(1)",
        }}>{o.emoji} {o.ar}</button>;
      })}
    </div>
    {nxt&&qi+1<words.length&&<button onClick={go} style={{marginTop:18,padding:"11px 36px",borderRadius:30,border:"none",background:cc,color:"white",fontSize:15,fontWeight:700,cursor:"pointer"}}>التالي ←</button>}
    <FeedbackBanner type={sel?(ok?"correct":"wrong"):null} correctEn={cur.en} correctAr={cur.ar} catColor={cc} />
  </div>;
}

/* ═══════════════════ MAIN APP ═══════════════════ */
export default function EnglishQuestGame() {
  const [scr,setScr]=useState("home");const [cat,setCat]=useState(null);const [mode,setMode]=useState(null);
  const [fs,setFs]=useState(0);const [tq,setTq]=useState(0);const [conf,setConf]=useState(false);
  const [ts,setTs]=useState(0);const [gp,setGp]=useState(0);const [vr,setVr]=useState(false);

  useEffect(()=>{
    const lv=()=>{if(window.speechSynthesis?.getVoices()?.length>0)setVr(true);};
    lv();window.speechSynthesis?.addEventListener("voiceschanged",lv);
    return()=>window.speechSynthesis?.removeEventListener("voiceschanged",lv);
  },[]);

  const start=(c,m)=>{sfxTap();setCat(c);setMode(m);setScr("play");};

  const finish=useCallback((score)=>{
    const total=mode==="match"?cat.words.slice(0,6).length:cat.words.length;
    setFs(score);setTq(total);setGp(g=>g+1);
    const p=total>0?score/total:0;
    const stars=p>=.9?3:p>=.6?2:p>=.3?1:0;
    setTs(s=>s+stars);
    // Sound effects based on performance
    if(p===1) sfxPerfect();
    else if(p>=.6) sfxVictory();
    else sfxWrong();
    // Stars sfx
    if(stars>0) setTimeout(()=>sfxStar(),600);
    if(p>=.6){setConf(true);setTimeout(()=>setConf(false),3000);}
    setScr("result");
  },[cat,mode]);

  const goHome=()=>{window.speechSynthesis?.cancel();setScr("home");};

  return <div style={{minHeight:"100vh",direction:"rtl",fontFamily:"'Noto Kufi Arabic','Fredoka',sans-serif",background:"linear-gradient(135deg,#fdf6ec 0%,#e8f4f8 50%,#f0e6f6 100%)"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
      @keyframes confettiFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
      @keyframes bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
      @keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
      @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}
    `}</style>
    <Confetti active={conf} />

    {/* HEADER */}
    <div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",padding:"18px 22px",color:"white"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:22,fontWeight:800}}>🚀 English Quest</div>
          <div style={{fontSize:11,opacity:.7,marginTop:2}}>نطق صوتي + تعزيز صوتي 🔊🎵</div>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center",fontSize:13}}>
          <div style={{textAlign:"center"}}><div>⭐</div><div style={{fontWeight:700}}>{ts}</div></div>
          <div style={{textAlign:"center"}}><div>🎮</div><div style={{fontWeight:700}}>{gp}</div></div>
          <div style={{fontSize:9,padding:"3px 8px",borderRadius:10,background:vr?"rgba(40,167,69,.3)":"rgba(255,193,7,.3)",color:vr?"#90EE90":"#FFD700"}}>{vr?"🔊 جاهز":"⏳"}</div>
        </div>
      </div>
    </div>

    <div style={{maxWidth:480,margin:"0 auto",padding:"18px 14px"}}>

      {/* HOME */}
      {scr==="home"&&<div style={{animation:"slideUp .4s ease-out"}}>
        <div style={{textAlign:"center",marginBottom:24,padding:"22px 14px",background:"white",borderRadius:20,boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          <div style={{fontSize:50,animation:"float 3s ease-in-out infinite"}}>🌟</div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1a1a2e",margin:"10px 0 4px"}}>!مرحباً يا بطل</h2>
          <p style={{fontSize:13,color:"#888"}}>نطق صوتي 🔊 + مؤثرات صوتية تعزيزية 🎵</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          {CATEGORIES.map((c,i)=><button key={c.id} onClick={()=>{sfxTap();setCat(c);setScr("mode");speakEn(c.nameEn);}}
            style={{padding:"20px 10px",borderRadius:18,border:"none",background:"white",cursor:"pointer",boxShadow:"0 3px 15px rgba(0,0,0,.06)",transition:"all .25s",animation:`slideUp .4s ease-out ${i*.07}s both`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) scale(1.02)";e.currentTarget.style.boxShadow=`0 8px 25px ${c.color}30`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{fontSize:36,marginBottom:6}}>{c.emoji}</div>
            <div style={{fontSize:14,fontWeight:700,color:c.color}}>{c.nameAr}</div>
            <div style={{fontSize:11,color:"#aaa",fontFamily:"'Fredoka'",marginTop:2}}>{c.nameEn}</div>
            <div style={{marginTop:6,fontSize:10,color:"white",background:c.color,borderRadius:20,padding:"2px 10px",display:"inline-block",fontWeight:600}}>{c.words.length} كلمات</div>
          </button>)}
        </div>
      </div>}

      {/* MODE */}
      {scr==="mode"&&cat&&<div style={{animation:"slideUp .4s ease-out"}}>
        <button onClick={goHome} style={{background:"none",border:"none",fontSize:13,color:"#888",cursor:"pointer",marginBottom:14}}>→ رجوع</button>
        <div style={{textAlign:"center",padding:"24px 14px",borderRadius:20,background:`linear-gradient(135deg,${cat.color}15,${cat.color}08)`,border:`2px solid ${cat.color}25`,marginBottom:20}}>
          <div style={{fontSize:50}}>{cat.emoji}</div>
          <h2 style={{fontSize:22,fontWeight:800,color:cat.color,margin:"8px 0"}}>{cat.nameAr}</h2>
          <p style={{fontSize:13,color:"#888"}}>اختر نوع اللعبة</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {GAME_MODES.map((m,i)=><button key={m.id} onClick={()=>start(cat,m.id)} style={{
            display:"flex",alignItems:"center",gap:14,padding:"16px 18px",borderRadius:16,
            border:`2px solid ${cat.color}20`,background:"white",cursor:"pointer",textAlign:"right",
            boxShadow:"0 2px 10px rgba(0,0,0,.04)",transition:"all .25s",
            animation:`slideUp .4s ease-out ${i*.1}s both`,
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateX(-4px)";e.currentTarget.style.borderColor=cat.color;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=`${cat.color}20`;}}>
            <div style={{fontSize:30,width:52,height:52,borderRadius:14,background:`${cat.color}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{m.emoji}</div>
            <div><div style={{fontSize:16,fontWeight:700,color:"#1a1a2e"}}>{m.nameAr}</div><div style={{fontSize:11,color:"#999",marginTop:2}}>{m.desc}</div></div>
          </button>)}
        </div>
      </div>}

      {/* PLAY */}
      {scr==="play"&&cat&&mode&&<div style={{animation:"slideUp .35s ease-out"}}>
        <button onClick={()=>{window.speechSynthesis?.cancel();setScr("mode");}} style={{background:"none",border:"none",fontSize:13,color:"#888",cursor:"pointer",marginBottom:14}}>→ رجوع</button>
        <div style={{background:"white",borderRadius:20,padding:"22px 18px",boxShadow:"0 4px 20px rgba(0,0,0,.06)"}}>
          {mode==="quiz"&&<QuizGame words={shuffle(cat.words)} onFinish={finish} cc={cat.color}/>}
          {mode==="match"&&<MatchGame words={cat.words} onFinish={finish} cc={cat.color}/>}
          {mode==="spell"&&<SpellGame words={shuffle(cat.words)} onFinish={finish} cc={cat.color}/>}
          {mode==="listen"&&<ListenGame words={shuffle(cat.words)} onFinish={finish} cc={cat.color}/>}
        </div>
      </div>}

      {/* RESULT */}
      {scr==="result"&&<div style={{animation:"bounceIn .5s ease-out",textAlign:"center"}}>
        <div style={{background:"white",borderRadius:24,padding:"34px 22px",boxShadow:"0 6px 30px rgba(0,0,0,.08)"}}>
          <div style={{fontSize:60,marginBottom:10,animation:"float 2s ease-in-out infinite"}}>{fs===tq?"🏆":fs>=tq*.7?"🎖️":fs>=tq*.4?"👏":"💪"}</div>
          <h2 style={{fontSize:24,fontWeight:800,color:"#1a1a2e",marginBottom:8}}>
            {fs===tq?"🌟 مثالي!":fs>=tq*.7?"!أحسنت":fs>=tq*.4?"!جيد":"!لا تستسلم"}
          </h2>
          <StarRating score={fs} total={tq} />
          <div style={{marginTop:18,padding:"14px 18px",borderRadius:16,background:fs===tq?"linear-gradient(135deg,#d4edda,#c3e6cb)":"#f0f7ff",fontSize:20,fontWeight:700,color:fs===tq?"#155724":"#0f3460"}}>{fs} / {tq}</div>
          <div style={{marginTop:8,fontSize:13,color:"#888"}}>
            {fs===tq?"نتيجة مثالية! أنت عبقري!":fs>=tq*.7?"ممتاز! استمر هكذا!":fs>=tq*.4?"جيد! حاول مجدداً للتحسن!":"التكرار يصنع المعجزات! حاول مرة أخرى!"}
          </div>
          <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{sfxTap();setScr("play");}} style={{padding:"12px 26px",borderRadius:30,border:`2px solid ${cat?.color}`,background:"white",color:cat?.color,fontSize:14,fontWeight:700,cursor:"pointer"}}>🔄 أعد اللعبة</button>
            <button onClick={()=>{sfxTap();goHome();}} style={{padding:"12px 26px",borderRadius:30,border:"none",background:"linear-gradient(135deg,#1a1a2e,#0f3460)",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>🏠 الرئيسية</button>
          </div>
        </div>
      </div>}
    </div>
  </div>;
}

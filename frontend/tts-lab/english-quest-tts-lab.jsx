import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   HYBRID TTS ENGINE — محرك النطق الهجين
   
   Strategy (بالترتيب):
   1. Google Translate TTS (أفضل جودة عربية مجانية)
   2. Web Speech API — صوت Google المفضّل
   3. Web Speech API — أي صوت عربي متاح
   ══════════════════════════════════════════════════════════════ */

// ─── Google TTS via Audio Element (No CORS issues) ───
function googleTTS(text, lang = "ar", slow = true) {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio();
      const tl = lang === "ar" ? "ar" : "en";
      const speed = slow ? "&ttsspeed=0.8" : "";
      // Google Translate TTS endpoint — free, high quality
      audio.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(text)}`;
      audio.playbackRate = slow ? 0.85 : 0.9;
      audio.volume = 1;
      audio.onended = () => resolve("google");
      audio.onerror = () => reject("google_failed");
      audio.play().catch(() => reject("google_blocked"));
    } catch (e) {
      reject("google_error");
    }
  });
}

// ─── Web Speech API with Smart Voice Selection ───
function getArabicVoices() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const arabic = voices.filter(v => v.lang.startsWith("ar"));

  // Priority ranking for Arabic voices
  const ranked = arabic.sort((a, b) => {
    const score = (v) => {
      let s = 0;
      // Prefer Google voices (best quality)
      if (v.name.toLowerCase().includes("google")) s += 100;
      // Prefer online/remote voices (usually better)
      if (!v.localService) s += 50;
      // Prefer ar-XA (Google's premium Arabic)
      if (v.lang === "ar-XA") s += 30;
      // Prefer standard Arabic over regional
      if (v.lang === "ar-SA" || v.lang === "ar") s += 20;
      // Prefer female voices (often clearer for children)
      if (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("hala") || v.name.toLowerCase().includes("laila")) s += 10;
      return s;
    };
    return score(b) - score(a);
  });

  return ranked;
}

function getEnglishVoices() {
  const voices = window.speechSynthesis?.getVoices() || [];
  const english = voices.filter(v => v.lang.startsWith("en"));
  return english.sort((a, b) => {
    const score = (v) => {
      let s = 0;
      if (v.name.toLowerCase().includes("google")) s += 100;
      if (!v.localService) s += 50;
      if (v.lang === "en-US") s += 20;
      // Prefer female voices for children
      if (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha")) s += 10;
      return s;
    };
    return score(b) - score(a);
  });
}

function webSpeechTTS(text, lang = "ar", rate = 0.78) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) { reject("no_synthesis"); return; }
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    const voices = lang === "ar" ? getArabicVoices() : getEnglishVoices();

    if (voices.length > 0) {
      utter.voice = voices[0]; // Best ranked voice
    }

    utter.lang = lang === "ar" ? (voices[0]?.lang || "ar-SA") : "en-US";
    utter.rate = rate;
    utter.pitch = lang === "ar" ? 1.0 : 1.05;
    utter.volume = 1;

    utter.onend = () => resolve("webspeech");
    utter.onerror = () => reject("webspeech_failed");

    window.speechSynthesis.speak(utter);
  });
}

// ─── Hybrid Speaker — tries best source first ───
async function speakHybrid(text, lang = "ar", slow = true) {
  // Stop any current speech
  window.speechSynthesis?.cancel();

  try {
    // Try Google TTS first (best Arabic quality)
    const result = await googleTTS(text, lang, slow);
    return result;
  } catch (e) {
    // Fallback to Web Speech API
    try {
      const rate = lang === "ar" ? 0.75 : 0.8;
      const result = await webSpeechTTS(text, lang, rate);
      return result;
    } catch (e2) {
      console.warn("All TTS failed:", e, e2);
      return "failed";
    }
  }
}

async function speakAr(text) { return speakHybrid(text, "ar", true); }
async function speakEn(text) { return speakHybrid(text, "en", true); }
async function speakBoth(ar, en) {
  await speakAr(ar);
  await new Promise(r => setTimeout(r, 500));
  await speakEn(en);
}

// ─── SFX ───
let _ctx = null;
function getCtx() { if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)(); if (_ctx.state === "suspended") _ctx.resume(); return _ctx; }
function playTone(f, d, t = "sine", v = .3, dl = 0) { const c = getCtx(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime + dl); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + dl + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime + dl); o.stop(c.currentTime + dl + d); }
function sfxCorrect() { playTone(523, .12, "sine", .25, 0); playTone(659, .12, "sine", .25, .1); playTone(784, .18, "sine", .3, .2); playTone(1047, .25, "sine", .2, .3); }
function sfxWrong() { playTone(350, .15, "square", .12, 0); playTone(280, .2, "square", .1, .12); }
function sfxTap() { playTone(600, .04, "sine", .1, 0); }

/* ══════════════════════════════════════════════════════════════
   FASEEH MINI
   ══════════════════════════════════════════════════════════════ */
function Faseeh({ expr = "happy", size = 80 }) {
  const open = expr === "speaking";
  return <svg viewBox="0 0 100 130" width={size} height={size * 1.3}><ellipse cx="50" cy="115" rx="14" ry="12" fill="#1B998B" opacity=".8" /><ellipse cx="50" cy="85" rx="26" ry="32" fill="#2EC4B6" /><ellipse cx="50" cy="89" rx="19" ry="24" fill="#CBF3F0" />
    <circle cx="50" cy="40" r="24" fill="#2EC4B6" /><circle cx="50" cy="42" r="18" fill="#CBF3F0" opacity=".5" />
    <ellipse cx="44" cy="18" rx="3" ry="8" fill="#FF6B35" transform="rotate(-15 44 18)" /><ellipse cx="50" cy="16" rx="2.5" ry="9" fill="#FFBE0B" /><ellipse cx="56" cy="18" rx="3" ry="8" fill="#FF6B35" transform="rotate(15 56 18)" />
    <circle cx="40" cy="37" r="7" fill="white" /><circle cx="60" cy="37" r="7" fill="white" />
    <circle cx="41" cy="36.5" r="3.5" fill="#1A1A2E" /><circle cx="59" cy="36.5" r="3.5" fill="#1A1A2E" />
    <circle cx="42" cy="35.5" r="1.2" fill="white" /><circle cx="60" cy="35.5" r="1.2" fill="white" />
    {(expr === "happy" || expr === "speaking") && <><circle cx="34" cy="44" r="4" fill="#FF9F9F" opacity=".3" /><circle cx="66" cy="44" r="4" fill="#FF9F9F" opacity=".3" /></>}
    <path d={open ? "M45 45 Q50 42 55 45 Q52 50 50 52 Q48 50 45 45Z" : "M45 44 Q50 41 55 44 Q50 48 45 44Z"} fill="#FFBE0B" stroke="#E6A800" strokeWidth=".5" />
    {expr === "speaking" && <><rect x="68" y="18" rx="6" ry="6" width="28" height="18" fill="white" stroke="#2EC4B6" strokeWidth="1.5" /><text x="82" y="30" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1A1A2E">🔊</text></>}
  </svg>;
}

/* ══════════════════════════════════════════════════════════════
   TEST WORDS — كلمات اختبار
   ══════════════════════════════════════════════════════════════ */
const TEST_WORDS = [
  { ar: "بسم الله الرحمن الرحيم", en: "In the name of God", cat: "عبارات دينية" },
  { ar: "مرحباً يا أصدقاء", en: "Hello friends", cat: "تحيات" },
  { ar: "أنا أحب تعلّم الإنجليزية", en: "I love learning English", cat: "جمل" },
  { ar: "الشمس تشرق في الصباح", en: "The sun rises in the morning", cat: "طبيعة" },
  { ar: "أسد", en: "Lion", cat: "كلمات مفردة" },
  { ar: "فراشة", en: "Butterfly", cat: "كلمات مفردة" },
  { ar: "القطة نائمة على السرير", en: "The cat is sleeping on the bed", cat: "جمل" },
  { ar: "كم الساعة الآن؟", en: "What time is it now?", cat: "أسئلة" },
  { ar: "عائلتي تحبني كثيراً", en: "My family loves me very much", cat: "عائلة" },
  { ar: "الطبيب يساعد المرضى", en: "The doctor helps patients", cat: "مهن" },
  { ar: "أريد أن أكون شجاعاً", en: "I want to be brave", cat: "مشاعر" },
  { ar: "الماء ضروري للحياة", en: "Water is essential for life", cat: "علوم" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
export default function TTSTestLab() {
  const [voices, setVoices] = useState({ ar: [], en: [] });
  const [speaking, setSpeaking] = useState(null); // word index
  const [engine, setEngine] = useState(null); // "google" or "webspeech"
  const [lastResult, setLastResult] = useState(null);
  const [activeTab, setActiveTab] = useState("test");
  const [customText, setCustomText] = useState("");
  const [faseehExpr, setFaseehExpr] = useState("happy");
  const [ttsPreference, setTtsPreference] = useState("auto"); // auto, google, webspeech

  useEffect(() => {
    const loadVoices = () => {
      setVoices({ ar: getArabicVoices(), en: getEnglishVoices() });
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const handleSpeak = async (text, lang, idx = null) => {
    sfxTap();
    setSpeaking(idx);
    setFaseehExpr("speaking");

    let result;
    if (ttsPreference === "google") {
      try { result = await googleTTS(text, lang); } catch { result = "failed"; }
    } else if (ttsPreference === "webspeech") {
      try { result = await webSpeechTTS(text, lang, lang === "ar" ? 0.75 : 0.8); } catch { result = "failed"; }
    } else {
      result = await speakHybrid(text, lang);
    }

    setEngine(result);
    setLastResult(result);
    setSpeaking(null);
    setFaseehExpr("happy");
  };

  const handleSpeakBoth = async (ar, en, idx) => {
    sfxTap();
    setSpeaking(idx);
    setFaseehExpr("speaking");
    await handleSpeak(ar, "ar", idx);
    await new Promise(r => setTimeout(r, 400));
    await handleSpeak(en, "en", idx);
    setSpeaking(null);
    setFaseehExpr("happy");
  };

  const tabs = [
    { id: "test", label: "🔊 اختبار النطق", desc: "جرّب الكلمات" },
    { id: "voices", label: "🎤 الأصوات المتاحة", desc: "فحص الأصوات" },
    { id: "settings", label: "⚙️ الإعدادات", desc: "تخصيص المحرك" },
  ];

  return (
    <div style={{ minHeight: "100vh", direction: "rtl", fontFamily: "'Noto Kufi Arabic','Fredoka',sans-serif", background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes speaking{0%{box-shadow:0 0 0 0 rgba(46,196,182,.4)}70%{box-shadow:0 0 0 12px rgba(46,196,182,0)}100%{box-shadow:0 0 0 0 rgba(46,196,182,0)}}
        *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Faseeh expr={faseehExpr} size={40} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>مختبر النطق الصوتي</div>
            <div style={{ fontSize: 10, color: "#2EC4B6" }}>TTS Quality Lab — English Quest</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, padding: "4px 10px", borderRadius: 10,
          background: lastResult === "google" ? "rgba(40,167,69,.2)" : lastResult === "webspeech" ? "rgba(255,193,7,.2)" : "rgba(100,116,139,.2)",
          color: lastResult === "google" ? "#4ade80" : lastResult === "webspeech" ? "#fbbf24" : "#94a3b8",
        }}>
          {lastResult === "google" ? "🟢 Google TTS" : lastResult === "webspeech" ? "🟡 Web Speech" : "⚪ جاهز"}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: "1px solid #334155" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "12px 16px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400,
            color: activeTab === t.id ? "#2EC4B6" : "#64748b",
            borderBottom: activeTab === t.id ? "2px solid #2EC4B6" : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* ═══ TEST TAB ═══ */}
        {activeTab === "test" && (
          <div style={{ animation: "fadeIn .3s ease-out" }}>
            {/* Custom text input */}
            <div style={{ background: "#1e293b", borderRadius: 16, padding: "16px", border: "1px solid #334155", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>✏️ جرّب أي نص عربي:</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text" value={customText} onChange={e => setCustomText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && customText.trim() && handleSpeak(customText, "ar")}
                  placeholder="اكتب جملة عربية هنا..."
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #334155",
                    background: "#0f172a", color: "white", fontSize: 14, outline: "none",
                    fontFamily: "'Noto Kufi Arabic'",
                  }}
                />
                <button onClick={() => customText.trim() && handleSpeak(customText, "ar")} style={{
                  padding: "10px 18px", borderRadius: 10, border: "none",
                  background: "#2EC4B6", color: "white", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>🔊 انطق</button>
              </div>
            </div>

            {/* Engine indicator */}
            <div style={{
              display: "flex", gap: 8, marginBottom: 16, justifyContent: "center",
              padding: "10px", background: "#0f172a", borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>المحرك النشط:</div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: ttsPreference === "google" ? "#4ade80" : ttsPreference === "webspeech" ? "#fbbf24" : "#2EC4B6",
              }}>
                {ttsPreference === "google" ? "🟢 Google TTS فقط" :
                  ttsPreference === "webspeech" ? "🟡 Web Speech فقط" :
                    "🔵 تلقائي (Google أولاً)"}
              </div>
            </div>

            {/* Test words grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TEST_WORDS.map((w, i) => (
                <div key={i} style={{
                  background: speaking === i ? "#2EC4B620" : "#1e293b",
                  borderRadius: 14, padding: "14px 16px",
                  border: `1px solid ${speaking === i ? "#2EC4B6" : "#334155"}`,
                  transition: "all .2s",
                  animation: speaking === i ? "speaking 1.5s ease-in-out infinite" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.6 }}>{w.ar}</div>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "'Fredoka'", marginTop: 2 }}>{w.en}</div>
                    </div>
                    <span style={{ fontSize: 9, color: "#475569", background: "#0f172a", padding: "2px 8px", borderRadius: 6 }}>{w.cat}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button onClick={() => handleSpeak(w.ar, "ar", i)} disabled={speaking !== null}
                      style={{
                        padding: "7px 14px", borderRadius: 8, border: "none",
                        background: speaking === i ? "#2EC4B640" : "#2EC4B620", color: "#2EC4B6",
                        fontSize: 12, fontWeight: 600, cursor: speaking !== null ? "default" : "pointer",
                        opacity: speaking !== null && speaking !== i ? 0.4 : 1,
                      }}>🔈 عربي</button>
                    <button onClick={() => handleSpeak(w.en, "en", i)} disabled={speaking !== null}
                      style={{
                        padding: "7px 14px", borderRadius: 8, border: "none",
                        background: "#FF6B3520", color: "#FF6B35",
                        fontSize: 12, fontWeight: 600, cursor: speaking !== null ? "default" : "pointer",
                        opacity: speaking !== null && speaking !== i ? 0.4 : 1,
                      }}>🔊 English</button>
                    <button onClick={() => handleSpeakBoth(w.ar, w.en, i)} disabled={speaking !== null}
                      style={{
                        padding: "7px 14px", borderRadius: 8, border: "none",
                        background: "#FFBE0B20", color: "#FFBE0B",
                        fontSize: 12, fontWeight: 600, cursor: speaking !== null ? "default" : "pointer",
                        opacity: speaking !== null && speaking !== i ? 0.4 : 1,
                      }}>🔁 الاثنين</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ VOICES TAB ═══ */}
        {activeTab === "voices" && (
          <div style={{ animation: "fadeIn .3s ease-out" }}>
            <div style={{
              background: "#0f172a", borderRadius: 14, padding: "16px",
              border: "1px solid #334155", marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2EC4B6", marginBottom: 4 }}>
                📊 ملخص الأصوات المتاحة
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                عربي: {voices.ar.length} صوت | إنجليزي: {voices.en.length} صوت
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                + Google Translate TTS (لا يحتاج أصوات محلية)
              </div>
            </div>

            {/* Arabic voices */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#FFBE0B", marginBottom: 10 }}>🔈 الأصوات العربية ({voices.ar.length})</h3>
            {voices.ar.length === 0 ? (
              <div style={{ background: "#1e293b", borderRadius: 12, padding: "16px", border: "1px solid #334155", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#f87171" }}>⚠️ لا توجد أصوات عربية محلية</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>سيتم استخدام Google TTS تلقائياً (جودة أفضل)</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {voices.ar.map((v, i) => (
                  <div key={i} style={{
                    background: i === 0 ? "#2EC4B610" : "#1e293b",
                    borderRadius: 10, padding: "10px 14px",
                    border: `1px solid ${i === 0 ? "#2EC4B640" : "#334155"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>
                        {i === 0 && "⭐ "}{v.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        {v.lang} | {v.localService ? "محلي" : "سحابي"} | {v.name.includes("Google") ? "Google" : "نظام"}
                      </div>
                    </div>
                    <button onClick={() => {
                      const u = new SpeechSynthesisUtterance("مرحباً يا أصدقاء");
                      u.voice = v; u.lang = v.lang; u.rate = 0.75;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }} style={{
                      padding: "5px 12px", borderRadius: 8, border: "none",
                      background: "#2EC4B620", color: "#2EC4B6", fontSize: 11,
                      cursor: "pointer", fontWeight: 600,
                    }}>جرّب</button>
                  </div>
                ))}
              </div>
            )}

            {/* English voices (top 5) */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#FF6B35", marginBottom: 10 }}>🔊 أفضل الأصوات الإنجليزية (أعلى 5)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {voices.en.slice(0, 5).map((v, i) => (
                <div key={i} style={{
                  background: i === 0 ? "#FF6B3510" : "#1e293b",
                  borderRadius: 10, padding: "10px 14px",
                  border: `1px solid ${i === 0 ? "#FF6B3540" : "#334155"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{i === 0 && "⭐ "}{v.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{v.lang} | {v.localService ? "محلي" : "سحابي"}</div>
                  </div>
                  <button onClick={() => {
                    const u = new SpeechSynthesisUtterance("Hello friends, let us learn English together!");
                    u.voice = v; u.lang = v.lang; u.rate = 0.8;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                  }} style={{
                    padding: "5px 12px", borderRadius: 8, border: "none",
                    background: "#FF6B3520", color: "#FF6B35", fontSize: 11,
                    cursor: "pointer", fontWeight: 600,
                  }}>Test</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === "settings" && (
          <div style={{ animation: "fadeIn .3s ease-out" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 16 }}>⚙️ إعدادات المحرك الصوتي</h3>

            <div style={{ background: "#1e293b", borderRadius: 16, padding: "20px", border: "1px solid #334155", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2EC4B6", marginBottom: 12 }}>اختر محرك النطق:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { id: "auto", label: "🔵 تلقائي (موصى به)", desc: "يجرّب Google TTS أولاً، ثم Web Speech كبديل", badge: "الأفضل" },
                  { id: "google", label: "🟢 Google TTS فقط", desc: "جودة عربية ممتازة — يحتاج إنترنت", badge: "جودة عالية" },
                  { id: "webspeech", label: "🟡 Web Speech فقط", desc: "يعتمد على أصوات الجهاز — يعمل بدون إنترنت", badge: "بدون نت" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => { sfxTap(); setTtsPreference(opt.id); }}
                    style={{
                      padding: "14px 16px", borderRadius: 12, textAlign: "right",
                      border: `2px solid ${ttsPreference === opt.id ? "#2EC4B6" : "#334155"}`,
                      background: ttsPreference === opt.id ? "#2EC4B615" : "#0f172a",
                      cursor: "pointer", transition: "all .2s",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{opt.label}</div>
                      <span style={{
                        fontSize: 9, padding: "2px 8px", borderRadius: 6,
                        background: ttsPreference === opt.id ? "#2EC4B630" : "#334155",
                        color: ttsPreference === opt.id ? "#2EC4B6" : "#64748b",
                      }}>{opt.badge}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #2EC4B615, #1B998B15)",
              borderRadius: 16, padding: "20px", border: "1px solid #2EC4B630",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2EC4B6", marginBottom: 10 }}>💡 لماذا Google TTS أفضل للعربية؟</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 2 }}>
                <strong style={{ color: "#e2e8f0" }}>Web Speech API</strong>: يعتمد على أصوات النظام — في كثير من الأجهزة لا توجد أصوات عربية عالية الجودة، أو تكون آلية جداً وغير واضحة للأطفال.
                <br /><br />
                <strong style={{ color: "#e2e8f0" }}>Google Translate TTS</strong>: يستخدم نفس محرك Google المتقدم — نطق عربي فصيح واضح، مجاني، ويعمل في جميع المتصفحات. العيب الوحيد: يحتاج اتصال إنترنت.
                <br /><br />
                <strong style={{ color: "#4ade80" }}>الاستراتيجية المثلى</strong>: الوضع التلقائي يجرّب Google أولاً (جودة أعلى)، وإذا فشل (بدون إنترنت) ينتقل تلقائياً لـ Web Speech.
              </div>
            </div>

            <div style={{
              marginTop: 16, background: "#1e293b", borderRadius: 16, padding: "20px",
              border: "1px solid #334155",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FFBE0B", marginBottom: 10 }}>🚀 خطة الترقية المستقبلية (PRD)</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 2 }}>
                <span style={{ color: "#64748b" }}>MVP:</span> Google TTS مجاني ✅
                <br />
                <span style={{ color: "#fbbf24" }}>v1.5:</span> Google Cloud TTS ($4/مليون حرف) — أصوات WaveNet فائقة الجودة
                <br />
                <span style={{ color: "#f87171" }}>v2.0:</span> ElevenLabs أو تسجيل بشري — لشخصية فصيح بصوت خاص
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

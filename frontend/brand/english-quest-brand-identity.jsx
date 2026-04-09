import { useState } from "react";

/* ═══════ SVG MASCOT: فصيح — Faseeh the Parrot ═══════ */
function Faseeh({ expression = "happy", size = 200, style: xs = {} }) {
  const s = size;
  const eyes = {
    happy: { left: "◠", right: "◠", brow: 0 },
    excited: { left: "★", right: "★", brow: -3 },
    thinking: { left: "◉", right: "◔", brow: 2 },
    sad: { left: "◡", right: "◡", brow: 4 },
    celebrating: { left: "✦", right: "✦", brow: -4 },
    encouraging: { left: "◠", right: "●", brow: -1 },
    sleeping: { left: "—", right: "—", brow: 0 },
    speaking: { left: "◉", right: "◉", brow: -2 },
  };
  const e = eyes[expression] || eyes.happy;
  const isOpen = expression === "speaking" || expression === "celebrating";
  const wingUp = expression === "celebrating" || expression === "excited";
  const headTilt = expression === "thinking" ? 8 : expression === "sleeping" ? -5 : 0;

  return (
    <svg viewBox="0 0 200 260" width={s} height={s * 1.3} style={xs} xmlns="http://www.w3.org/2000/svg">
      {/* Tail feathers */}
      <ellipse cx="100" cy="230" rx="28" ry="24" fill="#1B998B" opacity="0.9" />
      <ellipse cx="82" cy="235" rx="18" ry="20" fill="#2EC4B6" opacity="0.8" />
      <ellipse cx="118" cy="235" rx="18" ry="20" fill="#0F7B6C" opacity="0.8" />

      {/* Body */}
      <ellipse cx="100" cy="170" rx="52" ry="65" fill="#2EC4B6" />
      <ellipse cx="100" cy="178" rx="38" ry="48" fill="#CBF3F0" />

      {/* Feet */}
      <ellipse cx="78" cy="232" rx="14" ry="6" fill="#FF6B35" />
      <ellipse cx="122" cy="232" rx="14" ry="6" fill="#FF6B35" />

      {/* Wings */}
      <g transform={`rotate(${wingUp ? -25 : -5} 58 165)`}>
        <ellipse cx="48" cy="158" rx="22" ry="42" fill="#1B998B" />
        <ellipse cx="48" cy="155" rx="14" ry="30" fill="#2EC4B6" opacity="0.6" />
      </g>
      <g transform={`rotate(${wingUp ? 25 : 5} 142 165)`}>
        <ellipse cx="152" cy="158" rx="22" ry="42" fill="#1B998B" />
        <ellipse cx="152" cy="155" rx="14" ry="30" fill="#2EC4B6" opacity="0.6" />
      </g>

      {/* Head */}
      <g transform={`rotate(${headTilt} 100 80)`}>
        {/* Head shape */}
        <circle cx="100" cy="80" r="48" fill="#2EC4B6" />
        <circle cx="100" cy="85" r="36" fill="#CBF3F0" opacity="0.5" />

        {/* Crown feathers */}
        <ellipse cx="88" cy="36" rx="6" ry="16" fill="#FF6B35" transform="rotate(-15 88 36)" />
        <ellipse cx="100" cy="32" rx="5" ry="18" fill="#FFBE0B" />
        <ellipse cx="112" cy="36" rx="6" ry="16" fill="#FF6B35" transform="rotate(15 112 36)" />

        {/* Eyes */}
        <circle cx="80" cy="74" r="14" fill="white" />
        <circle cx="120" cy="74" r="14" fill="white" />
        {expression !== "sleeping" && <>
          <circle cx="82" cy="73" r="7" fill="#1A1A2E" />
          <circle cx="118" cy="73" r="7" fill="#1A1A2E" />
          <circle cx="84" cy="71" r="2.5" fill="white" />
          <circle cx="120" cy="71" r="2.5" fill="white" />
        </>}
        {expression === "sleeping" && <>
          <line x1="72" y1="74" x2="88" y2="74" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="112" y1="74" x2="128" y2="74" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
        </>}

        {/* Eyebrows */}
        <line x1="72" y1={58 + e.brow} x2="88" y2={56 + e.brow} stroke="#1B998B" strokeWidth="3" strokeLinecap="round" />
        <line x1="112" y1={56 + e.brow} x2="128" y2={58 + e.brow} stroke="#1B998B" strokeWidth="3" strokeLinecap="round" />

        {/* Cheeks */}
        {(expression === "happy" || expression === "celebrating" || expression === "excited") && <>
          <circle cx="68" cy="88" r="8" fill="#FF9F9F" opacity="0.35" />
          <circle cx="132" cy="88" r="8" fill="#FF9F9F" opacity="0.35" />
        </>}

        {/* Beak */}
        <path d={isOpen
          ? "M90 90 Q100 84 110 90 Q105 100 100 104 Q95 100 90 90Z"
          : "M90 88 Q100 82 110 88 Q100 96 90 88Z"
        } fill="#FFBE0B" stroke="#E6A800" strokeWidth="1" />
        {isOpen && <path d="M93 94 Q100 98 107 94" fill="#FF6B35" opacity="0.6" />}
      </g>

      {/* Speech bubble for speaking */}
      {expression === "speaking" && <>
        <rect x="135" y="30" rx="12" ry="12" width="55" height="32" fill="white" stroke="#2EC4B6" strokeWidth="2" />
        <text x="162" y="51" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1A1A2E">Hi!</text>
        <polygon points="140,62 148,55 152,62" fill="white" stroke="#2EC4B6" strokeWidth="2" strokeLinejoin="round" />
        <rect x="140" y="54" width="12" height="8" fill="white" />
      </>}

      {/* Celebration stars */}
      {expression === "celebrating" && <>
        <text x="30" y="40" fontSize="18" opacity="0.8">✨</text>
        <text x="160" y="35" fontSize="16" opacity="0.7">⭐</text>
        <text x="20" y="120" fontSize="14" opacity="0.6">🎉</text>
        <text x="170" y="110" fontSize="14" opacity="0.6">🌟</text>
      </>}

      {/* Zzz for sleeping */}
      {expression === "sleeping" && <>
        <text x="130" y="55" fontSize="14" fill="#2EC4B6" opacity="0.5" fontWeight="700">z</text>
        <text x="142" y="42" fontSize="18" fill="#2EC4B6" opacity="0.7" fontWeight="700">z</text>
        <text x="156" y="28" fontSize="22" fill="#2EC4B6" opacity="0.9" fontWeight="700">Z</text>
      </>}

      {/* Thinking dots */}
      {expression === "thinking" && <>
        <circle cx="145" cy="55" r="4" fill="#2EC4B6" opacity="0.4" />
        <circle cx="155" cy="42" r="6" fill="#2EC4B6" opacity="0.6" />
        <circle cx="168" cy="28" r="8" fill="#2EC4B6" opacity="0.3" />
      </>}
    </svg>
  );
}

/* ═══════ COLOR SWATCH ═══════ */
function Swatch({ color, name, nameEn, hex, role }) {
  return (
    <div style={{ textAlign: "center", flex: "1 1 100px" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 16, background: color, margin: "0 auto 8px",
        boxShadow: `0 4px 12px ${color}40`, border: "3px solid white",
      }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>{name}</div>
      <div style={{ fontSize: 11, color: "#888", fontFamily: "'DM Sans'" }}>{nameEn}</div>
      <div style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", marginTop: 2 }}>{hex}</div>
      <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{role}</div>
    </div>
  );
}

/* ═══════ MAIN APP ═══════ */
export default function BrandIdentity() {
  const [activeExpr, setActiveExpr] = useState("happy");
  const [activeSection, setActiveSection] = useState("overview");

  const expressions = [
    { id: "happy", label: "سعيد", labelEn: "Happy", use: "الحالة الافتراضية — الشاشة الرئيسية" },
    { id: "excited", label: "متحمس", labelEn: "Excited", use: "عند بداية لعبة جديدة" },
    { id: "celebrating", label: "يحتفل", labelEn: "Celebrating", use: "عند الإجابة الصحيحة + نهاية ناجحة" },
    { id: "encouraging", label: "مشجّع", labelEn: "Encouraging", use: "عند الإجابة الخاطئة — تشجيع لطيف" },
    { id: "thinking", label: "يفكّر", labelEn: "Thinking", use: "أثناء انتظار إجابة الطفل" },
    { id: "speaking", label: "يتكلم", labelEn: "Speaking", use: "عند نطق الكلمة صوتياً" },
    { id: "sleeping", label: "نائم", labelEn: "Sleeping", use: "عند عدم النشاط لفترة — دعوة للعودة" },
    { id: "sad", label: "حزين", labelEn: "Sad", use: "عند خسارة كل النقاط (نادر)" },
  ];

  const sections = [
    { id: "overview", label: "نظرة عامة" },
    { id: "mascot", label: "فصيح" },
    { id: "colors", label: "الألوان" },
    { id: "typography", label: "الخطوط" },
    { id: "voice", label: "صوت العلامة" },
  ];

  return (
    <div style={{
      minHeight: "100vh", direction: "rtl",
      fontFamily: "'Noto Kufi Arabic', 'DM Sans', sans-serif",
      background: "#FAFAF8",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Fredoka:wght@400;500;600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        button { font-family:inherit; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#2EC4B6; border-radius:4px; }
      `}</style>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
        padding: "28px 28px 24px", color: "white", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(46,196,182,0.08)" }} />
        <div style={{ position: "absolute", bottom: -50, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,190,11,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 14, color: "#2EC4B6", fontWeight: 600, letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans'" }}>BRAND IDENTITY GUIDE</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#FFBE0B" }}>English</span> <span>Quest</span>
          </div>
          <div style={{ fontSize: 15, opacity: 0.65, marginTop: 4 }}>دليل الهوية البصرية — شركة أذكياء للبرمجيات</div>
        </div>
      </div>

      {/* NAV */}
      <div style={{
        background: "white", borderBottom: "1px solid #eee",
        padding: "0 28px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 0, overflow: "auto" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeSection === s.id ? 700 : 500,
              color: activeSection === s.id ? "#2EC4B6" : "#888",
              borderBottom: activeSection === s.id ? "3px solid #2EC4B6" : "3px solid transparent",
              transition: "all .2s", whiteSpace: "nowrap",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>

        {/* ═══ OVERVIEW ═══ */}
        {activeSection === "overview" && (
          <div style={{ animation: "fadeIn .4s ease-out" }}>
            <div style={{
              background: "white", borderRadius: 24, padding: "36px 28px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", textAlign: "center", marginBottom: 28,
            }}>
              <Faseeh expression="happy" size={140} style={{ animation: "float 3s ease-in-out infinite" }} />
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1A1A2E", margin: "16px 0 8px" }}>مرحباً! أنا فصيح 🦜</h2>
              <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8, maxWidth: 500, margin: "0 auto" }}>
                ببغاء ذكي يحب تعلّم اللغات! أرافق الأطفال في رحلة تعلّم الإنجليزية — أشجّعهم عند النجاح، وأدعمهم عند الخطأ، وأحتفل معهم في كل إنجاز!
              </p>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>فلسفة العلامة التجارية</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { icon: "🎯", title: "المهمة", desc: "جعل تعلّم الإنجليزية متعة يومية لكل طفل عربي" },
                { icon: "💚", title: "القيم", desc: "التشجيع أولاً — لا إحباط أبداً — التعلم باللعب" },
                { icon: "🎨", title: "الشخصية", desc: "مرحة، دافئة، ذكية، صبورة — كصديق حقيقي" },
                { icon: "🌍", title: "الوعد", desc: "من أول كلمة إنجليزية إلى محادثة كاملة — معك في كل خطوة" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "white", borderRadius: 16, padding: "20px 18px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)", border: "1px solid #f0f0f0",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24, background: "linear-gradient(135deg, #2EC4B6 0%, #1B998B 100%)",
              borderRadius: 20, padding: "24px 22px", color: "white",
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>💡 لماذا ببغاء؟</h4>
              <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.95 }}>
                الببغاء هو الطائر الذي "يتعلم الكلام" — تماماً مثل الطفل الذي يتعلم لغة جديدة! فصيح لا يعرف الإنجليزية من البداية، بل يتعلمها مع الطفل خطوة بخطوة. هذا يخلق رابطة عاطفية: "أنا وفصيح نتعلم معاً". اسمه "فصيح" يعني البليغ في العربية — وهذا ما سيصبح عليه الطفل!
              </p>
            </div>
          </div>
        )}

        {/* ═══ MASCOT ═══ */}
        {activeSection === "mascot" && (
          <div style={{ animation: "fadeIn .4s ease-out" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", marginBottom: 6 }}>شخصية فصيح — 8 تعبيرات</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>كل تعبير يُستخدم في سياق محدد داخل التطبيق</p>

            {/* Main showcase */}
            <div style={{
              background: "white", borderRadius: 24, padding: "32px 24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)", textAlign: "center", marginBottom: 24,
            }}>
              <div style={{ animation: "pulse 2s ease-in-out infinite" }}>
                <Faseeh expression={activeExpr} size={180} />
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E" }}>
                  {expressions.find(e => e.id === activeExpr)?.label}
                </span>
                <span style={{ fontSize: 14, color: "#aaa", marginRight: 8, fontFamily: "'DM Sans'" }}>
                  {expressions.find(e => e.id === activeExpr)?.labelEn}
                </span>
              </div>
              <div style={{
                marginTop: 8, fontSize: 13, color: "#666",
                background: "#f8f8f6", borderRadius: 10, padding: "8px 16px", display: "inline-block",
              }}>
                📍 {expressions.find(e => e.id === activeExpr)?.use}
              </div>
            </div>

            {/* Expression grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {expressions.map(expr => (
                <button key={expr.id} onClick={() => setActiveExpr(expr.id)} style={{
                  background: activeExpr === expr.id ? "#2EC4B615" : "white",
                  border: `2px solid ${activeExpr === expr.id ? "#2EC4B6" : "#f0f0f0"}`,
                  borderRadius: 16, padding: "14px 8px", cursor: "pointer",
                  transition: "all .2s", textAlign: "center",
                }}>
                  <Faseeh expression={expr.id} size={60} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", marginTop: 4 }}>{expr.label}</div>
                  <div style={{ fontSize: 9, color: "#aaa", fontFamily: "'DM Sans'" }}>{expr.labelEn}</div>
                </button>
              ))}
            </div>

            <div style={{
              marginTop: 24, background: "white", borderRadius: 16, padding: "20px 18px",
              border: "1px solid #f0f0f0",
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 12 }}>📐 مواصفات التصميم</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: "#555" }}>
                <div><strong>الأسلوب:</strong> Flat illustration + SVG</div>
                <div><strong>القياس:</strong> مرن — من 40px إلى 300px</div>
                <div><strong>اللون الأساسي:</strong> تيل #2EC4B6</div>
                <div><strong>التاج:</strong> برتقالي #FF6B35 + ذهبي #FFBE0B</div>
                <div><strong>المنقار:</strong> ذهبي #FFBE0B</div>
                <div><strong>الخدود:</strong> وردي خفيف (في التعبيرات السعيدة)</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ COLORS ═══ */}
        {activeSection === "colors" && (
          <div style={{ animation: "fadeIn .4s ease-out" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", marginBottom: 20 }}>نظام الألوان</h3>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 16, letterSpacing: 1 }}>الألوان الأساسية</h4>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                <Swatch color="#2EC4B6" name="تيل فصيح" nameEn="Faseeh Teal" hex="#2EC4B6" role="اللون الرئيسي" />
                <Swatch color="#1A1A2E" name="الليل" nameEn="Night Blue" hex="#1A1A2E" role="النصوص والعناوين" />
                <Swatch color="#FFBE0B" name="الذهبي" nameEn="Quest Gold" hex="#FFBE0B" role="الإنجازات والنجوم" />
                <Swatch color="#FF6B35" name="البرتقالي" nameEn="Energy Orange" hex="#FF6B35" role="CTA والتحفيز" />
              </div>
            </div>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 16, letterSpacing: 1 }}>ألوان الحالات</h4>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                <Swatch color="#28A745" name="النجاح" nameEn="Success Green" hex="#28A745" role="إجابة صحيحة" />
                <Swatch color="#DC3545" name="الخطأ" nameEn="Gentle Red" hex="#DC3545" role="إجابة خاطئة" />
                <Swatch color="#FFC107" name="التنبيه" nameEn="Warm Yellow" hex="#FFC107" role="تلميحات وتوضيحات" />
                <Swatch color="#6C63FF" name="البنفسجي" nameEn="Magic Purple" hex="#6C63FF" role="المكافآت الخاصة" />
              </div>
            </div>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#888", marginBottom: 16, letterSpacing: 1 }}>ألوان الخلفيات</h4>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                <Swatch color="#FAFAF8" name="كريمي" nameEn="Cream" hex="#FAFAF8" role="خلفية التطبيق" />
                <Swatch color="#CBF3F0" name="تيل فاتح" nameEn="Light Teal" hex="#CBF3F0" role="بطاقات مميزة" />
                <Swatch color="#FDF6EC" name="دافئ" nameEn="Warm Beige" hex="#FDF6EC" role="خلفية بديلة" />
                <Swatch color="#FFFFFF" name="أبيض" nameEn="Pure White" hex="#FFFFFF" role="البطاقات الأساسية" />
              </div>
            </div>

            {/* gradient bar */}
            <div style={{
              marginTop: 20, height: 48, borderRadius: 14, overflow: "hidden",
              background: "linear-gradient(90deg, #2EC4B6 0%, #1B998B 25%, #FFBE0B 50%, #FF6B35 75%, #1A1A2E 100%)",
              boxShadow: "0 4px 16px rgba(46,196,182,0.2)",
            }} />
            <div style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 6 }}>
              التدرج اللوني الكامل لعلامة English Quest
            </div>
          </div>
        )}

        {/* ═══ TYPOGRAPHY ═══ */}
        {activeSection === "typography" && (
          <div style={{ animation: "fadeIn .4s ease-out" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", marginBottom: 20 }}>نظام الخطوط</h3>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: "#2EC4B6", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>العربية — PRIMARY</div>
              <div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 36, fontWeight: 800, color: "#1A1A2E", marginBottom: 4 }}>نوتو كوفي عربي</div>
              <div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 14, color: "#666", lineHeight: 2, marginBottom: 16 }}>
                أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ — خط عربي حديث ومقروء للأطفال، يتوافق مع معايير Google Fonts ويدعم جميع الحركات.
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[400, 500, 600, 700, 800].map(w => (
                  <div key={w} style={{ fontFamily: "'Noto Kufi Arabic'", fontWeight: w, fontSize: 16, color: "#444" }}>
                    {w} — مرحباً
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>ENGLISH — DISPLAY</div>
              <div style={{ fontFamily: "'Fredoka'", fontSize: 36, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>Fredoka</div>
              <div style={{ fontFamily: "'Fredoka'", fontSize: 14, color: "#666", lineHeight: 2, marginBottom: 16 }}>
                A B C D E F G H I J K L M N O P Q R S T U V W X Y Z — Friendly, rounded, child-safe typeface with playful personality.
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[400, 500, 600, 700].map(w => (
                  <div key={w} style={{ fontFamily: "'Fredoka'", fontWeight: w, fontSize: 16, color: "#444" }}>
                    {w} — Hello
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 12, color: "#1A1A2E", fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>ENGLISH — BODY / UI</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 36, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>DM Sans</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "#666", lineHeight: 2 }}>
                Clean geometric sans-serif for UI elements, buttons, labels, and parent dashboard. Professional yet approachable.
              </div>
            </div>

            <div style={{
              marginTop: 20, background: "#1A1A2E", borderRadius: 16, padding: "24px 20px", color: "white",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2EC4B6", marginBottom: 12 }}>📏 سلم الأحجام (Type Scale)</div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "8px 16px", fontSize: 12 }}>
                <div style={{ color: "#888" }}>الحجم</div><div style={{ color: "#888" }}>العربية</div><div style={{ color: "#888" }}>English</div>
                <div style={{ color: "#FFBE0B" }}>36px</div><div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 20, fontWeight: 800 }}>عنوان رئيسي</div><div style={{ fontFamily: "'Fredoka'", fontSize: 20, fontWeight: 700 }}>Main Title</div>
                <div style={{ color: "#FFBE0B" }}>24px</div><div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 16, fontWeight: 700 }}>عنوان فرعي</div><div style={{ fontFamily: "'Fredoka'", fontSize: 16, fontWeight: 600 }}>Subtitle</div>
                <div style={{ color: "#FFBE0B" }}>18px</div><div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 14, fontWeight: 600 }}>الكلمة المعروضة</div><div style={{ fontFamily: "'Fredoka'", fontSize: 14, fontWeight: 600 }}>Word Display</div>
                <div style={{ color: "#FFBE0B" }}>14px</div><div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 12, fontWeight: 500 }}>نص عادي</div><div style={{ fontFamily: "'DM Sans'", fontSize: 12 }}>Body text</div>
                <div style={{ color: "#FFBE0B" }}>12px</div><div style={{ fontFamily: "'Noto Kufi Arabic'", fontSize: 11, fontWeight: 400 }}>تسمية صغيرة</div><div style={{ fontFamily: "'DM Sans'", fontSize: 11 }}>Caption</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BRAND VOICE ═══ */}
        {activeSection === "voice" && (
          <div style={{ animation: "fadeIn .4s ease-out" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", marginBottom: 20 }}>صوت العلامة التجارية</h3>

            <div style={{
              background: "white", borderRadius: 20, padding: "28px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", marginBottom: 16,
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#2EC4B6", marginBottom: 16 }}>🗣️ كيف يتحدث فصيح مع الطفل؟</h4>
              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { situation: "عند الإجابة الصحيحة", good: "🎉 يا بطل! إجابة ممتازة!", bad: "إجابة صحيحة.", icon: "✅" },
                  { situation: "عند الإجابة الخاطئة", good: "😊 لا بأس! الكلمة هي Apple — جرّب مرة ثانية!", bad: "❌ خطأ. الإجابة Apple.", icon: "💪" },
                  { situation: "عند العودة بعد غياب", good: "🥳 اشتقتلك! يلا نكمّل من وين وقفنا!", bad: "مرحباً. لم تكمل الدرس السابق.", icon: "🤗" },
                  { situation: "عند إكمال مستوى", good: "🏆 ما شاء الله! خلّصت مستوى الحيوانات! جاهز للمغامرة الجاية؟", bad: "تم إكمال المستوى. انتقل للتالي.", icon: "🌟" },
                  { situation: "عند الصعوبة", good: "🤔 هالكلمة صعبة شوي... خلني أساعدك! الحرف الأول هو...", bad: "استخدم التلميح.", icon: "🧩" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#f8f8f6", borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>{item.icon} {item.situation}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "#d4edda", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#155724", lineHeight: 1.7 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: "#28a745" }}>✅ صح</div>
                        {item.good}
                      </div>
                      <div style={{ background: "#f8d7da", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#721c24", lineHeight: 1.7 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: "#dc3545" }}>❌ خطأ</div>
                        {item.bad}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #2EC4B6 0%, #1B998B 100%)",
              borderRadius: 20, padding: "28px 24px", color: "white", marginBottom: 16,
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>✨ القواعد الذهبية لصوت فصيح</h4>
              <div style={{ display: "grid", gap: 10, fontSize: 13, lineHeight: 1.8 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px" }}>🌟 <strong>شجّع دائماً</strong> — حتى عند الخطأ، ابدأ بكلمة إيجابية</div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px" }}>🗣️ <strong>تحدّث بلهجة قريبة</strong> — "يلا" و"يا بطل" بدل "هيا" و"عزيزي المتعلم"</div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px" }}>📏 <strong>جمل قصيرة</strong> — لا تتجاوز 10 كلمات لكل رسالة</div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px" }}>🎮 <strong>استخدم لغة اللعب</strong> — "مغامرة" و"مهمة" و"بطل" بدل "درس" و"اختبار"</div>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px" }}>🚫 <strong>لا تُحبط أبداً</strong> — لا "خطأ" ولا "فشلت" — بل "جرّب مرة ثانية!" و"قريب!"</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

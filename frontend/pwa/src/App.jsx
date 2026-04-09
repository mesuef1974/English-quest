import { useState, useEffect } from "react";
import EnglishQuestGame from "./game/EnglishQuestV2.jsx";

export default function App() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Capture install prompt
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);

    // Online/offline status
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <>
      {/* Install banner */}
      {installPrompt && !isInstalled && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: "linear-gradient(135deg, #2EC4B6, #1B998B)",
          padding: "14px 20px", display: "flex", alignItems: "center",
          justifyContent: "space-between", direction: "rtl",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}>
          <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
            📲 ثبّت English Quest على جهازك!
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleInstall} style={{
              padding: "8px 20px", borderRadius: 20, border: "none",
              background: "white", color: "#1B998B", fontSize: 13,
              fontWeight: 700, cursor: "pointer",
            }}>تثبيت</button>
            <button onClick={() => setInstallPrompt(null)} style={{
              padding: "8px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)",
              background: "transparent", color: "white", fontSize: 12,
              cursor: "pointer",
            }}>لاحقاً</button>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "#FFBE0B", padding: "6px", textAlign: "center",
          fontSize: 12, fontWeight: 600, color: "#1A1A2E", direction: "rtl",
        }}>
          📴 بدون إنترنت — النطق الصوتي قد لا يعمل
        </div>
      )}

      <EnglishQuestGame />
    </>
  );
}

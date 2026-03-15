import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════
// DELIVERIZON — Demo Hub
// Landing page shown during Q&A. Two big cards, instant access.
// ═══════════════════════════════════════════════════════════════

export default function Hub() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0A; }
        .hub-card {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hub-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0A0A0A", fontFamily: "'DM Sans',-apple-system,sans-serif",
        padding: "40px",
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: 48,
          animation: "fade-up 0.5s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "#EE0000",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>🤖</div>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.5px" }}>
              DELIVERIZON
            </span>
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            5G-Powered Autonomous Delivery • Interactive Demo
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: "flex", gap: 28, animation: "fade-up 0.6s ease-out 0.15s both",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {/* Card 1: Try a Delivery */}
          <div
            className="hub-card"
            onClick={() => navigate("/demo")}
            style={{
              width: 420, borderRadius: 24, background: "#141414",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Card visual */}
            <div style={{
              height: 200, background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative phone frame */}
              <div style={{
                width: 100, height: 180, borderRadius: 18, background: "#FFF",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8, padding: "12px",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 12, fontWeight: 700 }}>S</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: "#1A1A1A" }}>Sierre</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 6px", borderRadius: 4, background: "#F0FDF4" }}>
                  <span style={{ fontSize: 8 }}>☂️</span>
                  <span style={{ fontSize: 6, fontWeight: 600 }}>Umbrella</span>
                </div>
                <div style={{ width: "80%", height: 20, borderRadius: 6, background: "#EE0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 5.5, fontWeight: 700, color: "#FFF" }}>SEND</span>
                </div>
              </div>

              {/* Floating bot */}
              <div style={{
                position: "absolute", bottom: 20, right: 40,
                fontSize: 36, opacity: 0.3,
              }}>🤖</div>
            </div>

            {/* Card text */}
            <div style={{ padding: "24px 28px 28px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>
                Try a Delivery
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                Walk through a complete peer-to-peer delivery — from request to drop-off
              </div>
              <div style={{
                marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12, background: "#EE0000",
                color: "#FFF", fontSize: 13, fontWeight: 700,
              }}>
                Launch Demo →
              </div>
            </div>
          </div>

          {/* Card 2: Fleet Intelligence */}
          <div
            className="hub-card"
            onClick={() => navigate("/fleet")}
            style={{
              width: 420, borderRadius: 24, background: "#141414",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Card visual */}
            <div style={{
              height: 200, background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative map dots */}
              <svg viewBox="0 0 200 120" width="200" height="120">
                <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="60" y1="0" x2="60" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="140" y1="0" x2="140" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <polyline points="40,90 70,60 110,45 150,35" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
                <circle cx="40" cy="90" r="5" fill="#EE0000" opacity="0.7" />
                <circle cx="100" cy="55" r="4" fill="rgba(255,255,255,0.3)" />
                <circle cx="150" cy="35" r="5" fill="#8B5CF6" opacity="0.7" />
                <circle cx="60" cy="40" r="3" fill="rgba(255,255,255,0.2)" />
                <circle cx="170" cy="80" r="3" fill="rgba(255,255,255,0.2)" />
                <circle cx="70" cy="60" r="6" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" opacity="0.9" />
                <circle cx="130" cy="70" r="6" fill="#10B981" stroke="#FFF" strokeWidth="1.5" opacity="0.9" />
              </svg>
              <div style={{
                position: "absolute", top: 15, right: 25,
                width: 40, height: 40, borderRadius: "50%",
                border: "1.5px solid rgba(59,130,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
                </div>
              </div>
            </div>

            {/* Card text */}
            <div style={{ padding: "24px 28px 28px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", marginBottom: 8 }}>
                Fleet Intelligence
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                See how the 5G network selects and dispatches bots in real time
              </div>
              <div style={{
                marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12, background: "#3B82F6",
                color: "#FFF", fontSize: 13, fontWeight: 700,
              }}>
                Launch Demo →
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          marginTop: 40, fontSize: 12, color: "rgba(255,255,255,0.2)",
          animation: "fade-up 0.6s ease-out 0.3s both",
        }}>
          Powered by <span style={{ color: "#EE0000", fontWeight: 700 }}>Verizon 5G</span> + MEC •
          Northeastern University • Verizon Smart Campus Competition 2026
        </div>
      </div>
    </>
  );
}
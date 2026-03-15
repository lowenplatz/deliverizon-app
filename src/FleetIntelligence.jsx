import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════
// DELIVERIZON — Fleet Intelligence
// Toggle between Phase 1 (single campus) and Phase 2 (multi)
// Loads the standalone HTML files via iframe
// ═══════════════════════════════════════════════════════════════

export default function FleetIntelligence() {
  const [phase, setPhase] = useState(1);
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0A; }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh", display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans',-apple-system,sans-serif", background: "#0A0A0A", overflow: "hidden",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0, zIndex: 10,
        }}>
          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate("/")}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#FFF",
              }}
            >←</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: "#EE0000",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>🤖</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#FFF" }}>Fleet Intelligence</span>
            </div>
          </div>

          {/* Center: phase toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3,
          }}>
            <button
              onClick={() => setPhase(1)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: phase === 1 ? "#3B82F6" : "transparent",
                color: phase === 1 ? "#FFF" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              Phase 1 — Bot Selection
            </button>
            <button
              onClick={() => setPhase(2)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: phase === 2 ? "#3B82F6" : "transparent",
                color: phase === 2 ? "#FFF" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              Phase 2 — Fleet Dispatch
            </button>
          </div>

          {/* Right: 5G badge */}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Powered by <span style={{ color: "#EE0000", fontWeight: 700 }}>Verizon 5G</span>
          </div>
        </div>

        {/* Iframe content */}
        <div style={{ flex: 1, position: "relative" }}>
          <iframe
            key={phase}
            src={phase === 1 ? "/phase1-fleet.html" : "/phase2-fleet.html"}
            style={{
              width: "100%", height: "100%", border: "none",
              background: "#F0F1F3",
            }}
            title={`Fleet Phase ${phase}`}
          />
        </div>
      </div>
    </>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const JUDGES = [
  // Verizon
  { id: "suzanne_s", name: "Suzanne S." },
  { id: "paul_su",   name: "Paul S." },
  { id: "adam_t",    name: "Adam T." },
  { id: "sudhir_k",  name: "Sudhir K." },
  { id: "ed_r",      name: "Ed R." },
  { id: "mirela_m",  name: "Mirela M." },
  { id: "michael_r", name: "Michael R." },
  { id: "tom_c",     name: "Tom C." },
  // Northeastern
  { id: "elizabeth_z", name: "Elizabeth Z." },
  { id: "christine_b", name: "Christine B." },
  { id: "elizabeth_m", name: "Elizabeth M." },
  { id: "kal_b",       name: "Kal B." },
];

const ZONES = [
  { id: "snell", name: "Snell Library", x: 420, y: 195 },
  { id: "isec", name: "ISEC", x: 105, y: 340 },
  { id: "curry", name: "Curry Student Center", x: 330, y: 145 },
  { id: "ell", name: "ELL Hall", x: 370, y: 55 },
  { id: "marino", name: "Marino Center", x: 240, y: 38 },
  { id: "richards", name: "Richards Hall", x: 560, y: 270 },
  { id: "forsyth", name: "Forsyth Building", x: 360, y: 385 },
  { id: "west_village", name: "West Village H", x: 68, y: 300 },
  { id: "shillman", name: "Shillman Hall", x: 495, y: 145 },
];

const CORRECT_CODE = "4829";

function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }

function getWaypoints(fromZone, toZone) {
  const f = fromZone, t = toZone;
  const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
  return [
    { x: f.x, y: f.y },
    { x: lerp(f.x, mx, 0.5), y: lerp(f.y, my, 0.4) + 15 },
    { x: mx, y: my },
    { x: lerp(mx, t.x, 0.5), y: lerp(my, t.y, 0.6) - 10 },
    { x: t.x, y: t.y },
  ];
}

function getBotPosition(waypoints, progress) {
  const n = waypoints.length - 1;
  const f = progress * n;
  const seg = Math.min(Math.floor(f), n - 1);
  const t = f - seg;
  return {
    x: lerp(waypoints[seg].x, waypoints[seg + 1].x, t),
    y: lerp(waypoints[seg].y, waypoints[seg + 1].y, t),
  };
}

function buildTraveled(waypoints, progress) {
  const pts = [];
  const n = waypoints.length - 1;
  const f = progress * n;
  const cs = Math.floor(f);
  const t = f - cs;
  for (let i = 0; i <= cs && i < waypoints.length; i++) pts.push(waypoints[i]);
  if (cs < n) pts.push({ x: lerp(waypoints[cs].x, waypoints[cs + 1].x, t), y: lerp(waypoints[cs].y, waypoints[cs + 1].y, t) });
  return pts;
}

function StatusBar() {
  return (
    <div style={{
      height: 54, padding: "14px 28px 0",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontSize: 14, fontWeight: 600, color: "#1A1A1A", flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1A1A1A">
          <rect x="0" y="5" width="3" height="6" rx="1" />
          <rect x="4.5" y="3" width="3" height="8" rx="1" />
          <rect x="9" y="1" width="3" height="10" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" opacity="0.3" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="#1A1A1A" strokeWidth="1" />
          <rect x="22" y="3.5" width="2" height="5" rx="1" fill="#1A1A1A" opacity="0.3" />
          <rect x="1.5" y="2.5" width="14" height="7" rx="1.5" fill="#10B981" />
        </svg>
      </div>
    </div>
  );
}

function HomeBar() {
  return (
    <div style={{ height: 24, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 6, flexShrink: 0 }}>
      <div style={{ width: 134, height: 4, borderRadius: 2, background: "#1A1A1A", opacity: 0.15 }} />
    </div>
  );
}

function CampusMap({ children }) {
  return (
    <svg viewBox="0 0 630 430" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="mgrid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#DBDDE1" strokeWidth="0.4" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="630" height="430" fill="#ECEEF1" />
      <rect width="630" height="430" fill="url(#mgrid)" />
      <line x1="0" y1="110" x2="630" y2="110" stroke="#D1D5DB" strokeWidth="5" opacity="0.25" />
      <line x1="0" y1="290" x2="630" y2="290" stroke="#D1D5DB" strokeWidth="4" opacity="0.2" />
      <line x1="210" y1="0" x2="210" y2="430" stroke="#D1D5DB" strokeWidth="4" opacity="0.2" />
      <line x1="450" y1="0" x2="450" y2="430" stroke="#D1D5DB" strokeWidth="4" opacity="0.2" />
      <rect x="250" y="120" width="120" height="80" rx="10" fill="#DCE8D4" opacity="0.4" />
      <text x="285" y="167" fill="#AAB89F" fontSize="8" fontFamily="'DM Sans',sans-serif" fontWeight="500">CENTENNIAL</text>
      {children}
    </svg>
  );
}

function ZoneMarker({ zone, selected, onTap, dimmed }) {
  return (
    <g onClick={onTap} style={onTap ? { cursor: "pointer" } : undefined}>
      {selected && (
        <>
          <circle cx={zone.x} cy={zone.y} r={26} fill="#EE0000" opacity="0.08">
            <animate attributeName="r" values="18;28;18" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.04;0.15" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={zone.x} cy={zone.y} r={20} fill="#EE0000" opacity="0.14" />
        </>
      )}
      <circle
        cx={zone.x} cy={zone.y}
        r={selected ? 13 : dimmed ? 6 : 9}
        fill={selected ? "#EE0000" : dimmed ? "#B0B5BF" : "#1A1A1A"}
        style={{ transition: "all 0.15s" }}
      />
      {!dimmed && <circle cx={zone.x} cy={zone.y} r={selected ? 6 : 4} fill="#FFF" opacity="0.85" />}
      <text
        x={zone.x} y={zone.y + (selected ? 27 : dimmed ? 18 : 22)}
        textAnchor="middle"
        fill={selected ? "#EE0000" : dimmed ? "#B0B5BF" : "#374151"}
        fontSize={selected ? "11" : dimmed ? "8" : "9"}
        fontWeight={selected ? "700" : "500"}
        fontFamily="'DM Sans',sans-serif"
      >
        {zone.name}
      </text>
    </g>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(1);
  const [transitionOverlay, setTransitionOverlay] = useState(null);

  // Screen 1 — pre-filled defaults
  const [recipient, setRecipient] = useState(JUDGES[0]);
  const [itemName, setItemName] = useState("");
  const [pickupZone, setPickupZone] = useState(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [confirmAnim, setConfirmAnim] = useState(0);

  // Screen 2
  const [recipientChoice, setRecipientChoice] = useState(null);
  const [dropoffZone, setDropoffZone] = useState(null);

  // Screen 3
  const [s3Progress, setS3Progress] = useState(0);
  const [s3Arrived, setS3Arrived] = useState(false);
  const [s3Deposited, setS3Deposited] = useState(false);

  // Screen 4
  const [s4Progress, setS4Progress] = useState(0);
  const [s4Arrived, setS4Arrived] = useState(false);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [focusIdx, setFocusIdx] = useState(0);
  const [codeState, setCodeState] = useState("tracking");
  const [shake, setShake] = useState(false);
  const [codePhaseVisible, setCodePhaseVisible] = useState(false);
  const inputRefs = useRef([]);

  const senderZone = pickupZone ? ZONES.find(z => z.id === pickupZone) : ZONES.find(z => z.id === "snell");
  const receiverZone = dropoffZone ? ZONES.find(z => z.id === dropoffZone) : ZONES.find(z => z.id === "west_village");

  const s3Waypoints = senderZone ? getWaypoints({ x: 290, y: 340 }, senderZone) : [];
  useEffect(() => {
    if (screen !== 3 || s3Arrived) return;
    const iv = setInterval(() => {
      setS3Progress(p => { if (p + 0.002 >= 1) { setS3Arrived(true); return 1; } return p + 0.002; });
    }, 40);
    return () => clearInterval(iv);
  }, [screen, s3Arrived]);

  const s4Waypoints = receiverZone ? getWaypoints({ x: 290, y: 180 }, receiverZone) : [];
  useEffect(() => {
    if (screen !== 4 || s4Arrived) return;
    const iv = setInterval(() => {
      setS4Progress(p => {
        if (p + 0.002 >= 1) {
          setS4Arrived(true);
          setCodeState("entering");
          setTimeout(() => setCodePhaseVisible(true), 150);
          return 1;
        }
        return p + 0.002;
      });
    }, 40);
    return () => clearInterval(iv);
  }, [screen, s4Arrived]);

  useEffect(() => {
    if (codeState === "entering") setTimeout(() => inputRefs.current[0]?.focus(), 350);
  }, [codeState]);

  function showTransition(text, callback) {
    setTransitionOverlay({ text });
    setTimeout(() => {
      callback();
      setTimeout(() => setTransitionOverlay(null), 350);
    }, 500);
  }

  function handleSendConfirm() {
    setShowSendConfirm(true);
    setTimeout(() => setConfirmAnim(1), 100);
    setTimeout(() => setConfirmAnim(2), 700);
  }
  function goToScreen2() {
    const firstName = recipient?.name?.split(" ")[0] || "Recipient";
    showTransition(`Switching to ${firstName}'s view…`, () => {
      setScreen(2); setShowSendConfirm(false); setConfirmAnim(0);
    });
  }
  function goToScreen3() {
    showTransition("Switching to Sneha's view…", () => setScreen(3));
  }
  function handleDeposit() {
    setS3Deposited(true);
    const firstName = recipient?.name?.split(" ")[0] || "Recipient";
    setTimeout(() => {
      showTransition(`Switching to ${firstName}'s view…`, () => setScreen(4));
    }, 1500);
  }

  function handleDigit(index, value) {
    if (codeState !== "entering") return;
    const val = value.replace(/[^0-9]/g, "").slice(-1);
    const nd = [...digits]; nd[index] = val; setDigits(nd);
    if (val && index < 3) { setFocusIdx(index + 1); inputRefs.current[index + 1]?.focus(); }
  }
  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      setFocusIdx(index - 1); inputRefs.current[index - 1]?.focus();
      const nd = [...digits]; nd[index - 1] = ""; setDigits(nd);
    }
  }
  function handleUnlock() {
    const code = digits.join("");
    if (code !== CORRECT_CODE) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => { setDigits(["", "", "", ""]); setFocusIdx(0); inputRefs.current[0]?.focus(); }, 700);
      return;
    }
    setCodeState("unlocking");
    setTimeout(() => setCodeState("complete"), 900);
  }
  function handleFullReset() {
    setScreen(1); setRecipient(JUDGES[0]); setItemName(""); setPickupZone(null);
    setShowSendConfirm(false); setConfirmAnim(0);
    setRecipientChoice(null); setDropoffZone(null);
    setS3Progress(0); setS3Arrived(false); setS3Deposited(false);
    setS4Progress(0); setS4Arrived(false);
    setDigits(["", "", "", ""]); setFocusIdx(0);
    setCodeState("tracking"); setShake(false); setCodePhaseVisible(false);
    setTransitionOverlay(null);
  }

  const canSend = recipient && itemName.trim() && pickupZone;
  const canProceedS2 = recipientChoice === "later" || recipientChoice === "now";
  const s3Bot = s3Waypoints.length ? getBotPosition(s3Waypoints, s3Progress) : { x: 290, y: 340 };
  const s4Bot = s4Waypoints.length ? getBotPosition(s4Waypoints, s4Progress) : { x: 290, y: 180 };

  const recipientFirstName = recipient?.name?.split(" ")[0] || "Recipient";
  const contextLabel = screen === 1 || screen === 3 ? "Sneha C. · Sender" : `${recipientFirstName} · Recipient`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #F0F1F3; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-pop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes ring-draw { from { stroke-dashoffset: 289; } to { stroke-dashoffset: 0; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(180px) rotate(720deg); opacity: 0; } }
        @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes overlay-out { from { opacity: 1; } to { opacity: 0; } }
        input:focus { outline: none; }
        input::placeholder { color: #9CA3AF; }
      `}</style>

      <div style={{
        width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F0F1F3", fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 1000,
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
            background: "#FFFFFF", cursor: "pointer",
            fontFamily: "'DM Sans',-apple-system,sans-serif",
            fontSize: 13, fontWeight: 700, color: "#1A1A1A",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >← Hub</button>

        {/* Phone frame — 420px wide */}
        <div style={{
          width: 420, height: 844, borderRadius: 44, background: "#FFFFFF",
          boxShadow: "0 25px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
        }}>

          {/* Perspective transition overlay */}
          {transitionOverlay && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 50,
              background: "rgba(8,8,8,0.90)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 44,
              animation: "overlay-in 0.2s ease-out forwards",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FFF", letterSpacing: "0.2px" }}>
                  {transitionOverlay.text}
                </div>
                <div style={{ width: 28, height: 2, background: "#EE0000", borderRadius: 2, margin: "10px auto 0" }} />
              </div>
            </div>
          )}

          <StatusBar />

          {/* Minimal context line — replaces all nav chrome */}
          <div style={{ padding: "1px 22px 7px", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{contextLabel}</span>
          </div>

          {/* ═══ SCREEN 1: SEND ═══ */}
          {screen === 1 && !showSendConfirm && (
            <div style={{ flex: 1, overflow: "hidden", padding: "0 20px 0", display: "flex", flexDirection: "column" }}>

              {/* Compact form — two tight rows */}
              <div style={{ flexShrink: 0, marginBottom: 8 }}>
                {/* Recipient row */}
                <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", display: "block", marginBottom: 5 }}>SEND TO</label>
                <div style={{ marginBottom: 8 }}>
                  <select
                    value={recipient?.id || ""}
                    onChange={e => setRecipient(JUDGES.find(j => j.id === e.target.value))}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 12,
                      border: "2px solid #F3F4F6", background: "#F9FAFB",
                      fontSize: 14, fontWeight: 600, color: "#1A1A1A",
                      fontFamily: "inherit", cursor: "pointer", appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239CA3AF' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                    }}
                  >
                    {JUDGES.map(j => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>

                {/* Item */}
                <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "9px 12px", border: "1.5px solid #F3F4F6", display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text" placeholder="Item name" value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#1A1A1A", fontFamily: "inherit", fontWeight: 500 }}
                  />
                </div>
              </div>

              {/* Pickup zone label */}
              <label style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.8px", display: "block", marginBottom: 5, flexShrink: 0 }}>PICKUP ZONE</label>

              {/* Big map — takes all remaining space */}
              <div style={{ flex: 1, borderRadius: 18, overflow: "hidden", background: "#ECEEF1", position: "relative", minHeight: 200 }}>
                <CampusMap>
                  {ZONES.map(z => <ZoneMarker key={z.id} zone={z} selected={pickupZone === z.id} onTap={() => setPickupZone(z.id)} />)}
                </CampusMap>
                {pickupZone && (
                  <div style={{
                    position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                    background: "rgba(238,0,0,0.95)", color: "#FFF", padding: "7px 16px",
                    borderRadius: 10, fontSize: 13, fontWeight: 700,
                    animation: "fade-up 0.2s ease-out", whiteSpace: "nowrap",
                  }}>
                    📍 {ZONES.find(z => z.id === pickupZone)?.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Screen 1 confirm */}
          {screen === 1 && showSendConfirm && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
              <div style={{ position: "relative", width: 90, height: 90, marginBottom: 24 }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute" }}>
                  <circle cx="45" cy="45" r="40" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="289" strokeLinecap="round"
                    style={{ animation: confirmAnim >= 1 ? "ring-draw 0.5s ease-out forwards" : "none", strokeDashoffset: confirmAnim >= 1 ? undefined : 289 }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${confirmAnim >= 2 ? 1 : 0})`, fontSize: 38, transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>✓</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A1A", marginBottom: 6, opacity: confirmAnim >= 2 ? 1 : 0, transition: "opacity 0.3s 0.1s" }}>Delivery Requested!</div>
              <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, opacity: confirmAnim >= 2 ? 1 : 0, transition: "opacity 0.3s 0.2s" }}>
                Waiting for <strong style={{ color: "#1A1A1A" }}>{recipient?.name}</strong> to accept
              </div>
              <button onClick={goToScreen2} style={{
                padding: "14px 36px", borderRadius: 14, border: "none", background: "#EE0000",
                color: "#FFF", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                opacity: confirmAnim >= 2 ? 1 : 0, transition: "opacity 0.3s 0.3s",
              }}>
                Continue →
              </button>
            </div>
          )}

          {/* ═══ SCREEN 2: ACCEPT ═══ */}
          {screen === 2 && (
            <div style={{ flex: 1, overflow: "auto", padding: "4px 20px 0" }}>

              {/* Big dramatic notification card */}
              <div style={{ background: "#1A1A1A", borderRadius: 22, padding: "24px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "1px", marginBottom: 14 }}>INCOMING DELIVERY</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                  <div style={{ width: 58, height: 58, borderRadius: 16, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>☂️</div>
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: "#FFF", lineHeight: 1.1 }}>{itemName || "Umbrella"}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 5 }}>from Sneha</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                  From {ZONES.find(z => z.id === pickupZone)?.name || "Snell Library"} · Now
                </div>
              </div>

              {/* Choice buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                <button
                  onClick={() => { setRecipientChoice("now"); setDropoffZone("west_village"); }}
                  style={{
                    padding: "18px", borderRadius: 18,
                    border: recipientChoice === "now" ? "2px solid #EE0000" : "2px solid #F3F4F6",
                    background: recipientChoice === "now" ? "#FFF5F5" : "#F9FAFB",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: recipientChoice === "now" ? "#EE0000" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.15s", flexShrink: 0 }}>📍</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>Receive Now</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Deliver to your location: West Village H</div>
                  </div>
                </button>
                <button
                  onClick={() => setRecipientChoice("later")}
                  style={{
                    padding: "18px", borderRadius: 18,
                    border: recipientChoice === "later" ? "2px solid #EE0000" : "2px solid #F3F4F6",
                    background: recipientChoice === "later" ? "#FFF5F5" : "#F9FAFB",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: recipientChoice === "later" ? "#EE0000" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.15s", flexShrink: 0 }}>🏪</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>Receive Later</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Schedule for later — item held at the hub</div>
                  </div>
                </button>
              </div>

              {/* Confirmation — no map */}
              {recipientChoice === "now" && (
                <div style={{ background: "#FFF5F5", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, animation: "fade-up 0.2s ease-out" }}>
                  <span style={{ fontSize: 14 }}>📍</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#EE0000" }}>Delivering to West Village H</span>
                </div>
              )}
              {recipientChoice === "later" && (
                <div style={{ background: "#F0FDF4", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, animation: "fade-up 0.25s ease-out" }}>
                  <span style={{ fontSize: 14 }}>🕐</span>
                  <div style={{ fontSize: 13, color: "#059669", lineHeight: 1.4 }}>Scheduling for later — your item will be stored at the <strong>Deliverizon Hub</strong> until you're ready to pick it up.</div>
                </div>
              )}
            </div>
          )}

          {/* ═══ SCREEN 3: SENDER TRACKING ═══ */}
          {screen === 3 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "4px 20px 0", flexShrink: 0 }}>
                <div style={{ background: s3Arrived ? "#F0FDF4" : "#1A1A1A", borderRadius: 20, padding: "16px 18px", transition: "background 0.5s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: s3Arrived ? "#10B981" : "#EE0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.5s" }}>{s3Arrived ? "✅" : "🤖"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: s3Arrived ? "#1A1A1A" : "#FFF", transition: "color 0.5s" }}>{s3Arrived ? "Bot arrived at pickup!" : "Deliverizer 2 en route"}</div>
                      <div style={{ fontSize: 12, color: s3Arrived ? "#6B7280" : "rgba(255,255,255,0.5)", marginTop: 2 }}>{s3Arrived ? "Deposit your item now" : `Heading to ${senderZone?.name}`}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map — fills remaining space */}
              <div style={{ flex: 1, margin: "10px 20px", borderRadius: 20, overflow: "hidden", background: "#ECEEF1" }}>
                <CampusMap>
                  {ZONES.map(z => <ZoneMarker key={z.id} zone={z} dimmed={z.id !== pickupZone} selected={z.id === pickupZone} />)}
                  <polyline points={s3Waypoints.map(w => `${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.2" strokeLinecap="round" />
                  {buildTraveled(s3Waypoints, s3Progress).length >= 2 && (
                    <polyline points={buildTraveled(s3Waypoints, s3Progress).map(w => `${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  )}
                  <g filter="url(#glow)">
                    <circle cx={s3Bot.x} cy={s3Bot.y} r={8} fill="#3B82F6" opacity="0.1">
                      <animate attributeName="r" values="8;22;8" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={s3Bot.x} cy={s3Bot.y} r={s3Arrived ? 11 : 9} fill={s3Arrived ? "#10B981" : "#3B82F6"} stroke="#FFF" strokeWidth="2.5" style={{ transition: "all 0.5s" }} />
                    <text x={s3Bot.x} y={s3Bot.y + 3.5} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800" fontFamily="'DM Sans',sans-serif">{s3Arrived ? "✓" : "🤖"}</text>
                  </g>
                </CampusMap>
              </div>

              {/* Bottom action — no item card, just button or status */}
              <div style={{ padding: "0 20px 8px", flexShrink: 0 }}>
                {s3Arrived && !s3Deposited && (
                  <button onClick={handleDeposit} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "#EE0000", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", animation: "fade-up 0.3s ease-out" }}>
                    I've Deposited My Item ✓
                  </button>
                )}
                {s3Deposited && (
                  <div style={{ background: "#F0FDF4", borderRadius: 16, padding: "16px", textAlign: "center", animation: "fade-up 0.3s ease-out" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#059669" }}>✅ Secured!</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>Item secured, bot heading to {recipient?.name || "Recipient"}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ SCREEN 4: RECIPIENT TRACKING + CODE ═══ */}
          {screen === 4 && codeState !== "complete" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "4px 20px 0", flexShrink: 0 }}>
                <div style={{ background: s4Arrived ? "#F0FDF4" : "#1A1A1A", borderRadius: 20, padding: "16px 18px", transition: "background 0.5s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: s4Arrived ? "#10B981" : "#EE0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "background 0.5s" }}>{s4Arrived ? "📍" : "🤖"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: s4Arrived ? "#1A1A1A" : "#FFF", transition: "color 0.5s" }}>{s4Arrived ? "Your Deliverizer arrived!" : "Deliverizer 2 en route"}</div>
                      <div style={{ fontSize: 12, color: s4Arrived ? "#6B7280" : "rgba(255,255,255,0.5)", marginTop: 2 }}>{s4Arrived ? "Enter code to unlock compartment" : `Heading to ${receiverZone?.name}`}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crossfade: map → code entry */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                {/* Map phase */}
                <div style={{
                  position: "absolute", inset: 0,
                  opacity: s4Arrived ? 0 : 1,
                  transition: "opacity 0.5s ease-in-out",
                  pointerEvents: s4Arrived ? "none" : "auto",
                  margin: "10px 20px",
                  borderRadius: 20, overflow: "hidden", background: "#ECEEF1",
                }}>
                  <CampusMap>
                    {ZONES.map(z => <ZoneMarker key={z.id} zone={z} dimmed={z.id !== (dropoffZone || "west_village")} selected={z.id === (dropoffZone || "west_village")} />)}
                    <polyline points={s4Waypoints.map(w => `${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.2" strokeLinecap="round" />
                    {buildTraveled(s4Waypoints, s4Progress).length >= 2 && (
                      <polyline points={buildTraveled(s4Waypoints, s4Progress).map(w => `${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    )}
                    <g filter="url(#glow)">
                      <circle cx={s4Bot.x} cy={s4Bot.y} r={8} fill="#3B82F6" opacity="0.1">
                        <animate attributeName="r" values="8;22;8" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={s4Bot.x} cy={s4Bot.y} r={9} fill="#3B82F6" stroke="#FFF" strokeWidth="2.5" />
                      <text x={s4Bot.x} y={s4Bot.y + 3.5} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800" fontFamily="'DM Sans',sans-serif">🤖</text>
                    </g>
                  </CampusMap>
                </div>

                {/* Code entry phase — fades in */}
                <div style={{
                  position: "absolute", inset: 0,
                  opacity: codePhaseVisible ? 1 : 0,
                  transition: "opacity 0.5s ease-in-out",
                  pointerEvents: codePhaseVisible ? "auto" : "none",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "20px 28px 0",
                }}>
                  {/* Lock icon — simple locked / unlocked */}
                  <div style={{
                    width: 76, height: 76, borderRadius: 20,
                    background: codeState === "unlocking" ? "#D1FAE5" : "#F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 14, transition: "background 0.4s",
                  }}>
                    {codeState === "unlocking" ? (
                      <div style={{ fontSize: 34, animation: "scale-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)" }}>🔓</div>
                    ) : (
                      <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
                        <rect x="10" y="24" width="36" height="28" rx="6" fill="#9CA3AF" />
                        <path d="M18 24V18C18 12.477 22.477 8 28 8C33.523 8 38 12.477 38 18V24" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none" />
                        <circle cx="28" cy="36" r="4" fill="white" /><rect x="26" y="36" width="4" height="8" rx="2" fill="white" />
                      </svg>
                    )}
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginBottom: 12 }}>
                    {codeState === "unlocking" ? "Unlocking…" : "Enter pickup code"}
                  </div>

                  {/* SMS-style code notification */}
                  <div style={{
                    background: "#F0F9FF", border: "1px solid #BAE6FD",
                    borderRadius: 12, padding: "10px 14px", marginBottom: 18,
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 10, color: "#3B82F6", fontWeight: 700, letterSpacing: "0.3px" }}>DELIVERIZON · TEXT MESSAGE</div>
                      <div style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 600, marginTop: 1 }}>
                        Your pickup code: <span style={{ letterSpacing: "3px", color: "#0369A1" }}>4829</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 16, animation: shake ? "shake 0.4s" : "none" }}>
                    {digits.map((d, i) => (
                      <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onFocus={() => setFocusIdx(i)}
                        disabled={codeState !== "entering"}
                        style={{
                          width: 58, height: 68, borderRadius: 16,
                          border: `2.5px solid ${d ? "#EE0000" : focusIdx === i ? "#EE0000" : "#E5E7EB"}`,
                          background: d ? "#FFF5F5" : "#F9FAFB", textAlign: "center", fontSize: 26, fontWeight: 800,
                          color: "#1A1A1A", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", caretColor: "transparent",
                        }} />
                    ))}
                  </div>

                  <button onClick={handleUnlock} disabled={digits.join("").length < 4 || codeState !== "entering"}
                    style={{
                      width: "100%", padding: "16px", borderRadius: 16, border: "none",
                      background: digits.join("").length === 4 && codeState === "entering" ? "#EE0000" : "#F3F4F6",
                      color: digits.join("").length === 4 && codeState === "entering" ? "#FFF" : "#9CA3AF",
                      fontSize: 15, fontWeight: 700, cursor: digits.join("").length === 4 ? "pointer" : "default",
                      fontFamily: "inherit", transition: "all 0.2s",
                    }}>🔐 Unlock Compartment</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 4: COMPLETE ═══ */}
          {screen === 4 && codeState === "complete" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 28px", position: "relative", overflow: "hidden" }}>
              {/* More confetti */}
              {Array.from({ length: 32 }).map((_, i) => {
                const colors = ["#EE0000", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];
                return (
                  <div key={i} style={{
                    position: "absolute", top: -20, left: `${4 + (i * 2.9) % 92}%`,
                    width: 6 + (i % 3) * 3, height: i % 2 === 0 ? 7 : 14,
                    borderRadius: i % 3 === 0 ? "50%" : 2, background: colors[i % colors.length],
                    animation: `confetti-fall ${1.0 + (i % 5) * 0.2}s ease-in ${(i % 8) * 0.1}s forwards`,
                    opacity: 0,
                  }} />
                );
              })}

              <div style={{ position: "relative", width: 110, height: 110, marginBottom: 20, zIndex: 1 }}>
                <svg width="110" height="110" viewBox="0 0 110 110" style={{ position: "absolute" }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="289" strokeLinecap="round"
                    style={{ animation: "ring-draw 0.6s ease-out forwards" }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "scale-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
                  <div style={{ fontSize: 48 }}>✅</div>
                </div>
              </div>

              <div style={{ textAlign: "center", zIndex: 1, animation: "fade-up 0.4s ease-out 0.4s both" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#1A1A1A", marginBottom: 6 }}>Delivery Complete!</div>
                <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 4 }}>Enjoy your {itemName || "Umbrella"} ☂️</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>From <strong style={{ color: "#6B7280" }}>Sneha</strong> · Delivered in 8 min</div>
              </div>

              {/* 3-row receipt */}
              <div style={{
                marginTop: 20, width: "100%", background: "#F9FAFB", borderRadius: 18,
                padding: "16px 18px", zIndex: 1, animation: "fade-up 0.4s ease-out 0.7s both",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", marginBottom: 10 }}>RECEIPT</div>
                {[
                  { l: "Item", v: `☂️ ${itemName || "Umbrella"}` },
                  { l: "From", v: "Sneha" },
                  { l: "Time", v: "8 min 23 sec" },
                ].map((r, i) => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
                    <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>{r.l}</span>
                    <span style={{ fontSize: 13, color: "#1A1A1A", fontWeight: 700 }}>{r.v}</span>
                  </div>
                ))}
              </div>

              {/* Prominent replay button */}
              <button onClick={handleFullReset} style={{
                marginTop: 16, width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: "#EE0000", color: "#FFF", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", zIndex: 1,
                animation: "fade-up 0.4s ease-out 1s both",
              }}>↺ Replay Full Demo</button>
            </div>
          )}

          {/* Bottom buttons */}
          {screen === 1 && !showSendConfirm && (
            <div style={{ padding: "8px 20px 8px", flexShrink: 0 }}>
              <button onClick={handleSendConfirm} disabled={!canSend} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: canSend ? "#EE0000" : "#F3F4F6",
                color: canSend ? "#FFF" : "#9CA3AF",
                fontSize: 15, fontWeight: 700, cursor: canSend ? "pointer" : "default",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>Confirm & Request Delivery</button>
            </div>
          )}
          {screen === 2 && (
            <div style={{ padding: "8px 20px 8px", flexShrink: 0 }}>
              <button onClick={goToScreen3} disabled={!canProceedS2} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: canProceedS2 ? "#EE0000" : "#F3F4F6",
                color: canProceedS2 ? "#FFF" : "#9CA3AF",
                fontSize: 15, fontWeight: 700, cursor: canProceedS2 ? "pointer" : "default",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>Continue →</button>
            </div>
          )}

          <HomeBar />
        </div>
      </div>
    </>
  );
}
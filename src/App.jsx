import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── DATA ───────────────────────────────────────────────────────

const JUDGES = [
  { id: "suzanne_s",   name: "Suzanne S.",   zone: "alumni"       },
  { id: "paul_su",     name: "Paul S.",      zone: "shillman"     },
  { id: "adam_t",      name: "Adam T.",      zone: "curry"        },
  { id: "sudhir_k",    name: "Sudhir K.",    zone: "isec"         },
  { id: "ed_r",        name: "Ed R.",        zone: "snell"        },
  { id: "mirela_m",    name: "Mirela M.",    zone: "ell"          },
  { id: "michael_r",   name: "Michael R.",   zone: "curry"        },
  { id: "tom_c",       name: "Tom C.",       zone: "forsyth"      },
  { id: "elizabeth_z", name: "Elizabeth Z.", zone: "marino"       },
  { id: "christine_b", name: "Christine B.", zone: "west_village" },
  { id: "elizabeth_m", name: "Elizabeth M.", zone: "snell"        },
  { id: "kal_b",       name: "Kal B.",       zone: "isec"         },
];

const ITEMS = [
  { id: "umbrella",   emoji: "☂️",  name: "Umbrella"     },
  { id: "charger",    emoji: "⚡",  name: "Charger"      },
  { id: "hat",        emoji: "🧢",  name: "Hat"          },
  { id: "gloves",     emoji: "🧤",  name: "Gloves"       },
  { id: "keys",       emoji: "🔑",  name: "Keys"         },
  { id: "headphones", emoji: "🎧",  name: "Headphones"   },
  { id: "textbook",   emoji: "📚",  name: "Textbook"     },
  { id: "drill",      emoji: "🔧",  name: "Drill"        },
  { id: "snacks",     emoji: "🍕",  name: "Snacks"       },
  { id: "sunglasses", emoji: "🕶️",  name: "Sunglasses"   },
  { id: "notebook",   emoji: "📓",  name: "Notebook"     },
  { id: "water",      emoji: "💧",  name: "Water Bottle" },
];

const ZONES = [
  { id: "snell",        name: "Snell Library",        x: 322, y: 371 },
  { id: "isec",         name: "ISEC",                 x: 406, y: 467 },
  { id: "curry",        name: "Curry Student Center", x: 343, y: 353 },
  { id: "ell",          name: "ELL Hall",              x: 361, y: 317 },
  { id: "marino",       name: "Marino Center",         x: 175, y: 342 },
  { id: "richards",     name: "Richards Hall",         x: 427, y: 428 },
  { id: "forsyth",      name: "Forsyth Building",      x: 340, y: 449 },
  { id: "west_village", name: "West Village H",        x: 140, y: 364 },
  { id: "shillman",     name: "Shillman Hall",         x: 392, y: 342 },
  { id: "alumni",       name: "Alumni Center",         x: 154, y: 517 },
  { id: "burstein",     name: "Burstein Hall",         x: 175, y: 392 },
  { id: "sheraton",     name: "Sheraton Hotel",        x: 493, y: 103 },
  { id: "mission_hill", name: "Mission Hill",          x:  70, y: 695 },
  { id: "roxbury",      name: "Roxbury Crossing",      x: 119, y: 674 },
];

const CORRECT_CODE = "4829";
const HUB = { x: 260, y: 420 };

// ─── HELPERS ────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }

function getWaypoints(from, to) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  return [
    { x: from.x, y: from.y },
    { x: lerp(from.x, mx, 0.5), y: lerp(from.y, my, 0.4) + 15 },
    { x: mx, y: my },
    { x: lerp(mx, to.x, 0.5), y: lerp(my, to.y, 0.6) - 10 },
    { x: to.x, y: to.y },
  ];
}

function getBotPosition(waypoints, progress) {
  const n = waypoints.length - 1;
  const f = progress * n;
  const seg = Math.min(Math.floor(f), n - 1);
  const t = f - seg;
  return { x: lerp(waypoints[seg].x, waypoints[seg+1].x, t), y: lerp(waypoints[seg].y, waypoints[seg+1].y, t) };
}

function buildTraveled(waypoints, progress) {
  const pts = [];
  const n = waypoints.length - 1;
  const f = progress * n;
  const cs = Math.floor(f);
  const t = f - cs;
  for (let i = 0; i <= cs && i < waypoints.length; i++) pts.push(waypoints[i]);
  if (cs < n) pts.push({ x: lerp(waypoints[cs].x, waypoints[cs+1].x, t), y: lerp(waypoints[cs].y, waypoints[cs+1].y, t) });
  return pts;
}

// ─── UI CHROME ──────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={{ height: 54, padding: "14px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 600, color: "#1A1A1A", flexShrink: 0 }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="#1A1A1A">
          <rect x="0" y="5" width="3" height="6" rx="1" /><rect x="4.5" y="3" width="3" height="8" rx="1" />
          <rect x="9" y="1" width="3" height="10" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" opacity="0.3" />
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

// ─── MAP ────────────────────────────────────────────────────────

function CampusMap({ children }) {
  return (
    <svg viewBox="0 0 630 820" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="mgrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#D0D2DA" strokeWidth="0.3" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Base */}
      <rect width="630" height="820" fill="#ECEEF2" />

      {/* ── COLOR ZONES (drawn before grid so grid overlays them) ── */}
      {/* Off-campus north — Sheraton / Prudential area */}
      <rect x="0"   y="0"   width="630" height="200" fill="#EDE9F4" />
      {/* Academic core — main campus between the two avenues */}
      <rect x="220" y="200" width="410" height="320" fill="#E4EBF8" />
      {/* Residential west — West Village, Burstein, Marino */}
      <rect x="0"   y="200" width="220" height="320" fill="#F5EDE4" />
      {/* Athletics / south campus — Alumni Center strip */}
      <rect x="0"   y="520" width="630" height="130" fill="#E6F0E6" />
      {/* Off-campus south — Mission Hill, Roxbury */}
      <rect x="0"   y="650" width="630" height="170" fill="#EDE9F4" />

      <rect width="630" height="820" fill="url(#mgrid)" />

      {/* Zone labels — faint, top corner of each region */}
      <text x="12"  y="192" fill="#A89CC8" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.4" opacity="0.8">OFF-CAMPUS NORTH</text>
      <text x="228" y="220" fill="#8099C4" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.4" opacity="0.8">ACADEMIC CORE</text>
      <text x="12"  y="220" fill="#C49A78" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.4" opacity="0.8">RESIDENTIAL WEST</text>
      <text x="12"  y="540" fill="#6BA86B" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.4" opacity="0.8">ATHLETICS / SOUTH CAMPUS</text>
      <text x="12"  y="668" fill="#A89CC8" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.4" opacity="0.8">MISSION HILL / ROXBURY</text>

      {/* Centennial Common */}
      <rect x="295" y="335" width="80" height="48" rx="7" fill="#C8DEAD" opacity="0.7" />
      <text x="311" y="362" fill="#7AAD72" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif" letterSpacing="0.3">CENTENNIAL</text>

      {/* Avenue dividers — thin lines only, no fill bands */}
      <line x1="0" y1="375" x2="630" y2="373" stroke="#B0B4C2" strokeWidth="3" />
      <text x="8" y="370" fill="#8890A4" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif">Huntington Ave</text>
      <line x1="0" y1="470" x2="630" y2="470" stroke="#B0B4C2" strokeWidth="3" />
      <text x="8" y="466" fill="#8890A4" fontSize="7" fontWeight="700" fontFamily="'DM Sans',sans-serif">Columbus Ave</text>

      {/* Ruggles St vertical */}
      <line x1="133" y1="200" x2="133" y2="650" stroke="#B0B4C2" strokeWidth="2" opacity="0.5" />

      {/* HUB marker */}
      <rect x="244" y="412" width="32" height="18" rx="4" fill="#880000" opacity="0.9" />
      <text x="260" y="424" textAnchor="middle" fill="#FFF" fontSize="7" fontWeight="800" fontFamily="'DM Sans',sans-serif" letterSpacing="0.5">HUB</text>

      {/* Compass */}
      <text x="606" y="26" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="700" fontFamily="'DM Sans',sans-serif">N</text>
      <line x1="606" y1="30" x2="606" y2="44" stroke="#9CA3AF" strokeWidth="1.2" />
      <polygon points="606,30 603,40 606,37 609,40" fill="#9CA3AF" />

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
      <circle cx={zone.x} cy={zone.y} r={selected ? 13 : dimmed ? 6 : 9}
        fill={selected ? "#EE0000" : dimmed ? "#B0B5BF" : "#1A1A1A"}
        style={{ transition: "all 0.15s" }} />
      {!dimmed && <circle cx={zone.x} cy={zone.y} r={selected ? 6 : 4} fill="#FFF" opacity="0.85" />}
      <text x={zone.x} y={zone.y + (selected ? 30 : dimmed ? 22 : 26)}
        textAnchor="middle"
        fill={selected ? "#EE0000" : dimmed ? "#B0B5BF" : "#374151"}
        fontSize={selected ? "14" : dimmed ? "11" : "12"}
        fontWeight={selected ? "700" : "500"}
        fontFamily="'DM Sans',sans-serif">
        {zone.name}
      </text>
    </g>
  );
}

// ─── DROPDOWN STYLE (shared) ─────────────────────────────────────

const dropdownStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 12,
  border: "2px solid #F3F4F6", background: "#F9FAFB",
  fontSize: 14, fontWeight: 600, color: "#1A1A1A",
  fontFamily: "inherit", cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239CA3AF' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
};

// ─── MAIN APP ────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();

  // ── screens: 1 | 2 | 3 | 5 | 6 | 4 | "complete"
  const [screen, setScreen]               = useState(1);
  const [transitionOverlay, setTransitionOverlay] = useState(null);

  // Screen 1
  const [recipient,   setRecipient]   = useState(null);       // no pre-selection
  const [selectedItem, setSelectedItem] = useState(null);     // item dropdown
  const [pickupZone,  setPickupZone]  = useState(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [confirmAnim, setConfirmAnim] = useState(0);

  // Screen 2
  const [flowType,       setFlowType]       = useState(null); // "now" | "later"
  const [dropoffZone,    setDropoffZone]    = useState(null); // chosen on S2 (now) or S6 (later)

  // Screen 3 — sender tracking
  const [s3Progress, setS3Progress] = useState(0);
  const [s3Arrived,  setS3Arrived]  = useState(false);
  const [s3Deposited,setS3Deposited]= useState(false);

  // Screen 5 — hub secured (later flow)
  const [s5Done, setS5Done] = useState(false);

  // Screen 6 — "4 hours later" (later flow)
  const [s6OverlayVisible, setS6OverlayVisible] = useState(true);
  const [laterDropoffZone, setLaterDropoffZone] = useState(null);

  // Screen 4 — delivery tracking + code
  const [s4Progress, setS4Progress] = useState(0);
  const [s4Arrived,  setS4Arrived]  = useState(false);
  const [digits,    setDigits]    = useState(["","","",""]);
  const [focusIdx,  setFocusIdx]  = useState(0);
  const [codeState, setCodeState] = useState("tracking");
  const [shake,     setShake]     = useState(false);
  const [codePhaseVisible, setCodePhaseVisible] = useState(false);
  const inputRefs = useRef([]);

  // ── Derived ──
  const recipientFirstName = recipient?.name?.split(" ")[0] || "Recipient";
  const senderZone   = ZONES.find(z => z.id === (pickupZone || "snell"));
  // For screen 4, dropoff is either the "now" choice or the "later" choice
  const finalDropoff = flowType === "later" ? laterDropoffZone : dropoffZone;
  const receiverZone = ZONES.find(z => z.id === (finalDropoff || "west_village"));

  const s3Waypoints = senderZone   ? getWaypoints(HUB, senderZone)   : [];
  const s4Origin    = flowType === "now" ? senderZone : HUB;
  const s4Waypoints = receiverZone ? getWaypoints(s4Origin || HUB, receiverZone) : [];

  const s3Bot = s3Waypoints.length ? getBotPosition(s3Waypoints, s3Progress) : HUB;
  const s4Bot = s4Waypoints.length ? getBotPosition(s4Waypoints, s4Progress) : (s4Origin || HUB);

  // ── Screen 3 animation ──
  useEffect(() => {
    if (screen !== 3 || s3Arrived) return;
    const iv = setInterval(() => {
      setS3Progress(p => { if (p + 0.005 >= 1) { setS3Arrived(true); return 1; } return p + 0.005; });
    }, 40);
    return () => clearInterval(iv);
  }, [screen, s3Arrived]);

  // ── Screen 5 auto-advance (later flow) ──
  useEffect(() => {
    if (screen !== 5 || s5Done) return;
    const t = setTimeout(() => setS5Done(true), 2000);
    return () => clearTimeout(t);
  }, [screen, s5Done]);

  // ── Screen 6 overlay auto-dismiss ──
  useEffect(() => {
    if (screen !== 6) return;
    setS6OverlayVisible(true);
    const t = setTimeout(() => setS6OverlayVisible(false), 2200);
    return () => clearTimeout(t);
  }, [screen]);

  // ── Screen 4 animation ──
  useEffect(() => {
    if (screen !== 4 || s4Arrived) return;
    const iv = setInterval(() => {
      setS4Progress(p => {
        if (p + 0.005 >= 1) {
          setS4Arrived(true);
          setCodeState("entering");
          setTimeout(() => setCodePhaseVisible(true), 150);
          return 1;
        }
        return p + 0.005;
      });
    }, 40);
    return () => clearInterval(iv);
  }, [screen, s4Arrived]);

  useEffect(() => {
    if (codeState === "entering") setTimeout(() => inputRefs.current[0]?.focus(), 350);
  }, [codeState]);

  // ── Helpers ──
  function showTransition(text, callback) {
    setTransitionOverlay({ text });
    setTimeout(() => { callback(); setTimeout(() => setTransitionOverlay(null), 350); }, 500);
  }

  function handleSendConfirm() {
    setShowSendConfirm(true);
    setTimeout(() => setConfirmAnim(1), 100);
    setTimeout(() => setConfirmAnim(2), 700);
  }

  function goToScreen2() {
    showTransition(`Switching to ${recipientFirstName}'s view…`, () => {
      setScreen(2); setShowSendConfirm(false); setConfirmAnim(0);
    });
  }

  function goToScreen3() {
    showTransition("Switching to Sneha's view…", () => setScreen(3));
  }

  function handleDeposit() {
    setS3Deposited(true);
    if (flowType === "now") {
      setTimeout(() => {
        showTransition(`Switching to ${recipientFirstName}'s view…`, () => setScreen(4));
      }, 1500);
    } else {
      // later flow: bot returns to hub
      setTimeout(() => {
        showTransition("Item secured at Hub…", () => setScreen(5));
      }, 1500);
    }
  }

  function handleReadyDispatch() {
    showTransition(`Switching to ${recipientFirstName}'s view…`, () => setScreen(4));
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
    if (digits.join("") !== CORRECT_CODE) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => { setDigits(["","","",""]); setFocusIdx(0); inputRefs.current[0]?.focus(); }, 700);
      return;
    }
    setCodeState("unlocking");
    setTimeout(() => setCodeState("complete"), 900);
  }

  function handleFullReset() {
    setScreen(1); setRecipient(null); setSelectedItem(null); setPickupZone(null);
    setShowSendConfirm(false); setConfirmAnim(0);
    setFlowType(null); setDropoffZone(null);
    setS3Progress(0); setS3Arrived(false); setS3Deposited(false);
    setS5Done(false); setS6OverlayVisible(true); setLaterDropoffZone(null);
    setS4Progress(0); setS4Arrived(false);
    setDigits(["","","",""]); setFocusIdx(0);
    setCodeState("tracking"); setShake(false); setCodePhaseVisible(false);
    setTransitionOverlay(null);
  }

  // ── Validation ──
  const canSend = recipient && selectedItem && pickupZone;
  const canProceedS2 = flowType === "later" || (flowType === "now" && dropoffZone !== null);
  const contextLabel = (screen === 1 || screen === 3 || screen === 5)
    ? "Sneha C. · Sender"
    : `${recipientFirstName} · Recipient`;

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #F0F1F3; }
        @keyframes fade-up      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scale-pop    { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes ring-draw    { from{stroke-dashoffset:289} to{stroke-dashoffset:0} }
        @keyframes shake        { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes confetti-fall{ 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(180px) rotate(720deg);opacity:0} }
        @keyframes overlay-in   { from{opacity:0} to{opacity:1} }
        @keyframes clock-fade   { 0%{opacity:0;transform:scale(0.9)} 20%{opacity:1;transform:scale(1)} 80%{opacity:1} 100%{opacity:0} }
        input:focus { outline: none; }
        input::placeholder { color: #9CA3AF; }
      `}</style>

      <div style={{ width:"100vw", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F0F1F3", fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
        <button onClick={() => navigate("/")} style={{ position:"fixed", top:20, left:20, zIndex:1000, display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:12, border:"1px solid rgba(0,0,0,0.1)", background:"#FFF", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:"#1A1A1A", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>← Hub</button>

        {/* Phone frame */}
        <div style={{ width:420, height:844, borderRadius:44, background:"#FFF", boxShadow:"0 25px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)", overflow:"hidden", display:"flex", flexDirection:"column", position:"relative" }}>

          {/* Transition overlay */}
          {transitionOverlay && (
            <div style={{ position:"absolute", inset:0, zIndex:50, background:"rgba(8,8,8,0.90)", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:44, animation:"overlay-in 0.2s ease-out forwards" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#FFF" }}>{transitionOverlay.text}</div>
                <div style={{ width:28, height:2, background:"#EE0000", borderRadius:2, margin:"10px auto 0" }} />
              </div>
            </div>
          )}

          <StatusBar />
          <div style={{ padding:"1px 22px 7px", flexShrink:0 }}>
            <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:500 }}>{contextLabel}</span>
          </div>

          {/* ══════════════════════════════════════════════
              SCREEN 1 — SEND FORM
          ══════════════════════════════════════════════ */}
          {screen === 1 && !showSendConfirm && (
            <div style={{ flex:1, overflow:"hidden", padding:"0 20px", display:"flex", flexDirection:"column" }}>

              <div style={{ flexShrink:0, marginBottom:8 }}>
                {/* Recipient */}
                <label style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.8px", display:"block", marginBottom:5 }}>SEND TO</label>
                <div style={{ marginBottom:8 }}>
                  <select
                    value={recipient?.id || ""}
                    onChange={e => {
                      const j = JUDGES.find(j => j.id === e.target.value);
                      setRecipient(j || null);
                    }}
                    style={{ ...dropdownStyle, color: recipient ? "#1A1A1A" : "#9CA3AF" }}
                  >
                    <option value="" disabled>Select recipient…</option>
                    {JUDGES.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>

                {/* Item dropdown */}
                <label style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.8px", display:"block", marginBottom:5 }}>ITEM</label>
                <div style={{ marginBottom:8 }}>
                  <select
                    value={selectedItem?.id || ""}
                    onChange={e => setSelectedItem(ITEMS.find(i => i.id === e.target.value) || null)}
                    style={{ ...dropdownStyle, color: selectedItem ? "#1A1A1A" : "#9CA3AF" }}
                  >
                    <option value="" disabled>Select item…</option>
                    {ITEMS.map(it => <option key={it.id} value={it.id}>{it.emoji} {it.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Pickup zone */}
              <label style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.8px", display:"block", marginBottom:5, flexShrink:0 }}>SEND FROM</label>
              <div style={{ flex:1, borderRadius:18, overflow:"hidden", background:"#ECEEF1", position:"relative", minHeight:200 }}>
                <CampusMap>
                  {ZONES.map(z => <ZoneMarker key={z.id} zone={z} selected={pickupZone === z.id} onTap={() => setPickupZone(z.id)} />)}
                </CampusMap>
                {pickupZone && (
                  <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(238,0,0,0.95)", color:"#FFF", padding:"7px 16px", borderRadius:10, fontSize:13, fontWeight:700, animation:"fade-up 0.2s ease-out", whiteSpace:"nowrap" }}>
                    📍 {ZONES.find(z => z.id === pickupZone)?.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Screen 1 confirm */}
          {screen === 1 && showSendConfirm && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px" }}>
              <div style={{ position:"relative", width:90, height:90, marginBottom:24 }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ position:"absolute" }}>
                  <circle cx="45" cy="45" r="40" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="289" strokeLinecap="round"
                    style={{ animation: confirmAnim >= 1 ? "ring-draw 0.5s ease-out forwards" : "none", strokeDashoffset: confirmAnim >= 1 ? undefined : 289 }} />
                </svg>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:`translate(-50%,-50%) scale(${confirmAnim >= 2 ? 1 : 0})`, fontSize:38, transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>✓</div>
              </div>
              <div style={{ fontSize:20, fontWeight:800, color:"#1A1A1A", marginBottom:6, opacity:confirmAnim>=2?1:0, transition:"opacity 0.3s 0.1s" }}>Delivery Requested!</div>
              <div style={{ fontSize:14, color:"#6B7280", marginBottom:24, opacity:confirmAnim>=2?1:0, transition:"opacity 0.3s 0.2s" }}>
                Waiting for <strong style={{ color:"#1A1A1A" }}>{recipient?.name}</strong> to accept
              </div>
              <button onClick={goToScreen2} style={{ padding:"14px 36px", borderRadius:14, border:"none", background:"#EE0000", color:"#FFF", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity:confirmAnim>=2?1:0, transition:"opacity 0.3s 0.3s" }}>
                Continue →
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCREEN 2 — RECIPIENT ACCEPTS
          ══════════════════════════════════════════════ */}
          {screen === 2 && (
            <div style={{ flex:1, overflow:"hidden", padding:"4px 20px 0", display:"flex", flexDirection:"column", minHeight:0 }}>

              {/* Incoming card */}
              <div style={{ background:"#1A1A1A", borderRadius:22, padding:"16px 20px", marginBottom:10, flexShrink:0 }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:"1px", marginBottom:14 }}>INCOMING DELIVERY</div>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
                  <div style={{ width:58, height:58, borderRadius:16, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
                    {selectedItem?.emoji || "📦"}
                  </div>
                  <div>
                    <div style={{ fontSize:30, fontWeight:800, color:"#FFF", lineHeight:1.1 }}>{selectedItem?.name || "Item"}</div>
                    <div style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginTop:5 }}>from Sneha</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10 }}>
                  From {ZONES.find(z => z.id === pickupZone)?.name || "Campus"} · Now
                </div>
              </div>

              {/* Choice buttons */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10, flexShrink:0 }}>
                <button
                  onClick={() => { setFlowType("now"); setDropoffZone(null); }}
                  style={{ padding:"18px", borderRadius:18, border: flowType==="now" ? "2px solid #EE0000" : "2px solid #F3F4F6", background: flowType==="now" ? "#FFF5F5" : "#F9FAFB", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:46, height:46, borderRadius:14, background: flowType==="now" ? "#EE0000" : "#E5E7EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"background 0.15s", flexShrink:0 }}>📍</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#1A1A1A" }}>Receive Now</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>Choose your location and the bot comes to you</div>
                  </div>
                </button>

                <button
                  onClick={() => { setFlowType("later"); setDropoffZone(null); }}
                  style={{ padding:"18px", borderRadius:18, border: flowType==="later" ? "2px solid #EE0000" : "2px solid #F3F4F6", background: flowType==="later" ? "#FFF5F5" : "#F9FAFB", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:46, height:46, borderRadius:14, background: flowType==="later" ? "#EE0000" : "#E5E7EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"background 0.15s", flexShrink:0 }}>🏪</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#1A1A1A" }}>Receive Later</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>Item stored at Hub until you're ready to receive</div>
                  </div>
                </button>
              </div>

              {/* Receive Now — drop-off zone picker */}
              {flowType === "now" && (
                <div style={{ display:"flex", flexDirection:"column", flex:1, minHeight:0, animation:"fade-up 0.25s ease-out" }}>
                  <label style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.8px", display:"block", marginBottom:6, flexShrink:0 }}>YOUR LOCATION</label>
                  <div style={{ flex:1, borderRadius:18, overflow:"hidden", background:"#ECEEF1", position:"relative", minHeight:200 }}>
                    <CampusMap>
                      {ZONES.map(z => <ZoneMarker key={z.id} zone={z} selected={dropoffZone === z.id} onTap={() => setDropoffZone(z.id)} />)}
                    </CampusMap>
                    {dropoffZone && (
                      <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(238,0,0,0.95)", color:"#FFF", padding:"7px 16px", borderRadius:10, fontSize:13, fontWeight:700, animation:"fade-up 0.2s ease-out", whiteSpace:"nowrap" }}>
                        📍 {ZONES.find(z => z.id === dropoffZone)?.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Receive Later confirmation chip */}
              {flowType === "later" && (
                <div style={{ background:"#F0FDF4", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:8, animation:"fade-up 0.25s ease-out" }}>
                  <span style={{ fontSize:14 }}>🕐</span>
                  <div style={{ fontSize:13, color:"#059669", lineHeight:1.4 }}>
                    Your item is stored at Hub until you're ready to receive.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCREEN 3 — SENDER TRACKING (both flows)
          ══════════════════════════════════════════════ */}
          {screen === 3 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"4px 20px 0", flexShrink:0 }}>
                <div style={{ background: s3Arrived ? "#F0FDF4" : "#1A1A1A", borderRadius:20, padding:"16px 18px", transition:"background 0.5s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:14, background: s3Arrived ? "#10B981" : "#EE0000", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"background 0.5s" }}>{s3Arrived ? "✅" : "🤖"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color: s3Arrived ? "#1A1A1A" : "#FFF", transition:"color 0.5s" }}>{s3Arrived ? "Bot arrived at pickup!" : "Deliverizer 2 en route"}</div>
                      <div style={{ fontSize:12, color: s3Arrived ? "#6B7280" : "rgba(255,255,255,0.5)", marginTop:2 }}>{s3Arrived ? "Deposit your item now" : `Heading to ${senderZone?.name}`}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex:1, margin:"10px 20px", borderRadius:20, overflow:"hidden", background:"#ECEEF1" }}>
                <CampusMap>
                  {ZONES.map(z => <ZoneMarker key={z.id} zone={z} dimmed={z.id !== pickupZone} selected={z.id === pickupZone} />)}
                  <polyline points={s3Waypoints.map(w=>`${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.2" strokeLinecap="round" />
                  {buildTraveled(s3Waypoints, s3Progress).length >= 2 && (
                    <polyline points={buildTraveled(s3Waypoints, s3Progress).map(w=>`${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  )}
                  <g filter="url(#glow)">
                    <circle cx={s3Bot.x} cy={s3Bot.y} r={8} fill="#3B82F6" opacity="0.1">
                      <animate attributeName="r" values="8;22;8" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={s3Bot.x} cy={s3Bot.y} r={s3Arrived ? 11 : 9} fill={s3Arrived ? "#10B981" : "#3B82F6"} stroke="#FFF" strokeWidth="2.5" style={{ transition:"all 0.5s" }} />
                    <text x={s3Bot.x} y={s3Bot.y+3.5} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800" fontFamily="'DM Sans',sans-serif">{s3Arrived ? "✓" : "🤖"}</text>
                  </g>
                </CampusMap>
              </div>
              <div style={{ padding:"0 20px 8px", flexShrink:0 }}>
                {s3Arrived && !s3Deposited && (
                  <button onClick={handleDeposit} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background:"#EE0000", color:"#FFF", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", animation:"fade-up 0.3s ease-out" }}>
                    I've Deposited My Item ✓
                  </button>
                )}
                {s3Deposited && (
                  <div style={{ background:"#F0FDF4", borderRadius:16, padding:"16px", textAlign:"center", animation:"fade-up 0.3s ease-out" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:"#059669" }}>✅ Secured!</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:3 }}>
                      {flowType === "later" ? "Bot returning to Hub…" : `Bot heading to ${recipientFirstName}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCREEN 5 — ITEM AT HUB (later flow only)
          ══════════════════════════════════════════════ */}
          {screen === 5 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 28px", gap:20 }}>
              <div style={{ width:88, height:88, borderRadius:24, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:42, animation:"scale-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🏪</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#1A1A1A", marginBottom:8 }}>Item Secured at Hub</div>
                <div style={{ fontSize:14, color:"#6B7280", lineHeight:1.5 }}>
                  {selectedItem?.emoji} <strong>{selectedItem?.name}</strong> from Sneha is waiting for you at the Deliverizon Hub.
                </div>
              </div>
              <div style={{ background:"#F9FAFB", borderRadius:16, padding:"16px 20px", width:"100%", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"rgba(16,185,129,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>✅</div>
                <div style={{ fontSize:13, color:"#374151", lineHeight:1.4 }}>
                  Your item is stored at Hub until you're ready to receive.
                </div>
              </div>
              {s5Done && (
                <button
                  onClick={() => { setScreen(6); }}
                  style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background:"#EE0000", color:"#FFF", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", animation:"fade-up 0.4s ease-out" }}>
                  View Status →
                </button>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCREEN 6 — 4 HOURS LATER / I'M READY
          ══════════════════════════════════════════════ */}
          {screen === 6 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

              {/* "4 hours later" overlay */}
              {s6OverlayVisible && (
                <div style={{ position:"absolute", inset:0, zIndex:10, background:"rgba(10,10,10,0.95)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, animation:"clock-fade 2.2s ease-in-out forwards" }}>
                  <div style={{ fontSize:52 }}>⏰</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"#FFF", letterSpacing:"-0.5px" }}>4 hours later…</div>
                  <div style={{ width:40, height:2, background:"#EE0000", borderRadius:2 }} />
                </div>
              )}

              {/* "I'm Ready" content */}
              {!s6OverlayVisible && (
                <div style={{ flex:1, overflow:"hidden", padding:"12px 20px 0", display:"flex", flexDirection:"column", minHeight:0, animation:"fade-up 0.4s ease-out" }}>
                  {/* Status card */}
                  <div style={{ background:"#1A1A1A", borderRadius:20, padding:"14px 16px", marginBottom:10, flexShrink:0 }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:"1px", marginBottom:10 }}>READY TO RECEIVE</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:32 }}>{selectedItem?.emoji || "📦"}</div>
                      <div>
                        <div style={{ fontSize:18, fontWeight:800, color:"#FFF" }}>{selectedItem?.name}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3 }}>from Sneha · Stored at Hub</div>
                      </div>
                    </div>
                  </div>

                  {/* Location picker */}
                  <label style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.8px", display:"block", marginBottom:6, flexShrink:0 }}>WHERE ARE YOU NOW?</label>
                  <div style={{ flex:1, borderRadius:18, overflow:"hidden", background:"#ECEEF1", position:"relative", minHeight:200 }}>
                    <CampusMap>
                      {ZONES.map(z => <ZoneMarker key={z.id} zone={z} selected={laterDropoffZone === z.id} onTap={() => setLaterDropoffZone(z.id)} />)}
                    </CampusMap>
                    {laterDropoffZone && (
                      <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(238,0,0,0.95)", color:"#FFF", padding:"7px 16px", borderRadius:10, fontSize:13, fontWeight:700, animation:"fade-up 0.2s ease-out", whiteSpace:"nowrap" }}>
                        📍 {ZONES.find(z => z.id === laterDropoffZone)?.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCREEN 4 — DELIVERY TRACKING + CODE
          ══════════════════════════════════════════════ */}
          {screen === 4 && codeState !== "complete" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"4px 20px 0", flexShrink:0 }}>
                <div style={{ background: s4Arrived ? "#F0FDF4" : "#1A1A1A", borderRadius:20, padding:"16px 18px", transition:"background 0.5s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:14, background: s4Arrived ? "#10B981" : "#EE0000", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"background 0.5s" }}>{s4Arrived ? "📍" : "🤖"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color: s4Arrived ? "#1A1A1A" : "#FFF", transition:"color 0.5s" }}>{s4Arrived ? "Your Deliverizer arrived!" : "Deliverizer 2 en route"}</div>
                      <div style={{ fontSize:12, color: s4Arrived ? "#6B7280" : "rgba(255,255,255,0.5)", marginTop:2 }}>{s4Arrived ? "Enter code to unlock compartment" : `Heading to ${receiverZone?.name}`}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crossfade: map → code entry */}
              <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, opacity: s4Arrived ? 0 : 1, transition:"opacity 0.5s ease-in-out", pointerEvents: s4Arrived ? "none" : "auto", margin:"10px 20px", borderRadius:20, overflow:"hidden", background:"#ECEEF1" }}>
                  <CampusMap>
                    {ZONES.map(z => <ZoneMarker key={z.id} zone={z} dimmed={z.id !== (finalDropoff || "west_village")} selected={z.id === (finalDropoff || "west_village")} />)}
                    <polyline points={s4Waypoints.map(w=>`${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.2" strokeLinecap="round" />
                    {buildTraveled(s4Waypoints, s4Progress).length >= 2 && (
                      <polyline points={buildTraveled(s4Waypoints, s4Progress).map(w=>`${w.x},${w.y}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    )}
                    <g filter="url(#glow)">
                      <circle cx={s4Bot.x} cy={s4Bot.y} r={8} fill="#3B82F6" opacity="0.1">
                        <animate attributeName="r" values="8;22;8" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={s4Bot.x} cy={s4Bot.y} r={9} fill="#3B82F6" stroke="#FFF" strokeWidth="2.5" />
                      <text x={s4Bot.x} y={s4Bot.y+3.5} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800" fontFamily="'DM Sans',sans-serif">🤖</text>
                    </g>
                  </CampusMap>
                </div>

                {/* Code entry */}
                <div style={{ position:"absolute", inset:0, opacity: codePhaseVisible ? 1 : 0, transition:"opacity 0.5s ease-in-out", pointerEvents: codePhaseVisible ? "auto" : "none", display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 28px 0" }}>
                  <div style={{ width:76, height:76, borderRadius:20, background: codeState==="unlocking" ? "#D1FAE5" : "#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, transition:"background 0.4s" }}>
                    {codeState === "unlocking"
                      ? <div style={{ fontSize:34, animation:"scale-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)" }}>🔓</div>
                      : <svg width="36" height="36" viewBox="0 0 56 56" fill="none"><rect x="10" y="24" width="36" height="28" rx="6" fill="#9CA3AF" /><path d="M18 24V18C18 12.477 22.477 8 28 8C33.523 8 38 12.477 38 18V24" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" fill="none" /><circle cx="28" cy="36" r="4" fill="white" /><rect x="26" y="36" width="4" height="8" rx="2" fill="white" /></svg>
                    }
                  </div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1A", marginBottom:12 }}>
                    {codeState === "unlocking" ? "Unlocking…" : "Enter pickup code"}
                  </div>
                  <div style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", borderRadius:12, padding:"10px 14px", marginBottom:18, display:"flex", alignItems:"center", gap:10, width:"100%" }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#3B82F6", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:10, color:"#3B82F6", fontWeight:700, letterSpacing:"0.3px" }}>DELIVERIZON · TEXT MESSAGE</div>
                      <div style={{ fontSize:13, color:"#1A1A1A", fontWeight:600, marginTop:1 }}>
                        Your pickup code: <span style={{ letterSpacing:"3px", color:"#0369A1" }}>4829</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, marginBottom:16, animation: shake ? "shake 0.4s" : "none" }}>
                    {digits.map((d, i) => (
                      <input key={i} ref={el => inputRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onFocus={() => setFocusIdx(i)}
                        disabled={codeState !== "entering"}
                        style={{ width:58, height:68, borderRadius:16, border:`2.5px solid ${d ? "#EE0000" : focusIdx===i ? "#EE0000" : "#E5E7EB"}`, background: d ? "#FFF5F5" : "#F9FAFB", textAlign:"center", fontSize:26, fontWeight:800, color:"#1A1A1A", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", caretColor:"transparent" }} />
                    ))}
                  </div>
                  <button onClick={handleUnlock} disabled={digits.join("").length < 4 || codeState !== "entering"}
                    style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background: digits.join("").length===4 && codeState==="entering" ? "#EE0000" : "#F3F4F6", color: digits.join("").length===4 && codeState==="entering" ? "#FFF" : "#9CA3AF", fontSize:15, fontWeight:700, cursor: digits.join("").length===4 ? "pointer" : "default", fontFamily:"inherit", transition:"all 0.2s" }}>
                    🔐 Unlock Compartment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              COMPLETE
          ══════════════════════════════════════════════ */}
          {screen === 4 && codeState === "complete" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 28px", position:"relative", overflow:"hidden" }}>
              {Array.from({ length: 32 }).map((_, i) => {
                const colors = ["#EE0000","#10B981","#3B82F6","#F59E0B","#8B5CF6","#EC4899"];
                return <div key={i} style={{ position:"absolute", top:-20, left:`${4+(i*2.9)%92}%`, width:6+(i%3)*3, height:i%2===0?7:14, borderRadius:i%3===0?"50%":2, background:colors[i%colors.length], animation:`confetti-fall ${1.0+(i%5)*0.2}s ease-in ${(i%8)*0.1}s forwards`, opacity:0 }} />;
              })}
              <div style={{ position:"relative", width:110, height:110, marginBottom:20, zIndex:1 }}>
                <svg width="110" height="110" viewBox="0 0 110 110" style={{ position:"absolute" }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="289" strokeLinecap="round" style={{ animation:"ring-draw 0.6s ease-out forwards" }} />
                </svg>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"scale-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both" }}>
                  <div style={{ fontSize:48 }}>✅</div>
                </div>
              </div>
              <div style={{ textAlign:"center", zIndex:1, animation:"fade-up 0.4s ease-out 0.4s both" }}>
                <div style={{ fontSize:24, fontWeight:800, color:"#1A1A1A", marginBottom:6 }}>Delivery Complete!</div>
                <div style={{ fontSize:15, color:"#6B7280", marginBottom:4 }}>Enjoy your {selectedItem?.emoji} {selectedItem?.name || "item"}!</div>
                <div style={{ fontSize:12, color:"#9CA3AF" }}>From <strong style={{ color:"#6B7280" }}>Sneha</strong></div>
              </div>
              <div style={{ marginTop:20, width:"100%", background:"#F9FAFB", borderRadius:18, padding:"16px 18px", zIndex:1, animation:"fade-up 0.4s ease-out 0.7s both" }}>
                <div style={{ fontSize:9, fontWeight:700, color:"#9CA3AF", letterSpacing:"1px", marginBottom:10 }}>RECEIPT</div>
                {[
                  { l: "Item", v: `${selectedItem?.emoji || "📦"} ${selectedItem?.name || "Item"}` },
                  { l: "From", v: "Sneha C." },
                ].map((r, i) => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom: i < 1 ? "1px solid #F3F4F6" : "none" }}>
                    <span style={{ fontSize:13, color:"#9CA3AF", fontWeight:500 }}>{r.l}</span>
                    <span style={{ fontSize:13, color:"#1A1A1A", fontWeight:700 }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleFullReset} style={{ marginTop:16, width:"100%", padding:"16px", borderRadius:16, border:"none", background:"#EE0000", color:"#FFF", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", zIndex:1, animation:"fade-up 0.4s ease-out 1s both" }}>
                ↺ Replay Full Demo
              </button>
            </div>
          )}

          {/* ── Bottom buttons ── */}
          {screen === 1 && !showSendConfirm && (
            <div style={{ padding:"8px 20px", flexShrink:0 }}>
              <button onClick={handleSendConfirm} disabled={!canSend} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background: canSend ? "#EE0000" : "#F3F4F6", color: canSend ? "#FFF" : "#9CA3AF", fontSize:15, fontWeight:700, cursor: canSend ? "pointer" : "default", fontFamily:"inherit", transition:"all 0.15s" }}>
                Send Delivery Request
              </button>
            </div>
          )}
          {screen === 2 && (
            <div style={{ padding:"8px 20px", flexShrink:0 }}>
              <button onClick={goToScreen3} disabled={!canProceedS2} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background: canProceedS2 ? "#EE0000" : "#F3F4F6", color: canProceedS2 ? "#FFF" : "#9CA3AF", fontSize:15, fontWeight:700, cursor: canProceedS2 ? "pointer" : "default", fontFamily:"inherit", transition:"all 0.15s" }}>
                Continue →
              </button>
            </div>
          )}
          {screen === 6 && !s6OverlayVisible && (
            <div style={{ padding:"8px 20px", flexShrink:0 }}>
              <button onClick={handleReadyDispatch} disabled={!laterDropoffZone} style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", background: laterDropoffZone ? "#EE0000" : "#F3F4F6", color: laterDropoffZone ? "#FFF" : "#9CA3AF", fontSize:15, fontWeight:700, cursor: laterDropoffZone ? "pointer" : "default", fontFamily:"inherit", transition:"all 0.15s" }}>
                🤖 Dispatch Bot →
              </button>
            </div>
          )}

          <HomeBar />
        </div>
      </div>
    </>
  );
}
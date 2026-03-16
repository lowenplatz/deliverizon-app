import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════
// DELIVERIZON — Edge Cases
// Tap a card to expand. Three beats: trigger, response, outcome.
// ═══════════════════════════════════════════════════════════════

const SCENARIOS = [
  {
    id: "signal",
    title: "5G signal drops",
    teaser: "Bot loses connectivity mid-delivery",
    sev: "critical",
    sevLabel: "CRITICAL",
    sevColor: "#E24B4A",
    image: "/5gLostEdge.png",
    copy: [
      { label: "BOT STOPS IN <10ms", sub: "No network needed." },
      { label: "Verizon tech dispatched.", sub: "GPS never stops." },
      { label: "5G drops.\nSafety doesn't.", sub: null, headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C11 3 4 7.5 4 12.5a7 7 0 0014 0C18 7.5 11 3 11 3z" stroke="#F09595" strokeWidth="1.5" fill="none"/>
        <line x1="7.5" y1="7.5" x2="14.5" y2="14.5" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="14.5" y1="7.5" x2="7.5" y2="14.5" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "MEC connection lost. Bot receives no navigation updates." },
      { type: "response", label: "SYSTEM RESPONSE", text: "Teensy MCU cuts motors in <10ms — completely independent of 5G. Bot stops, hazard lights activate. 4G fallback kicks in. Verizon tech auto-alerted via ThingSpace." },
      { type: "outcome",  label: "OUTCOME",         text: "Safe stop guaranteed. Delivery paused. Field tech dispatched if signal doesn't restore in 60s. This product is built on 5G — Verizon quality is the product." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <rect x="80" y="95" width="60" height="55" rx="9" fill="#1A1A1A" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <circle cx="110" cy="113" r="9" fill="rgba(238,0,0,0.15)"/>
        <circle cx="110" cy="113" r="5" fill="#EE0000"/>
        <rect x="90" y="130" width="40" height="7" rx="3" fill="rgba(255,255,255,0.08)"/>
        <rect x="92" y="141" width="10" height="9" rx="2" fill="rgba(255,255,255,0.15)"/>
        <rect x="105" y="141" width="10" height="9" rx="2" fill="rgba(255,255,255,0.15)"/>
        <rect x="118" y="141" width="10" height="9" rx="2" fill="rgba(255,255,255,0.15)"/>
        <line x1="110" y1="95" x2="110" y2="74" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 2"/>
        <rect x="96" y="58" width="28" height="16" rx="3" fill="#1A1A1A" stroke="rgba(255,255,255,0.1)"/>
        <text x="110" y="69" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">MEC</text>
        <line x1="60" y1="58" x2="150" y2="58" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="62" y1="50" x2="70" y2="66" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="140" y1="50" x2="148" y2="66" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="55" y="160" width="50" height="20" rx="5" fill="rgba(226,75,74,0.15)" stroke="rgba(226,75,74,0.3)" strokeWidth="1"/>
        <text x="80" y="173" textAnchor="middle" fill="#F09595" fontSize="11" fontFamily="sans-serif" fontWeight="600">STOPPED</text>
        <rect x="115" y="160" width="50" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="140" y="173" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">SAFE</text>
      </svg>
    ),
  },
  {
    id: "tipped",
    title: "Bot tipped over",
    teaser: "Physical incident — damaged goods?",
    sev: "critical",
    sevLabel: "CRITICAL",
    sevColor: "#E24B4A",
    image: "/TippedEdge.png",
    copy: [
      { label: "Bot asks for help.\nStudent obliges.", sub: null },
      { label: "Compartment stays locked.\nInspection triggered.", sub: null },
      { label: "Nothing gets through\nwithout a human check.", sub: null, headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="5" y="7" width="12" height="11" rx="3" stroke="#F09595" strokeWidth="1.5"/>
        <path d="M8 7V5.5a3 3 0 016 0V7" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="20" x2="19" y2="16" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "Accelerometer detects fall. Bot orientation invalid." },
      { type: "response", label: "SYSTEM RESPONSE", text: "Motors cut instantly. Operator alert fires with GPS coordinates. Verizon field tech dispatched. Compartment stays locked — item cannot be accessed." },
      { type: "outcome",  label: "OUTCOME",         text: "Item is secure. Bot replaced — at $125 compute cost, a damaged chassis is a logistics issue, not a crisis. The intelligence lives in the network, not the bot. Delivery refunded." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <g transform="translate(50,95) rotate(-70) translate(-28,-28)">
          <rect x="4" y="4" width="52" height="48" rx="8" fill="#1A1A1A" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
          <circle cx="30" cy="22" r="9" fill="rgba(255,255,255,0.06)"/>
          <circle cx="18" cy="44" r="8" fill="#2A2A2A" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          <circle cx="40" cy="44" r="8" fill="#2A2A2A" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        </g>
        <path d="M118 118 Q142 100 165 112" stroke="#FAC775" strokeWidth="1.5" strokeDasharray="3 2" fill="none"/>
        <circle cx="173" cy="108" r="12" fill="rgba(186,117,23,0.18)" stroke="#FAC775" strokeWidth="1"/>
        <text x="173" y="112" textAnchor="middle" fill="#FAC775" fontSize="13" fontFamily="sans-serif" fontWeight="700">!</text>
        <text x="173" y="128" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif">operator</text>
        <rect x="55" y="160" width="110" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="110" y="173" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">Item locked. Tech en route.</text>
      </svg>
    ),
  },
  {
    id: "battery",
    title: "Battery dying",
    teaser: "Bot may not complete delivery",
    sev: "warning",
    sevLabel: "WARNING",
    sevColor: "#BA7517",
    image: "/BatteryEdge.png",
    copy: [
      { label: "Bot calculates: not enough\nbattery to deliver and return.", sub: null },
      { label: "MEC dispatches backup.\nBots align. Item transfers.", sub: null },
      { label: "Two bots.\nOne seamless handoff.", sub: "Delivery continues. Bot 1 heads to charge.", headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="6" y="3" width="10" height="14" rx="2" stroke="#FAC775" strokeWidth="1.5"/>
        <rect x="9" y="1" width="4" height="3" rx="1" fill="#FAC775"/>
        <rect x="7.5" y="12" width="7" height="4" rx="1" fill="rgba(186,117,23,0.3)" stroke="#FAC775" strokeWidth="0.5"/>
        <line x1="11" y1="6" x2="11" y2="10" stroke="#FAC775" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "Bot battery drops below safe threshold mid-route." },
      { type: "response", label: "SYSTEM RESPONSE", text: "MEC identifies nearest available bot. Handoff initiated — item stays locked during transfer. Recipient gets 'your delivery has been reassigned' in the app." },
      { type: "outcome",  label: "OUTCOME",         text: "Delivery continues with a different bot. No interruption from the recipient's perspective. Fleet coordination via 5G MEC makes this seamless." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <rect x="15" y="72" width="52" height="48" rx="8" fill="#1A1A1A" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <rect x="20" y="110" width="42" height="5" rx="2" fill="#2A2A2A"/>
        <rect x="20" y="110" width="10" height="5" rx="2" fill="#E24B4A"/>
        <text x="41" y="98" textAnchor="middle" fill="#F09595" fontSize="10" fontFamily="sans-serif">LOW</text>
        <path d="M70 96 L108 96" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
        <path d="M112 96 L150 96" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
        <circle cx="110" cy="96" r="14" fill="rgba(55,138,221,0.14)" stroke="#378ADD" strokeWidth="1"/>
        <text x="110" y="100" textAnchor="middle" fill="#85B7EB" fontSize="9" fontFamily="sans-serif" fontWeight="700">MEC</text>
        <rect x="153" y="72" width="52" height="48" rx="8" fill="#1A1A1A" stroke="rgba(16,185,129,0.4)" strokeWidth="1"/>
        <rect x="158" y="110" width="42" height="5" rx="2" fill="#2A2A2A"/>
        <rect x="158" y="110" width="36" height="5" rx="2" fill="#10B981"/>
        <text x="179" y="98" textAnchor="middle" fill="#5DCAA5" fontSize="10" fontFamily="sans-serif">FULL</text>
        <text x="110" y="148" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="sans-serif">Handoff via MEC</text>
        <rect x="55" y="160" width="110" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="110" y="173" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">Delivery continues uninterrupted.</text>
      </svg>
    ),
  },
  {
    id: "kidnap",
    title: "Bot kidnapped",
    teaser: "Bot removed from delivery path",
    sev: "critical",
    sevLabel: "CRITICAL",
    sevColor: "#E24B4A",
    image: "/KidnapEdge.png",
    copy: [
      { label: "Bot goes off-route.\nThingSpace knows immediately.", sub: null },
      { label: "GPS tracked in real time.\nCompartment never opened.", sub: null },
      { label: "You can take the bot.\nYou can't take what's inside.", sub: null, headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#F09595" strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="3" fill="#F09595" opacity="0.4"/>
        <circle cx="11" cy="11" r="1.5" fill="#F09595"/>
        <line x1="3" y1="3" x2="19" y2="19" stroke="#F09595" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "Bot stationary outside delivery context for 60 seconds. GPS active via ThingSpace." },
      { type: "response", label: "SYSTEM RESPONSE", text: "Immobility alert fires. All motors remotely locked. Compartment seal engaged. Campus security + Verizon field tech notified with exact GPS coordinates." },
      { type: "outcome",  label: "OUTCOME",         text: "Item stays secure — locked compartment requires the correct code. Bot is tracked and fully recoverable. Brute-force entry is impractical." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <circle cx="110" cy="80" r="35" fill="rgba(226,75,74,0.06)" stroke="#E24B4A" strokeWidth="1" strokeDasharray="4 3"/>
        <circle cx="110" cy="80" r="20" fill="rgba(226,75,74,0.1)" stroke="#E24B4A" strokeWidth="1"/>
        <circle cx="110" cy="80" r="5" fill="#E24B4A"/>
        <rect x="84" y="120" width="52" height="42" rx="8" fill="#1A1A1A" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <line x1="110" y1="100" x2="110" y2="120" stroke="#E24B4A" strokeWidth="1" strokeDasharray="3 2"/>
        <rect x="90" y="130" width="40" height="6" rx="2" fill="#2A2A2A"/>
        <text x="110" y="150" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif">GPS LOCKED</text>
        <rect x="50" y="167" width="120" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="110" y="180" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">Located. Motors locked. Item safe.</text>
      </svg>
    ),
  },
  {
    id: "clog",
    title: "Hub getting clogged",
    teaser: "Recipients not picking up stored items",
    sev: "warning",
    sevLabel: "WARNING",
    sevColor: "#BA7517",
    image: "/HubEdge.png",
    copy: [
      { label: "Shelves fill up.\nNew deliveries can't complete.", sub: null },
      { label: "Nudges fire. Sender looped in.\nReturn to sender offered.", sub: null },
      { label: "No action in 72hrs?\nItem hits the marketplace.", sub: "Campus wins. Hub clears.", headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="9" width="16" height="10" rx="2" stroke="#FAC775" strokeWidth="1.5"/>
        <path d="M3 12h16M9 9V7a2 2 0 014 0v2" stroke="#FAC775" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="13.5" r="1" fill="#FAC775"/>
        <circle cx="16" cy="16.5" r="1" fill="#FAC775"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "3+ items held at hub beyond 6 hours. Capacity threshold hit." },
      { type: "response", label: "SYSTEM RESPONSE", text: "Escalating nudges: reminder at 2h, urgent at 6h, final notice at 24h. Sender notified after 24h with options: hold for a fee, return the item, or donate to campus lost & found." },
      { type: "outcome",  label: "OUTCOME",         text: "Hub stays clear. Sender stays in control. Demand prediction flags high-occupancy risk in advance so it rarely gets this far." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <rect x="80" y="55" width="60" height="80" rx="9" fill="#1A1A1A" stroke="rgba(186,117,23,0.5)" strokeWidth="1.5"/>
        <text x="110" y="76" textAnchor="middle" fill="#FAC775" fontSize="10" fontFamily="sans-serif" fontWeight="700">HUB</text>
        <rect x="87" y="82" width="46" height="9" rx="2" fill="rgba(226,75,74,0.25)" stroke="#E24B4A" strokeWidth="0.5"/>
        <rect x="87" y="95" width="46" height="9" rx="2" fill="rgba(226,75,74,0.25)" stroke="#E24B4A" strokeWidth="0.5"/>
        <rect x="87" y="108" width="46" height="9" rx="2" fill="rgba(186,117,23,0.25)" stroke="#FAC775" strokeWidth="0.5"/>
        <text x="110" y="90" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="sans-serif">6h+</text>
        <text x="110" y="103" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="sans-serif">6h+</text>
        <text x="110" y="116" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="sans-serif">2h</text>
        <path d="M140 88 Q162 85 162 73" stroke="#FAC775" strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
        <rect x="156" y="58" width="38" height="15" rx="4" fill="rgba(186,117,23,0.2)" stroke="#FAC775" strokeWidth="0.5"/>
        <text x="175" y="68" textAnchor="middle" fill="#FAC775" fontSize="9" fontFamily="sans-serif">nudge</text>
        <rect x="45" y="155" width="130" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="110" y="168" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">Hub clear. Sender in control.</text>
      </svg>
    ),
  },
  {
    id: "spotcheck",
    title: "Prohibited items",
    teaser: "What stops someone sending dangerous goods?",
    sev: "info",
    sevLabel: "INFO",
    sevColor: "#378ADD",
    image: "/DrugEdge.png",
    copy: [
      { label: "Every user signs our\nprohibited items agreement.", sub: null },
      { label: "Suspicious patterns trigger\nautomatic account flagging.", sub: null },
      { label: "Random spot checks.\nUnpredictable enough to matter.", sub: "No worse than a campus mailroom.\nConsiderably more accountable.", headline: true },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="9" width="14" height="10" rx="2" stroke="#85B7EB" strokeWidth="1.5"/>
        <path d="M7.5 9V7a3.5 3.5 0 017 0v2" stroke="#85B7EB" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="14" r="1.5" fill="#85B7EB"/>
        <line x1="16" y1="3" x2="20" y2="3" stroke="#85B7EB" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="3" x2="14" y2="5" stroke="#85B7EB" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20" y1="3" x2="18" y2="5" stroke="#85B7EB" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    beats: [
      { type: "trigger",  label: "WHAT HAPPENED",  text: "6 failed unlock attempts on the compartment." },
      { type: "response", label: "SYSTEM RESPONSE", text: "Compartment permanently locked. Recipient gets SMS with code re-sent. Sender receives a confirmation request: 'Did you send this to the right person?' Sender can cancel and recall the bot remotely." },
      { type: "outcome",  label: "OUTCOME",         text: "Item stays secure. Exponential lockout makes brute-force impractical. Sender stays in control of their delivery at all times." },
    ],
    visual: (
      <svg viewBox="0 0 220 200" width="220" height="200" fill="none">
        <rect x="70" y="48" width="80" height="88" rx="12" fill="#1A1A1A" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <rect x="80" y="78" width="60" height="16" rx="5" fill="#2A2A2A" stroke="#E24B4A" strokeWidth="1"/>
        <text x="110" y="89" textAnchor="middle" fill="#F09595" fontSize="10" fontFamily="monospace" letterSpacing="4">?  ?  ?  ?</text>
        <text x="110" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="sans-serif">Attempt 6 / 6</text>
        {[0,1,2].map(col => [0,1].map(row => (
          <rect key={`${col}-${row}`} x={86 + col*16} y={100 + row*14} width="12" height="11" rx="2"
            fill={col === 2 && row === 1 ? "rgba(226,75,74,0.5)" : "rgba(226,75,74,0.25)"}
            stroke="rgba(226,75,74,0.4)" strokeWidth="0.5"/>
        )))}
        <path d="M150 84 Q174 78 174 66" stroke="#85B7EB" strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
        <rect x="168" y="52" width="38" height="14" rx="4" fill="rgba(55,138,221,0.15)" stroke="#378ADD" strokeWidth="0.5"/>
        <text x="187" y="62" textAnchor="middle" fill="#85B7EB" fontSize="9" fontFamily="sans-serif">sender</text>
        <rect x="50" y="152" width="120" height="20" rx="5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" strokeWidth="1"/>
        <text x="110" y="165" textAnchor="middle" fill="#5DCAA5" fontSize="11" fontFamily="sans-serif" fontWeight="600">Locked. Sender alerted. Safe.</text>
      </svg>
    ),
  },
];

const SEV_STYLES = {
  critical: { bg: "rgba(226,75,74,0.14)", color: "#F09595", border: "rgba(226,75,74,0.3)" },
  warning:  { bg: "rgba(186,117,23,0.14)", color: "#FAC775", border: "rgba(186,117,23,0.3)" },
  info:     { bg: "rgba(55,138,221,0.14)", color: "#85B7EB", border: "rgba(55,138,221,0.3)" },
};

const BEAT_STYLES = {
  trigger:  { bg: "rgba(226,75,74,0.15)",   color: "#F09595", label: "TRIGGER"  },
  response: { bg: "rgba(55,138,221,0.15)",  color: "#85B7EB", label: "RESPONSE" },
  outcome:  { bg: "rgba(16,185,129,0.15)", color: "#5DCAA5", label: "OUTCOME"  },
};

export default function EdgeCases() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const s = active !== null ? SCENARIOS[active] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0A0A0A; }
        .ec-card-hover { transition: border-color 0.15s, transform 0.12s; }
        .ec-card-hover:hover { border-color: rgba(255,255,255,0.22) !important; transform: translateY(-2px); }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ width:"100vw", height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',-apple-system,sans-serif", background:"#0A0A0A", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", background:"#111111", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button
              onClick={() => active !== null ? setActive(null) : navigate("/")}
              style={{ width:36, height:36, borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16, color:"#FFF" }}>←</button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"#E24B4A", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1L2 4v3.5c0 3 2 5.5 5.5 6.5C11 12 13 9.5 13 7.5V4L7.5 1z" stroke="#FFF" strokeWidth="1.3" fill="none"/>
                  <line x1="5" y1="7.5" x2="6.8" y2="9.3" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="6.8" y1="9.3" x2="10.2" y2="5.7" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize:15, fontWeight:700, color:"#FFF" }}>Edge Cases</span>
              {s && <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>— {s.title}</span>}
            </div>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>
            Powered by <span style={{ color:"#EE0000", fontWeight:700 }}>Verizon 5G</span>
          </div>
        </div>

        {/* Grid view */}
        {active === null && (
          <div style={{ flex:1, overflow:"auto", padding:"24px 28px" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", lineHeight:1.5 }}>
                Tap a scenario to see how Deliverizon responds.
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
              {SCENARIOS.map((sc, i) => {
                const ss = SEV_STYLES[sc.sev];
                return (
                  <div key={sc.id} className="ec-card-hover" onClick={() => setActive(i)}
                    style={{ background:"#161616", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"18px", cursor:"pointer", animation:`fade-up 0.3s ease-out ${i*0.05}s both` }}>
                    <div style={{ width:42, height:42, borderRadius:11, background:ss.bg, border:`1px solid ${ss.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                      {sc.icon}
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#FFF", marginBottom:5 }}>{sc.title}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.4, marginBottom:12 }}>{sc.teaser}</div>
                    <span style={{ fontSize:9, fontWeight:700, padding:"2px 9px", borderRadius:10, letterSpacing:"0.5px", background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>
                      {sc.sevLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail view */}
        {active !== null && s && (
          <div style={{ flex:1, display:"flex", overflow:"hidden", animation:"fade-up 0.2s ease-out" }}>

            {/* LEFT — image (60%) or SVG fallback (42%) */}
            {s.image ? (
              <div style={{ width:"80%", flexShrink:0, position:"relative", overflow:"hidden" }}>
                <img
                  src={s.image}
                  alt={s.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }}
                />
                {/* Dot nav overlaid bottom-center */}
                <div style={{ position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8 }}>
                  {SCENARIOS.map((_, i) => (
                    <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? 22 : 7, height:7, borderRadius:4, background: i === active ? "#FFF" : "rgba(255,255,255,0.3)", cursor:"pointer", transition:"all 0.2s" }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ width:"42%", flexShrink:0, background:"#111", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px" }}>
                {s.visual}
                <div style={{ marginTop:16, display:"flex", gap:8 }}>
                  {SCENARIOS.map((_, i) => (
                    <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? 20 : 6, height:6, borderRadius:3, background: i === active ? s.sevColor : "rgba(255,255,255,0.15)", cursor:"pointer", transition:"all 0.2s" }} />
                  ))}
                </div>
              </div>
            )}

            {/* RIGHT — big copy (image mode) or beats (SVG mode) */}
            <div style={{ flex:1, padding: s.image ? "36px 40px" : "28px 32px", overflow:"auto", display:"flex", flexDirection:"column", justifyContent: s.image ? "center" : "flex-start" }}>

              {/* Title + badge */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: s.image ? 32 : 20 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:SEV_STYLES[s.sev].bg, border:`1px solid ${SEV_STYLES[s.sev].border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#FFF" }}>{s.title}</div>
                  <span style={{ fontSize:9, fontWeight:700, padding:"2px 9px", borderRadius:10, letterSpacing:"0.5px", background:SEV_STYLES[s.sev].bg, color:SEV_STYLES[s.sev].color, border:`1px solid ${SEV_STYLES[s.sev].border}` }}>
                    {s.sevLabel}
                  </span>
                </div>
              </div>

              {/* IMAGE MODE: big punchy copy */}
              {s.image && s.copy && (
                <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                  {s.copy.map((line, li) => (
                    <div key={li} style={{ borderLeft: line.headline ? `3px solid ${s.sevColor}` : "none", paddingLeft: line.headline ? 16 : 0 }}>
                      <div style={{
                        fontSize: line.headline ? 30 : 22,
                        fontWeight: 800,
                        color: line.headline ? "#FFF" : "rgba(255,255,255,0.9)",
                        lineHeight: 1.2,
                        whiteSpace: "pre-line",
                        marginBottom: line.sub ? 6 : 0,
                      }}>
                        {line.label}
                      </div>
                      {line.sub && (
                        <div style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>
                          {line.sub}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SVG MODE: three beats */}
              {!s.image && s.beats.map((beat, bi) => {
                const bs = BEAT_STYLES[beat.type];
                return (
                  <div key={bi} style={{ display:"flex", gap:14, marginBottom:20 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:bs.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                      {beat.type === "trigger"  && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#F09595" strokeWidth="1.4"/><line x1="7" y1="4" x2="7" y2="7" stroke="#F09595" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="10" r="0.8" fill="#F09595"/></svg>}
                      {beat.type === "response" && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="#85B7EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {beat.type === "outcome"  && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="#5DCAA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <div style={{ fontSize:9, fontWeight:700, color:bs.color, letterSpacing:"0.6px", marginBottom:4 }}>{bs.label}</div>
                      <div style={{ fontSize:14, color:"rgba(255,255,255,0.75)", lineHeight:1.6 }}>{beat.text}</div>
                    </div>
                  </div>
                );
              })}

              {/* Nav arrows */}
              <div style={{ display:"flex", gap:10, marginTop: s.image ? 40 : 8 }}>
                {active > 0 && (
                  <button onClick={() => setActive(active - 1)}
                    style={{ padding:"10px 18px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    ← {SCENARIOS[active - 1].title}
                  </button>
                )}
                {active < SCENARIOS.length - 1 && (
                  <button onClick={() => setActive(active + 1)}
                    style={{ padding:"10px 18px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer", fontFamily:"inherit", marginLeft:"auto" }}>
                    {SCENARIOS[active + 1].title} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
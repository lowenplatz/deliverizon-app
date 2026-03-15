import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// DELIVERIZON — Fleet Operations Dashboard (Screen 10)
// Access via /dashboard — loops on second laptop during Q&A
// ═══════════════════════════════════════════════════════════════

const ZONES = [
  { id: "snell", name: "Snell Library", x: 687, y: 347, short: "Snell Library" },
  { id: "isec", name: "ISEC", x: 169, y: 536, short: "ISEC" },
  { id: "curry", name: "Curry Student Center", x: 554, y: 268, short: "Curry Center" },
  { id: "ell", name: "ELL Hall", x: 598, y: 112, short: "ELL Hall" },
  { id: "marino", name: "Marino Center", x: 416, y: 80, short: "Marino" },
  { id: "richards", name: "Richards Hall", x: 870, y: 440, short: "Richards" },
  { id: "forsyth", name: "Forsyth Building", x: 588, y: 590, short: "Forsyth" },
  { id: "west_village", name: "West Village H", x: 110, y: 490, short: "West Village" },
  { id: "shillman", name: "Shillman Hall", x: 776, y: 274, short: "Shillman" },
  { id: "hub", name: "Deliverizon Hub", x: 460, y: 340, short: "Hub" },
];

const ZONE_MAP = {};
ZONES.forEach(z => ZONE_MAP[z.id] = z);

const PATHS = [
  ["hub","snell"],["hub","curry"],["hub","marino"],["hub","isec"],["hub","forsyth"],
  ["snell","shillman"],["snell","richards"],["curry","ell"],["ell","marino"],
  ["isec","west_village"],["isec","forsyth"],["forsyth","richards"],["shillman","richards"],["curry","hub"],
];

const BOT_ROUTES = [
  ["hub","snell","shillman","richards","forsyth","hub"],
  ["hub","curry","ell","marino","curry","hub"],
  ["hub","isec","west_village","isec","forsyth","hub"],
  null,
];
const BOT_NAMES = ["Deliverizer 1","Deliverizer 2","Deliverizer 3","Deliverizer 4"];
const BOT_BATTERIES = [92,78,65,34];

const ACTIVITY_POOL = [
  { icon: "📦", text: "Umbrella delivered to Sierre at West Village H" },
  { icon: "🤖", text: "Deliverizer 2 picked up Textbook from Sneha at Snell Library" },
  { icon: "📦", text: "Keys delivered to Adya at ISEC" },
  { icon: "🔋", text: "Deliverizer 4 charging at Hub — 34%" },
  { icon: "📦", text: "Notebook delivered to Sneha at Curry Center" },
  { icon: "🤖", text: "Deliverizer 1 picked up Headphones at ELL Hall" },
  { icon: "📦", text: "Water Bottle delivered to Adya at Marino Center" },
  { icon: "🤖", text: "Deliverizer 3 picked up Calculator from Sierre at Richards Hall" },
  { icon: "📦", text: "Phone Charger delivered to Sneha at Shillman Hall" },
  { icon: "🤖", text: "Deliverizer 2 en route to Forsyth Building" },
  { icon: "📦", text: "Lab Goggles delivered to Adya at West Village H" },
  { icon: "🤖", text: "Deliverizer 1 picked up USB Drive from Sierre at Curry Center" },
];

function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }
function timeAgo(ms) {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  return min === 1 ? "1 min ago" : `${min} min ago`;
}

export default function FleetDashboard() {
  const [bots, setBots] = useState(() =>
    BOT_ROUTES.map((route, i) => ({
      id: i, name: BOT_NAMES[i], battery: BOT_BATTERIES[i], route,
      segment: 0, progress: 0, paused: false, pauseTicks: 0,
      x: ZONE_MAP[route ? route[0] : "hub"].x, y: ZONE_MAP[route ? route[0] : "hub"].y,
    }))
  );
  const [activities, setActivities] = useState(() => {
    const now = Date.now();
    return [
      { ...ACTIVITY_POOL[0], time: now - 120000 },
      { ...ACTIVITY_POOL[1], time: now - 240000 },
      { ...ACTIVITY_POOL[2], time: now - 420000 },
      { ...ACTIVITY_POOL[3], time: now - 720000 },
      { ...ACTIVITY_POOL[4], time: now - 900000 },
    ];
  });
  const [deliveryCount, setDeliveryCount] = useState(23);
  const [now, setNow] = useState(Date.now());
  const activityIdx = useRef(5);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBots(prev => prev.map(bot => {
        if (!bot.route) return bot;
        if (bot.paused) {
          if (bot.pauseTicks <= 0) {
            const nextSeg = (bot.segment + 1) % (bot.route.length - 1);
            return { ...bot, paused: false, segment: nextSeg, progress: 0, pauseTicks: 0 };
          }
          return { ...bot, pauseTicks: bot.pauseTicks - 1 };
        }
        let np = bot.progress + 0.004;
        const from = ZONE_MAP[bot.route[bot.segment]], to = ZONE_MAP[bot.route[bot.segment + 1]];
        if (np >= 1) return { ...bot, progress: 1, x: to.x, y: to.y, paused: true, pauseTicks: 80 };
        return { ...bot, progress: np, x: lerp(from.x, to.x, np), y: lerp(from.y, to.y, np) };
      }));
    }, 45);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = activityIdx.current % ACTIVITY_POOL.length;
      setActivities(prev => [{ ...ACTIVITY_POOL[idx], time: Date.now() }, ...prev.slice(0, 9)]);
      activityIdx.current += 1;
      setDeliveryCount(c => c + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  function getBotStatus(bot) {
    if (!bot.route) return { label: "Charging", color: "#F59E0B", bg: "#FEF3C7" };
    if (bot.paused) return { label: `At ${ZONE_MAP[bot.route[bot.segment + 1]]?.short || "Hub"}`, color: "#10B981", bg: "#D1FAE5" };
    return { label: "En Route", color: "#3B82F6", bg: "#DBEAFE" };
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #FFFFFF; }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink-live { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .activity-item { animation: fade-in-up 0.4s ease-out; }
        .bot-marker-pulse { animation: pulse-ring 2s ease-out infinite; }
        .live-dot { animation: blink-live 1.5s ease-in-out infinite; }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", fontFamily: "'DM Sans',-apple-system,sans-serif", background: "#FFF", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#1A1A1A", color: "#FFF", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EE0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.5px" }}>DELIVERIZON</span>
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Fleet Operations Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", gap: 20, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              <span><span style={{ color: "#FFF", fontWeight: 700, fontSize: 16 }}>{deliveryCount}</span> deliveries today</span>
              <span><span style={{ color: "#FFF", fontWeight: 700, fontSize: 16 }}>4</span> bots active</span>
              <span><span style={{ color: "#FFF", fontWeight: 700, fontSize: 16 }}>8</span> min avg</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(238,0,0,0.15)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(238,0,0,0.3)" }}>
              <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#EE0000" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#EE0000", letterSpacing: "1px" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Map */}
          <div style={{ flex: 1, position: "relative", background: "#F0F1F3", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 16, left: 20, zIndex: 10, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", padding: "8px 14px", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>Northeastern University Campus</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>Boston, MA • 10 zones active</div>
            </div>
            <svg viewBox="0 0 1000 680" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D9DBDF" strokeWidth="0.5" opacity="0.5" /></pattern>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" /></filter>
              </defs>
              <rect width="1000" height="680" fill="#ECEEF1" />
              <rect width="1000" height="680" fill="url(#grid)" />
              <line x1="0" y1="200" x2="1000" y2="200" stroke="#D1D5DB" strokeWidth="8" opacity="0.4" />
              <line x1="0" y1="450" x2="1000" y2="450" stroke="#D1D5DB" strokeWidth="6" opacity="0.3" />
              <line x1="350" y1="0" x2="350" y2="680" stroke="#D1D5DB" strokeWidth="6" opacity="0.3" />
              <line x1="700" y1="0" x2="700" y2="680" stroke="#D1D5DB" strokeWidth="6" opacity="0.3" />
              <text x="820" y="193" fill="#B0B5BF" fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="500">HUNTINGTON AVE</text>
              <rect x="380" y="220" width="200" height="140" rx="12" fill="#DCE8D4" opacity="0.5" />
              <text x="440" y="298" fill="#9CAE90" fontSize="9" fontFamily="'DM Sans',sans-serif" fontWeight="500">CENTENNIAL</text>

              {PATHS.map(([a,b], i) => <line key={i} x1={ZONE_MAP[a].x} y1={ZONE_MAP[a].y} x2={ZONE_MAP[b].x} y2={ZONE_MAP[b].y} stroke="#C4C8CF" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />)}

              {ZONES.map(zone => {
                const isHub = zone.id === "hub";
                return (
                  <g key={zone.id}>
                    {isHub && <rect x={zone.x - 18} y={zone.y - 18} width={36} height={36} rx={8} fill="#EE0000" opacity="0.1" />}
                    <circle cx={zone.x} cy={zone.y} r={isHub ? 14 : 10} fill={isHub ? "#EE0000" : "#1A1A1A"} filter="url(#shadow)" />
                    <circle cx={zone.x} cy={zone.y} r={isHub ? 10 : 6} fill="#FFF" opacity="0.9" />
                    {isHub && <text x={zone.x} y={zone.y + 4} textAnchor="middle" fill="#EE0000" fontSize="10" fontWeight="800" fontFamily="'DM Sans',sans-serif">H</text>}
                    <text x={zone.x} y={zone.y + (isHub ? 28 : 24)} textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600" fontFamily="'DM Sans',sans-serif">{zone.short}</text>
                  </g>
                );
              })}

              {bots.map(bot => {
                const isCharging = !bot.route;
                return (
                  <g key={bot.id}>
                    {!isCharging && <circle cx={bot.x} cy={bot.y} r={8} fill="none" stroke="#EE0000" strokeWidth="2" className="bot-marker-pulse" opacity="0.5" />}
                    <circle cx={bot.x} cy={bot.y} r={isCharging ? 6 : 8} fill={isCharging ? "#F59E0B" : "#EE0000"} stroke="#FFF" strokeWidth="2.5" filter="url(#shadow)" />
                    <text x={bot.x} y={bot.y + 3.5} textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="800" fontFamily="'DM Sans',sans-serif">{bot.id + 1}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", bottom: 16, left: 20, display: "flex", gap: 16, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", padding: "8px 14px", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", fontSize: 11, color: "#6B7280" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EE0000", border: "1.5px solid white", boxShadow: "0 0 0 1px #EE0000" }} /><span>Active Bot</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", border: "1.5px solid white", boxShadow: "0 0 0 1px #F59E0B" }} /><span>Charging</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1A1A1A", border: "1.5px solid white", boxShadow: "0 0 0 1px #1A1A1A" }} /><span>Pickup Zone</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#EE0000" }} /><span style={{ fontWeight: 600 }}>Hub</span></div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: 330, borderLeft: "1px solid #E5E7EB", display: "flex", flexDirection: "column", background: "#FFF", flexShrink: 0 }}>
            <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", marginBottom: 10 }}>ACTIVE FLEET</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bots.map(bot => {
                  const status = getBotStatus(bot);
                  return (
                    <div key={bot.id} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: "#F9FAFB", borderRadius: 10, gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: bot.route ? "#FEE2E2" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🤖</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A" }}>{bot.name}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>
                          <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: status.bg, color: status.color, fontWeight: 600, fontSize: 10 }}>{status.label}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: bot.battery > 60 ? "#10B981" : bot.battery > 30 ? "#F59E0B" : "#EF4444" }}>{bot.battery}%</div>
                        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB", marginTop: 3, overflow: "hidden" }}>
                          <div style={{ width: `${bot.battery}%`, height: "100%", borderRadius: 2, background: bot.battery > 60 ? "#10B981" : bot.battery > 30 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", marginBottom: 10 }}>RECENT ACTIVITY</div>
              <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                {activities.map((item, i) => (
                  <div key={`${item.text}-${item.time}`} className="activity-item" style={{ display: "flex", gap: 10, padding: "9px 10px", borderRadius: 8, background: i === 0 ? "#FFF7ED" : "transparent", transition: "background 0.5s" }}>
                    <span style={{ fontSize: 15, flexShrink: 0, lineHeight: "20px" }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#374151", lineHeight: "17px", fontWeight: i === 0 ? 500 : 400 }}>{item.text}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{timeAgo(now - item.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>Powered by <span style={{ color: "#EE0000", fontWeight: 700 }}>Verizon 5G</span> + MEC</div>
              <div style={{ fontSize: 9, color: "#D1D5DB", fontWeight: 500 }}>v1.0 DEMO</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

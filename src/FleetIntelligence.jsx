import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MAP_ZONES = [
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

const BOT_HOMES = {
  D01: { x: 205, y: 295 },
  D02: { x: 472, y: 388 },
  D03: { x: 288, y: 502 },
  D04: { x: 148, y: 448 },
};

const BOT_COLORS = { D01:"#3B82F6", D02:"#8B5CF6", D03:"#F59E0B", D04:"#10B981" };

const REQUESTS = [
  { icon:"⚡", item:"Charger",    from:"Ed R.",     fromZone:"snell",   to:"Mirela M.",    toZone:"ell",         winBot:"D01", eta:"3m", lat:"13ms", rows:[{id:"D01",dist:1,batt:1,cap:1,tag:"match"},{id:"D02",dist:0,batt:1,cap:1,tag:"far"},{id:"D03",dist:0,batt:1,cap:1,tag:"far"},{id:"D04",dist:1,batt:0,cap:1,tag:"low"}] },
  { icon:"☂️", item:"Umbrella",   from:"Kal B.",    fromZone:"isec",    to:"Christine B.", toZone:"west_village",winBot:"D04", eta:"4m", lat:"15ms", rows:[{id:"D01",dist:0,batt:1,cap:1,tag:"far"},{id:"D02",dist:1,batt:1,cap:0,tag:"busy"},{id:"D03",dist:1,batt:0,cap:1,tag:"low"},{id:"D04",dist:1,batt:1,cap:1,tag:"match"}] },
  { icon:"🔑", item:"Keys",       from:"Suzanne S.",fromZone:"alumni",  to:"Adam T.",      toZone:"curry",       winBot:"D04", eta:"3m", lat:"12ms", rows:[{id:"D01",dist:0,batt:1,cap:1,tag:"far"},{id:"D02",dist:0,batt:1,cap:1,tag:"far"},{id:"D03",dist:1,batt:0,cap:1,tag:"low"},{id:"D04",dist:1,batt:1,cap:1,tag:"match"}] },
  { icon:"🎧", item:"Headphones", from:"Tom C.",    fromZone:"forsyth", to:"Elizabeth Z.", toZone:"marino",      winBot:"D03", eta:"4m", lat:"16ms", rows:[{id:"D01",dist:1,batt:1,cap:0,tag:"busy"},{id:"D02",dist:0,batt:1,cap:1,tag:"far"},{id:"D03",dist:1,batt:1,cap:1,tag:"match"},{id:"D04",dist:1,batt:0,cap:1,tag:"low"}] },
  { icon:"📓", item:"Notebook",   from:"Paul S.",   fromZone:"shillman",to:"Sudhir K.",    toZone:"isec",        winBot:"D02", eta:"2m", lat:"11ms", rows:[{id:"D01",dist:0,batt:1,cap:1,tag:"far"},{id:"D02",dist:1,batt:1,cap:1,tag:"match"},{id:"D03",dist:1,batt:0,cap:1,tag:"low"},{id:"D04",dist:0,batt:1,cap:1,tag:"far"}] },
];

const TICK=50, CARD_T=300, ROW_BASE=750, ROW_STEP=620, FACTOR_OFFSET=220, FACTOR_STEP=200;
const RESULT_T   = ROW_BASE + 3*ROW_STEP + 950;
const DISPATCH_T = RESULT_T + 480;
const SENDER_END = DISPATCH_T + 2400;
const PICKUP_T   = SENDER_END + 350;
const DEST_END   = PICKUP_T + 2400;
const TOTAL_T    = DEST_END + 1800;

const rowT    = i     => ROW_BASE + i*ROW_STEP;
const factorT = (i,f) => ROW_BASE + i*ROW_STEP + FACTOR_OFFSET + f*FACTOR_STEP;

function lerp(a,b,t){const c=Math.min(Math.max(t,0),1);return a+(b-a)*c;}
function lerp2(a,b,t){return{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)};}
function ease(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}

function getBotPos(elapsed,req){
  const home=BOT_HOMES[req.winBot];
  const from=MAP_ZONES.find(z=>z.id===req.fromZone);
  const to=MAP_ZONES.find(z=>z.id===req.toZone);
  if(!from||!to)return home;
  if(elapsed<DISPATCH_T)return home;
  if(elapsed<SENDER_END)return lerp2(home,from,ease((elapsed-DISPATCH_T)/(SENDER_END-DISPATCH_T)));
  if(elapsed<PICKUP_T)return from;
  if(elapsed<DEST_END)return lerp2(from,to,ease((elapsed-PICKUP_T)/(DEST_END-PICKUP_T)));
  return to;
}

function FleetMap({req,elapsed}){
  const from=MAP_ZONES.find(z=>z.id===req.fromZone);
  const to=MAP_ZONES.find(z=>z.id===req.toZone);
  const botPos=getBotPos(elapsed,req);
  const dispatched=elapsed>=DISPATCH_T;
  const atSender=elapsed>=SENDER_END&&elapsed<PICKUP_T;
  const delivered=elapsed>=DEST_END;
  const winColor=BOT_COLORS[req.winBot];
  const home=BOT_HOMES[req.winBot];

  const traveled=[];
  if(dispatched&&from){
    if(elapsed<SENDER_END){const t=ease((elapsed-DISPATCH_T)/(SENDER_END-DISPATCH_T));traveled.push(home,lerp2(home,from,t));}
    else{traveled.push(home,from);if(elapsed>=PICKUP_T&&to){if(elapsed<DEST_END){const t=ease((elapsed-PICKUP_T)/(DEST_END-PICKUP_T));traveled.push(lerp2(from,to,t));}else traveled.push(to);}}
  }

  return(
    <svg viewBox="0 0 630 820" style={{width:"100%",height:"100%",display:"block"}} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="fgrid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#C8CAD4" strokeWidth="0.3"/></pattern>
        <filter id="fglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="630" height="820" fill="#ECEEF2"/>
      <rect x="0" y="0" width="630" height="200" fill="#EDE9F4"/>
      <rect x="220" y="200" width="410" height="320" fill="#E4EBF8"/>
      <rect x="0" y="200" width="220" height="320" fill="#F5EDE4"/>
      <rect x="0" y="520" width="630" height="130" fill="#E6F0E6"/>
      <rect x="0" y="650" width="630" height="170" fill="#EDE9F4"/>
      <rect width="630" height="820" fill="url(#fgrid)"/>
      <rect x="295" y="335" width="80" height="48" rx="7" fill="#C8DEAD" opacity="0.65"/>
      <line x1="0" y1="375" x2="630" y2="373" stroke="#B0B4C2" strokeWidth="3"/>
      <text x="8" y="370" fill="#9098B0" fontSize="12" fontWeight="700" fontFamily="'DM Sans',sans-serif">Huntington Ave</text>
      <line x1="0" y1="470" x2="630" y2="470" stroke="#B0B4C2" strokeWidth="3"/>
      <text x="8" y="466" fill="#9098B0" fontSize="12" fontWeight="700" fontFamily="'DM Sans',sans-serif">Columbus Ave</text>
      <line x1="133" y1="200" x2="133" y2="650" stroke="#B0B4C2" strokeWidth="2" opacity="0.4"/>
      <rect x="244" y="412" width="32" height="18" rx="4" fill="#880000" opacity="0.85"/>
      <text x="260" y="424" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="800" fontFamily="'DM Sans',sans-serif" letterSpacing="0.5">HUB</text>
      {MAP_ZONES.map(z=>{
        const isFrom=z.id===req.fromZone,isTo=z.id===req.toZone,active=isFrom||isTo;
        return(<g key={z.id}>
          {isFrom&&<circle cx={z.x} cy={z.y} r={22} fill="#EE0000" opacity="0.1"><animate attributeName="r" values="14;24;14" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.18;0.04;0.18" dur="1.6s" repeatCount="indefinite"/></circle>}
          {isTo&&<circle cx={z.x} cy={z.y} r={22} fill="#3B82F6" opacity="0.1"><animate attributeName="r" values="14;24;14" dur="1.6s" repeatCount="indefinite" begin="0.5s"/><animate attributeName="opacity" values="0.18;0.04;0.18" dur="1.6s" repeatCount="indefinite" begin="0.5s"/></circle>}
          <circle cx={z.x} cy={z.y} r={active?10:6} fill={isFrom?"#EE0000":isTo?"#3B82F6":"#8890A4"} opacity={active?1:0.35}/>
          {active&&<circle cx={z.x} cy={z.y} r={4} fill="#FFF" opacity="0.9"/>}
          <text x={z.x} y={z.y+(active?22:17)} textAnchor="middle" fill={isFrom?"#EE0000":isTo?"#3B82F6":"#6B7280"} fontSize={active?"10":"7.5"} fontWeight={active?"700":"400"} fontFamily="'DM Sans',sans-serif" opacity={active?1:0.5}>{z.name}</text>
        </g>);
      })}
      {from&&to&&<line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#3B82F6" strokeWidth="2" strokeDasharray="7 5" opacity="0.18" strokeLinecap="round"/>}
      {traveled.length>=2&&<polyline points={traveled.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={winColor} strokeWidth="3" strokeLinecap="round" opacity="0.75"/>}
      {Object.entries(BOT_HOMES).filter(([id])=>id!==req.winBot).map(([id,pos])=>(
        <g key={id} opacity="0.35">
          <circle cx={pos.x} cy={pos.y} r={11} fill={BOT_COLORS[id]} stroke="#FFF" strokeWidth="1.5"/>
          <text x={pos.x} y={pos.y+3.5} textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="800" fontFamily="'DM Sans',sans-serif">{id}</text>
        </g>
      ))}
      <g filter="url(#fglow)">
        <circle cx={botPos.x} cy={botPos.y} r={12} fill={winColor} opacity="0.15"><animate attributeName="r" values="10;20;10" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0.04;0.25" dur="1.4s" repeatCount="indefinite"/></circle>
        <circle cx={botPos.x} cy={botPos.y} r={atSender||delivered?13:11} fill={delivered?"#10B981":winColor} stroke="#FFF" strokeWidth="2.5" style={{transition:"fill 0.4s"}}/>
        <text x={botPos.x} y={botPos.y+3.5} textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="800" fontFamily="'DM Sans',sans-serif">{delivered?"✓":req.winBot}</text>
      </g>
      <text x="606" y="26" textAnchor="middle" fill="#9CA3AF" fontSize="13" fontWeight="700" fontFamily="'DM Sans',sans-serif">N</text>
      <line x1="606" y1="30" x2="606" y2="44" stroke="#9CA3AF" strokeWidth="1.2"/>
      <polygon points="606,30 603,40 606,37 609,40" fill="#9CA3AF"/>
    </svg>
  );
}

const TAG_STYLES={match:{bg:"#D1FAE5",color:"#065F46",label:"MATCH"},far:{bg:"#FEE2E2",color:"#991B1B",label:"TOO FAR"},low:{bg:"#FEF3C7",color:"#92400E",label:"LOW BATT"},busy:{bg:"#F3F4F6",color:"#9CA3AF",label:"BUSY"}};

function Factor({label,good,visible}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:!visible?"#E5E7EB":good?"#10B981":"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s, transform 0.2s",transform:visible?"scale(1.08)":"scale(1)",fontSize:13,color:"#FFF",fontWeight:700}}>{visible?(good?"✓":"✗"):""}</div>
      <span style={{fontSize:13,color:"#9CA3AF",fontWeight:600}}>{label}</span>
    </div>
  );
}

function EvalPanel({req,elapsed}){
  const showCard=elapsed>=CARD_T, resultVis=elapsed>=RESULT_T, dispatched=elapsed>=DISPATCH_T, delivered=elapsed>=DEST_END;
  return(
    <div style={{width:380,flexShrink:0,display:"flex",flexDirection:"column",background:"#FFF",borderRight:"1px solid #F0F0F0",height:"100%",overflow:"hidden"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:32,height:32,borderRadius:8,background:"#EE0000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>🤖</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#1A1A1A"}}>MEC Bot Selection</div>
            <div style={{fontSize:13,color:"#3B82F6",fontWeight:700,letterSpacing:"0.6px"}}>VERIZON 5G EDGE · REAL-TIME</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,fontSize:14,color:"#6B7280",fontWeight:600}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#10B981",animation:"pulse-g 2s infinite"}}/>LIVE
          </div>
        </div>
        <div style={{fontSize:14,color:"#9CA3AF",lineHeight:1.5}}>When a request arrives, the 5G MEC evaluates every nearby bot — distance, battery, capacity — and dispatches the optimal one in milliseconds.</div>
      </div>

      <div style={{padding:"12px 18px 8px",flexShrink:0}}>
        {showCard?(
          <div style={{background:dispatched&&!delivered?"#EFF6FF":delivered?"#F0FDF4":"#FAFAFA",borderRadius:10,border:"1px solid #E5E7EB",borderLeft:`4px solid ${dispatched&&!delivered?"#3B82F6":delivered?"#10B981":"#3B82F6"}`,padding:"12px 14px",transition:"all 0.5s",animation:"ecIn 0.35s ease-out"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:24}}>{req.icon}</span>
              <span style={{fontSize:17,fontWeight:700,color:"#1A1A1A"}}>{req.item}</span>
              {dispatched&&<span style={{marginLeft:"auto",fontSize:13,fontWeight:700,padding:"2px 7px",borderRadius:10,background:delivered?"#D1FAE5":"#DBEAFE",color:delivered?"#065F46":"#1E40AF"}}>{delivered?"DELIVERED ✓":"EN ROUTE"}</span>}
            </div>
            <div style={{fontSize:14,color:"#6B7280",marginBottom:dispatched?6:0}}>{req.from} → {req.to}</div>
            {dispatched&&<div style={{fontSize:14,color:"#3B82F6",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              <span>→ <strong>{req.winBot}</strong></span>
              <span style={{color:"#9CA3AF"}}>·</span><span>via 5G MEC</span>
              <span style={{color:"#9CA3AF"}}>·</span><span>{req.eta} ETA</span>
              <span style={{color:"#9CA3AF"}}>·</span><span style={{color:"#8B5CF6",fontWeight:700}}>⚡{req.lat}</span>
            </div>}
          </div>
        ):(
          <div style={{padding:"12px",textAlign:"center",color:"#D1D5DB",fontSize:15}}>Awaiting request…</div>
        )}
      </div>

      <div style={{padding:"0 18px",flex:1,overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#9CA3AF",letterSpacing:"1.2px",marginBottom:6}}>BOT EVALUATION</div>
        {req.rows.map((row,i)=>{
          const visible=elapsed>=rowT(i), isBusy=row.tag==="busy", isMatch=row.tag==="match";
          const showDist=!isBusy&&elapsed>=factorT(i,0), showBatt=!isBusy&&elapsed>=factorT(i,1);
          const showCap=!isBusy&&elapsed>=factorT(i,2), showTag=elapsed>=factorT(i,3);
          const dimmed=showTag&&!isMatch, ts=TAG_STYLES[row.tag]||TAG_STYLES.far;
          return(
            <div key={row.id} style={{display:"flex",alignItems:"center",padding:"7px 8px",borderRadius:7,marginBottom:4,opacity:visible?(dimmed?0.28:1):0,transform:visible?"translateY(0)":"translateY(6px)",transition:"opacity 0.35s, transform 0.35s",background:isMatch&&showTag?"rgba(16,185,129,0.06)":"transparent"}}>
              <div style={{width:34,height:22,borderRadius:6,background:BOT_COLORS[row.id],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginRight:8}}>
                <span style={{fontSize:13,fontWeight:800,color:"#FFF"}}>{row.id}</span>
              </div>
              {isBusy?(<span style={{fontSize:14,color:"#9CA3AF",fontStyle:"italic",flex:1}}>Busy on another delivery</span>):(
                <div style={{display:"flex",gap:8,alignItems:"center",flex:1}}>
                  <Factor label="Dist" good={row.dist} visible={showDist}/>
                  <Factor label="Batt" good={row.batt} visible={showBatt}/>
                  <Factor label="Cap"  good={row.cap}  visible={showCap}/>
                </div>
              )}
              <div style={{opacity:showTag?1:0,transition:"opacity 0.3s",marginLeft:"auto",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:700,padding:"2px 7px",borderRadius:4,background:ts.bg,color:ts.color}}>{ts.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{borderTop:"1px solid #F0F0F0",padding:"10px 18px",display:"flex",background:"#FAFAFA",flexShrink:0}}>
        {[{v:"~14ms",l:"MEC LATENCY"},{v:"4",l:"ACTIVE BOTS"},{v:"100%",l:"UPTIME"}].map((s,i)=>(
          <div key={s.l} style={{flex:1,textAlign:"center",position:"relative"}}>
            {i>0&&<div style={{position:"absolute",left:0,top:"10%",bottom:"10%",width:1,background:"#E5E7EB"}}/>}
            <div style={{fontSize:20,fontWeight:800,color:"#1A1A1A"}}>{s.v}</div>
            <div style={{fontSize:12,color:"#9CA3AF",letterSpacing:"0.5px",fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Phase1(){
  const [elapsed,setElapsed]=useState(0);
  const [reqIdx,setReqIdx]=useState(0);
  useEffect(()=>{
    let e=0;
    const iv=setInterval(()=>{
      e+=TICK; setElapsed(e);
      if(e>=TOTAL_T){e=0;setElapsed(0);setReqIdx(r=>(r+1)%REQUESTS.length);}
    },TICK);
    return()=>clearInterval(iv);
  },[]);
  const req=REQUESTS[reqIdx];
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <EvalPanel req={req} elapsed={elapsed}/>
      <div style={{flex:1,background:"#F4F5F8",overflow:"hidden"}}><FleetMap req={req} elapsed={elapsed}/></div>
    </div>
  );
}

// ── PHASE 2 ─────────────────────────────────────────────────────

const RESTAURANTS=[{name:"El Jefe's Taqueria",emoji:"🌮"},{name:"Shake Shack",emoji:"🍔"},{name:"Kung Fu Tea",emoji:"🧋"},{name:"Saloniki Greek",emoji:"🥙"},{name:"Sweetgreen",emoji:"🥗"},{name:"Dunkin'",emoji:"🍩"},{name:"Insomnia Cookies",emoji:"🍪"},{name:"Boloco",emoji:"🌯"},{name:"Trident Booksellers",emoji:"📚"},{name:"Caffe Nero",emoji:"☕"}];
const ZONES_P2=["Snell Library","ISEC","Curry Student Center","West Village H","Alumni Center","Marino Center","Shillman Hall","ELL Hall","Forsyth Building","Richards Hall","Burstein Hall"];
const P2P_ITEMS=[{emoji:"⚡",name:"Charger"},{emoji:"☂️",name:"Umbrella"},{emoji:"🔑",name:"Keys"},{emoji:"💻",name:"Laptop"},{emoji:"📓",name:"Notebook"},{emoji:"🎧",name:"Headphones"},{emoji:"🔧",name:"Drill"},{emoji:"📱",name:"Phone"},{emoji:"📚",name:"Textbook"},{emoji:"🏋️",name:"Gym Pass"}];
const JUDGES_P2=["Ed R.","Mirela M.","Kal B.","Christine B.","Suzanne S.","Adam T.","Paul S.","Sudhir K.","Tom C.","Elizabeth Z.","Michael R.","Elizabeth M."];
const B2C_STATUSES=[{label:"PICKING UP",color:"#F59E0B"},{label:"EN ROUTE",color:"#3B82F6"},{label:"DELIVERING",color:"#EE0000"},{label:"DELIVERED",color:"#10B981"}];
const P2P_STATUSES=[{label:"AWAITING PICKUP",color:"#F59E0B"},{label:"ITEM SECURED",color:"#8B5CF6"},{label:"EN ROUTE",color:"#3B82F6"},{label:"DELIVERED",color:"#10B981"}];
let _uid=100,_bot=1;
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const uid=()=>_uid++;
const botId=()=>`D${String((_bot++%20)+1).padStart(2,"0")}`;
function makeB2C(si=0){return{id:uid(),bot:botId(),type:"b2c",restaurant:pick(RESTAURANTS),destination:pick(ZONES_P2),si,eta:`${2+Math.floor(Math.random()*7)}m`,lat:`${10+Math.floor(Math.random()*12)}ms`,ticks:si*4,removing:false,fresh:si===0};}
function makeP2P(si=0){const js=[...JUDGES_P2].sort(()=>Math.random()-0.5);return{id:uid(),bot:botId(),type:"p2p",from:js[0],to:js[1],item:pick(P2P_ITEMS),pickup:pick(ZONES_P2),dropoff:pick(ZONES_P2),si,eta:`${2+Math.floor(Math.random()*8)}m`,lat:`${10+Math.floor(Math.random()*12)}ms`,ticks:si*4,removing:false,fresh:si===0};}

function B2CCard({d}){const st=B2C_STATUSES[Math.min(d.si,3)];return(<div style={{background:"#141414",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",borderLeft:`3px solid ${st.color}`,padding:"14px 16px",marginBottom:10,opacity:d.removing?0:1,transform:d.removing?"translateY(-6px) scale(0.98)":"translateY(0) scale(1)",transition:"opacity 0.45s ease, transform 0.45s ease",animation:d.fresh?"slideIn 0.3s ease-out":"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:36,lineHeight:1}}>{d.restaurant.emoji}</span><div><div style={{fontSize:17,fontWeight:700,color:"#FFF",marginBottom:2}}>{d.restaurant.name}</div><div style={{fontSize:15,color:"rgba(255,255,255,0.35)"}}>→ {d.destination}</div></div></div><span style={{fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:20,flexShrink:0,background:`${st.color}1A`,color:st.color,border:`1px solid ${st.color}44`,letterSpacing:"0.4px"}}>{st.label}</span></div><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:14,color:"rgba(255,255,255,0.25)",fontWeight:700}}>{d.bot}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.12)"}}>·</span><span style={{fontSize:14,color:"rgba(59,130,246,0.75)",fontWeight:600}}>⚡ {d.lat} MEC</span><span style={{fontSize:14,color:"rgba(255,255,255,0.12)"}}>·</span><span style={{fontSize:14,color:"rgba(255,255,255,0.28)"}}>ETA {d.eta}</span></div></div>);}
function P2PCard({d}){const st=P2P_STATUSES[Math.min(d.si,3)];return(<div style={{background:"#141414",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",borderLeft:`3px solid ${st.color}`,padding:"14px 16px",marginBottom:10,opacity:d.removing?0:1,transform:d.removing?"translateY(-6px) scale(0.98)":"translateY(0) scale(1)",transition:"opacity 0.45s ease, transform 0.45s ease",animation:d.fresh?"slideIn 0.3s ease-out":"none"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><div style={{width:28,height:28,borderRadius:8,background:"rgba(238,0,0,0.15)",border:"1px solid rgba(238,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#EE0000",flexShrink:0}}>{d.from[0]}</div><span style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{d.from}</span><span style={{fontSize:21,margin:"0 2px"}}>{d.item.emoji}</span><span style={{fontSize:16,color:"rgba(255,255,255,0.2)"}}>→</span><div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"rgba(255,255,255,0.5)",flexShrink:0}}>{d.to[0]}</div><span style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{d.to}</span></div><div style={{fontSize:15,color:"rgba(255,255,255,0.25)"}}>{d.item.name} · {d.pickup} → {d.dropoff}</div></div><span style={{fontSize:13,fontWeight:700,padding:"3px 9px",borderRadius:20,flexShrink:0,marginLeft:10,background:`${st.color}1A`,color:st.color,border:`1px solid ${st.color}44`,letterSpacing:"0.4px"}}>{st.label}</span></div><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:14,color:"rgba(255,255,255,0.25)",fontWeight:700}}>{d.bot}</span><span style={{fontSize:14,color:"rgba(255,255,255,0.12)"}}>·</span><span style={{fontSize:14,color:"rgba(238,0,0,0.65)",fontWeight:600}}>⚡ {d.lat} MEC</span><span style={{fontSize:14,color:"rgba(255,255,255,0.12)"}}>·</span><span style={{fontSize:14,color:"rgba(255,255,255,0.28)"}}>ETA {d.eta}</span></div></div>);}
function Stat({value,label,color,small}){return(<div style={{textAlign:"center"}}><div style={{fontSize:small?20:26,fontWeight:800,color:color||"#FFF",lineHeight:1}}>{value}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.28)",letterSpacing:"0.7px",fontWeight:700,marginTop:3}}>{label}</div></div>);}
function Divider(){return <div style={{width:1,height:24,background:"rgba(255,255,255,0.07)"}}/>;}

function Phase2(){
  const [b2cList,setB2c]=useState(()=>[makeB2C(0),makeB2C(1),makeB2C(2),makeB2C(1)]);
  const [p2pList,setP2p]=useState(()=>[makeP2P(0),makeP2P(1),makeP2P(2),makeP2P(1)]);
  const [total,setTotal]=useState(847);
  useEffect(()=>{
    let t=0;
    const iv=setInterval(()=>{
      t++;
      const advance=(list,makeFn)=>{let next=list.filter(d=>!d.removing);next=next.map(d=>{const nt=d.ticks+1,ns=Math.floor(nt/4),done=ns>=4;return{...d,ticks:nt,si:Math.min(ns,3),removing:done,fresh:false}});if(t%3===0&&next.filter(d=>!d.removing).length<5)next=[makeFn(0),...next];return next;};
      setB2c(prev=>advance(prev,makeB2C));setP2p(prev=>advance(prev,makeP2P));
      if(t%3===0)setTotal(c=>c+1);
    },2600);
    return()=>clearInterval(iv);
  },[]);
  const activeBots=b2cList.filter(d=>!d.removing).length+p2pList.filter(d=>!d.removing).length;
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",borderRight:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{padding:"16px 20px 12px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(59,130,246,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:34,height:34,borderRadius:9,background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏪</div>
            <div><div style={{fontSize:20,fontWeight:800,color:"#FFF"}}>B2C Deliveries</div><div style={{fontSize:14,color:"rgba(59,130,246,0.85)",fontWeight:700,letterSpacing:"0.6px"}}>BUSINESS TO CONSUMER</div></div>
            <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#3B82F6",animation:"pulse-blue 2s infinite"}}/>
          </div>
          <div style={{fontSize:15,color:"rgba(255,255,255,0.28)"}}>{b2cList.filter(d=>!d.removing).length} active · Restaurants → Campus drop zones</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>{b2cList.map(d=><B2CCard key={d.id} d={d}/>)}</div>
      </div>
      <div style={{width:148,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:"0 14px",borderRight:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.01)"}}>
        <Stat value={total} label="DELIVERIES TODAY" color="#FFF"/><Divider/>
        <Stat value={activeBots} label="ACTIVE BOTS" color="#FFF"/><Divider/>
        <div style={{background:"rgba(238,0,0,0.1)",border:"1px solid rgba(238,0,0,0.28)",borderRadius:14,padding:"12px 14px",textAlign:"center",width:"100%"}}>
          <div style={{fontSize:13,color:"#EE0000",fontWeight:800,letterSpacing:"0.6px"}}>VERIZON</div>
          <div style={{fontSize:13,color:"#EE0000",fontWeight:800,letterSpacing:"0.6px",marginBottom:6}}>5G MEC</div>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981",margin:"0 auto 4px",animation:"pulse-green 2s infinite"}}/>
          <div style={{fontSize:13,color:"#10B981",fontWeight:700,letterSpacing:"0.4px"}}>ACTIVE</div>
        </div>
        <Divider/><Stat value="~14ms" label="AVG MEC LATENCY" color="#3B82F6" small/><Divider/>
        <Stat value="2" label="CAMPUSES" color="#FFF"/>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"16px 20px 12px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(238,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:34,height:34,borderRadius:9,background:"rgba(238,0,0,0.15)",border:"1px solid rgba(238,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👤</div>
            <div><div style={{fontSize:20,fontWeight:800,color:"#FFF"}}>P2P Deliveries</div><div style={{fontSize:14,color:"rgba(238,0,0,0.85)",fontWeight:700,letterSpacing:"0.6px"}}>PEER TO PEER</div></div>
            <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#EE0000",animation:"pulse-red 2s infinite"}}/>
          </div>
          <div style={{fontSize:15,color:"rgba(255,255,255,0.28)"}}>{p2pList.filter(d=>!d.removing).length} active · Person → Person, any item</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>{p2pList.map(d=><P2PCard key={d.id} d={d}/>)}</div>
      </div>
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────────

export default function FleetIntelligence(){
  const [phase,setPhase]=useState(1);
  const navigate=useNavigate();
  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}body{background:#0A0A0A;}
        @keyframes pulse-blue{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}50%{box-shadow:0 0 0 6px rgba(59,130,246,0)}}
        @keyframes pulse-red{0%,100%{box-shadow:0 0 0 0 rgba(238,0,0,.5)}50%{box-shadow:0 0 0 6px rgba(238,0,0,0)}}
        @keyframes pulse-green{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}50%{box-shadow:0 0 0 6px rgba(16,185,129,0)}}
        @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}50%{box-shadow:0 0 0 4px rgba(16,185,129,0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ecIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
      <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',-apple-system,sans-serif",background:phase===1?"#F4F5F8":"#0A0A0A",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:phase===1?"#FFF":"#111111",borderBottom:`1px solid ${phase===1?"#E5E7EB":"rgba(255,255,255,0.06)"}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <button onClick={()=>navigate("/")} style={{width:36,height:36,borderRadius:10,border:`1px solid ${phase===1?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.1)"}`,background:phase===1?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:21,color:phase===1?"#1A1A1A":"#FFF"}}>←</button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:7,background:"#EE0000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
              <span style={{fontSize:20,fontWeight:700,color:phase===1?"#1A1A1A":"#FFF"}}>Fleet Intelligence</span>
            </div>
          </div>
          <div style={{display:"flex",background:phase===1?"rgba(0,0,0,0.05)":"rgba(255,255,255,0.06)",borderRadius:10,padding:3}}>
            {[{n:1,label:"Bot Selection"},{n:2,label:"Live Fleet"}].map(p=>(
              <button key={p.n} onClick={()=>setPhase(p.n)} style={{padding:"8px 20px",borderRadius:8,border:"none",background:phase===p.n?"#3B82F6":"transparent",color:phase===p.n?"#FFF":phase===1?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.4)",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{p.label}</button>
            ))}
          </div>
          <div style={{fontSize:15,color:phase===1?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.25)"}}>Powered by <span style={{color:"#EE0000",fontWeight:700}}>Verizon 5G</span></div>
        </div>
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {phase===1?<Phase1/>:<Phase2/>}
        </div>
      </div>
    </>
  );
}
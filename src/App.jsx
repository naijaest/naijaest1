import { useState, useEffect, useRef } from “react”;

const PROPERTY = {
id: 1,
title: “Luxury 5-Bed Duplex”,
location: “Maitama, Abuja”,
price: 320000000,
type: “sell”,
lat: 9.0820,
lng: 7.4891,
agent: “Emeka Okafor”,
agentPhoto: “👨🏿‍💼”,
phone: “+2348030000001”,
beds: 5, baths: 4, sqm: 480,
images: [
“https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80”,
“https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80”,
“https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=80”,
“https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=900&q=80”,
“https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80”,
“https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80”,
],
features: [“Swimming Pool”, “Boys Quarters”, “CCTV”, “Generator”, “Smart Home”, “Solar Panels”, “Gym”, “Cinema”],
desc: “A breathtaking luxury duplex in the heart of Maitama diplomatic zone. Italian marble, smart automation, solar energy, rooftop terrace, and a heated pool. The pinnacle of Abuja living.”,
verified: true,
rating: 4.9,
reviews: 28,
};

const fmt = (n) => `₦${(n / 1_000_000).toFixed(0)}M`;

const NEARBY = [
{ icon: “🏫”, name: “American Int’l School”, dist: “0.8km”, type: “School” },
{ icon: “🏥”, name: “Maitama Hospital”, dist: “1.2km”, type: “Hospital” },
{ icon: “🛒”, name: “Ceddi Plaza”, dist: “2.1km”, type: “Mall” },
{ icon: “⛽”, name: “NNPC Station”, dist: “0.4km”, type: “Fuel” },
{ icon: “🏦”, name: “GTBank Maitama”, dist: “0.6km”, type: “Bank” },
{ icon: “✈️”, name: “Abuja Airport”, dist: “18km”, type: “Airport” },
];

const AI_STEPS = [
{ label: “Scanning exterior & walls…”, icon: “🏠” },
{ label: “Analysing roof condition…”, icon: “🔍” },
{ label: “Checking drainage & flood risk…”, icon: “💧” },
{ label: “Inspecting windows & doors…”, icon: “🚪” },
{ label: “Running AI valuation model…”, icon: “💰” },
{ label: “Generating full report…”, icon: “📋” },
];

const AI_REPORT = {
score: 94,
verdict: “Excellent Condition”,
color: “#00e676”,
findings: [
{ icon: “✅”, label: “Structural Integrity”, status: “Excellent”, detail: “No cracks or sagging detected in walls or foundation”, pct: 96 },
{ icon: “✅”, label: “Roof & Ceiling”, status: “Excellent”, detail: “New roof installed 2022, no damage or leaks detected”, pct: 98 },
{ icon: “✅”, label: “Paint & Finishes”, status: “Very Good”, detail: “Fresh premium paint, no water stains or peeling”, pct: 93 },
{ icon: “⚠️”, label: “Drainage”, status: “Fair”, detail: “Minor water pooling risk near east perimeter wall”, pct: 74 },
{ icon: “✅”, label: “Security & Gates”, status: “Excellent”, detail: “Reinforced perimeter, electric fence, CCTV coverage”, pct: 97 },
{ icon: “✅”, label: “Utilities”, status: “Very Good”, detail: “Solar panels active, industrial generator in good condition”, pct: 91 },
],
valuation: “AI estimates fair market value at ₦300M – ₦340M. Listed price of ₦320M is within fair range.”,
recommendation: “Strong buy recommendation. Negotiate ₦5–10M discount citing minor drainage note.”,
};

const SLOTS = [
{ time: “Today 2:00 PM”, available: true },
{ time: “Today 5:00 PM”, available: true },
{ time: “Tomorrow 10:00 AM”, available: true },
{ time: “Tomorrow 2:00 PM”, available: false },
{ time: “Saturday 11:00 AM”, available: true },
];

// Scanning animation component
const Scanline = () => (

  <div style={{
    position: "absolute", left: 0, right: 0, height: 3,
    background: "linear-gradient(90deg, transparent 0%, #00e676 40%, #00e676 60%, transparent 100%)",
    boxShadow: "0 0 16px 4px rgba(0,230,118,0.5)",
    animation: "scanline 2s linear infinite", pointerEvents: "none", zIndex: 10
  }} />
);

// Corner brackets for AR scanning UI
const ScanBrackets = ({ color = “#00e676” }) => (
<>
{[
{ top: 8, left: 8, borderTop: true, borderLeft: true },
{ top: 8, right: 8, borderTop: true, borderRight: true },
{ bottom: 8, left: 8, borderBottom: true, borderLeft: true },
{ bottom: 8, right: 8, borderBottom: true, borderRight: true },
].map((b, i) => (
<div key={i} style={{
position: “absolute”, …b,
width: 22, height: 22,
borderColor: color,
borderStyle: “solid”,
borderWidth: 0,
borderTopWidth: b.borderTop ? 2.5 : 0,
borderLeftWidth: b.borderLeft ? 2.5 : 0,
borderRightWidth: b.borderRight ? 2.5 : 0,
borderBottomWidth: b.borderBottom ? 2.5 : 0,
borderRadius: b.borderTop && b.borderLeft ? “4px 0 0 0” : b.borderTop && b.borderRight ? “0 4px 0 0” : b.borderBottom && b.borderLeft ? “0 0 0 4px” : “0 0 4px 0”,
pointerEvents: “none”, zIndex: 20
}} />
))}
</>
);

export default function Naijaest() {
const [tab, setTab] = useState(“gallery”);
const [imgIdx, setImgIdx] = useState(0);
const [mapMode, setMapMode] = useState(“earth”); // earth | street
const [streetDir, setStreetDir] = useState(0);
const [aiState, setAiState] = useState(“idle”); // idle | scanning | done
const [aiStep, setAiStep] = useState(0);
const [aiPct, setAiPct] = useState(0);
const [liveStep, setLiveStep] = useState(“intro”); // intro | slots | confirm
const [liveSlot, setLiveSlot] = useState(null);
const [chatOpen, setChatOpen] = useState(false);
const [chatInput, setChatInput] = useState(””);
const [chatHistory, setChatHistory] = useState([
{ from: “agent”, text: “Welcome to Naijaest! 🏡 I’m Emeka, your agent for this stunning Maitama duplex. How can I help you today?” }
]);
const [chatLoading, setChatLoading] = useState(false);
const [arMode, setArMode] = useState(false);
const [arScanImg, setArScanImg] = useState(0);
const chatEndRef = useRef(null);

useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: “smooth” });
}, [chatHistory, chatLoading]);

// AI inspection runner
const startAI = () => {
setAiState(“scanning”);
setAiStep(0);
setAiPct(0);
let s = 0;
const tick = setInterval(() => {
s++;
setAiStep(s);
setAiPct(Math.round((s / AI_STEPS.length) * 100));
if (s >= AI_STEPS.length) {
clearInterval(tick);
setTimeout(() => setAiState(“done”), 700);
}
}, 950);
};

// AI chat
const sendChat = async () => {
if (!chatInput.trim() || chatLoading) return;
const msg = chatInput.trim();
setChatInput(””);
setChatHistory(h => […h, { from: “user”, text: msg }]);
setChatLoading(true);
try {
const res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
system: `You are Emeka Okafor, a top Lagos/Abuja real estate agent on Naijaest.com — Nigeria's #1 property platform. You represent a luxury 5-bed duplex in Maitama, Abuja at ₦320M for sale (5 beds, 4 baths, 480sqm, pool, BQ, generator, solar, smart home, gym, cinema). Naijaest covers Lagos and Abuja first, then all Nigeria, then Africa. Be SHORT (2-3 sentences), warm, confident, and use natural Nigerian context (mention Naira, NEPA, area boys, good roads etc where relevant). If they want to view, mention the Live AR Inspection feature on Naijaest.com.`,
messages: [{ role: “user”, content: msg }]
})
});
const data = await res.json();
const reply = data.content?.[0]?.text || “Please call me directly — +234 803 000 0001!”;
setChatHistory(h => […h, { from: “agent”, text: reply }]);
} catch {
setChatHistory(h => […h, { from: “agent”, text: “Network issue — WhatsApp me directly for faster response! 📱” }]);
}
setChatLoading(false);
};

// Cycle AR scan image
useEffect(() => {
if (!arMode) return;
const t = setInterval(() => setArScanImg(i => (i + 1) % PROPERTY.images.length), 3500);
return () => clearInterval(t);
}, [arMode]);

const TABS = [
{ id: “gallery”, label: “Gallery”, emoji: “📸” },
{ id: “earth”, label: “Earth View”, emoji: “🌍” },
{ id: “ai”, label: “AI Inspect”, emoji: “🤖” },
{ id: “live”, label: “Live Tour”, emoji: “📹” },
];

return (
<>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{font-family:'Space Grotesk',sans-serif;background:#050508;} @keyframes scanline{0%{top:-2%}100%{top:102%}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}} @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,230,118,.25)}50%{box-shadow:0 0 36px rgba(0,230,118,.6)}} @keyframes earthSpin{from{background-position:0% center}to{background-position:200% center}} @keyframes ripple{0%{transform:scale(.8);opacity:1}100%{transform:scale(2.5);opacity:0}} @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}} ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e2535;border-radius:2px}`}</style>

```
  <div style={{ maxWidth: 480, margin: "0 auto", background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>

    {/* ── LOGO BAR ──────────────────────────────────── */}
    <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #e63946, #c1121f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏡</div>
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: -0.5 }}>Naija</span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, color: "#e63946", letterSpacing: -0.5 }}>est</span>
          <span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>.com</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,230,118,.08)", border: "1px solid rgba(0,230,118,.2)", borderRadius: 20, padding: "5px 12px" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", animation: "pulse 1.8s infinite" }} />
        <span style={{ fontSize: 11, color: "#00e676", fontWeight: 600 }}>Lagos · Abuja</span>
      </div>
    </div>

    {/* ── PROPERTY HEADER ──────────────────────────── */}
    <div style={{ padding: "18px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ background: "#e63946", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: 1 }}>FOR SALE</span>
            {PROPERTY.verified && <span style={{ background: "rgba(0,230,118,.12)", color: "#00e676", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: 1, border: "1px solid rgba(0,230,118,.25)" }}>✓ VERIFIED</span>}
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", lineHeight: 1.2 }}>{PROPERTY.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, color: "#666", fontSize: 12 }}>
            <span>📍</span><span>{PROPERTY.location}</span>
            <span style={{ color: "#2a2a3a" }}>•</span>
            <span style={{ color: "#f4a261" }}>★ {PROPERTY.rating}</span>
            <span style={{ color: "#666" }}>({PROPERTY.reviews})</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: "#e63946", lineHeight: 1 }}>{fmt(PROPERTY.price)}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>Negotiable</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, padding: "12px 14px", background: "#0d0d18", borderRadius: 14, border: "1px solid #1a1a2e" }}>
        {[
          { v: PROPERTY.beds, l: "Beds", i: "🛏" },
          { v: PROPERTY.baths, l: "Baths", i: "🚿" },
          { v: `${PROPERTY.sqm}m²`, l: "Area", i: "📐" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid #1a1a2e" : "none" }}>
            <div style={{ fontSize: 16 }}>{s.i}</div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginTop: 2 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ── TAB BAR ───────────────────────────────────── */}
    <div style={{ display: "flex", margin: "18px 20px 0", background: "#0d0d18", borderRadius: 14, padding: 4, border: "1px solid #1a1a2e" }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, padding: "9px 4px", border: "none", borderRadius: 10, cursor: "pointer",
          background: tab === t.id ? "#1a1a2e" : "transparent",
          color: tab === t.id ? "#fff" : "#444",
          fontSize: 9, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: 0.3, transition: "all 0.2s", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3
        }}>
          <span style={{ fontSize: 15 }}>{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>

    {/* ════════════════════════════════════════════════
        TAB: GALLERY
    ════════════════════════════════════════════════ */}
    {tab === "gallery" && (
      <div style={{ animation: "fadeUp 0.3s ease", marginTop: 16 }}>

        {/* AR Mode toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 20px 10px" }}>
          <button onClick={() => setArMode(m => !m)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: arMode ? "rgba(0,230,118,.15)" : "#0d0d18",
            border: arMode ? "1px solid rgba(0,230,118,.4)" : "1px solid #1a1a2e",
            borderRadius: 20, padding: "6px 14px", cursor: "pointer",
            color: arMode ? "#00e676" : "#666", fontSize: 11, fontWeight: 600
          }}>
            <span style={{ fontSize: 14 }}>🥽</span>
            {arMode ? "AR Mode ON" : "Try AR View"}
          </button>
        </div>

        {/* Main image with AR overlay */}
        <div style={{ position: "relative", height: 280, margin: "0 20px", borderRadius: 18, overflow: "hidden", background: "#0d0d18" }}>
          <img
            src={PROPERTY.images[arMode ? arScanImg : imgIdx]}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }}
          />

          {arMode && (
            <>
              {/* AR scan overlay */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,10,5,0.35)" }} />
              <Scanline />
              <ScanBrackets color="#00e676" />

              {/* AR data tags */}
              {[
                { top: "18%", left: "12%", label: "Living Room", sub: "Est. 45m²", color: "#00e676" },
                { top: "55%", right: "10%", label: "Pool Area", sub: "Verified ✓", color: "#f4a261" },
                { top: "30%", left: "55%", label: "Roof", sub: "Good Cond.", color: "#00e676" },
              ].map((tag, i) => (
                <div key={i} style={{
                  position: "absolute", top: tag.top, left: tag.left, right: tag.right,
                  background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                  border: `1px solid ${tag.color}60`, borderRadius: 8,
                  padding: "5px 10px", animation: `fadeUp 0.4s ease ${i * 0.15}s both`
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tag.color }}>{tag.label}</div>
                  <div style={{ fontSize: 9, color: "#aaa", marginTop: 1 }}>{tag.sub}</div>
                </div>
              ))}

              <div style={{ position: "absolute", top: 10, left: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "4px 10px", border: "1px solid rgba(0,230,118,0.3)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 9, color: "#00e676", fontWeight: 700, letterSpacing: 1 }}>AR REALITY MODE</span>
              </div>
            </>
          )}

          {!arMode && (
            <>
              <button onClick={() => setImgIdx(i => (i - 1 + PROPERTY.images.length) % PROPERTY.images.length)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 34, height: 34, color: "#fff", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <button onClick={() => setImgIdx(i => (i + 1) % PROPERTY.images.length)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 34, height: 34, color: "#fff", cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                {PROPERTY.images.map((_, i) => <div key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 18 : 5, height: 5, borderRadius: 3, background: i === imgIdx ? "#e63946" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.2s" }} />)}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {!arMode && (
          <div style={{ display: "flex", gap: 8, padding: "12px 20px", overflowX: "auto" }}>
            {PROPERTY.images.map((img, i) => (
              <div key={i} onClick={() => setImgIdx(i)} style={{ flexShrink: 0, width: 68, height: 50, borderRadius: 10, overflow: "hidden", border: i === imgIdx ? "2px solid #e63946" : "2px solid #1a1a2e", cursor: "pointer", transition: "border 0.2s" }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div style={{ padding: "0 20px 100px", marginTop: arMode ? 12 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 10 }}>FEATURES & AMENITIES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {PROPERTY.features.map(f => (
              <span key={f} style={{ background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#bbb", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#00e676", fontSize: 10 }}>✓</span>{f}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{PROPERTY.desc}</p>
        </div>
      </div>
    )}

    {/* ════════════════════════════════════════════════
        TAB: GOOGLE EARTH VIEW
    ════════════════════════════════════════════════ */}
    {tab === "earth" && (
      <div style={{ animation: "fadeUp 0.3s ease", marginTop: 16 }}>

        {/* Mode switch */}
        <div style={{ display: "flex", margin: "0 20px 14px", background: "#0d0d18", borderRadius: 12, padding: 3, border: "1px solid #1a1a2e" }}>
          {[
            { id: "earth", label: "🌍 Earth View" },
            { id: "street", label: "🚶 Street View" },
          ].map(m => (
            <button key={m.id} onClick={() => setMapMode(m.id)} style={{
              flex: 1, padding: "9px", border: "none", borderRadius: 9, cursor: "pointer",
              background: mapMode === m.id ? "#e63946" : "transparent",
              color: mapMode === m.id ? "#fff" : "#555",
              fontWeight: 700, fontSize: 12, transition: "all 0.2s"
            }}>{m.label}</button>
          ))}
        </div>

        {mapMode === "earth" ? (
          <div>
            {/* Real OpenStreetMap embed of Maitama, Abuja */}
            <div style={{ margin: "0 20px", borderRadius: 18, overflow: "hidden", border: "1px solid #1a1a2e", position: "relative" }}>
              <iframe
                title="Naijaest Earth View"
                width="100%"
                height="300"
                style={{ border: "none", display: "block" }}
                src="https://www.openstreetmap.org/export/embed.html?bbox=7.478%2C9.075%2C7.499%2C9.092&layer=mapnik&marker=9.0820%2C7.4891"
              />
              {/* Property pin overlay */}
              <div style={{ position: "absolute", top: 10, left: 12, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "8px 12px", border: "1px solid #e6394640" }}>
                <div style={{ fontSize: 10, color: "#e63946", fontWeight: 700, letterSpacing: 1 }}>📍 PROPERTY LOCATION</div>
                <div style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>Maitama, Abuja FCT</div>
              </div>
              <a href={`https://www.google.com/maps/@${PROPERTY.lat},${PROPERTY.lng},17z`} target="_blank" rel="noopener noreferrer" style={{
                position: "absolute", bottom: 10, right: 10,
                background: "#4285F4", borderRadius: 8, padding: "6px 12px",
                fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5
              }}>🗺 Open in Google Maps</a>
            </div>

            {/* Neighbourhood stats */}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 12 }}>NEIGHBOURHOOD SCORE</div>
              {[
                { label: "Security", pct: 95, color: "#00e676" },
                { label: "Road Quality", pct: 88, color: "#00e676" },
                { label: "Power Supply", pct: 72, color: "#f4a261" },
                { label: "Water Access", pct: 80, color: "#f4a261" },
                { label: "Proximity to Amenities", pct: 91, color: "#00e676" },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#bbb" }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 4, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Nearby */}
            <div style={{ padding: "0 20px 100px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 12 }}>NEARBY PLACES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {NEARBY.map(n => (
                  <div key={n.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#0d0d18", borderRadius: 12, border: "1px solid #1a1a2e" }}>
                    <span style={{ fontSize: 20 }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{n.name}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>{n.type}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#00e676", background: "rgba(0,230,118,.08)", padding: "3px 9px", borderRadius: 10 }}>{n.dist}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Street View
          <div>
            <div style={{ margin: "0 20px", borderRadius: 18, overflow: "hidden", position: "relative", height: 300, background: "#0d0d18", border: "1px solid #1a1a2e" }}>
              {/* Panoramic street simulation */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${PROPERTY.images[streetDir % PROPERTY.images.length]})`,
                backgroundSize: "cover",
                backgroundPosition: `${(streetDir * 15) % 100}% center`,
                filter: "brightness(0.8) saturate(1.1)",
                transition: "background-position 0.6s ease"
              }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

              {/* Street HUD */}
              <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between" }}>
                <div style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 9, color: "#00e676", fontWeight: 700, letterSpacing: 1 }}>STREET VIEW</div>
                  <div style={{ fontSize: 11, color: "#ccc", marginTop: 1 }}>Aguiyi Ironsi St, Maitama</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.75)", borderRadius: 10, padding: "6px 12px", fontSize: 12 }}>
                  {["⬆️ N", "➡️ E", "⬇️ S", "⬅️ W"][streetDir % 4]}
                </div>
              </div>

              {/* Street labels */}
              <div style={{ position: "absolute", bottom: 55, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", borderRadius: 8, padding: "5px 14px", border: "1px solid #e6394640" }}>
                <span style={{ fontSize: 11, color: "#e63946", fontWeight: 700 }}>📍 Plot 14 — This Property</span>
              </div>

              {/* Nav controls */}
              <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setStreetDir(d => d - 1)} style={{ background: "rgba(0,0,0,0.75)", border: "1px solid #333", borderRadius: 10, padding: "8px 18px", color: "#fff", cursor: "pointer", fontSize: 15 }}>◀</button>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.75)", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧭</div>
                <button onClick={() => setStreetDir(d => d + 1)} style={{ background: "rgba(0,0,0,0.75)", border: "1px solid #333", borderRadius: 10, padding: "8px 18px", color: "#fff", cursor: "pointer", fontSize: 15 }}>▶</button>
              </div>
            </div>

            {/* Street details */}
            <div style={{ padding: "16px 20px 100px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: "🛣️", label: "Road", value: "Tarmac" },
                  { icon: "🔒", label: "Security", value: "Gated" },
                  { icon: "💡", label: "Lighting", value: "Solar" },
                  { icon: "🌳", label: "Trees", value: "Yes" },
                  { icon: "🚗", label: "Parking", value: "Wide" },
                  { icon: "🏘️", label: "Zone", value: "Premium" },
                ].map(d => (
                  <div key={d.label} style={{ background: "#0d0d18", borderRadius: 12, padding: "12px 10px", border: "1px solid #1a1a2e", textAlign: "center" }}>
                    <div style={{ fontSize: 18 }}>{d.icon}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd", marginTop: 2 }}>{d.value}</div>
                  </div>
                ))}
              </div>
              <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${PROPERTY.lat},${PROPERTY.lng}`} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 14, padding: "12px", background: "#4285F4", borderRadius: 12,
                color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none"
              }}>🌍 Open Full Street View in Google Maps</a>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ════════════════════════════════════════════════
        TAB: AI REALITY INSPECTION
    ════════════════════════════════════════════════ */}
    {tab === "ai" && (
      <div style={{ padding: "16px 20px 100px", animation: "fadeUp 0.3s ease" }}>

        {aiState === "idle" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🤖</div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>AI Reality Inspection</h2>
              <p style={{ color: "#666", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>Our AI scans property photos using computer vision to assess condition, flag issues, and verify the asking price — just like a physical inspection.</p>
            </div>

            <div style={{ background: "#0d0d18", borderRadius: 16, padding: 18, marginBottom: 20, border: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 14 }}>WHAT THE AI CHECKS</div>
              {AI_STEPS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < AI_STEPS.length - 1 ? 12 : 0 }}>
                  <span style={{ fontSize: 20, width: 28 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: "#bbb" }}>{s.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#00e676", fontWeight: 700 }}>✓</span>
                </div>
              ))}
            </div>

            <button onClick={startAI} style={{
              width: "100%", padding: 16, border: "none", borderRadius: 14, cursor: "pointer",
              background: "linear-gradient(135deg, #00e676, #00c853)",
              color: "#050508", fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 10, animation: "glow 2.5s infinite"
            }}>
              🔍 Start AI Inspection
            </button>
          </>
        )}

        {aiState === "scanning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 220, height: 165, margin: "20px auto 28px", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,230,118,0.3)" }}>
              <img src={PROPERTY.images[Math.floor(aiStep / 2) % PROPERTY.images.length]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,20,10,0.4)" }} />
              <Scanline />
              <ScanBrackets />
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 48, color: "#00e676" }}>{aiPct}%</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 6, animation: "pulse 1s infinite" }}>
              {AI_STEPS[Math.min(aiStep, AI_STEPS.length - 1)].icon} {AI_STEPS[Math.min(aiStep, AI_STEPS.length - 1)].label}
            </div>
            <div style={{ margin: "20px auto 0", maxWidth: 260, background: "#1a1a2e", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${aiPct}%`, background: "linear-gradient(90deg, #00e676, #00c853)", borderRadius: 6, transition: "width 0.8s ease" }} />
            </div>
          </div>
        )}

        {aiState === "done" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {/* Score card */}
            <div style={{ background: "linear-gradient(135deg, #0d1f0d, #0d0d18)", borderRadius: 18, padding: 22, marginBottom: 16, border: `1px solid ${AI_REPORT.color}30`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 72, color: AI_REPORT.color, lineHeight: 1 }}>{AI_REPORT.score}</div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginTop: 2 }}>OUT OF 100</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: AI_REPORT.color, marginTop: 8 }}>{AI_REPORT.verdict}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, background: "rgba(0,230,118,.1)", borderRadius: 20, padding: "5px 14px", border: "1px solid rgba(0,230,118,.2)" }}>
                <span style={{ fontSize: 10, color: "#00e676", fontWeight: 700 }}>✓ AI INSPECTION COMPLETE</span>
              </div>
            </div>

            {/* Findings */}
            <div style={{ background: "#0d0d18", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 14 }}>DETAILED FINDINGS</div>
              {AI_REPORT.findings.map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{f.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{f.label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: f.pct >= 85 ? "#00e676" : f.pct >= 70 ? "#f4a261" : "#e63946", background: f.pct >= 85 ? "rgba(0,230,118,.1)" : f.pct >= 70 ? "rgba(244,162,97,.1)" : "rgba(230,57,70,.1)", padding: "2px 8px", borderRadius: 8 }}>{f.status}</span>
                  </div>
                  <div style={{ background: "#1a1a2e", borderRadius: 4, height: 5, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: `${f.pct}%`, background: f.pct >= 85 ? "#00e676" : f.pct >= 70 ? "#f4a261" : "#e63946", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>{f.detail}</div>
                </div>
              ))}
            </div>

            {/* Valuation */}
            <div style={{ background: "linear-gradient(135deg, #1a1005, #0d0d18)", borderRadius: 14, padding: 16, marginBottom: 14, border: "1px solid rgba(244,162,97,.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f4a261", letterSpacing: 1, marginBottom: 8 }}>💰 AI VALUATION VERDICT</div>
              <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>{AI_REPORT.valuation}</div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #1a0d05, #0d0d18)", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid rgba(0,230,118,.15)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#00e676", letterSpacing: 1, marginBottom: 8 }}>🎯 RECOMMENDATION</div>
              <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>{AI_REPORT.recommendation}</div>
            </div>

            <button onClick={() => { setAiState("idle"); setAiPct(0); setAiStep(0); }} style={{ width: "100%", padding: 12, background: "#1a1a2e", border: "1px solid #2a2a40", borderRadius: 12, color: "#777", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🔄 Run Inspection Again</button>
          </div>
        )}
      </div>
    )}

    {/* ════════════════════════════════════════════════
        TAB: LIVE VIDEO TOUR
    ════════════════════════════════════════════════ */}
    {tab === "live" && (
      <div style={{ padding: "16px 20px 100px", animation: "fadeUp 0.3s ease" }}>

        {liveStep === "intro" && (
          <>
            {/* Live preview mockup */}
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", height: 220, marginBottom: 20, border: "1px solid #1a1a2e" }}>
              <img src={PROPERTY.images[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 64, height: 64, marginBottom: 14 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(230,57,70,.3)", animation: "ripple 2s infinite" }} />
                  <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "rgba(230,57,70,.5)", animation: "ripple 2s infinite 0.5s" }} />
                  <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "#e63946", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18 }}>▶</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Live Property Tour</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Watch in real-time with the agent</div>
              </div>
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#e63946", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>LIVE AVAILABLE</span>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 8 }}>Book a Live Inspection</h2>
            <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>Join a real-time video walkthrough with {PROPERTY.agent}. Ask questions, point at details, and inspect every corner — from Lagos, London or anywhere.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { icon: "📱", title: "Works on WhatsApp or Zoom", desc: "No special app needed" },
                { icon: "🌍", title: "Join from anywhere in the world", desc: "Diaspora buyers welcome" },
                { icon: "🤖", title: "AI assists the tour live", desc: "Flags issues in real-time during the call" },
                { icon: "📋", title: "Receive full report after tour", desc: "AI-generated PDF with findings" },
              ].map(f => (
                <div key={f.title} style={{ display: "flex", gap: 14, padding: "12px 14px", background: "#0d0d18", borderRadius: 12, border: "1px solid #1a1a2e" }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setLiveStep("slots")} style={{ width: "100%", padding: 16, border: "none", borderRadius: 14, background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(230,57,70,0.4)" }}>
              📅 Choose a Time Slot
            </button>
          </>
        )}

        {liveStep === "slots" && (
          <>
            <button onClick={() => setLiveStep("intro")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginBottom: 16, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>← Back</button>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>Pick a Time Slot</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>All times are WAT (West Africa Time)</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {SLOTS.map(s => (
                <button key={s.time} onClick={() => s.available && setLiveSlot(s.time)} disabled={!s.available} style={{
                  padding: "15px 16px", borderRadius: 14, cursor: s.available ? "pointer" : "not-allowed",
                  border: liveSlot === s.time ? "1.5px solid #e63946" : "1.5px solid #1a1a2e",
                  background: liveSlot === s.time ? "rgba(230,57,70,.08)" : s.available ? "#0d0d18" : "#080810",
                  color: !s.available ? "#333" : liveSlot === s.time ? "#e63946" : "#bbb",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontWeight: 700, fontSize: 14, transition: "all 0.2s"
                }}>
                  <span>📅 {s.time}</span>
                  {!s.available && <span style={{ fontSize: 11, color: "#333" }}>Booked</span>}
                  {s.available && liveSlot === s.time && <span style={{ fontSize: 16, color: "#e63946" }}>✓</span>}
                  {s.available && liveSlot !== s.time && <span style={{ fontSize: 11, color: "#555", background: "#1a1a2e", padding: "3px 10px", borderRadius: 8 }}>Available</span>}
                </button>
              ))}
            </div>

            <button onClick={() => liveSlot && setLiveStep("confirm")} style={{
              width: "100%", padding: 16, border: "none", borderRadius: 14,
              background: liveSlot ? "linear-gradient(135deg, #e63946, #c1121f)" : "#1a1a2e",
              color: liveSlot ? "#fff" : "#444",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 15,
              cursor: liveSlot ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: liveSlot ? "0 6px 24px rgba(230,57,70,0.35)" : "none"
            }}>
              📹 {liveSlot ? `Confirm — ${liveSlot}` : "Select a slot first"}
            </button>
          </>
        )}

        {liveStep === "confirm" && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: "#fff" }}>Tour Booked!</h2>
            <p style={{ color: "#666", fontSize: 13, marginTop: 8, marginBottom: 20 }}>Your live inspection is confirmed</p>

            <div style={{ background: "#0d0d18", borderRadius: 16, padding: "14px 20px", marginBottom: 20, border: "1px solid #e6394630", display: "inline-block" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: "#e63946" }}>{liveSlot}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>West Africa Time (WAT)</div>
            </div>

            {/* Agent card */}
            <div style={{ background: "#0d0d18", borderRadius: 16, padding: 18, marginBottom: 20, border: "1px solid #1a1a2e", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #e63946, #c1121f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👨🏿‍💼</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{PROPERTY.agent}</div>
                  <div style={{ fontSize: 12, color: "#00e676", marginTop: 2 }}>✓ Verified Naijaest Agent</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 1 }}>⭐ {PROPERTY.rating} · {PROPERTY.reviews} reviews</div>
                </div>
              </div>
              <div style={{ background: "#050508", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#777", lineHeight: 1.6 }}>
                📱 {PROPERTY.agent} will send a WhatsApp video call link to your number 30 minutes before the tour.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`https://wa.me/${PROPERTY.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 14, background: "#25D366", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
                💬 Message Agent on WhatsApp
              </a>
              <button onClick={() => { setLiveStep("intro"); setLiveSlot(null); }} style={{ padding: 12, background: "transparent", border: "1px solid #1a1a2e", borderRadius: 12, color: "#555", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Book a Different Time</button>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ── FLOATING AI CHAT ───────────────────────────── */}
    {chatOpen && (
      <div style={{
        position: "fixed", bottom: 80, right: 16, width: 330, zIndex: 600,
        background: "#0d0d18", borderRadius: 20, border: "1px solid #1a1a2e",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)", overflow: "hidden",
        animation: "slideIn 0.25s ease"
      }}>
        <div style={{ background: "linear-gradient(135deg, #e63946, #c1121f)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 26 }}>👨🏿‍💼</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{PROPERTY.agent}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00e676" }} /> AI-Powered · Naijaest Agent
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} style={{ background: "rgba(0,0,0,0.25)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ height: 250, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {chatHistory.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.2s ease" }}>
              <div style={{ maxWidth: "82%", padding: "9px 13px", borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "user" ? "linear-gradient(135deg, #e63946, #c1121f)" : "#1a1a2e", color: "#fff", fontSize: 12, lineHeight: 1.55 }}>
                {m.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: "flex", gap: 5, padding: "9px 14px", background: "#1a1a2e", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#555", animation: `pulse 1s infinite ${i * 0.2}s` }} />)}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={{ padding: "10px 12px", borderTop: "1px solid #1a1a2e", display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Ask about this property..."
            style={{ flex: 1, background: "#050508", border: "1px solid #1a1a2e", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "'Space Grotesk', sans-serif" }}
          />
          <button onClick={sendChat} style={{ background: "#e63946", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 12 }}>Send</button>
        </div>
      </div>
    )}

    {/* Chat FAB */}
    <button onClick={() => setChatOpen(o => !o)} style={{
      position: "fixed", bottom: 24, right: 20, zIndex: 700,
      width: 54, height: 54, borderRadius: "50%",
      background: chatOpen ? "#1a1a2e" : "linear-gradient(135deg, #e63946, #c1121f)",
      border: chatOpen ? "1px solid #2a2a40" : "none",
      cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: chatOpen ? "none" : "0 6px 24px rgba(230,57,70,0.5)",
      animation: chatOpen ? "none" : "glow 3s infinite", transition: "all 0.25s"
    }}>
      {chatOpen ? "✕" : "💬"}
    </button>

  </div>
</>
```

);
}

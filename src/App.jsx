import { useState, useEffect } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  subscribeTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  registerForTournament,
  cancelRegistration,
  getAllUsers,
  setUserRole,
  deleteUserProfile,
  getTournamentRegistrations,
} from "./firebase";

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050810; color: #e0e8ff; font-family: 'Rajdhani', sans-serif; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0f1e; }
  ::-webkit-scrollbar-thumb { background: #00f5ff44; border-radius: 2px; }
  @keyframes pulse-border { 0%,100%{border-color:#00f5ff33} 50%{border-color:#00f5ffaa} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes flicker { 0%,95%,100%{opacity:1} 96%{opacity:.4} 97%{opacity:1} 98%{opacity:.6} }
  @keyframes glitch { 0%,90%,100%{clip-path:none;transform:none} 91%{clip-path:inset(20% 0 60% 0);transform:translateX(-4px)} 92%{clip-path:inset(60% 0 10% 0);transform:translateX(4px)} 93%{clip-path:none;transform:none} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes notifIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .scanline { position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00f5ff33,transparent);animation:scan 8s linear infinite;pointer-events:none;z-index:9999; }
  .grid-bg { position:fixed;inset:0;background-image:linear-gradient(rgba(0,245,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0; }
  .app { position:relative;z-index:1;min-height:100vh; }

  .nav { position:sticky;top:0;z-index:100;background:rgba(5,8,16,.92);border-bottom:1px solid #00f5ff22;backdrop-filter:blur(12px);padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:64px; }
  .nav-logo { font-family:'Orbitron',monospace;font-weight:900;font-size:20px;letter-spacing:3px;color:#00f5ff;text-shadow:0 0 20px #00f5ff88;animation:flicker 8s infinite;cursor:pointer; }
  .nav-logo span { color:#ff00c8;text-shadow:0 0 20px #ff00c888; }
  .nav-links { display:flex;gap:8px;align-items:center; }
  .nav-btn { background:transparent;border:1px solid #00f5ff33;color:#a0b4cc;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;cursor:pointer;transition:all .2s;border-radius:2px; }
  .nav-btn:hover { border-color:#00f5ff;color:#00f5ff;text-shadow:0 0 8px #00f5ff; }
  .nav-btn.active { border-color:#00f5ff;color:#00f5ff;background:#00f5ff11; }
  .nav-user { display:flex;align-items:center;gap:12px; }
  .avatar { width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#00f5ff,#ff00c8);display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:#050810;box-shadow:0 0 12px #00f5ff55; }
  .badge { font-size:10px;font-family:'Orbitron',monospace;letter-spacing:1px;padding:2px 8px;border-radius:2px;text-transform:uppercase;font-weight:700; }
  .badge-admin { background:#ff00c822;border:1px solid #ff00c8;color:#ff00c8; }
  .badge-user { background:#00f5ff22;border:1px solid #00f5ff;color:#00f5ff; }

  .page { animation:fadeInUp .4s ease;padding:40px 32px;max-width:1280px;margin:0 auto; }

  .login-wrap { min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:32px;padding:32px; }
  .login-hero { font-family:'Orbitron',monospace;font-size:clamp(28px,5vw,52px);font-weight:900;text-align:center;letter-spacing:6px;line-height:1.2;animation:glitch 6s infinite; }
  .login-hero .t1 { color:#00f5ff;text-shadow:0 0 30px #00f5ff;display:block; }
  .login-hero .t2 { color:#ff00c8;text-shadow:0 0 30px #ff00c8;display:block;font-size:.55em;letter-spacing:10px; }
  .login-card { background:#080d1a;border:1px solid #00f5ff33;border-radius:4px;padding:40px;width:100%;max-width:440px;animation:pulse-border 3s infinite;position:relative;overflow:hidden; }
  .login-card::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#00f5ff,transparent); }
  .login-tabs { display:flex;margin-bottom:32px;border-bottom:1px solid #00f5ff22; }
  .login-tab { flex:1;padding:10px;background:transparent;border:none;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;cursor:pointer;color:#4a6080;border-bottom:2px solid transparent;transition:all .2s; }
  .login-tab.active { color:#00f5ff;border-bottom-color:#00f5ff; }
  .field-wrap { margin-bottom:20px; }
  .field-label { font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a6080;margin-bottom:6px;display:block;font-family:'Orbitron',monospace; }
  .neon-input { width:100%;background:#0a1020;border:1px solid #00f5ff33;border-radius:2px;color:#e0e8ff;font-family:'Rajdhani',sans-serif;font-size:15px;padding:10px 14px;outline:none;transition:all .2s; }
  .neon-input:focus { border-color:#00f5ff;box-shadow:0 0 12px #00f5ff22; }
  .neon-input::placeholder { color:#2a3a55; }
  select.neon-input { cursor:pointer; }
  textarea.neon-input { resize:vertical; }
  .neon-btn { width:100%;background:transparent;border:1px solid #00f5ff;color:#00f5ff;font-family:'Orbitron',monospace;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:13px;cursor:pointer;transition:all .2s;border-radius:2px; }
  .neon-btn:hover:not(:disabled) { background:#00f5ff;color:#050810;box-shadow:0 0 24px #00f5ff88; }
  .neon-btn:disabled { opacity:.4;cursor:not-allowed; }
  .neon-btn-mag { border-color:#ff00c8;color:#ff00c8; }
  .neon-btn-mag:hover:not(:disabled) { background:#ff00c8;color:#050810;box-shadow:0 0 24px #ff00c888; }
  .neon-btn-green { border-color:#00ff88;color:#00ff88; }
  .neon-btn-green:hover:not(:disabled) { background:#00ff88;color:#050810;box-shadow:0 0 24px #00ff8888; }
  .neon-btn-sm { padding:7px 18px;font-size:11px;letter-spacing:2px;width:auto; }
  .err-msg { background:#ff004422;border:1px solid #ff0044;color:#ff4466;font-size:12px;padding:10px 14px;border-radius:2px;margin-bottom:16px;letter-spacing:.5px; }
  .success-msg { background:#00ff8822;border:1px solid #00ff88;color:#00ff88;font-size:12px;padding:10px 14px;border-radius:2px;margin-bottom:16px;letter-spacing:.5px; }
  .hint { text-align:center;margin-top:16px;font-size:12px;color:#2a4060;letter-spacing:1px; }
  .hint span { color:#00f5ff; }

  .spinner { width:18px;height:18px;border:2px solid #00f5ff33;border-top-color:#00f5ff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px; }
  .loading-screen { min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px; }
  .loading-title { font-family:'Orbitron',monospace;font-size:14px;letter-spacing:4px;color:#00f5ff;text-shadow:0 0 16px #00f5ff55; }

  .hero { text-align:center;padding:60px 0 40px; }
  .hero-eyebrow { font-size:11px;letter-spacing:4px;color:#ff00c8;font-family:'Orbitron',monospace;text-transform:uppercase;margin-bottom:16px; }
  .hero-title { font-family:'Orbitron',monospace;font-size:clamp(28px,4vw,48px);font-weight:900;letter-spacing:4px;line-height:1.1;margin-bottom:16px; }
  .hero-title .hl { color:#00f5ff;text-shadow:0 0 20px #00f5ff66; }
  .hero-sub { color:#5070a0;font-size:15px;letter-spacing:1px;margin-bottom:40px; }

  .stats-bar { display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#00f5ff11;border:1px solid #00f5ff22;border-radius:4px;overflow:hidden;margin-bottom:48px; }
  .stat-item { background:#080d1a;padding:20px;text-align:center; }
  .stat-num { font-family:'Orbitron',monospace;font-size:28px;font-weight:900;color:#00f5ff;text-shadow:0 0 16px #00f5ff55;display:block; }
  .stat-label { font-size:11px;letter-spacing:2px;color:#3a5070;text-transform:uppercase;margin-top:4px; }

  .filters { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px;align-items:center; }
  .filter-label { font-size:11px;letter-spacing:2px;color:#3a5070;text-transform:uppercase;font-family:'Orbitron',monospace;margin-right:4px; }
  .filter-btn { background:transparent;border:1px solid #1a2a40;color:#4a6080;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;cursor:pointer;border-radius:2px;transition:all .15s; }
  .filter-btn:hover,.filter-btn.active { border-color:#00f5ff55;color:#00f5ff;background:#00f5ff11; }

  .t-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px; }
  .t-card { background:#080d1a;border:1px solid #1a2a40;border-radius:4px;overflow:hidden;cursor:pointer;transition:all .25s;position:relative;animation:fadeInUp .4s ease both; }
  .t-card:hover { border-color:#00f5ff55;transform:translateY(-3px);box-shadow:0 8px 32px #00f5ff11; }
  .t-card-banner { height:120px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center; }
  .t-banner-icon { font-size:48px;filter:drop-shadow(0 0 20px currentColor);z-index:1; }
  .t-card-body { padding:20px; }
  .t-card-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px; }
  .t-title { font-family:'Orbitron',monospace;font-size:14px;font-weight:700;letter-spacing:1px;color:#d0e4ff;line-height:1.3;flex:1;margin-right:8px; }
  .t-status { font-size:9px;letter-spacing:2px;text-transform:uppercase;font-family:'Orbitron',monospace;font-weight:700;padding:3px 8px;border-radius:2px;white-space:nowrap; }
  .status-live { background:#ff000022;border:1px solid #ff0044;color:#ff4466; }
  .status-open { background:#00ff8822;border:1px solid #00ff88;color:#00ff88; }
  .status-upcoming { background:#ffee0022;border:1px solid #ffee00;color:#ffee00; }
  .status-closed { background:#1a2030;border:1px solid #2a3a50;color:#4a6080; }
  .t-meta { display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px; }
  .t-meta-item { display:flex;align-items:center;gap:5px;font-size:12px;color:#4a6080; }
  .t-prize { font-family:'Orbitron',monospace;font-size:18px;font-weight:900;margin-bottom:16px;display:flex;align-items:baseline;gap:6px; }
  .t-prize-label { font-size:9px;letter-spacing:2px;color:#3a5070;text-transform:uppercase;font-weight:400; }
  .progress-bar-wrap { margin-bottom:16px; }
  .progress-label { display:flex;justify-content:space-between;font-size:11px;color:#3a5070;margin-bottom:6px; }
  .progress-bar { height:3px;background:#1a2030;border-radius:2px;overflow:hidden; }
  .progress-fill { height:100%;border-radius:2px;transition:width .6s ease; }

  .modal-overlay { position:fixed;inset:0;z-index:200;background:rgba(5,8,16,.92);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeInUp .2s ease; }
  .modal { background:#080d1a;border:1px solid #00f5ff44;border-radius:4px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 0 60px #00f5ff11; }
  .modal::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#00f5ff,transparent); }
  .modal-header { padding:24px 28px 20px;border-bottom:1px solid #1a2a40;display:flex;justify-content:space-between;align-items:center; }
  .modal-title { font-family:'Orbitron',monospace;font-size:16px;font-weight:700;letter-spacing:2px;color:#00f5ff; }
  .modal-close { background:transparent;border:none;color:#4a6080;font-size:20px;cursor:pointer;transition:color .2s;line-height:1; }
  .modal-close:hover { color:#ff00c8; }
  .modal-body { padding:28px; }
  .modal-banner { height:160px;border-radius:4px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden; }
  .detail-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px; }
  .detail-item-label { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a5070;font-family:'Orbitron',monospace;margin-bottom:4px; }
  .detail-item-val { font-size:14px;color:#c0d4f0;font-weight:500; }
  .desc-text { font-size:14px;color:#5070a0;line-height:1.7;margin-bottom:24px; }

  .section-title { font-family:'Orbitron',monospace;font-size:18px;font-weight:700;letter-spacing:3px;margin-bottom:24px;display:flex;align-items:center;gap:12px;text-transform:uppercase; }
  .section-title::after { content:'';flex:1;height:1px;background:linear-gradient(90deg,#00f5ff22,transparent); }

  .admin-grid { display:grid;grid-template-columns:240px 1fr;gap:24px; }
  .admin-sidebar { background:#080d1a;border:1px solid #1a2a40;border-radius:4px;padding:20px;height:fit-content;position:sticky;top:80px; }
  .admin-sidebar-title { font-family:'Orbitron',monospace;font-size:10px;letter-spacing:3px;color:#3a5070;text-transform:uppercase;margin-bottom:16px; }
  .admin-nav-item { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:2px;cursor:pointer;font-size:13px;letter-spacing:1px;color:#4a6080;transition:all .15s;margin-bottom:4px;font-weight:500; }
  .admin-nav-item:hover { color:#00f5ff;background:#00f5ff0a; }
  .admin-nav-item.active { color:#00f5ff;background:#00f5ff11;border-left:2px solid #00f5ff; }
  .admin-card { background:#080d1a;border:1px solid #1a2a40;border-radius:4px;padding:24px;margin-bottom:20px; }
  .admin-card-title { font-family:'Orbitron',monospace;font-size:12px;letter-spacing:2px;color:#00f5ff;text-transform:uppercase;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #1a2a40; }

  .t-table { width:100%;border-collapse:collapse; }
  .t-table th { text-align:left;padding:10px 14px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3a5070;font-family:'Orbitron',monospace;border-bottom:1px solid #1a2a40; }
  .t-table td { padding:12px 14px;font-size:13px;color:#8090a8;border-bottom:1px solid #0f1828; }
  .t-table tr:hover td { background:#0a1020;color:#c0d4f0; }
  .action-btn { background:transparent;border:1px solid currentColor;font-family:'Rajdhani',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;cursor:pointer;border-radius:2px;transition:all .15s;margin-right:6px;font-weight:600; }
  .action-btn.edit { color:#00f5ff; }
  .action-btn.edit:hover { background:#00f5ff;color:#050810; }
  .action-btn.del { color:#ff4466; }
  .action-btn.del:hover { background:#ff4466;color:#fff; }

  .reg-card { background:#080d1a;border:1px solid #1a2a40;border-radius:4px;padding:20px;display:flex;align-items:center;gap:16px;margin-bottom:12px;transition:all .2s;cursor:pointer; }
  .reg-card:hover { border-color:#00f5ff33; }
  .reg-name { font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:#c0d4f0;margin-bottom:4px;letter-spacing:1px; }
  .reg-sub { font-size:12px;color:#4a6080; }

  .notif { position:fixed;bottom:24px;right:24px;z-index:300;background:#080d1a;border:1px solid #00ff88;border-radius:4px;padding:14px 20px;font-size:13px;color:#00ff88;box-shadow:0 0 24px #00ff8833;animation:notifIn .3s ease;font-family:'Rajdhani',sans-serif;letter-spacing:1px;max-width:320px; }
  .notif.err { border-color:#ff4466;color:#ff4466;box-shadow:0 0 24px #ff446633; }

  .divider { height:1px;background:linear-gradient(90deg,transparent,#00f5ff22,transparent);margin:32px 0; }
  .verify-banner { background:#ffee0011;border:1px solid #ffee0044;border-radius:4px;padding:14px 20px;display:flex;align-items:center;gap:12px;margin-bottom:24px;font-size:13px;color:#ffee00; }
  .verify-banner button { background:transparent;border:1px solid #ffee00;color:#ffee00;font-family:'Rajdhani',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;cursor:pointer;border-radius:2px;margin-left:auto;transition:all .2s; }
  .verify-banner button:hover { background:#ffee00;color:#050810; }
`;

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const GAMES = ["All", "FPS", "MOBA", "Battle Royale", "Fighting", "Sports", "Strategy", "Card"];

const GAME_META = {
  FPS:            { icon: "🎯", color: "#ff00c8", bg: "linear-gradient(135deg,#1a0020,#2a0040)" },
  MOBA:           { icon: "⚡", color: "#00f5ff", bg: "linear-gradient(135deg,#001a2a,#00152a)" },
  "Battle Royale":{ icon: "🏆", color: "#ffee00", bg: "linear-gradient(135deg,#1a1400,#251a00)" },
  Fighting:       { icon: "👊", color: "#ff6b00", bg: "linear-gradient(135deg,#1a0800,#200a00)" },
  Sports:         { icon: "⚽", color: "#00ff88", bg: "linear-gradient(135deg,#001a10,#00200f)" },
  Strategy:       { icon: "♟️", color: "#c080ff", bg: "linear-gradient(135deg,#0f0020,#150028)" },
  Card:           { icon: "🃏", color: "#ff8800", bg: "linear-gradient(135deg,#1a0a00,#200c00)" },
};

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = { live:"status-live", open:"status-open", upcoming:"status-upcoming", closed:"status-closed" };
  return <span className={`t-status ${map[status]||""}`}>{status==="live" ? "● LIVE" : status.toUpperCase()}</span>;
}

function Spinner() { return <span className="spinner" />; }

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`notif ${type==="err" ? "err" : ""}`}>✦ {msg}</div>;
}

function Field({ label, children }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// ── TOURNAMENT CARD ───────────────────────────────────────────────────────────
function TCard({ t, onClick, delay, isRegistered }) {
  const pct = Math.round((t.filled / t.slots) * 100);
  return (
    <div className="t-card" style={{ animationDelay:`${delay}ms` }} onClick={() => onClick(t)}>
      <div className="t-card-banner" style={{ background: t.bg }}>
        <div className="t-banner-icon" style={{ color: t.color }}>{t.icon}</div>
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.03) 1px,transparent 1px)",backgroundSize:"16px 16px" }} />
      </div>
      <div className="t-card-body">
        <div className="t-card-header">
          <div className="t-title">{t.title}</div>
          <StatusBadge status={t.status} />
        </div>
        <div className="t-meta">
          <div className="t-meta-item"><span>🎮</span><span>{t.game}</span></div>
          <div className="t-meta-item"><span>📅</span><span>{t.date}</span></div>
          <div className="t-meta-item"><span>🖥</span><span>{t.platform}</span></div>
        </div>
        <div className="t-prize" style={{ color:t.color, textShadow:`0 0 16px ${t.color}55` }}>
          {t.prize}<span className="t-prize-label">PRIZE POOL</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-label">
            <span>Slots Filled</span>
            <span style={{ color: pct > 80 ? "#ff4466" : "#4a6080" }}>{t.filled}/{t.slots}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${t.color}88,${t.color})`, boxShadow:`0 0 8px ${t.color}55` }} />
          </div>
        </div>
        {isRegistered && <div style={{ fontSize:11,color:"#00ff88",letterSpacing:2,fontFamily:"'Orbitron',monospace" }}>✓ REGISTERED</div>}
      </div>
    </div>
  );
}

// ── TOURNAMENT MODAL ──────────────────────────────────────────────────────────
function TModal({ t, onClose, onRegister, onCancel, isRegistered, loading }) {
  const pct = Math.round((t.filled / t.slots) * 100);
  const canReg = t.status === "open" || t.status === "upcoming";
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{t.title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-banner" style={{ background: t.bg }}>
            <span style={{ fontSize:72, filter:`drop-shadow(0 0 24px ${t.color})` }}>{t.icon}</span>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-item-label">Prize Pool</div>
              <div className="detail-item-val" style={{ color:t.color, fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900 }}>{t.prize}</div>
            </div>
            <div><div className="detail-item-label">Game</div><div className="detail-item-val">{t.game}</div></div>
            <div><div className="detail-item-label">Date</div><div className="detail-item-val">{t.date}</div></div>
            <div><div className="detail-item-label">Platform</div><div className="detail-item-val">{t.platform}</div></div>
            <div><div className="detail-item-label">Slots</div><div className="detail-item-val">{t.filled}/{t.slots} ({pct}% full)</div></div>
            <div><div className="detail-item-label">Format</div><div className="detail-item-val">Double Elimination</div></div>
          </div>
          <div className="progress-bar-wrap" style={{ marginBottom:24 }}>
            <div className="progress-bar" style={{ height:5 }}>
              <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${t.color}88,${t.color})` }} />
            </div>
          </div>
          <p className="desc-text">{t.desc}</p>
          {isRegistered ? (
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ flex:1,textAlign:"center",padding:14,border:"1px solid #00ff88",borderRadius:4,color:"#00ff88",fontFamily:"'Orbitron',monospace",fontSize:13,letterSpacing:2 }}>✓ REGISTERED</div>
              <button className="neon-btn neon-btn-sm" style={{ width:"auto",borderColor:"#ff4466",color:"#ff4466",padding:"14px 20px" }} onClick={() => onCancel(t.id)} disabled={loading}>
                {loading ? <><Spinner/>CANCELLING</> : "CANCEL"}
              </button>
            </div>
          ) : canReg ? (
            <button className="neon-btn neon-btn-green" onClick={() => onRegister(t.id)} disabled={loading}>
              {loading ? <><Spinner/>REGISTERING...</> : "⚡ REGISTER NOW"}
            </button>
          ) : (
            <button className="neon-btn" style={{ opacity:.4,cursor:"not-allowed" }} disabled>
              {t.status === "live" ? "TOURNAMENT IN PROGRESS" : "REGISTRATION CLOSED"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage({ notify }) {
  const [tab, setTab] = useState("login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      await loginUser(email, pass);
    } catch(e) {
      setError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, "").trim());
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !pass || !name) { setError("All fields are required."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await registerUser(email, pass, name);
      setStep(2);
      notify("Verification email sent to " + email, "ok");
    } catch(e) {
      setError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, "").trim());
    }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <span className="t1">NEXUS<span style={{ color:"#ff00c8" }}>ARENA</span></span>
        <span className="t2">TOURNAMENT PLATFORM</span>
      </div>
      <div className="login-card">
        <div className="login-tabs">
          <button className={`login-tab ${tab==="login"?"active":""}`} onClick={() => { setTab("login"); setStep(1); setError(""); }}>LOGIN</button>
          <button className={`login-tab ${tab==="signup"?"active":""}`} onClick={() => { setTab("signup"); setStep(1); setError(""); }}>SIGN UP</button>
        </div>
        {error && <div className="err-msg">⚠ {error}</div>}
        {tab === "login" && (
          <>
            <Field label="Email"><input className="neon-input" placeholder="your@email.gg" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Password"><input className="neon-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} /></Field>
            <button className="neon-btn" onClick={handleLogin} disabled={loading}>{loading ? <><Spinner/>AUTHENTICATING...</> : "JACK IN"}</button>
          </>
        )}
        {tab === "signup" && step === 1 && (
          <>
            <Field label="Gamertag"><input className="neon-input" placeholder="PLAYER_001" value={name} onChange={e => setName(e.target.value)} /></Field>
            <Field label="Email"><input className="neon-input" placeholder="your@email.gg" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Password"><input className="neon-input" type="password" placeholder="Min 6 characters" value={pass} onChange={e => setPass(e.target.value)} /></Field>
            <button className="neon-btn neon-btn-mag" onClick={handleSignup} disabled={loading}>{loading ? <><Spinner/>CREATING...</> : "CREATE ACCOUNT"}</button>
            <div className="hint">A verification email will be sent to your inbox</div>
          </>
        )}
        {tab === "signup" && step === 2 && (
          <>
            <div className="success-msg">✓ Account created! Check your inbox at {email} and click the verification link before logging in.</div>
            <button className="neon-btn neon-btn-green" onClick={() => { setTab("login"); setStep(1); }}>GO TO LOGIN</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── USER HOME ─────────────────────────────────────────────────────────────────
function UserHome({ tournaments, user, setUser, notify }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const myRegs = user.registrations || [];
  const filtered = filter === "All" ? tournaments : tournaments.filter(t => t.game === filter);

  const handleRegister = async (tid) => {
    setLoading(true);
    try {
      await registerForTournament(tid, user);
      setUser(u => ({ ...u, registrations: [...(u.registrations||[]), tid] }));
      notify("Registered! Good luck, " + user.name + "!", "ok");
      setSelected(null);
    } catch(e) { notify(e.message, "err"); }
    setLoading(false);
  };

  const handleCancel = async (tid) => {
    setLoading(true);
    try {
      await cancelRegistration(tid, user.uid);
      setUser(u => ({ ...u, registrations: (u.registrations||[]).filter(id => id !== tid) }));
      notify("Registration cancelled.", "ok");
      setSelected(null);
    } catch(e) { notify(e.message, "err"); }
    setLoading(false);
  };

  return (
    <div className="page">
      {!user.emailVerified && (
        <div className="verify-banner">
          <span>⚠</span>
          <span>Please verify your email to register for tournaments.</span>
          <button onClick={() => notify("Check your inbox for the verification email.", "ok")}>Resend</button>
        </div>
      )}
      <div className="hero">
        <div className="hero-eyebrow">WELCOME BACK, {user.name} <span style={{ animation:"blink 1s step-end infinite",display:"inline-block" }}>_</span></div>
        <h1 className="hero-title">COMPETE. CONQUER.<br /><span className="hl">CLAIM YOUR PRIZE.</span></h1>
        <p className="hero-sub">Browse active tournaments and register to compete</p>
      </div>
      <div className="stats-bar">
        <div className="stat-item"><span className="stat-num">{tournaments.filter(t=>t.status==="live").length}</span><div className="stat-label">Live Now</div></div>
        <div className="stat-item"><span className="stat-num">{tournaments.filter(t=>t.status==="open").length}</span><div className="stat-label">Open</div></div>
        <div className="stat-item"><span className="stat-num">${(tournaments.reduce((a,t)=>a+(t.prizeRaw||0),0)/1000).toFixed(0)}K+</span><div className="stat-label">Prize Pool</div></div>
        <div className="stat-item"><span className="stat-num" style={{ color:"#00ff88" }}>{myRegs.length}</span><div className="stat-label">My Registrations</div></div>
      </div>
      {myRegs.length > 0 && (
        <>
          <div className="section-title" style={{ color:"#00ff88" }}>My Tournaments</div>
          {tournaments.filter(t => myRegs.includes(t.id)).map(t => (
            <div key={t.id} className="reg-card" onClick={() => setSelected(t)}>
              <div style={{ fontSize:32,width:48,textAlign:"center" }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div className="reg-name">{t.title}</div>
                <div className="reg-sub">{t.date} · {t.game} · {t.prize} Pool</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
          <div className="divider" />
        </>
      )}
      <div className="section-title">All Tournaments</div>
      <div className="filters">
        <span className="filter-label">Filter:</span>
        {GAMES.map(g => <button key={g} className={`filter-btn ${filter===g?"active":""}`} onClick={() => setFilter(g)}>{g}</button>)}
      </div>
      <div className="t-grid">
        {filtered.map((t,i) => (
          <TCard key={t.id} t={t} onClick={setSelected} delay={i*60} isRegistered={myRegs.includes(t.id)} />
        ))}
      </div>
      {selected && (
        <TModal t={selected} onClose={() => setSelected(null)} onRegister={handleRegister} onCancel={handleCancel} isRegistered={myRegs.includes(selected.id)} loading={loading} />
      )}
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ tournaments, user, notify }) {
  const [tab, setTab] = useState("tournaments");
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regs, setRegs] = useState({});
  const [viewRegsId, setViewRegsId] = useState(null);

  const emptyForm = { title:"", game:"FPS", status:"upcoming", prize:"", slots:32, date:"", platform:"PC", desc:"" };
  const [form, setForm] = useState(emptyForm);
  const [userForm, setUserForm] = useState({ email:"", name:"", role:"user" });

  useEffect(() => {
    if (tab === "users") getAllUsers().then(setUsers);
  }, [tab]);

  const handleSave = async () => {
    if (!form.title || !form.prize || !form.date) { notify("Fill all required fields", "err"); return; }
    setLoading(true);
    try {
      const meta = GAME_META[form.game] || GAME_META.FPS;
      const data = { ...form, ...meta, prizeRaw: parseInt(form.prize.replace(/\D/g,""))||0 };
      if (editId) {
        await updateTournament(editId, data);
        notify("Tournament updated!", "ok");
      } else {
        await createTournament(data, user.uid);
        notify("Tournament created!", "ok");
      }
      setShowForm(false); setEditId(null); setForm(emptyForm);
    } catch(e) { notify(e.message, "err"); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteTournament(id);
      notify("Tournament deleted.", "ok");
    } catch(e) { notify(e.message, "err"); }
    setLoading(false);
  };

  const handleEdit = (t) => {
    setForm({ title:t.title, game:t.game, status:t.status, prize:t.prize, slots:t.slots, date:t.date, platform:t.platform, desc:t.desc||"" });
    setEditId(t.id); setShowForm(true);
  };

  const handleViewRegs = async (tid) => {
    const data = await getTournamentRegistrations(tid);
    setRegs(prev => ({ ...prev, [tid]: data }));
    setViewRegsId(tid);
  };

  const navItems = [
    { id:"tournaments", icon:"🏆", label:"Tournaments" },
    { id:"users", icon:"👥", label:"Users & Admins" },
    { id:"stats", icon:"📊", label:"Stats" },
  ];

  return (
    <div className="page">
      <div className="section-title" style={{ color:"#ff00c8" }}>ADMIN<span style={{ color:"#00f5ff" }}>_</span>PANEL</div>
      <div className="admin-grid">
        <div className="admin-sidebar">
          <div className="admin-sidebar-title">Navigation</div>
          {navItems.map(n => (
            <div key={n.id} className={`admin-nav-item ${tab===n.id?"active":""}`} onClick={() => { setTab(n.id); setShowForm(false); setViewRegsId(null); }}>
              <span>{n.icon}</span> {n.label}
            </div>
          ))}
        </div>

        <div>
          {/* TOURNAMENTS */}
          {tab === "tournaments" && (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                <div style={{ fontFamily:"'Orbitron',monospace",fontSize:13,color:"#4a6080",letterSpacing:2 }}>{tournaments.length} TOURNAMENTS</div>
                <button className="neon-btn neon-btn-sm neon-btn-mag" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>+ ADD TOURNAMENT</button>
              </div>

              {showForm && (
                <div className="admin-card" style={{ borderColor:"#ff00c844",marginBottom:24 }}>
                  <div className="admin-card-title">{editId ? "EDIT TOURNAMENT" : "NEW TOURNAMENT"}</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
                    <Field label="Title *"><input className="neon-input" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="TOURNAMENT NAME" /></Field>
                    <Field label="Game Type">
                      <select className="neon-input" value={form.game} onChange={e => setForm(p=>({...p,game:e.target.value}))}>
                        {Object.keys(GAME_META).map(g => <option key={g}>{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Prize Pool *"><input className="neon-input" value={form.prize} onChange={e => setForm(p=>({...p,prize:e.target.value}))} placeholder="$5,000" /></Field>
                    <Field label="Max Slots"><input className="neon-input" type="number" value={form.slots} onChange={e => setForm(p=>({...p,slots:+e.target.value}))} /></Field>
                    <Field label="Date *"><input className="neon-input" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))} placeholder="MAR 15, 2026" /></Field>
                    <Field label="Status">
                      <select className="neon-input" value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                        {["upcoming","open","live","closed"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Platform"><input className="neon-input" value={form.platform} onChange={e => setForm(p=>({...p,platform:e.target.value}))} placeholder="PC / Console" /></Field>
                  </div>
                  <Field label="Description">
                    <textarea className="neon-input" value={form.desc} onChange={e => setForm(p=>({...p,desc:e.target.value}))} rows={3} />
                  </Field>
                  <div style={{ display:"flex",gap:12,marginTop:8 }}>
                    <button className="neon-btn neon-btn-green neon-btn-sm" style={{ width:"auto",padding:"10px 24px" }} onClick={handleSave} disabled={loading}>
                      {loading ? <><Spinner/>{editId?"SAVING...":"CREATING..."}</> : editId ? "SAVE CHANGES" : "CREATE"}
                    </button>
                    <button className="neon-btn neon-btn-sm" style={{ width:"auto",padding:"10px 24px",borderColor:"#4a6080",color:"#4a6080" }} onClick={() => { setShowForm(false); setEditId(null); }}>CANCEL</button>
                  </div>
                </div>
              )}

              {viewRegsId && (
                <div className="admin-card" style={{ borderColor:"#00f5ff44",marginBottom:24 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                    <div style={{ fontFamily:"'Orbitron',monospace",fontSize:12,color:"#00f5ff",letterSpacing:2 }}>REGISTRATIONS — {tournaments.find(t=>t.id===viewRegsId)?.title}</div>
                    <button onClick={() => setViewRegsId(null)} style={{ background:"transparent",border:"none",color:"#4a6080",cursor:"pointer",fontSize:18 }}>✕</button>
                  </div>
                  {(regs[viewRegsId]||[]).length === 0
                    ? <div style={{ color:"#3a5070",fontSize:13 }}>No registrations yet.</div>
                    : <table className="t-table">
                        <thead><tr><th>GAMERTAG</th><th>EMAIL</th><th>REGISTERED</th><th>STATUS</th></tr></thead>
                        <tbody>
                          {regs[viewRegsId].map(r => (
                            <tr key={r.id}>
                              <td style={{ color:"#c0d4f0",fontWeight:600 }}>{r.userName}</td>
                              <td>{r.userEmail}</td>
                              <td>{r.registeredAt?.toDate ? r.registeredAt.toDate().toLocaleDateString() : "—"}</td>
                              <td><span style={{ color:"#00ff88",fontSize:11 }}>✓ {r.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  }
                </div>
              )}

              <div className="admin-card">
                <div className="admin-card-title">MANAGE TOURNAMENTS</div>
                <table className="t-table">
                  <thead><tr><th>TITLE</th><th>GAME</th><th>STATUS</th><th>PRIZE</th><th>SLOTS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {tournaments.map(t => (
                      <tr key={t.id}>
                        <td style={{ color:"#c0d4f0",fontWeight:600 }}>{t.title}</td>
                        <td>{t.game}</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td style={{ color:t.color,fontFamily:"'Orbitron',monospace",fontSize:12 }}>{t.prize}</td>
                        <td>{t.filled}/{t.slots}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleEdit(t)}>Edit</button>
                          <button className="action-btn" style={{ color:"#c080ff",borderColor:"#c080ff" }} onClick={() => handleViewRegs(t.id)}>Registrations</button>
                          <button className="action-btn del" onClick={() => handleDelete(t.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* USERS */}
          {tab === "users" && (
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                <div style={{ fontFamily:"'Orbitron',monospace",fontSize:13,color:"#4a6080",letterSpacing:2 }}>{users.length} USERS</div>
                <button className="neon-btn neon-btn-sm neon-btn-mag" onClick={() => setShowUserForm(true)}>+ ADD ADMIN</button>
              </div>

              {showUserForm && (
                <div className="admin-card" style={{ borderColor:"#ff00c844",marginBottom:24 }}>
                  <div className="admin-card-title">ADD NEW ADMIN</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px" }}>
                    <Field label="Gamertag *"><input className="neon-input" value={userForm.name} onChange={e => setUserForm(p=>({...p,name:e.target.value}))} placeholder="ADMIN_X" /></Field>
                    <Field label="Role">
                      <select className="neon-input" value={userForm.role} onChange={e => setUserForm(p=>({...p,role:e.target.value}))}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </Field>
                    <Field label="Email *"><input className="neon-input" value={userForm.email} onChange={e => setUserForm(p=>({...p,email:e.target.value}))} placeholder="admin@arena.gg" /></Field>
                  </div>
                  <div style={{ fontSize:12,color:"#5070a0",marginBottom:16,letterSpacing:.5 }}>
                    ⚠ To add a new admin: first have them sign up through the app, then use "Toggle Role" below to promote them to admin.
                  </div>
                  <button className="neon-btn neon-btn-sm" style={{ width:"auto",padding:"10px 24px",borderColor:"#4a6080",color:"#4a6080" }} onClick={() => setShowUserForm(false)}>CLOSE</button>
                </div>
              )}

              <div className="admin-card">
                <div className="admin-card-title">ALL USERS</div>
                <table className="t-table">
                  <thead><tr><th>GAMERTAG</th><th>EMAIL</th><th>ROLE</th><th>VERIFIED</th><th>TOURNAMENTS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.uid}>
                        <td style={{ color:"#c0d4f0",fontWeight:600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role==="admin"?"badge-admin":"badge-user"}`}>{u.role?.toUpperCase()}</span></td>
                        <td style={{ color: u.emailVerified ? "#00ff88" : "#ffee00" }}>{u.emailVerified ? "✓ Verified" : "⚠ Pending"}</td>
                        <td style={{ color:"#4a6080" }}>{(u.registrations||[]).length}</td>
                        <td>
                          <button className="action-btn edit" onClick={async () => {
                            const newRole = u.role === "admin" ? "user" : "admin";
                            await setUserRole(u.uid, newRole);
                            setUsers(prev => prev.map(x => x.uid===u.uid ? { ...x, role:newRole } : x));
                            notify(`${u.name} is now ${newRole}`, "ok");
                          }}>Toggle Role</button>
                          <button className="action-btn del" onClick={async () => {
                            await deleteUserProfile(u.uid);
                            setUsers(prev => prev.filter(x => x.uid!==u.uid));
                            notify("User profile removed", "ok");
                          }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* STATS */}
          {tab === "stats" && (
            <div className="admin-card">
              <div className="admin-card-title">PLATFORM STATISTICS</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
                {[
                  { label:"Total Tournaments", val:tournaments.length, color:"#00f5ff" },
                  { label:"Live Now", val:tournaments.filter(t=>t.status==="live").length, color:"#ff4466" },
                  { label:"Open Registration", val:tournaments.filter(t=>t.status==="open").length, color:"#00ff88" },
                  { label:"Total Prize Pool", val:"$"+tournaments.reduce((a,t)=>a+(t.prizeRaw||0),0).toLocaleString(), color:"#ffee00" },
                  { label:"Filled Slots", val:tournaments.reduce((a,t)=>a+(t.filled||0),0), color:"#ff00c8" },
                  { label:"Total Users", val:users.length, color:"#c080ff" },
                ].map(s => (
                  <div key={s.label} style={{ background:"#0a1020",border:"1px solid #1a2a40",borderRadius:4,padding:"20px 24px" }}>
                    <div style={{ fontFamily:"'Orbitron',monospace",fontSize:28,fontWeight:900,color:s.color,textShadow:`0 0 16px ${s.color}55` }}>{s.val}</div>
                    <div style={{ fontSize:11,letterSpacing:2,color:"#3a5070",textTransform:"uppercase",marginTop:6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState("home");
  const [notif, setNotif] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const notify = (msg, type="ok") => setNotif({ msg, type, key: Date.now() });

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthChange((data) => {
      setUser(data?.profile || null);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Listen to Firestore tournaments in real time
  useEffect(() => {
    const unsub = subscribeTournaments(setTournaments);
    return unsub;
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setPage("home");
    notify("Logged out.", "ok");
  };

  if (authLoading) return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" />
      <div className="loading-screen">
        <Spinner />
        <div className="loading-title">CONNECTING TO FIREBASE...</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" />
      <div className="scanline" />
      <AuthPage notify={notify} />
      {notif && <Notification key={notif.key} msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" />
      <div className="scanline" />
      <div className="app">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setPage("home")}>NEXUS<span>ARENA</span></div>
          <div className="nav-links">
            <button className={`nav-btn ${page==="home"?"active":""}`} onClick={() => setPage("home")}>Tournaments</button>
            {user.role === "admin" && (
              <button className={`nav-btn ${page==="admin"?"active":""}`} onClick={() => setPage("admin")}>Admin Panel</button>
            )}
          </div>
          <div className="nav-user">
            <span className={`badge ${user.role==="admin"?"badge-admin":"badge-user"}`}>{user.role}</span>
            <div className="avatar">{user.name?.[0]||"U"}</div>
            <button className="nav-btn" style={{ borderColor:"#ff00c833",color:"#5a4070" }} onClick={handleLogout}>LOGOUT</button>
          </div>
        </nav>
        {page === "home" && <UserHome tournaments={tournaments} user={user} setUser={setUser} notify={notify} />}
        {page === "admin" && user.role === "admin" && <AdminPanel tournaments={tournaments} user={user} notify={notify} />}
      </div>
      {notif && <Notification key={notif.key} msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
    </>
  );
}

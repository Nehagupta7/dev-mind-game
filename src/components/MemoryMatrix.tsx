import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ---------------------------------------------------------
   MEMORY MATRIX — see it. remember it. rebuild it.
   Single-file React + TypeScript game.
   Persistence uses plain localStorage (this is a real
   browser app, not the sandbox preview).
--------------------------------------------------------- */

type Level = { id: number; grid: number; count: number; memorize: number };
type Phase = "countdown" | "memorize" | "rebuild" | "results";
type Screen = "home" | "levels" | "howto" | "scores" | "game";
type Placement = Record<number, string>;
type Feedback = "correct" | "incorrect" | "missed" | null;
type FeedbackMap = Record<number, Feedback>;

type Puzzle = {
  board: (string | null)[];
  activeIndices: number[];
  chars: string[];
};

type BestScore = { score: number; accuracy: number };
type Progress = { unlocked: number; best: Record<number, BestScore> };

type Result = {
  correct: number;
  incorrect: number;
  accuracy: number;
  timeTaken: number;
  base: number;
  speedBonus: number;
  multiplier: number;
  score: number;
  passed: boolean;
};

type DragState = { char: string; source: number | "tray"; x: number; y: number };

const CHAR_POOL: string[] = [
  "🦊","🐱","🐸","🐼","🐯","🐨","🦁","🐰","🐵","🐙","🦄","🐲",
  "🐺","🐻","🐷","🐮","🐹","🐭","🐔","🐧","🦉","🦋","🐝","🐢",
  "🐳","🐬","🦈","🐊","🦖","🦕","🦂","🕷️","🐌","🦑","🦀","🐡",
];

const LEVELS: Level[] = [
  { id: 1, grid: 3, count: 3, memorize: 6 },
  { id: 2, grid: 3, count: 4, memorize: 5 },
  { id: 3, grid: 4, count: 5, memorize: 5 },
  { id: 4, grid: 4, count: 7, memorize: 4 },
  { id: 5, grid: 5, count: 9, memorize: 4 },
  { id: 6, grid: 5, count: 12, memorize: 3 },
  { id: 7, grid: 6, count: 15, memorize: 3 },
  { id: 8, grid: 6, count: 20, memorize: 2 },
  { id: 9, grid: 7, count: 25, memorize: 2 },
  { id: 10, grid: 8, count: 32, memorize: 1.5 },
];

const PASS_ACCURACY = 70;
const STORAGE_KEY = "memory-matrix-progress";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard(level: Level): Puzzle {
  const total = level.grid * level.grid;
  const cellIndices = shuffle(Array.from({ length: total }, (_, i) => i)).slice(0, level.count);
  const chars = shuffle(CHAR_POOL).slice(0, level.count);
  const board: (string | null)[] = Array(total).fill(null);
  cellIndices.forEach((cellIdx, i) => { board[cellIdx] = chars[i]; });
  return { board, activeIndices: cellIndices, chars };
}

function useGoogleFont(): void {
  useEffect(() => {
    if (document.getElementById("mm-font")) return;
    const link = document.createElement("link");
    link.id = "mm-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch (e) { /* first run, or storage unavailable */ }
  return { unlocked: 1, best: {} };
}

function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) { /* best effort only */ }
}

/* ---------------------------------------------------------
   VISUAL PRIMITIVES
--------------------------------------------------------- */

function GlobalStyle() {
  return (
    <style>{`
      .mm-root { font-family: 'Inter', sans-serif; color: #EAE8FF; }
      .mm-display { font-family: 'Sora', sans-serif; }
      @keyframes mm-pop { 0% { transform: scale(0.7); opacity:0 } 60% { transform: scale(1.06); opacity:1 } 100% { transform: scale(1) } }
      @keyframes mm-fadeup { 0% { transform: translateY(14px); opacity:0 } 100% { transform: translateY(0); opacity:1 } }
      @keyframes mm-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.55) } 50% { box-shadow: 0 0 0 10px rgba(139,92,246,0) } }
      @keyframes mm-shake { 10%,90% { transform: translateX(-2px) } 20%,80% { transform: translateX(3px) } 30%,50%,70% { transform: translateX(-5px) } 40%,60% { transform: translateX(5px) } }
      @keyframes mm-glow { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.35) } }
      @keyframes mm-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      @keyframes mm-spin-ring { to { transform: rotate(360deg) } }
      @keyframes mm-confetti { 0% { transform: translateY(0) rotate(0); opacity:1 } 100% { transform: translateY(140px) rotate(340deg); opacity:0 } }
      @keyframes mm-scoreCount { 0% { transform: scale(0.4); opacity:0 } 100% { transform: scale(1); opacity:1 } }
      .mm-cell-flip { transition: transform 0.5s cubic-bezier(.4,.2,.2,1); transform-style: preserve-3d; }
      .mm-tilt-stage { perspective: 1400px; }
      .mm-btn { font-family: 'Sora', sans-serif; cursor: pointer; border: none; outline: none; user-select: none; }
      .mm-btn:active { transform: scale(0.96); }
      .mm-glass { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(14px); }
      ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 8px; }
    `}</style>
  );
}

function GradientBG({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mm-root"
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(1100px 620px at 15% -10%, rgba(139,92,246,0.20), transparent 60%)," +
          "radial-gradient(900px 560px at 105% 10%, rgba(34,211,238,0.14), transparent 55%)," +
          "linear-gradient(180deg, #05060F 0%, #0A0C1C 55%, #070813 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 16px 60px",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

function Logo({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size, height: size, borderRadius: 10,
          background: "linear-gradient(135deg,#8B5CF6,#22D3EE)",
          display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
          gap: 3, padding: 6, boxShadow: "0 6px 20px rgba(139,92,246,0.45)",
          transform: "rotate(-6deg)",
        }}
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: "rgba(5,6,15,0.55)", borderRadius: 3 }} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOME / LEVEL SELECT / MODALS
--------------------------------------------------------- */

type HomeScreenProps = { onStart: () => void; onHowTo: () => void; onScores: () => void; unlocked: number };

function HomeScreen({ onStart, onHowTo, onScores, unlocked }: HomeScreenProps) {
  return (
    <div style={{ width: "100%", maxWidth: 560, marginTop: "8vh", textAlign: "center", animation: "mm-fadeup 0.6s ease" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <div style={{ animation: "mm-float 3.5s ease-in-out infinite" }}><Logo size={64} /></div>
      </div>
      <h1 className="mm-display" style={{
        fontSize: 46, fontWeight: 800, margin: 0, letterSpacing: -1,
        background: "linear-gradient(135deg,#fff,#C4B5FD)", WebkitBackgroundClip: "text", color: "transparent",
      }}>
        Memory Matrix
      </h1>
      <p style={{ marginTop: 10, fontSize: 16, color: "#A5A2C4" }}>See it. Remember it. Rebuild it.</p>

      <div style={{ marginTop: 42, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <button
          onClick={onStart}
          className="mm-btn"
          style={{
            width: 260, padding: "16px 0", borderRadius: 16, fontSize: 17, fontWeight: 700, color: "#0B0616",
            background: "linear-gradient(135deg,#A78BFA,#22D3EE)", boxShadow: "0 10px 30px rgba(139,92,246,0.35)",
            transition: "transform 0.15s ease",
          }}
        >
          ▶ Select Level
        </button>
        <button onClick={onHowTo} className="mm-btn mm-glass"
          style={{ width: 260, padding: "13px 0", borderRadius: 16, fontSize: 15, fontWeight: 600, color: "#EAE8FF" }}>
          How to Play
        </button>
        <button onClick={onScores} className="mm-btn mm-glass"
          style={{ width: 260, padding: "13px 0", borderRadius: 16, fontSize: 15, fontWeight: 600, color: "#EAE8FF" }}>
          Best Scores
        </button>
      </div>

      <p style={{ marginTop: 30, fontSize: 13, color: "#6E6B95" }}>
        Level {unlocked} of {LEVELS.length} unlocked
      </p>
    </div>
  );
}

type LevelSelectProps = {
  unlocked: number;
  best: Record<number, BestScore>;
  onPick: (idx: number) => void;
  onBack: () => void;
};

function LevelSelect({ unlocked, best, onPick, onBack }: LevelSelectProps) {
  return (
    <div style={{ width: "100%", maxWidth: 560, marginTop: "6vh", animation: "mm-fadeup 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} className="mm-btn mm-glass" style={{ padding: "8px 13px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#EAE8FF" }}>← Back</button>
        <h2 className="mm-display" style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Select Level</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
        {LEVELS.map(lv => {
          const locked = lv.id > unlocked;
          const b = best[lv.id];
          return (
            <button
              key={lv.id}
              onClick={() => !locked && onPick(lv.id - 1)}
              className={locked ? "mm-glass" : "mm-btn mm-glass"}
              disabled={locked}
              style={{
                padding: "18px 10px", borderRadius: 16, textAlign: "center", cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.4 : 1, border: lv.id === unlocked ? "1.5px solid #8B5CF6" : "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="mm-display" style={{ fontSize: 22, fontWeight: 800, color: locked ? "#6E6B95" : "#EAE8FF" }}>
                {locked ? "🔒" : lv.id}
              </div>
              <div style={{ fontSize: 11, color: "#8A87AD", marginTop: 4 }}>{lv.grid}×{lv.grid} · {lv.count} icons</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24", marginTop: 6 }}>{b ? `${b.score} pts` : locked ? "" : "—"}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ModalShellProps = { title: string; onClose: () => void; children: React.ReactNode };

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(4,5,12,0.72)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
      animation: "mm-fadeup 0.25s ease",
    }} onClick={onClose}>
      <div
        className="mm-glass"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 460, borderRadius: 22, padding: 26, animation: "mm-pop 0.3s ease" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="mm-display" style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} className="mm-btn" style={{ background: "rgba(255,255,255,0.08)", width: 30, height: 30, borderRadius: "50%", color: "#EAE8FF", fontSize: 15 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HowToModal({ onClose }: { onClose: () => void }) {
  const steps = [
    { n: 1, title: "Memorize the board", body: "Study the grid before the timer hits zero. Every icon and cell matters." },
    { n: 2, title: "Rebuild it", body: "Drag the shuffled pieces below back into the cells you remember." },
    { n: 3, title: "Submit & beat your best", body: "Hit Check My Memory to score accuracy, speed, and level difficulty." },
  ];
  return (
    <ModalShell title="How to Play" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div className="mm-display" style={{
              minWidth: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,#8B5CF6,#22D3EE)", fontWeight: 800, fontSize: 15, color: "#0B0616",
            }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, color: "#A5A2C4", marginTop: 2, lineHeight: 1.5 }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

type ScoresModalProps = { onClose: () => void; best: Record<number, BestScore>; unlocked: number };

function ScoresModal({ onClose, best, unlocked }: ScoresModalProps) {
  return (
    <ModalShell title="Best Scores" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
        {LEVELS.map(lv => {
          const b = best[lv.id];
          const locked = lv.id > unlocked;
          return (
            <div key={lv.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.035)",
              opacity: locked ? 0.4 : 1,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Level {lv.id} <span style={{ color: "#8A87AD", fontWeight: 400 }}>· {lv.grid}×{lv.grid}</span></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: b ? "#FBBF24" : "#6E6B95" }}>
                {locked ? "🔒" : b ? `${b.score} pts` : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

/* ---------------------------------------------------------
   HEADER / HUD
--------------------------------------------------------- */

type HudProps = { level: Level; phase: Phase; timeLeft: number; memorizeTotal: number; onQuit: () => void };

function Hud({ level, phase, timeLeft, memorizeTotal, onQuit }: HudProps) {
  const pct = phase === "memorize" ? Math.max(0, (timeLeft / memorizeTotal) * 100) : 100;
  return (
    <div style={{ width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onQuit} className="mm-btn" style={{ background: "rgba(255,255,255,0.06)", color: "#C7C4E8", padding: "7px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600 }}>← Levels</button>
        <div className="mm-display" style={{ fontSize: 15, fontWeight: 700, color: "#EAE8FF" }}>
          Level {level.id} <span style={{ color: "#8A87AD", fontWeight: 400 }}>· {level.grid}×{level.grid} · {level.count} icons</span>
        </div>
        <div style={{ width: 74 }} />
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          width: `${(level.id / LEVELS.length) * 100}%`, height: "100%",
          background: "linear-gradient(90deg,#8B5CF6,#22D3EE)", transition: "width 0.4s ease",
        }} />
      </div>
      {phase === "memorize" && (
        <div style={{ width: "100%", height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: timeLeft <= 1.5 ? "#FB7185" : "#34D399", transition: "width 0.1s linear" }} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   COUNTDOWN
--------------------------------------------------------- */

function Countdown({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320 }}>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" style={{ position: "absolute", inset: 0, animation: "mm-spin-ring 3s linear infinite" }}>
          <circle cx={75} cy={75} r={66} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <circle cx={75} cy={75} r={66} fill="none" stroke="url(#mmGrad)" strokeWidth={6} strokeDasharray="120 300" strokeLinecap="round" />
          <defs>
            <linearGradient id="mmGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>
        <div key={value} className="mm-display" style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 62, fontWeight: 800, animation: "mm-pop 0.5s ease",
          background: "linear-gradient(135deg,#fff,#C4B5FD)", WebkitBackgroundClip: "text", color: "transparent",
        }}>
          {value > 0 ? value : "GO"}
        </div>
      </div>
      <p style={{ marginTop: 22, color: "#A5A2C4", fontSize: 14 }}>Get ready to memorize…</p>
    </div>
  );
}

/* ---------------------------------------------------------
   BOARD CELL
--------------------------------------------------------- */

type CellProps = {
  index: number;
  size: number;
  char: string | null;
  faceUp: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  feedback: Feedback;
  dragOver: boolean;
  onCellRef: (el: HTMLDivElement | null) => void;
  originalChar: string | null;
  showOriginal: boolean;
};

function Cell({ index, size, char, faceUp, onPointerDown, feedback, dragOver, onCellRef, originalChar, showOriginal }: CellProps) {
  const cellSize = size <= 4 ? 74 : size === 5 ? 64 : size === 6 ? 56 : size === 7 ? 49 : 43;
  const fontSize = cellSize * 0.5;

  let border = "1px solid rgba(255,255,255,0.09)";
  let bg = "rgba(255,255,255,0.035)";
  let glow = "none";
  if (feedback === "correct") { border = "1.5px solid #34D399"; bg = "rgba(52,211,153,0.14)"; glow = "0 0 18px rgba(52,211,153,0.35)"; }
  else if (feedback === "incorrect") { border = "1.5px solid #FB7185"; bg = "rgba(251,113,133,0.14)"; glow = "0 0 18px rgba(251,113,133,0.3)"; }
  else if (feedback === "missed") { border = "1.5px dashed rgba(251,191,36,0.6)"; bg = "rgba(251,191,36,0.08)"; }
  else if (dragOver) { border = "1.5px solid #8B5CF6"; bg = "rgba(139,92,246,0.16)"; }

  return (
    <div
      ref={onCellRef}
      data-cell-index={index}
      onPointerDown={onPointerDown}
      className="mm-cell-flip"
      style={{
        width: cellSize, height: cellSize, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        border, background: bg, boxShadow: glow,
        position: "relative", touchAction: "none",
        cursor: char ? "grab" : "default",
      }}
    >
      {faceUp && char && (
        <span style={{ fontSize, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))", pointerEvents: "none" }}>{char}</span>
      )}
      {showOriginal && originalChar && feedback !== "correct" && (
        <span style={{
          position: "absolute", bottom: -6, right: -6, fontSize: fontSize * 0.42,
          background: "rgba(5,6,15,0.85)", borderRadius: "50%", padding: 2,
          border: "1px solid rgba(251,191,36,0.5)", lineHeight: 1, pointerEvents: "none",
        }}>{originalChar}</span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   TRAY PIECE
--------------------------------------------------------- */

type TrayPieceProps = { char: string; onPointerDown: (e: React.PointerEvent) => void; size: number };

function TrayPiece({ char, onPointerDown, size }: TrayPieceProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      data-tray-char={char}
      style={{
        width: size, height: size, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
        fontSize: size * 0.52, cursor: "grab", touchAction: "none",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)", animation: "mm-fadeup 0.35s ease",
      }}
    >
      {char}
    </div>
  );
}

/* ---------------------------------------------------------
   GAME BOARD (memorize / rebuild / results) — custom pointer DnD
--------------------------------------------------------- */

type GameBoardProps = {
  level: Level;
  phase: Phase;
  board: (string | null)[];
  placement: Placement;
  setPlacement: React.Dispatch<React.SetStateAction<Placement>>;
  trayOrder: string[];
  feedbackMap: FeedbackMap | null;
};

function GameBoard({ level, phase, board, placement, setPlacement, trayOrder, feedbackMap }: GameBoardProps) {
  const gridN = level.grid;
  const cellSize = gridN <= 4 ? 74 : gridN === 5 ? 64 : gridN === 6 ? 56 : gridN === 7 ? 49 : 43;
  const gap = gridN <= 5 ? 8 : 6;

  const cellRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCell, setHoverCell] = useState<number | null>(null);

  const placedChars = useMemo(() => Object.values(placement), [placement]);
  const trayItems = trayOrder.filter(c => !placedChars.includes(c));

  const startDrag = (e: React.PointerEvent, char: string, source: number | "tray") => {
    if (phase !== "rebuild") return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({ char, source, x: e.clientX, y: e.clientY });
  };

  const findCellAt = useCallback((clientX: number, clientY: number): number | null => {
    for (const [idx, el] of Object.entries(cellRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return Number(idx);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : d);
      setHoverCell(findCellAt(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      const targetIdx = findCellAt(e.clientX, e.clientY);
      setPlacement(prev => {
        const next = { ...prev };
        if (targetIdx !== null) {
          const occupant = next[targetIdx];
          if (typeof drag.source === "number") {
            delete next[drag.source];
            if (occupant) next[drag.source] = occupant;
          }
          next[targetIdx] = drag.char;
        } else if (typeof drag.source === "number") {
          delete next[drag.source];
        }
        return next;
      });
      setDrag(null);
      setHoverCell(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [drag, setPlacement, findCellAt]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, width: "100%" }}>
      <div className="mm-tilt-stage" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridN}, ${cellSize}px)`,
          gap,
          padding: 16,
          borderRadius: 20,
          transform: "rotateX(6deg)",
          transformStyle: "preserve-3d",
        }} className="mm-glass">
          {Array.from({ length: gridN * gridN }, (_, i) => {
            const origChar = board[i];
            let faceUp = false;
            let char: string | null = null;
            let feedback: Feedback = null;
            if (phase === "memorize") { faceUp = !!origChar; char = origChar; }
            else if (phase === "rebuild" || phase === "results") {
              char = placement[i] || null;
              faceUp = !!char;
              if (phase === "results") feedback = feedbackMap ? feedbackMap[i] : null;
            }
            return (
              <Cell
                key={i}
                index={i}
                size={gridN}
                char={char}
                faceUp={faceUp}
                dragOver={hoverCell === i}
                feedback={feedback}
                originalChar={origChar}
                showOriginal={phase === "results"}
                onCellRef={(el) => { cellRefs.current[i] = el; }}
                onPointerDown={(e) => {
                  if (phase === "rebuild" && placement[i]) startDrag(e, placement[i], i);
                }}
              />
            );
          })}
        </div>
      </div>

      {phase === "rebuild" && (
        <div className="mm-glass" style={{
          width: "100%", maxWidth: 560, minHeight: 90, borderRadius: 18, padding: 14,
          display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", alignItems: "center",
        }}>
          {trayItems.length === 0 && (
            <span style={{ fontSize: 13, color: "#6E6B95" }}>All pieces placed — ready to check!</span>
          )}
          {trayItems.map((c, i) => (
            <TrayPiece key={c + i} char={c} size={Math.min(cellSize, 52)} onPointerDown={(e) => startDrag(e, c, "tray")} />
          ))}
        </div>
      )}

      {drag && (
        <div style={{
          position: "fixed", left: drag.x - 26, top: drag.y - 26, width: 52, height: 52,
          borderRadius: 12, background: "rgba(139,92,246,0.28)", border: "1px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          pointerEvents: "none", zIndex: 100, boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
        }}>
          {drag.char}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   RESULTS SCREEN
--------------------------------------------------------- */

type ScoreStatProps = { label: string; value: string | number; color?: string };

function ScoreStat({ label, value, color }: ScoreStatProps) {
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 90 }}>
      <div className="mm-display" style={{ fontSize: 22, fontWeight: 800, color: color || "#EAE8FF" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#8A87AD", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: ["#8B5CF6", "#22D3EE", "#34D399", "#FBBF24", "#FB7185"][i % 5],
    dur: 1.1 + Math.random() * 0.8,
  })), []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", top: -10, left: `${p.left}%`, width: 7, height: 11, background: p.color,
          animation: `mm-confetti ${p.dur}s ease-in ${p.delay}s forwards`, borderRadius: 2,
        }} />
      ))}
    </div>
  );
}

type ResultsPanelProps = {
  result: Result;
  level: Level;
  isFinalLevel: boolean;
  onRetry: () => void;
  onNext: () => void;
  onMenu: () => void;
  onLevels: () => void;
};

function ResultsPanel({ result, level, isFinalLevel, onRetry, onNext, onMenu, onLevels }: ResultsPanelProps) {
  const passed = result.passed;
  return (
    <div className="mm-glass" style={{
      width: "100%", maxWidth: 560, borderRadius: 22, padding: "30px 26px", position: "relative",
      overflow: "hidden", animation: "mm-pop 0.4s ease", textAlign: "center",
    }}>
      {passed && <Confetti />}
      <div style={{ fontSize: 40, marginBottom: 4 }}>{passed ? "🎉" : "🌀"}</div>
      <h2 className="mm-display" style={{
        margin: "4px 0 2px", fontSize: 24, fontWeight: 800,
        color: passed ? "#34D399" : "#FB7185",
      }}>
        {passed ? (isFinalLevel ? "Matrix Mastered!" : "Level Complete!") : "Not Quite — Try Again"}
      </h2>
      <p style={{ color: "#A5A2C4", fontSize: 13.5, marginTop: 0 }}>
        {passed ? `Level ${level.id} cleared with ${result.accuracy}% accuracy.` : `You needed ${PASS_ACCURACY}% accuracy to pass this level.`}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0 6px", gap: 6, flexWrap: "wrap" }}>
        <ScoreStat label="Correct" value={result.correct} color="#34D399" />
        <ScoreStat label="Incorrect" value={result.incorrect} color="#FB7185" />
        <ScoreStat label="Accuracy" value={`${result.accuracy}%`} />
        <ScoreStat label="Time" value={`${result.timeTaken}s`} />
      </div>

      <div style={{ margin: "18px 0", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 12, color: "#8A87AD", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Final score</div>
        <div key={result.score} className="mm-display" style={{
          fontSize: 44, fontWeight: 800, animation: "mm-scoreCount 0.5s ease",
          background: "linear-gradient(135deg,#FBBF24,#FB923C)", WebkitBackgroundClip: "text", color: "transparent",
        }}>
          {result.score}
        </div>
        <div style={{ fontSize: 11.5, color: "#6E6B95", marginTop: 6 }}>
          base {result.base} + speed {result.speedBonus} × level ×{result.multiplier}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 6 }}>
        <button onClick={onMenu} className="mm-btn mm-glass" style={{ padding: "12px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, color: "#EAE8FF" }}>Menu</button>
        <button onClick={onLevels} className="mm-btn mm-glass" style={{ padding: "12px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, color: "#EAE8FF" }}>Choose Level</button>
        <button onClick={onRetry} className="mm-btn mm-glass" style={{ padding: "12px 20px", borderRadius: 14, fontWeight: 600, fontSize: 14, color: "#EAE8FF" }}>Retry Level</button>
        {passed && !isFinalLevel && (
          <button onClick={onNext} className="mm-btn" style={{
            padding: "12px 24px", borderRadius: 14, fontWeight: 700, fontSize: 14, color: "#0B0616",
            background: "linear-gradient(135deg,#A78BFA,#22D3EE)",
          }}>Next Level →</button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function MemoryMatrix() {
  useGoogleFont();

  const [screen, setScreen] = useState<Screen>("home");
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdownVal, setCountdownVal] = useState(3);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [placement, setPlacement] = useState<Placement>({});
  const [trayOrder, setTrayOrder] = useState<string[]>([]);
  const [memTimeLeft, setMemTimeLeft] = useState(0);
  const [rebuildStart, setRebuildStart] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<FeedbackMap | null>(null);

  const level = LEVELS[levelIdx];

  const startLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx];
    const gen = generateBoard(lvl);
    setPuzzle(gen);
    setPlacement({});
    setTrayOrder(shuffle(gen.chars));
    setLevelIdx(idx);
    setCountdownVal(3);
    setPhase("countdown");
    setResult(null);
    setFeedbackMap(null);
    setScreen("game");
  }, []);

  // countdown ticking
  useEffect(() => {
    if (screen !== "game" || phase !== "countdown") return;
    if (countdownVal <= 0) {
      const t = setTimeout(() => {
        setPhase("memorize");
        setMemTimeLeft(level.memorize);
      }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdownVal(v => v - 1), 700);
    return () => clearTimeout(t);
  }, [screen, phase, countdownVal, level]);

  // memorize ticking
  useEffect(() => {
    if (screen !== "game" || phase !== "memorize") return;
    if (memTimeLeft <= 0) {
      setPhase("rebuild");
      setRebuildStart(Date.now());
      return;
    }
    const t = setTimeout(() => setMemTimeLeft(v => Math.max(0, v - 0.1)), 100);
    return () => clearTimeout(t);
  }, [screen, phase, memTimeLeft]);

  const computeResult = useCallback((): Result => {
    if (!puzzle || rebuildStart === null) {
      return { correct: 0, incorrect: 0, accuracy: 0, timeTaken: 0, base: 0, speedBonus: 0, multiplier: 1, score: 0, passed: false };
    }
    const { board, activeIndices } = puzzle;
    let correct = 0;
    const fmap: FeedbackMap = {};
    activeIndices.forEach(idx => {
      const placed = placement[idx];
      if (placed && placed === board[idx]) { correct++; fmap[idx] = "correct"; }
      else if (placed) { fmap[idx] = "incorrect"; }
      else { fmap[idx] = "missed"; }
    });
    Object.keys(placement).forEach(k => {
      const idx = Number(k);
      if (!activeIndices.includes(idx) && placement[idx]) fmap[idx] = "incorrect";
    });
    const incorrect = activeIndices.length - correct;
    const accuracy = Math.round((correct / activeIndices.length) * 100);
    const timeTaken = Math.max(1, Math.round((Date.now() - rebuildStart) / 1000));

    const base = correct * 100;
    const speedBonus = Math.max(0, Math.round(45 - timeTaken) * 5);
    const multiplier = Math.round((1 + levelIdx * 0.15) * 100) / 100;
    const score = Math.round((base + speedBonus) * multiplier);
    const passed = accuracy >= PASS_ACCURACY;

    setFeedbackMap(fmap);
    return { correct, incorrect, accuracy, timeTaken, base, speedBonus, multiplier, score, passed };
  }, [puzzle, placement, rebuildStart, levelIdx]);

  const handleSubmit = () => {
    const r = computeResult();
    setResult(r);
    setPhase("results");

    setProgress(prev => {
      const next: Progress = { ...prev, best: { ...prev.best } };
      const cur = next.best[level.id];
      if (!cur || r.score > cur.score) next.best[level.id] = { score: r.score, accuracy: r.accuracy };
      if (r.passed && level.id === next.unlocked && next.unlocked < LEVELS.length) next.unlocked = next.unlocked + 1;
      saveProgress(next);
      return next;
    });
  };

  const placedCount = Object.keys(placement).length;

  return (
    <GradientBG>
      <GlobalStyle />

      {screen === "home" && (
        <HomeScreen
          unlocked={progress.unlocked}
          onStart={() => setScreen("levels")}
          onHowTo={() => setScreen("howto")}
          onScores={() => setScreen("scores")}
        />
      )}
      {screen === "levels" && (
        <LevelSelect unlocked={progress.unlocked} best={progress.best} onPick={(idx) => startLevel(idx)} onBack={() => setScreen("home")} />
      )}
      {screen === "howto" && (
        <>
          <HomeScreen unlocked={progress.unlocked} onStart={() => setScreen("levels")} onHowTo={() => setScreen("howto")} onScores={() => setScreen("scores")} />
          <HowToModal onClose={() => setScreen("home")} />
        </>
      )}
      {screen === "scores" && (
        <>
          <HomeScreen unlocked={progress.unlocked} onStart={() => setScreen("levels")} onHowTo={() => setScreen("howto")} onScores={() => setScreen("scores")} />
          <ScoresModal onClose={() => setScreen("home")} best={progress.best} unlocked={progress.unlocked} />
        </>
      )}

      {screen === "game" && puzzle && (
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Hud level={level} phase={phase} timeLeft={memTimeLeft} memorizeTotal={level.memorize} onQuit={() => setScreen("levels")} />

          {phase === "countdown" && <Countdown value={countdownVal} />}

          {(phase === "memorize" || phase === "rebuild") && (
            <>
              <GameBoard
                level={level}
                phase={phase}
                board={puzzle.board}
                placement={placement}
                setPlacement={setPlacement}
                trayOrder={trayOrder}
                feedbackMap={null}
              />
              {phase === "rebuild" && (
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={handleSubmit}
                    disabled={placedCount === 0}
                    className="mm-btn"
                    style={{
                      padding: "14px 34px", borderRadius: 16, fontWeight: 700, fontSize: 15, color: "#0B0616",
                      background: placedCount === 0 ? "rgba(255,255,255,0.12)" : "linear-gradient(135deg,#A78BFA,#22D3EE)",
                      opacity: placedCount === 0 ? 0.6 : 1,
                      boxShadow: placedCount === 0 ? "none" : "0 10px 26px rgba(139,92,246,0.35)",
                      animation: placedCount > 0 ? "mm-pulse 2.2s infinite" : "none",
                    }}
                  >
                    Check My Memory
                  </button>
                  <span style={{ fontSize: 12, color: "#6E6B95" }}>{placedCount} / {level.count} pieces placed</span>
                </div>
              )}
            </>
          )}

          {phase === "results" && result && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
              <div style={{ opacity: 0.55, transform: "scale(0.9)" }}>
                <GameBoard level={level} phase="results" board={puzzle.board} placement={placement} setPlacement={setPlacement} trayOrder={[]} feedbackMap={feedbackMap} />
              </div>
              <ResultsPanel
                result={result}
                level={level}
                isFinalLevel={levelIdx === LEVELS.length - 1}
                onRetry={() => startLevel(levelIdx)}
                onNext={() => startLevel(levelIdx + 1)}
                onMenu={() => setScreen("home")}
                onLevels={() => setScreen("levels")}
              />
            </div>
          )}
        </div>
      )}
    </GradientBG>
  );
}
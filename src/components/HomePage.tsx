import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Keyboard,
  Grid3x3,
  Hash,
  Dices,
  Brain,
  Gamepad2,
  Crown,
  Dumbbell,
  Flame,
  Play,
  Menu,
  X,
  Bug,
  Code2,
  LayoutGrid,
  Rocket,
  Lock,
  GripVertical,
  ArrowRight,
  Shield,
  Sparkles,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

/**
 * DEV MIND GYM — Home Page (with theme switcher)
 * ------------------------------------------------------------------
 * Drop this component into your app (no auth/login required, no
 * backend calls). Wire up real navigation by passing an `onPlay`
 * prop: <DevMindGymHome onPlay={(gameId) => navigate(`/play/${gameId}`)} />
 *
 * Three visual modes, switchable live from the header:
 *   - classic : the original dark gym/arcade look
 *   - hero    : bold red/blue/gold, angular comic-style cards
 *   - glam    : hot pink/gold, soft glossy rounded cards
 * ------------------------------------------------------------------
 */

type LevelColor = "a1" | "a2" | "a3";

interface Game {
  id: string;
  name: string;
  tag: string;
  level: string;
  levelColor: LevelColor;
  desc: string;
  icon: LucideIcon;
}

interface ComingSoonGame {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
}

interface NavLink {
  label: string;
  href: string;
}

type ThemeKey = "classic" | "hero" | "glam";
type ThreeShape = "classic" | "hero" | "glam";

interface Theme {
  label: string;
  icon: LucideIcon;
  bg: string;
  bgPanel: string;
  bgPanel2: string;
  border: string;
  text: string;
  textMuted: string;
  accent1: string;
  accent2: string;
  accent3: string;
  radiusCard: string;
  radiusBtn: string;
  eyebrow: string;
  heroTitle: [string, string];
  heroSub: string;
  footerTag: string;
  threeShape: ThreeShape;
  threeC1: number;
  threeC2: number;
}

const GAMES: Game[] = [
  { id: "typing", name: "Typing Sprint", tag: "Speed & Reflexes", level: "All Levels", levelColor: "a2", desc: "Race the clock typing real code syntax without breaking flow.", icon: Keyboard },
  { id: "sudoku", name: "Sudoku", tag: "Logic", level: "Medium", levelColor: "a1", desc: "Classic number logic to warm up pattern recognition before a deploy.", icon: Grid3x3 },
  { id: "tictactoe", name: "Tic-Tac-Toe", tag: "Quick Reps", level: "Easy", levelColor: "a2", desc: "A 30-second mental reset between pull requests.", icon: Hash },
  { id: "ludo", name: "Ludo", tag: "Strategy", level: "Easy", levelColor: "a2", desc: "Multiplayer dice strategy for the coffee-break crew.", icon: Dices },
  { id: "mindmatrix", name: "Mind Matrix", tag: "Memory", level: "Hard", levelColor: "a3", desc: "Sequence and pattern recall drills built for engineers.", icon: Brain },
  { id: "snake", name: "Snake", tag: "Reflexes", level: "Medium", levelColor: "a1", desc: "Old-school reflex training, one line of code short.", icon: Gamepad2 },
  { id: "chess", name: "Chess", tag: "Deep Logic", level: "Hard", levelColor: "a3", desc: "Long-form strategic thinking for your architecture brain.", icon: Crown },
];

const COMING_SOON: ComingSoonGame[] = [
  { id: "bugsquash", name: "Bug Squash", desc: "Spot the bug before the timer hits zero.", icon: Bug },
  { id: "regex", name: "Regex Reflex", desc: "Match the pattern in the fewest characters.", icon: Code2 },
  { id: "memorygrid", name: "Memory Grid", desc: "Flash recall for syntax and shortcuts.", icon: LayoutGrid },
  { id: "algorace", name: "Algorithm Race", desc: "Predict the sort before it finishes.", icon: Rocket },
];

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "The Floor", href: "#floor" },
  { label: "Build Session", href: "#session" },
  { label: "About", href: "#about" },
];

/* ---------------- Theme definitions ---------------- */
const THEMES: Record<ThemeKey, Theme> = {
  classic: {
    label: "Classic",
    icon: SlidersHorizontal,
    bg: "#0a0d13", bgPanel: "#12161e", bgPanel2: "#171c26", border: "rgba(255,255,255,0.08)",
    text: "#eef1f5", textMuted: "#8a93a6",
    accent1: "#ff7a29", accent2: "#33e1ff", accent3: "#ff4d6d",
    radiusCard: "14px", radiusBtn: "8px",
    eyebrow: "No sign-up. No excuses.",
    heroTitle: ["TRAIN YOUR DEV BRAIN", "LIKE A MUSCLE"],
    heroSub: "Seven quick mental workouts built for engineers — logic, memory, speed and focus — playable instantly, right in the browser. No account, no tracking, just reps.",
    footerTag: "Open 24/7 — no membership fee",
    threeShape: "classic",
    threeC1: 0x33e1ff, threeC2: 0xff7a29,
  },
  hero: {
    label: "Hero Mode",
    icon: Shield,
    bg: "#0b0f1a", bgPanel: "#141a2b", bgPanel2: "#1b2338", border: "rgba(255,255,255,0.10)",
    text: "#f5f7fb", textMuted: "#93a0bd",
    accent1: "#ef4136", accent2: "#2f6fed", accent3: "#ffc93c",
    radiusCard: "4px", radiusBtn: "4px",
    eyebrow: "No cape required. No excuses.",
    heroTitle: ["ASSEMBLE YOUR", "INNER CODE HERO"],
    heroSub: "Seven high-intensity mental drills for engineers who train like they ship — logic, memory, speed and focus. No sign-up, no sidekick required.",
    footerTag: "Suited up 24/7 — no membership fee",
    threeShape: "hero",
    threeC1: 0x2f6fed, threeC2: 0xef4136,
  },
  glam: {
    label: "Glam Mode",
    icon: Sparkles,
    bg: "#1a0f1e", bgPanel: "#241328", bgPanel2: "#2e1735", border: "rgba(255,255,255,0.10)",
    text: "#fdf3f8", textMuted: "#c9a0c2",
    accent1: "#ff3fa4", accent2: "#ffd166", accent3: "#c86dd7",
    radiusCard: "26px", radiusBtn: "999px",
    eyebrow: "No login, just glow.",
    heroTitle: ["GLOW UP YOUR", "DEV BRAIN"],
    heroSub: "Seven sparkling mental workouts for engineers — logic, memory, speed and focus, wrapped in a little glam. No account, no tracking, just glow.",
    footerTag: "Open 24/7 — glam included, free of charge",
    threeShape: "glam",
    threeC1: 0xff3fa4, threeC2: 0xffd166,
  },
};

/* ---------------- Tilt card wrapper ---------------- */
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(6px) scale(1.02)`,
    });
  };
  const reset = () =>
    setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)" });

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ ...style, transition: "transform 0.16s ease-out", transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ---------------- Scroll-reveal wrapper (staggered card entrance) ---------------- */
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`dmg-reveal ${visible ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

interface MeshPair {
  mesh1: THREE.Mesh | null;
  mesh2: THREE.Mesh | null;
}

export interface DevMindGymHomeProps {
  onPlay?: (gameId: string) => void;
}

export default function HomePage({ onPlay }: DevMindGymHomeProps) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("classic");
  const theme = THEMES[themeKey];

  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<Game[]>([]);
  const [dragOverZone, setDragOverZone] = useState(false);
  const [pulseId, setPulseId] = useState<string | null>(null);

  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<MeshPair>({ mesh1: null, mesh2: null });

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(73);

  /* ---------------- Measure header height (fixed positioning needs a spacer) ---------------- */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [menuOpen]);

  /* ---------------- Cursor trail effect ---------------- */
  useEffect(() => {
    let mouseX = 0,
      mouseY = 0,
      ringX = 0,
      ringY = 0,
      raf: number;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };
    const animate = () => {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    animate();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ---------------- Three.js scene setup (once) ---------------- */
  useEffect(() => {
    const container = threeMountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frameId: number;
    const animate = () => {
      const { mesh1, mesh2 } = meshRef.current;
      if (!prefersReduced) {
        if (mesh1) {
          mesh1.rotation.x += 0.0016;
          mesh1.rotation.y += 0.0022;
        }
        if (mesh2) {
          mesh2.rotation.x -= 0.0011;
          mesh2.rotation.y += 0.0019;
        }
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      scene.children.slice().forEach((child: any) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const material = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
        scene.remove(child);
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ---------------- Rebuild 3D shapes when theme changes ---------------- */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const { mesh1: oldMesh1, mesh2: oldMesh2 } = meshRef.current;
    [oldMesh1, oldMesh2].forEach((m) => {
      if (m) {
        scene.remove(m);
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    });

    let geo1: THREE.BufferGeometry;
    let geo2: THREE.BufferGeometry;
    if (theme.threeShape === "hero") {
      geo1 = new THREE.OctahedronGeometry(2.2, 0);
      geo2 = new THREE.OctahedronGeometry(1.2, 0);
    } else if (theme.threeShape === "glam") {
      geo1 = new THREE.TorusGeometry(1.7, 0.45, 12, 48);
      geo2 = new THREE.SphereGeometry(1, 14, 14);
    } else {
      geo1 = new THREE.IcosahedronGeometry(2.1, 1);
      geo2 = new THREE.IcosahedronGeometry(1.1, 0);
    }

    const mat1 = new THREE.MeshBasicMaterial({ color: theme.threeC1, wireframe: true, transparent: true, opacity: 0.32 });
    const mat2 = new THREE.MeshBasicMaterial({ color: theme.threeC2, wireframe: true, transparent: true, opacity: 0.28 });

    const mesh1 = new THREE.Mesh(geo1, mat1);
    const mesh2 = new THREE.Mesh(geo2, mat2);
    mesh2.position.set(2.6, -1.1, -2);

    scene.add(mesh1);
    scene.add(mesh2);
    meshRef.current = { mesh1, mesh2 };
  }, [themeKey]);

  /* ---------------- Drag and drop session builder ---------------- */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, gameId: string) => {
    e.dataTransfer.setData("text/plain", gameId);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverZone(true);
  };
  const handleDragLeave = () => setDragOverZone(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverZone(false);
    const id = e.dataTransfer.getData("text/plain");
    const game = GAMES.find((g) => g.id === id);
    if (game && !session.find((s) => s.id === id)) setSession((prev) => [...prev, game]);
  };
  const removeFromSession = (id: string) => setSession((prev) => prev.filter((s) => s.id !== id));

  const handlePlay = (gameId: string) => {
    setPulseId(gameId);
    setTimeout(() => setPulseId(null), 400);
    if (onPlay) onPlay(gameId);
  };

  const rootVars: React.CSSProperties = {
    "--bg": theme.bg,
    "--bg-panel": theme.bgPanel,
    "--bg-panel-2": theme.bgPanel2,
    "--border": theme.border,
    "--text": theme.text,
    "--text-muted": theme.textMuted,
    "--accent1": theme.accent1,
    "--accent2": theme.accent2,
    "--accent3": theme.accent3,
    "--radius-card": theme.radiusCard,
    "--radius-btn": theme.radiusBtn,
  } as React.CSSProperties;

  return (
    <div className="dmg-root" data-theme={themeKey} style={rootVars}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .dmg-root {
          font-family: 'Inter', sans-serif;
          background: var(--bg); color: var(--text);
          position: relative; overflow-x: hidden;
          transition: background 0.4s ease, color 0.4s ease;
        }
        /* Display font is fixed across all themes on purpose — only color/shape/motion change */
        .dmg-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dmg-mono { font-family: 'JetBrains Mono', monospace; }

        /* ---- scroll-in card reveal ---- */
        .dmg-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .dmg-reveal.in { opacity: 1; transform: translateY(0); }

        /* ---- gentle icon-badge glow pulse ---- */
        @keyframes dmgIconPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
          50% { box-shadow: 0 0 14px color-mix(in srgb, var(--accent2) 45%, transparent); }
        }
        .dmg-icon-badge { animation: dmgIconPulse 3.2s ease-in-out infinite; }
        .dmg-card:hover .dmg-icon-badge { animation-duration: 1.4s; }

        /* ---- cursor trail: shape differs per theme via inner span ---- */
        .dmg-cursor-dot { position: fixed; top: -6px; left: -6px; width: 12px; height: 12px; pointer-events: none; z-index: 9999; }
        .dmg-cursor-ring { position: fixed; top: -18px; left: -18px; width: 36px; height: 36px; pointer-events: none; z-index: 9998; }
        .dmg-cursor-shape { display: block; width: 100%; height: 100%; background: var(--accent2); border-radius: 50%; }
        .dmg-cursor-ring-shape { display: block; width: 100%; height: 100%; border: 1px solid var(--accent2); border-radius: 50%; opacity: 0.55; }
        @media (hover: none) { .dmg-cursor-dot, .dmg-cursor-ring { display: none; } }

        [data-theme="hero"] .dmg-cursor-shape { border-radius: 2px; transform: rotate(45deg); background: var(--accent1); }
        [data-theme="hero"] .dmg-cursor-ring-shape { border-radius: 2px; transform: rotate(45deg); border-color: var(--accent1); }

        [data-theme="glam"] .dmg-cursor-shape {
          background: var(--accent1); border-radius: 0;
          clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
          box-shadow: 0 0 10px var(--accent1);
        }
        [data-theme="glam"] .dmg-cursor-ring-shape { border-color: var(--accent1); opacity: 0.4; }

        .dmg-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: color-mix(in srgb, var(--bg) 80%, transparent);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }
        .dmg-nav-link { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; transition: color 0.2s ease; position: relative; }
        .dmg-nav-link:hover { color: var(--text); }
        .dmg-nav-link::after { content: ''; position: absolute; left: 0; bottom: -4px; height: 1px; width: 0; background: var(--accent2); transition: width 0.25s ease; }
        .dmg-nav-link:hover::after { width: 100%; }

        .dmg-theme-switch { display: flex; align-items: center; gap: 4px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 999px; padding: 4px; }
        .dmg-theme-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); transition: background 0.2s ease, color 0.2s ease; }
        .dmg-theme-btn.active { background: var(--accent1); color: var(--bg); }
        .dmg-theme-btn:hover:not(.active) { color: var(--text); }

        .dmg-btn-primary { background: linear-gradient(135deg, var(--accent1), var(--accent3)); color: var(--bg); font-weight: 700; border-radius: var(--radius-btn); transition: box-shadow 0.25s ease, transform 0.15s ease; }
        .dmg-btn-primary:hover { box-shadow: 0 0 28px color-mix(in srgb, var(--accent1) 45%, transparent); transform: translateY(-1px); }
        .dmg-btn-primary:focus-visible { outline: 2px solid var(--accent2); outline-offset: 2px; }

        .dmg-btn-ghost { border: 1px solid var(--border); color: var(--text); border-radius: var(--radius-btn); transition: border-color 0.2s ease, background 0.2s ease; }
        .dmg-btn-ghost:hover { border-color: var(--accent2); background: var(--bg-panel); }
        .dmg-btn-ghost:focus-visible { outline: 2px solid var(--accent2); outline-offset: 2px; }

        .dmg-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent2); }

        .dmg-hero-grid {
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
        }

        .dmg-stat-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; }

        .dmg-card { background: linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2)); border: 1px solid var(--border); border-radius: var(--radius-card); position: relative; overflow: hidden; transition: border-radius 0.3s ease, box-shadow 0.3s ease; }
        .dmg-card::before {
          content: ''; position: absolute; inset: 0; border-radius: var(--radius-card); padding: 1px;
          background: linear-gradient(135deg, var(--accent2), transparent 40%, var(--accent1));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .dmg-card:hover::before { opacity: 1; }
        .dmg-card-scan { position: absolute; left: 0; right: 0; height: 40%; top: -60%; background: linear-gradient(180deg, color-mix(in srgb, var(--accent2) 14%, transparent), transparent); transition: top 0.6s ease; pointer-events: none; }
        .dmg-card:hover .dmg-card-scan { top: 100%; }

        [data-theme="hero"] .dmg-card { clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%); box-shadow: 4px 4px 0 var(--accent3); border-width: 2px; }
        [data-theme="hero"] .dmg-display { text-shadow: 2px 2px 0 color-mix(in srgb, var(--accent3) 60%, transparent); }

        [data-theme="glam"] .dmg-card { box-shadow: 0 10px 30px color-mix(in srgb, var(--accent1) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.12); }

        .dmg-chip { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border); color: var(--text-muted); }
        .dmg-chip-a1 { color: var(--accent1); border-color: var(--accent1); background: var(--bg-panel-2); }
        .dmg-chip-a2 { color: var(--accent2); border-color: var(--accent2); background: var(--bg-panel-2); }
        .dmg-chip-a3 { color: var(--accent3); border-color: var(--accent3); background: var(--bg-panel-2); }

        .dmg-play-btn { border: 1px solid var(--accent2); color: var(--accent2); border-radius: var(--radius-btn); transition: background 0.2s ease, transform 0.15s ease; }
        .dmg-play-btn:hover { background: var(--bg-panel-2); }
        .dmg-play-btn.pulse { animation: dmgPulse 0.4s ease; }
        @keyframes dmgPulse { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }

        .dmg-locked { opacity: 0.55; }

        .dmg-chip-drag { cursor: grab; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius-card); transition: border-color 0.2s ease, transform 0.15s ease; }
        .dmg-chip-drag:active { cursor: grabbing; }
        .dmg-chip-drag:hover { border-color: var(--accent1); transform: translateY(-2px); }

        .dmg-dropzone { border: 1.5px dashed var(--border); border-radius: var(--radius-card); transition: border-color 0.2s ease, background 0.2s ease; }
        .dmg-dropzone.over { border-color: var(--accent1); background: var(--bg-panel-2); }

        .dmg-footer { border-top: 1px solid var(--border); background: var(--bg-panel); }

        .dmg-hero-title { font-size: clamp(2.4rem, 5vw + 1.2rem, 4.75rem); line-height: 1.03; }
      `}</style>

      <div ref={dotRef} className="dmg-cursor-dot"><span className="dmg-cursor-shape" /></div>
      <div ref={ringRef} className="dmg-cursor-ring"><span className="dmg-cursor-ring-shape" /></div>

      {/* ---------------- HEADER ---------------- */}
      <header ref={headerRef as React.RefObject<HTMLElement>} className="dmg-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent1), var(--accent2))" }}>
              <Dumbbell size={18} color="var(--bg)" strokeWidth={2.5} />
            </div>
            <span className="dmg-display text-xl tracking-wide hidden sm:inline">DEV MIND GYM</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="dmg-nav-link">{link.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="dmg-theme-switch">
              {(Object.entries(THEMES) as [ThemeKey, Theme][]).map(([key, t]) => {
                const Icon = t.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key)}
                    className={`dmg-theme-btn ${themeKey === key ? "active" : ""}`}
                    aria-pressed={themeKey === key}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <a href="#floor" className="dmg-btn-primary px-5 py-2.5 text-sm hidden md:inline-block">Start a Workout</a>

            <button className="lg:hidden" style={{ color: "var(--text)" }} onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden px-6 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: "var(--border)" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="dmg-nav-link py-1" onClick={() => setMenuOpen(false)}>{link.label}</a>
            ))}
            <a href="#floor" className="dmg-btn-primary px-4 py-2.5 text-sm text-center mt-1">Start a Workout</a>
          </div>
        )}
      </header>
      <div style={{ height: headerHeight }} aria-hidden="true" />

      {/* ---------------- HERO ---------------- */}
      <section id="home" className="relative px-6 pt-14 pb-16 md:pt-20 md:pb-24 dmg-hero-grid">
        <div ref={threeMountRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.9 }} />

        <div className="max-w-5xl mx-auto text-center relative">
          <p className="dmg-eyebrow mb-5">{theme.eyebrow}</p>
          <h1 className="dmg-hero-title dmg-display mb-6">
            {theme.heroTitle[0]}<br />{theme.heroTitle[1]}
          </h1>
          <p className="text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto px-2" style={{ color: "var(--text-muted)" }}>{theme.heroSub}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a href="#floor" className="dmg-btn-primary px-7 py-3.5 text-base flex items-center gap-2">Start a Workout <ArrowRight size={16} /></a>
            <a href="#session" className="dmg-btn-ghost px-7 py-3.5 text-base">Build Your Session</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Exercises on the floor", value: "07" },
              { label: "Sign-ups required", value: "00" },
              { label: "Runs locally, always", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="dmg-stat-card px-4 py-4">
                <div className="dmg-mono text-2xl font-semibold" style={{ color: "var(--accent2)" }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- THE FLOOR (games grid) ---------------- */}
      <section id="floor" className="px-6 py-14 md:py-20 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="dmg-eyebrow mb-2">Set 01 — Core Games</p>
            <h2 className="dmg-display text-3xl md:text-4xl">THE WORKOUT FLOOR</h2>
          </div>
          <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
            Every station trains a different muscle. Pick one, or drag a few into a full session below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {GAMES.map((game, i) => {
            const Icon = game.icon;
            return (
              <Reveal key={game.id} delay={i * 70}>
                <TiltCard className="dmg-card p-6 flex flex-col h-full">
                  <div className="dmg-card-scan" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="dmg-icon-badge w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                      <Icon size={20} color="var(--accent2)" />
                    </div>
                    <span className={`dmg-chip dmg-chip-${game.levelColor}`}>{game.level}</span>
                  </div>
                  <h3 className="dmg-display text-2xl mb-1">{game.name}</h3>
                  <p className="dmg-eyebrow mb-3" style={{ color: "var(--accent1)" }}>{game.tag}</p>
                  <p className="text-sm mb-6 flex-1" style={{ color: "var(--text-muted)" }}>{game.desc}</p>
                  <button onClick={() => handlePlay(game.id)} className={`dmg-play-btn px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${pulseId === game.id ? "pulse" : ""}`}>
                    <Play size={14} /> Play
                  </button>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- BUILD YOUR SESSION (drag & drop) ---------------- */}
      <section id="session" className="px-6 py-14 md:py-20 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="dmg-eyebrow mb-2">Set 02 — Build Your Session</p>
          <h2 className="dmg-display text-3xl md:text-4xl mb-3">DRAG EQUIPMENT INTO TODAY'S WORKOUT</h2>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-muted)" }}>
            Grab a game below and drop it into your session tray. Stack a few to plan a full workout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-wrap gap-3 content-start">
            {GAMES.map((game) => {
              const Icon = game.icon;
              const already = session.find((s) => s.id === game.id);
              return (
                <div key={game.id} draggable={!already} onDragStart={(e) => handleDragStart(e, game.id)} className={`dmg-chip-drag px-4 py-3 flex items-center gap-2 ${already ? "dmg-locked" : ""}`}>
                  <GripVertical size={14} color="var(--text-muted)" />
                  <Icon size={16} color="var(--accent1)" />
                  <span className="text-sm">{game.name}</span>
                </div>
              );
            })}
          </div>

          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`lg:col-span-3 dmg-dropzone p-6 min-h-[220px] ${dragOverZone ? "over" : ""}`}>
            <p className="dmg-eyebrow mb-4">Today's Session ({session.length})</p>
            {session.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center py-10">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Drop games here to build today's workout plan.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {session.map((game, i) => {
                  const Icon = game.icon;
                  return (
                    <div key={game.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "var(--bg-panel-2)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-3">
                        <span className="dmg-mono text-xs" style={{ color: "var(--accent1)" }}>{String(i + 1).padStart(2, "0")}</span>
                        <Icon size={16} color="var(--accent2)" />
                        <span className="text-sm">{game.name}</span>
                      </div>
                      <button onClick={() => removeFromSession(game.id)} aria-label={`Remove ${game.name}`} style={{ color: "var(--text-muted)" }}>
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- COMING SOON ---------------- */}
      <section id="about" className="px-6 py-14 md:py-20 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="dmg-eyebrow mb-2">Set 03 — Coming To The Floor</p>
          <h2 className="dmg-display text-3xl md:text-4xl">NEW EQUIPMENT ON THE WAY</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {COMING_SOON.map((game, i) => {
            const Icon = game.icon;
            return (
              <Reveal key={game.id} delay={i * 70}>
                <div className="dmg-card dmg-locked p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                      <Icon size={20} color="var(--text-muted)" />
                    </div>
                    <Lock size={14} color="var(--text-muted)" />
                  </div>
                  <h3 className="dmg-display text-xl mb-2">{game.name}</h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{game.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="dmg-footer px-6 pt-14 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent1), var(--accent2))" }}>
                <Dumbbell size={16} color="var(--bg)" strokeWidth={2.5} />
              </div>
              <span className="dmg-display text-lg">DEV MIND GYM</span>
            </div>
            <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>
              A no-login gym for developer brains. Logic, memory, speed and focus, trained in short daily reps — entirely in your browser.
            </p>
            <div className="flex items-center gap-2 mt-4 dmg-mono text-xs" style={{ color: "var(--accent1)" }}>
              <Flame size={14} /> {theme.footerTag}
            </div>
          </div>

          <div>
            <p className="dmg-eyebrow mb-4">The Floor</p>
            <ul className="flex flex-col gap-2">
              {GAMES.slice(0, 5).map((g) => (
                <li key={g.id}><a href="#floor" className="dmg-nav-link text-sm">{g.name}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="dmg-eyebrow mb-4">Gym</p>
            <ul className="flex flex-col gap-2">
              <li><a href="#session" className="dmg-nav-link text-sm">Build a Session</a></li>
              <li><a href="#about" className="dmg-nav-link text-sm">Coming Soon</a></li>
              <li><a href="#home" className="dmg-nav-link text-sm">Back to Top</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Dev Mind Gym. All reps reserved.</span>
          <span className="dmg-mono">No login · No tracking · Runs locally</span>
        </div>
      </footer>
    </div>
  );
}

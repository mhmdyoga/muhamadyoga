/* eslint-disable react-hooks/refs */
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════════
   TECH STACK — planet, bulan & asteroid (hitam-putih, gaya doodle)
   Roket terbang menyusuri tata surya kecil: tahan → untuk maju, ←
   untuk mundur. Tiap planet = satu kelompok tech stack; mendekat
   = tiap teknologinya muncul sebagai BULAN yang mengorbit.
   Asteroid melayang acak: tabrak dengan roket atau klik/ketuk untuk
   menyentilnya.

   DESIGN CONTRACT
   - Aksi utama: terbang → masuk orbit tiap planet → baca bulan-bulannya
     → lewati gerbang finish. Asteroid = selingan interaktif.
   - Token: HANYA ink #1a1a1a di atas putih (sama dengan section atas).
     Garis tebal, bayangan offset, arsiran tangan — tanpa warna.
   - State: belum mulai (petunjuk), terbang, orbit, tabrakan, finish,
     reduced-motion (bulan & asteroid diam, tanpa garis warp/ayunan),
     sentuh (tombol tahan, ketuk asteroid), HP (orbit lebih kecil),
     pembaca layar (daftar lengkap).
   ══════════════════════════════════════════════════════════════════ */

const INK = "#1a1a1a";
const WHITE = "#ffffff";

// ── Dunia (1 dimensi, satuan = piksel layar) ───────────────────────
const LEN = 6800; // panjang perjalanan
const GATE_X = 6600; // gerbang finish
const MAX_SPEED = 1000; // satuan per detik
const ORBIT_R = 260; // jarak agar planet dianggap "orbit"

type Kind = "ring" | "bands" | "cap" | "craters";
type StopDef = { title: string; sub: string; items: string[]; x: number; kind: Kind };

const STOPS: StopDef[] = [
  {
    title: "Frontend",
    sub: "Antarmuka & animasi",
    items: ["Next.js / React", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP"],
    x: 1200,
    kind: "ring",
  },
  {
    title: "Backend",
    sub: "API & server",
    items: ["Node.js", "Express.js", "Golang", "Gin"],
    x: 2700,
    kind: "bands",
  },
  {
    title: "Database",
    sub: "Data & ORM",
    items: ["PostgreSQL / MySQL", "Prisma", "GORM", "Redis"],
    x: 4200,
    kind: "cap",
  },
  {
    title: "Tools & Mobile",
    sub: "Pengiriman, pembayaran, mobile",
    items: ["Docker", "Git", "Midtrans Snap / Core API", "Kotlin"],
    x: 5700,
    kind: "craters",
  },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const pad = (n: number) => String(n).padStart(2, "0");
const smooth = (t: number) => t * t * (3 - 2 * t);
const labelW = (t: string) => Math.round(t.length * 6.6 + 18); // lebar kira-kira label bulan

// ── Garis tangan: lingkaran yang sedikit goyang & tidak menutup rapi ──
const seeded = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const handCircle = (r: number, seed: number, wob = 0.035) => {
  const rn = seeded(seed);
  const n = 28;
  const start = rn() * Math.PI * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n + 2; i++) {
    const a = start + (i / n) * Math.PI * 2;
    const rr = r * (1 + (rn() - 0.5) * 2 * wob);
    pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  const f = (v: number) => v.toFixed(1);
  const mid = (a: [number, number], b: [number, number]) => `${f((a[0] + b[0]) / 2)} ${f((a[1] + b[1]) / 2)}`;
  let d = `M ${mid(pts[0], pts[1])}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q ${f(pts[i][0])} ${f(pts[i][1])} ${mid(pts[i], pts[i + 1])}`;
  return d;
};
const PLANET_OUT = STOPS.map((_, i) => [handCircle(60, i * 7 + 3), handCircle(60, i * 7 + 11, 0.05)]);

// ── Asteroid: bentuk batu bersudut + kawah, dibuat deterministik ───
const ROCK_SIZES = [16, 24, 14, 30, 20, 26, 15, 22, 18];
const ROCKS = ROCK_SIZES.map((r, i) => {
  const rn = seeded(500 + i * 37);
  const n = 9;
  const pts = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const rr = r * (0.76 + rn() * 0.36);
    return `${(rr * Math.cos(a)).toFixed(1)} ${(rr * Math.sin(a)).toFixed(1)}`;
  });
  const craters = Array.from({ length: 2 }, () => {
    const a = rn() * Math.PI * 2;
    return { x: Math.cos(a) * r * 0.36, y: Math.sin(a) * r * 0.36, r: r * (0.12 + rn() * 0.1) };
  });
  return { r, d: `M ${pts.join(" L ")} Z`, craters };
});

// ── Bintang latar (deterministik; kedalaman → kecepatan paralaks) ──
const STARS = (() => {
  const rnd = seeded(31);
  return Array.from({ length: 170 }, () => {
    const d = rnd();
    return { x: rnd(), y: rnd(), f: 0.06 + d * 0.5, r: 0.6 + d * 1.5, a: 0.18 + d * 0.5, plus: d > 0.72 };
  });
})();

// planet garis jauh (dekor, paralaks 0.2) — acuan tinggi 600
const DECOR = [
  { x: 560, y: 470, r: 70, ring: true },
  { x: 1500, y: 130, r: 100, ring: false },
  { x: 2250, y: 470, r: 54, ring: false },
  { x: 2800, y: 150, r: 80, ring: true },
];

// ── Tombol kemudi (juga untuk layar sentuh) ────────────────────────
type Handlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onLostPointerCapture: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
};

function DriveButton({
  label,
  arrow,
  pressed,
  hint,
  handlers,
}: {
  label: string;
  arrow: "left" | "right";
  pressed: boolean;
  hint: string;
  handlers: Handlers;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} (${hint}). Tahan untuk bergerak.`}
      aria-pressed={pressed}
      {...handlers}
      className="inline-flex min-w-[8.5rem] select-none items-center justify-center gap-2.5 rounded-full border-[3px] border-[#1a1a1a] px-5 py-2.5 text-xs font-black uppercase tracking-widest outline-offset-4 transition-[transform,box-shadow,background-color,color] duration-100 focus-visible:outline-2 focus-visible:outline-[#1a1a1a]"
      style={{
        background: pressed ? INK : WHITE,
        color: pressed ? WHITE : INK,
        boxShadow: pressed ? "0 0 0 #1a1a1a" : "3px 3px 0 #1a1a1a",
        transform: pressed ? "translate(3px, 3px)" : "none",
        touchAction: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
    >
      {arrow === "left" && <Kbd>←</Kbd>}
      <span>{label}</span>
      {arrow === "right" && <Kbd>→</Kbd>}
    </button>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid h-6 min-w-6 place-items-center rounded border-2 border-[#1a1a1a] bg-white px-1.5 font-mono text-xs font-black leading-none text-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a]"
    >
      {children}
    </span>
  );
}

// ── Roket (menghadap ATAS di gambar; diputar 90° agar menghadap kanan) ──
function Rocket({
  flameRef,
  retroRef,
}: {
  flameRef: React.RefObject<SVGGElement | null>;
  retroRef: React.RefObject<SVGGElement | null>;
}) {
  return (
    <svg
      viewBox="0 0 24 44"
      width="100%"
      height="100%"
      fill="none"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      overflow="visible"
    >
      <g ref={flameRef} style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}>
        <path d="M8.5 28 Q12 42 15.5 28 Z" fill={WHITE} />
        <path d="M10.6 28 Q12 35 13.4 28" />
        <path d="M12 29 V33" />
      </g>
      <g ref={retroRef} opacity={0}>
        <path d="M9.5 6 Q4 2 6 -4 Q9 0 10.5 3 Z" fill={WHITE} />
        <path d="M14.5 6 Q20 2 18 -4 Q15 0 13.5 3 Z" fill={WHITE} />
      </g>
      <path d="M8 21 L3 30 L8 28 Z" fill={WHITE} />
      <path d="M16 21 L21 30 L16 28 Z" fill={WHITE} />
      <path d="M12 2 C16 8 17 17 16 28 L8 28 C7 17 8 8 12 2 Z" fill={WHITE} />
      <circle cx="12" cy="14" r="2.4" fill={INK} />
    </svg>
  );
}

// ── Planet gaya doodle (koordinat lokal, jari-jari 60) ─────────────
function PlanetArt({
  idx,
  def,
  clipId,
  maskId,
  artRef,
  haloRef,
}: {
  idx: number;
  def: StopDef;
  clipId: string;
  maskId: string;
  artRef: (el: SVGGElement | null) => void;
  haloRef: (el: SVGCircleElement | null) => void;
}) {
  return (
    <g ref={artRef} fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
      <circle ref={haloRef} r={78} strokeWidth={2} strokeDasharray="3 8" opacity={0} />
      {def.kind === "ring" && (
        <g transform="rotate(-14)" strokeWidth={2.6}>
          <path d="M -112 0 A 112 26 0 0 1 112 0" />
          <path d="M -92 0 A 92 21 0 0 1 92 0" />
        </g>
      )}
      <circle r={60} fill={WHITE} stroke="none" />
      {/* arsiran sisi bayangan */}
      <g clipPath={`url(#${clipId})`}>
        <g mask={`url(#${maskId})`} strokeWidth={1.7} opacity={0.6}>
          {Array.from({ length: 15 }, (_, k) => (
            <line key={k} x1={-70 + k * 10} y1={70} x2={k * 10} y2={-70 + 0} />
          ))}
        </g>
        {def.kind === "bands" &&
          [-32, -10, 14, 38].map((y) => (
            <path key={y} d={`M -62 ${y} q 20 -7 40 0 t 40 0 t 40 0`} strokeWidth={2.4} />
          ))}
        {def.kind === "cap" && (
          <>
            <path d="M -44 -40 Q 0 -56 44 -40" strokeWidth={2.4} />
            {[
              [-20, -8], [10, -14], [28, 6], [-6, 14], [-30, 20], [16, 30], [0, 40], [-14, -28],
            ].map(([cx, cy]) => (
              <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={1.9} fill={INK} stroke="none" />
            ))}
          </>
        )}
        {def.kind === "craters" &&
          [
            [-22, -14, 11],
            [20, 8, 15],
            [-8, 30, 9],
            [28, -30, 7],
          ].map(([cx, cy, r]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} strokeWidth={2.2} fill={WHITE} />)}
      </g>
      {/* kilau */}
      <path d="M -38 -34 A 50 50 0 0 1 -8 -52" strokeWidth={3} opacity={0.7} />
      {/* garis tepi: dua kali, agak meleset — kesan digambar tangan */}
      <path d={PLANET_OUT[idx][0]} strokeWidth={3.4} />
      <path d={PLANET_OUT[idx][1]} strokeWidth={1.4} opacity={0.55} />
      {def.kind === "ring" && (
        <g transform="rotate(-14)" strokeWidth={2.6}>
          <path d="M -112 0 A 112 26 0 0 0 112 0" />
          <path d="M -92 0 A 92 21 0 0 0 92 0" />
        </g>
      )}
    </g>
  );
}

type MoonEl = { g?: SVGGElement | null; c?: SVGCircleElement | null; l?: SVGGElement | null };
type Rock = {
  x: number;
  yf: number;
  vx: number;
  vy: number;
  h: number;
  s0: number;
  rot: number;
  spin: number;
  spin0: number;
  cd: number;
  sx: number;
  sy: number;
  vis: boolean;
};

// ═══════════════════════════════════════════════════════════════════
export default function TechStackPlanets() {
  const uid = useId().replace(/:/g, "");
  const reduce = !!useReducedMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const decorRef = useRef<SVGGElement>(null);
  const gateRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGGElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<SVGGElement>(null);
  const retroRef = useRef<SVGGElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const bonkRef = useRef<HTMLSpanElement>(null);

  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const artRefs = useRef<(SVGGElement | null)[]>([]);
  const haloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const orbitRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const nameRefs = useRef<(SVGGElement | null)[]>([]);
  const moonRefs = useRef<MoonEl[][]>(STOPS.map(() => []));
  const rockG = useRef<(SVGGElement | null)[]>([]);
  const rockR = useRef<(SVGGElement | null)[]>([]);
  const rocksRef = useRef<Rock[]>([]);

  const input = useRef({ f: false, b: false }); // f = maju (→), b = mundur (←)
  const visibleRef = useRef(false);

  const [held, setHeld] = useState<"f" | "b" | null>(null);
  const [started, setStarted] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(-1);
  const [shown, setShown] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);

  const press = useCallback((k: "f" | "b", down: boolean) => {
    input.current[k] = down;
    if (down) setStarted(true);
    const { f, b } = input.current;
    setHeld(f && !b ? "f" : b && !f ? "b" : null);
  }, []);

  // sentil asteroid dari titik klik/ketuk
  const flick = (i: number) => (e: ReactPointerEvent<SVGGElement>) => {
    const r = rocksRef.current[i];
    const svg = svgRef.current;
    if (!r || !svg || reduceRef.current) return;
    const b = svg.getBoundingClientRect();
    let nx = r.sx - (e.clientX - b.left);
    let ny = r.sy - (e.clientY - b.top);
    const d = Math.hypot(nx, ny) || 1;
    nx /= d;
    ny /= d;
    r.vx = nx * 380;
    r.vy = ny * 380;
    r.spin = (nx >= 0 ? 1 : -1) * (300 + Math.random() * 200);
  };

  // ── keyboard: → maju, ← mundur ──
  useEffect(() => {
    const editable = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el || !el.tagName) return false;
      return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
    };

    // fase capture + stopPropagation: saat papan terlihat, panah kiri/kanan
    // tidak ikut mengganti project di ProjectsSection.
    const onDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (editable(e.target) || !visibleRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      press(e.key === "ArrowRight" ? "f" : "b", true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") press("f", false);
      if (e.key === "ArrowLeft") press("b", false);
    };
    const release = () => {
      press("f", false);
      press("b", false);
    };

    window.addEventListener("keydown", onDown, true);
    window.addEventListener("keyup", onUp, true);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", onDown, true);
      window.removeEventListener("keyup", onUp, true);
      window.removeEventListener("blur", release);
    };
  }, [press]);

  // ── loop permainan ──
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.intersectionRatio >= 0.4;
      },
      { threshold: [0, 0.4, 1] }
    );
    io.observe(wrap);

    // asteroid: posisi awal deterministik, geraknya acak
    const rn = seeded(97);
    rocksRef.current = ROCKS.map((_, i) => {
      const spin0 = (rn() - 0.5) * 50;
      return {
        x: 450 + (i / ROCKS.length) * (LEN - 900) + rn() * 250,
        yf: 0.2 + rn() * 0.68,
        vx: 0,
        vy: 0,
        h: rn() * Math.PI * 2,
        s0: 18 + rn() * 34,
        rot: rn() * 360,
        spin: spin0,
        spin0,
        cd: 0,
        sx: 0,
        sy: 0,
        vis: true,
      };
    });

    const TILT = (-10 * Math.PI) / 180;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    let pos = 0;
    let vel = 0;
    let first = true;
    let activeIdx = -1;
    let end = false;
    let lastSpeedTxt = "";
    let t = 0;
    let bump = 0; // sisa waktu efek tabrakan
    let bx = 0;
    let by = 0;
    let bonks = 0;
    let last = performance.now();
    let raf = 0;
    const act = STOPS.map(() => 0);
    const planetVis = STOPS.map(() => true);
    const moonVis = STOPS.map(() => true);
    let gateVis = true;
    const BUMP_T = 0.6;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visibleRef.current && !first) return;
      t += dt;
      const calm = reduceRef.current;

      // tata letak: HP vs desktop
      const compact = W < 640;
      const rx = W * (compact ? 0.5 : 0.34);
      const ry0 = H * (compact ? 0.87 : 0.8);
      const sy = H * (compact ? 0.44 : 0.4);
      const R = compact ? Math.min(H * 0.11, 50) : Math.min(H * 0.15, 86);
      const OX = compact ? Math.min(W * 0.36, 135) : Math.min(W * 0.2, 230);
      const OY = compact ? 92 : Math.min(H * 0.2, 130);

      // gas / rem; dekat planet kecepatan maksimum menurun ("gravitasi")
      let nearest = Infinity;
      for (const s of STOPS) nearest = Math.min(nearest, Math.abs(pos - s.x));
      const k = clamp(nearest / (ORBIT_R * 1.6), 0, 1);
      const grav = 0.38 + 0.62 * smooth(k);
      const dir = (input.current.f ? 1 : 0) - (input.current.b ? 1 : 0);
      vel += (dir * MAX_SPEED * grav - vel) * (1 - Math.exp(-dt * (dir ? 2.4 : 5)));
      if (!dir && Math.abs(vel) < 1) vel = 0;
      pos = clamp(pos + vel * dt, 0, LEN);
      if ((pos === 0 && vel < 0) || (pos === LEN && vel > 0)) vel = 0;
      const inten = Math.abs(vel) / MAX_SPEED;

      // ── bintang (tinta di atas kertas) + garis warp ──
      ctx.clearRect(0, 0, W, H);
      const tile = W + 240;
      const streak = calm ? 0 : (vel / MAX_SPEED) * 260;
      ctx.lineCap = "round";
      ctx.strokeStyle = INK;
      ctx.fillStyle = INK;
      for (const s of STARS) {
        const sx = ((((s.x * tile - pos * s.f - (calm ? 0 : t * 7 * s.f)) % tile) + tile) % tile) - 120;
        const syy = s.y * H;
        ctx.globalAlpha = s.a;
        const dx = streak * s.f;
        if (Math.abs(dx) > 2) {
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(sx, syy);
          ctx.lineTo(sx + dx, syy);
          ctx.stroke();
        } else if (s.plus) {
          const L = s.r * 2.6;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(sx - L, syy);
          ctx.lineTo(sx + L, syy);
          ctx.moveTo(sx, syy - L);
          ctx.lineTo(sx, syy + L);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx, syy, s.r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      const decor = decorRef.current;
      if (decor) decor.setAttribute("transform", `translate(${(-pos * 0.2).toFixed(1)} 0) scale(${(H / 600).toFixed(3)})`);

      // ── roket: meliuk pelan mengikuti jalur ──
      const amp = calm ? 0 : H * 0.04;
      const wave = Math.sin(pos / 420);
      const slope = (amp * Math.cos(pos / 420)) / 420;
      const bob = calm ? 0 : Math.sin(t * 1.7) * 3 * (1 - inten);
      const tilt = calm ? 0 : (Math.atan(slope * 6) * 180) / Math.PI;
      const shake = bump > 0 && !calm ? Math.sin(t * 60) * 12 * (bump / BUMP_T) : 0;
      const rky = ry0 + wave * amp + bob;
      const rocket = rocketRef.current;
      if (rocket) {
        rocket.style.transform = `translate3d(${(rx - 14).toFixed(1)}px, ${(rky - 26).toFixed(1)}px, 0) rotate(${(90 + tilt + shake).toFixed(2)}deg)`;
      }
      const flame = flameRef.current;
      if (flame) {
        const fwd = Math.max(0, vel / MAX_SPEED);
        const flick = calm ? 0 : Math.sin(t * 38) * 0.1;
        flame.style.transform = `scaleY(${(0.55 + fwd * 2.3 + flick).toFixed(3)})`;
      }
      retroRef.current?.setAttribute("opacity", Math.max(0, -vel / MAX_SPEED).toFixed(2));
      const warp = warpRef.current;
      if (warp) warp.style.opacity = calm ? "0" : (Math.pow(inten, 1.3) * 0.9).toFixed(3);

      // ── asteroid: melayang acak, memantul dari tepi, dan bisa ditabrak ──
      const rocks = rocksRef.current;
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        const def = ROCKS[i];
        if (!calm) {
          rk.h += (Math.random() - 0.5) * dt * 3;
          const wx = Math.cos(rk.h) * rk.s0;
          const wy = Math.sin(rk.h) * rk.s0;
          const kk = 1 - Math.exp(-dt * 0.9);
          rk.vx += (wx - rk.vx) * kk;
          rk.vy += (wy - rk.vy) * kk;
          rk.spin += (rk.spin0 - rk.spin) * (1 - Math.exp(-dt * 1.2));
          rk.x += rk.vx * dt;
          rk.yf += (rk.vy * dt) / H;
          rk.rot += rk.spin * dt;
          if (rk.x < -300 || rk.x > LEN + 300) {
            rk.vx = -rk.vx;
            rk.h = Math.PI - rk.h;
            rk.x = clamp(rk.x, -300, LEN + 300);
          }
          if (rk.yf < 0.16 || rk.yf > 0.92) {
            rk.vy = -rk.vy;
            rk.h = -rk.h;
            rk.yf = clamp(rk.yf, 0.16, 0.92);
          }
        }
        rk.cd = Math.max(0, rk.cd - dt);

        rk.sx = rx + (rk.x - pos);
        rk.sy = rk.yf * H;
        const on = rk.sx > -80 && rk.sx < W + 80;
        const g = rockG.current[i];
        if (on !== rk.vis && g) {
          g.setAttribute("display", on ? "inline" : "none");
          rk.vis = on;
        }
        if (!on || !g) continue;
        g.setAttribute("transform", `translate(${rk.sx.toFixed(1)} ${rk.sy.toFixed(1)})`);
        rockR.current[i]?.setAttribute("transform", `rotate(${rk.rot.toFixed(1)})`);

        // tabrakan dengan roket
        if (!calm && rk.cd === 0) {
          const ddx = rk.sx - rx;
          const ddy = rk.sy - rky;
          const d = Math.hypot(ddx, ddy);
          if (d < def.r * 0.85 + 15) {
            const nx = ddx / (d || 1);
            const ny = ddy / (d || 1);
            rk.vx = nx * 240 + vel * 0.7;
            rk.vy = ny * 240;
            rk.spin = (nx >= 0 ? 1 : -1) * (260 + Math.random() * 260);
            rk.cd = 0.8;
            vel *= 0.5;
            bump = BUMP_T;
            bx = rx + nx * 16;
            by = rky + ny * 16;
            bonks += 1;
            if (bonkRef.current) bonkRef.current.textContent = `TAK ×${bonks}`;
          }
        }
      }

      // efek "tak!" saat tabrakan
      const burst = burstRef.current;
      if (burst) {
        if (bump > 0) {
          bump = Math.max(0, bump - dt);
          const p = 1 - bump / BUMP_T;
          burst.setAttribute("display", "inline");
          burst.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${(0.6 + p * 0.9).toFixed(2)})`);
          burst.setAttribute("opacity", (1 - p).toFixed(2));
        } else if (burst.getAttribute("display") !== "none") {
          burst.setAttribute("display", "none");
        }
      }

      // ── planet + bulan ──
      let idx = -1;
      let best = ORBIT_R;
      for (let i = 0; i < STOPS.length; i++) {
        const d = Math.abs(pos - STOPS[i].x);
        if (d < best) {
          best = d;
          idx = i;
        }
      }

      for (let i = 0; i < STOPS.length; i++) {
        const g = groupRefs.current[i];
        if (!g) continue;
        const px = rx + (STOPS[i].x - pos);
        const on = px > -(OX + 200) && px < W + OX + 200;
        if (on !== planetVis[i]) {
          g.setAttribute("display", on ? "inline" : "none");
          planetVis[i] = on;
        }
        const moons = moonRefs.current[i];
        if (!on) {
          if (moonVis[i]) {
            moons.forEach((m) => m.g?.setAttribute("display", "none"));
            moonVis[i] = false;
          }
          continue;
        }

        act[i] += ((idx === i ? 1 : 0) - act[i]) * (1 - Math.exp(-dt * 5));
        const a = act[i];
        const e = smooth(clamp(a, 0, 1));
        const sc = (R / 60) * (1 + 0.14 * a);

        g.setAttribute("transform", `translate(${px.toFixed(1)} ${sy.toFixed(1)})`);
        artRefs.current[i]?.setAttribute("transform", `scale(${sc.toFixed(3)})`);
        haloRefs.current[i]?.setAttribute("opacity", (a * 0.8).toFixed(2));
        const nm = nameRefs.current[i];
        if (nm) {
          nm.setAttribute("transform", `translate(0 ${(R * 1.2 + 30).toFixed(1)})`);
          nm.setAttribute("opacity", ((1 - clamp(a * 1.6, 0, 1)) * 0.85).toFixed(2));
        }
        const orb = orbitRefs.current[i];
        if (orb) {
          orb.setAttribute("rx", (OX * e).toFixed(1));
          orb.setAttribute("ry", (OY * e).toFixed(1));
          orb.setAttribute("opacity", (e * 0.5).toFixed(2));
        }

        // bulan
        const show = a > 0.012;
        if (show !== moonVis[i]) {
          moons.forEach((m) => m.g?.setAttribute("display", show ? "inline" : "none"));
          moonVis[i] = show;
        }
        if (show) {
          const n = moons.length;
          for (let j = 0; j < n; j++) {
            const m = moons[j];
            if (!m.g || !m.c || !m.l) continue;
            const th = (j / n) * Math.PI * 2 + i * 1.3 + (calm ? 0 : t * 0.5);
            const ex = OX * Math.cos(th) * e;
            const ey = OY * Math.sin(th) * e;
            const mx = px + ex * cosT - ey * sinT;
            const my = sy + ex * sinT + ey * cosT;
            const depth = (Math.sin(th) + 1) / 2; // 1 = di depan planet
            const rr = (compact ? 5.5 : 7) + depth * (compact ? 2.5 : 3.5);
            // bulan di belakang planet disamarkan saat tertutup
            const hidden = depth < 0.5 && Math.hypot(mx - px, my - sy) < R * (1 + 0.14 * a) + rr;
            const baseOp = (0.65 + 0.35 * depth) * (hidden ? 0.12 : 1) * clamp(a * 3, 0, 1);

            m.g.setAttribute("transform", `translate(${mx.toFixed(1)} ${my.toFixed(1)})`);
            m.g.setAttribute("opacity", baseOp.toFixed(2));
            m.c.setAttribute("r", rr.toFixed(1));

            // label tetap di dalam layar
            const half = labelW(STOPS[i].items[j]) / 2 + 6;
            const lx = clamp(mx, half, W - half) - mx;
            m.l.setAttribute("transform", `translate(${lx.toFixed(1)} ${(rr + 16).toFixed(1)})`);
            m.l.setAttribute("opacity", clamp((a - 0.5) / 0.4, 0, 1).toFixed(2));
          }
        }
      }

      // gerbang finish
      const gate = gateRef.current;
      if (gate) {
        const gx = rx + (GATE_X - pos);
        const on = gx > -120 && gx < W + 120;
        if (on !== gateVis) {
          gate.setAttribute("display", on ? "inline" : "none");
          gateVis = on;
        }
        if (on) gate.setAttribute("transform", `translate(${gx.toFixed(1)} ${ry0.toFixed(1)})`);
      }

      // ── HUD ──
      const pct = (pos / LEN) * 100;
      if (shipRef.current) shipRef.current.style.left = `${pct.toFixed(2)}%`;
      if (fillRef.current) fillRef.current.style.width = `${pct.toFixed(2)}%`;
      const txt = `WARP ${(inten * 9.9).toFixed(1)}c`;
      if (speedRef.current && txt !== lastSpeedTxt) {
        speedRef.current.textContent = txt;
        lastSpeedTxt = txt;
      }

      // ── state React (hanya saat berubah) ──
      if (idx !== activeIdx) {
        activeIdx = idx;
        setActive(idx);
        if (idx >= 0) {
          setShown(idx);
          setVisited((v) => (v.includes(idx) ? v : [...v, idx]));
        }
      }
      const nowEnd = pos >= GATE_X;
      if (nowEnd !== end) {
        end = nowEnd;
        setAtEnd(nowEnd);
      }

      first = false;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const bind = (k: "f" | "b"): Handlers => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      press(k, true);
    },
    onPointerUp: () => press(k, false),
    onPointerCancel: () => press(k, false),
    onLostPointerCapture: () => press(k, false),
    onKeyDown: (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        press(k, true);
      }
    },
    onKeyUp: (e) => {
      if (e.key === " " || e.key === "Enter") press(k, false);
    },
    onBlur: () => press(k, false),
    onContextMenu: (e) => e.preventDefault(),
  });

  const setMoon = (i: number, j: number, key: keyof MoonEl) => (el: SVGElement | null) => {
    const row = moonRefs.current[i];
    row[j] = row[j] ?? {};
    (row[j] as Record<string, SVGElement | null | undefined>)[key] = el;
  };

  const card = STOPS[shown];
  const hintKey = !started ? "start" : atEnd ? "end" : null;

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative w-full bg-white py-16" aria-labelledby="tech-stack-title">
        {/* heading — gaya sama dengan section Projects */}
        <div className="mb-6 flex items-end justify-between gap-4 px-6 md:px-9">
          <div>
            <h2 id="tech-stack-title" className="text-2xl font-black tracking-tight text-[#1a1a1a]">
              TECH STACK.
            </h2>
            <p className="mt-0.5 text-[9px] tracking-[.15em] text-[#1a1a1a] opacity-45">FLY BY MY PLANETS</p>
          </div>
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="font-mono text-[10px] tracking-widest text-[#1a1a1a]/55">
              {visited.length} / {STOPS.length}
            </span>
            <div className="flex gap-2">
              {STOPS.map((s, i) => (
                <span
                  key={s.title}
                  className="h-2 w-2 rounded-full border-[1.5px] border-[#1a1a1a] transition-colors"
                  style={{
                    background: visited.includes(i) ? INK : "transparent",
                    boxShadow: active === i ? "0 0 0 3px rgba(26,26,26,.22)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* papan: kertas putih bertitik, gaya doodle */}
        <div
          ref={wrapRef}
          className="relative h-[clamp(480px,46vw,620px)] w-full overflow-hidden border-y-[3px] border-[#1a1a1a] bg-white"
          style={{ backgroundImage: "radial-gradient(rgba(26,26,26,.13) 1px, transparent 1.2px)", backgroundSize: "24px 24px" }}
        >
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />

          <svg ref={svgRef} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <clipPath id={`${uid}-clip`}>
                <circle r={60} />
              </clipPath>
              <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x={-70} y={-70} width={140} height={140}>
                <rect x={-70} y={-70} width={140} height={140} fill="#fff" />
                <circle cx={-16} cy={-16} r={58} fill="#000" />
              </mask>
            </defs>

            {/* planet garis jauh */}
            <g ref={decorRef} fill="none" stroke={INK} strokeOpacity={0.14} strokeWidth={1.6}>
              {DECOR.map((d, i) => (
                <g key={i} transform={`translate(${d.x} ${d.y})`}>
                  <circle r={d.r} />
                  {[-0.45, 0, 0.45].map((c) => {
                    const yy = c * d.r;
                    const hw = Math.sqrt(Math.max(0, d.r * d.r - yy * yy));
                    return <line key={c} x1={-hw} x2={hw} y1={yy} y2={yy} strokeDasharray="3 8" />;
                  })}
                  {d.ring && <ellipse rx={d.r * 1.7} ry={d.r * 0.3} transform="rotate(-16)" />}
                </g>
              ))}
            </g>

            {/* gerbang finish */}
            <g ref={gateRef}>
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  {Array.from({ length: 12 }, (_, r) => (
                    <rect
                      key={r}
                      x={sd * 30 - 6}
                      y={-120 + r * 20}
                      width={12}
                      height={20}
                      fill={r % 2 === 0 ? WHITE : INK}
                      stroke={INK}
                      strokeWidth={1.5}
                    />
                  ))}
                </g>
              ))}
              <ellipse rx={30} ry={120} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 8" />
              <text y={-134} textAnchor="middle" fontSize={11} letterSpacing="0.3em" fontWeight={800} fill={INK} style={{ fontFamily: "ui-monospace, monospace" }}>
                FINISH
              </text>
            </g>

            {/* planet */}
            {STOPS.map((s, i) => (
              <g key={s.title} ref={(el) => { groupRefs.current[i] = el; }}>
                <ellipse
                  ref={(el) => { orbitRefs.current[i] = el; }}
                  rx={0}
                  ry={0}
                  fill="none"
                  stroke={INK}
                  strokeWidth={1.6}
                  strokeDasharray="3 7"
                  opacity={0}
                  transform="rotate(-10)"
                />
                <PlanetArt
                  idx={i}
                  def={s}
                  clipId={`${uid}-clip`}
                  maskId={`${uid}-mask`}
                  artRef={(el) => { artRefs.current[i] = el; }}
                  haloRef={(el) => { haloRefs.current[i] = el; }}
                />
                <g ref={(el) => { nameRefs.current[i] = el; }}>
                  <text textAnchor="middle" y={0} fontSize={10} letterSpacing="0.25em" fontWeight={700} fill={INK} opacity={0.6} style={{ fontFamily: "ui-monospace, monospace" }}>
                    PLANET {pad(i + 1)}
                  </text>
                  <text textAnchor="middle" y={19} fontSize={15} fontWeight={900} fill={INK}>
                    {s.title}
                  </text>
                </g>
              </g>
            ))}

            {/* asteroid: melayang acak — klik/ketuk untuk menyentil */}
            {ROCKS.map((rk, i) => (
              <g
                key={i}
                ref={(el) => { rockG.current[i] = el; }}
                onPointerDown={flick(i)}
                style={{ cursor: "pointer" }}
              >
                <circle r={rk.r + 10} fill="transparent" />
                <g ref={(el) => { rockR.current[i] = el; }} fill={WHITE} stroke={INK} strokeLinejoin="round" strokeLinecap="round">
                  <path d={rk.d} strokeWidth={2.4} />
                  {rk.craters.map((c, n) => (
                    <circle key={n} cx={c.x} cy={c.y} r={c.r} strokeWidth={1.6} />
                  ))}
                  <path d={`M ${(-rk.r * 0.1).toFixed(1)} ${(rk.r * 0.55).toFixed(1)} l ${(rk.r * 0.3).toFixed(1)} ${(-rk.r * 0.14).toFixed(1)}`} strokeWidth={1.4} />
                </g>
              </g>
            ))}

            {/* bulan (koordinat layar, di atas planet & asteroid) */}
            {STOPS.map((s, i) => (
              <g key={`m-${s.title}`}>
                {s.items.map((item, j) => (
                  <g key={item} ref={setMoon(i, j, "g")} display="none" opacity={0}>
                    <circle ref={setMoon(i, j, "c")} r={7} fill={WHITE} stroke={INK} strokeWidth={2} />
                    <g ref={setMoon(i, j, "l")}>
                      <rect x={-labelW(item) / 2} y={-10} width={labelW(item)} height={20} rx={6} fill={WHITE} stroke={INK} strokeWidth={2} />
                      <text y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill={INK}>
                        {item}
                      </text>
                    </g>
                  </g>
                ))}
              </g>
            ))}

            {/* "tak!" saat roket menabrak asteroid */}
            <g ref={burstRef} display="none" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round">
              {Array.from({ length: 8 }, (_, k) => {
                const a = (k / 8) * Math.PI * 2;
                return (
                  <line
                    key={k}
                    x1={Math.cos(a) * 12}
                    y1={Math.sin(a) * 12}
                    x2={Math.cos(a) * 22}
                    y2={Math.sin(a) * 22}
                  />
                );
              })}
              <text y={-28} textAnchor="middle" fontSize={14} fontWeight={900} fill={INK} stroke="none" transform="rotate(-8)">
                tak!
              </text>
            </g>
          </svg>

          {/* roket */}
          <div ref={rocketRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[2]" style={{ width: 28, height: 52, willChange: "transform" }}>
            <Rocket flameRef={flameRef} retroRef={retroRef} />
          </div>

          {/* bayangan tepi saat ngebut */}
          <div
            ref={warpRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{ opacity: 0, background: "radial-gradient(ellipse at 34% 70%, transparent 30%, rgba(26,26,26,.1) 100%)" }}
          />

          {/* HUD: rute perjalanan */}
          <div aria-hidden className="pointer-events-none absolute left-4 right-4 top-3 z-10 sm:right-auto sm:w-[38%] sm:max-w-[420px]">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-[.2em] text-[#1a1a1a]/65">
              <span ref={speedRef}>WARP 0.0c</span>
              <span ref={bonkRef} />
              <span>
                <b className="text-[#1a1a1a]">{pad(visited.length)}</b>/{pad(STOPS.length)}
              </span>
            </div>
            <div className="relative h-4">
              <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#1a1a1a]/25" />
              <div ref={fillRef} className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-[#1a1a1a]" style={{ width: 0 }} />
              {STOPS.map((s, i) => (
                <span
                  key={s.title}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1a1a1a]"
                  style={{ left: `${(s.x / LEN) * 100}%`, background: visited.includes(i) ? INK : WHITE }}
                />
              ))}
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-[#1a1a1a]"
                style={{
                  left: `${(GATE_X / LEN) * 100}%`,
                  background: `repeating-conic-gradient(${WHITE} 0% 25%, ${INK} 0% 50%) 50% / 6px 6px`,
                }}
              />
              <div
                ref={shipRef}
                className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1a1a1a]"
                style={{ left: 0, boxShadow: `0 0 0 2px ${WHITE}` }}
              />
            </div>
          </div>

          {/* tag planet yang sedang diorbit */}
          <div className="pointer-events-none absolute left-2 right-2 top-14 z-10 sm:left-auto sm:right-4 sm:top-3 sm:w-[270px]">
            <motion.div
              key={shown}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={active >= 0 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.77, 0, 0.18, 1] }}
              className="rounded-[10px] border-[3px] border-[#1a1a1a] bg-white px-3 py-2.5 shadow-[4px_4px_0_#1a1a1a]"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[11px] font-black text-white">
                  {shown + 1}
                </span>
                <span className="text-base font-black leading-none tracking-tight text-[#1a1a1a]">{card.title}</span>
                <span className="ml-auto rounded border-[1.5px] border-[#1a1a1a] px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-[#1a1a1a]">
                  {card.items.length} BULAN
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[.15em] text-[#1a1a1a]/55">{card.sub}</p>
            </motion.div>
          </div>

          {/* petunjuk awal / finish */}
          <div className="pointer-events-none absolute inset-x-3 bottom-4 z-10 flex justify-center">
            <AnimatePresence mode="wait">
              {hintKey && (
                <motion.div
                  key={hintKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border-[3px] border-[#1a1a1a] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] sm:text-[11px]"
                >
                  {hintKey === "start" ? (
                    <>
                      <span>Tahan</span>
                      <Kbd>→</Kbd>
                      <span>untuk maju · ketuk asteroid untuk menyentil</span>
                    </>
                  ) : (
                    <>
                      <span>Misi selesai! Tekan</span>
                      <Kbd>←</Kbd>
                      <span>untuk mundur</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* kemudi — keyboard atau tahan tombol */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 px-6">
          <DriveButton label="Mundur" arrow="left" hint="panah kiri" pressed={held === "b"} handlers={bind("b")} />
          <DriveButton label="Maju" arrow="right" hint="panah kanan" pressed={held === "f"} handlers={bind("f")} />
        </div>

        {/* pembaca layar: seluruh isi tanpa harus menyetir */}
        <div className="sr-only">
          <p aria-live="polite">{active >= 0 ? `${STOPS[active].title}: ${STOPS[active].items.join(", ")}` : ""}</p>
          <ul>
            {STOPS.map((s) => (
              <li key={s.title}>
                {s.title} ({s.sub}): {s.items.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MotionConfig>
  );
}
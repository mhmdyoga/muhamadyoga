"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Skiper67 } from "../VideoPlayer";
import Image from "next/image";

interface Project {
  num: string;
  year: string;
  title: string;
  sub: string;
  tags: string[];
  desc: string;
  stats: { val: string; key: string }[];
  demo: string;
  gitLab: string;
  dark: boolean;
  thumbnail?: string;
  video?: string;
}

const projects: Project[] = [
  {
    num: "01",
    year: "2026",
    title: "Mantappu Academy",
    sub: "E-Learning Platform",
    tags: ["Next.js", "Node.js", "Axios","Express.js", "Midtrans", "Rechart.js", "Shadcn/ui", "TypeScript", "Tailwind", "Docker", "Winston", "Passport.js", "JWT", "Multer", "Cloudinary", "Resend", "Zod", "Prisma", "Bcrypt", "Cors", "Helmet", "Rate Limit", "Morgan"],
    desc: "Platform e-learning dengan fitur video course, quiz, testimoni, payment integration Midtrans ( Core Api ), dan admin & instructor dashboard lengkap untuk manajemen konten & user serta data analytics menggunakan Rechart.js + Shadcn/ui.",
    stats: [{ val: "20+", key: "Courses" }, { val: "100+", key: "Students" }, { val: "4.5/5", key: "Rating" }],
    demo: "https://mantappuacademy.vercel.app/", gitLab: "#", dark: true, thumbnail: "/thumbnails/mantappu-academy.png",
    video: "/videos/mantappu_academy.mp4",
  },
  {
    num: "02",
    year: "2024",
    title: "Sneakersco",
    sub: "Ecommerce Platform",
    tags: ["React", "TypeScript", "Axios", "Rechart.js", "Shadcn/ui", "Tailwind", "Node.js", "Express.js", "Docker", "JWT", "Multer", "Zod", "Prisma", "Bcrypt", "Cors", "Helmet", "Rate Limit"],
    desc: "Platform ecommerce untuk jualan sneakers dengan fitur katalog produk, shopping cart, checkout, dan dashboard analytics interaktif menggunakan Rechart.js dan Shadcn/ui untuk visualisasi data penjualan.",
    stats: [{ val: "4", key: "Products" }, { val: "0", key: "Users" }, { val: "0/5", key: "Rating" }],
    demo: "#", gitLab: "#", dark: false, thumbnail: "/thumbnails/hero-sneakersco.png",
    video: "/videos/sneakersco.mp4",
  },
  {
    num: "03",
    year: "2024",
    title: "Weabonim",
    sub: "Realtime Information of Anime",
    tags: ["React", "Tailwind", "Jikan Api", "Axios"],
    desc: "Platform informasi anime real-time dengan data terbaru dari Jikan API dengan fitur search, dan detail anime.",
    stats: [{ val: "1000+", key: "Anime" }, { val: "500k+", key: "Users" }, { val: "4.5/5", key: "Rating" }],
    demo: "#", gitLab: "#", dark: true, thumbnail: "/thumbnails/weabonim.png",
  },
  {
    num: "04",
    year: "2023",
    title: "Ycreatives",
    sub: "Landing Page (heavy animation)",
    tags: ["Express", "MySQL", "Docker", "GSAP"],
    desc: "Landing Page untuk digital agency dengan animasi kompleks menggunakan GSAP untuk interaksi yang menarik dan interaktif.",
    stats: [{ val: "1", key: "Page" }, { val: "30+", key: "Customers" }, { val: "4.8/5", key: "Rating" }],
    demo: "#", gitLab: "#", dark: false, thumbnail: "/thumbnails/ycreatives.png",
    video: "/videos/ycreatives.mp4"
  },
  {
    num: "05",
    year: "2026",
    title: "BARKASNAS",
    sub: "Personal Portfolio Website",
    tags: ["React", "TypeScript", "Tailwind", "Framer Motion", "Golang", "Docker", "PostgreSQL", "JWT", "Axios", "Zod", "Prisma", "Bcrypt", "Cors", "GIN", "Rate Limit", "Gothic", "Cloudinary"],
    desc: "Barkasnas adalah portofolio pribadi mengenai platform E-commerce Barang Bekas (Preloved) dengan sistem Pembayaran COD only. Ada beberapa fitur seperti Authentication, CRUD Product, Favorited List, Messaging, dan Admin Dashboard untuk data analytics, Backend menggunakan Golang, GIN, PostgreSQL, Prisma, JWT, dan Frontend menggunakan React, TypeScript, Tailwind, Framer Motion.",
    stats: [{ val: "5+", key: "Projects" }, { val: "10+", key: "Skills" }, { val: "4.9/5", key: "Rating" }],
    demo: "#", gitLab: "#", dark: true, thumbnail: "/thumbnails/barkasnas.png",
    video: "/videos/barkasnas.mp4"
  }
];

// ── Orbit perimeter helper ─────────────────────────────────────────
function ellipsePerim(rx: number, ry: number) {
  return 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
}

// ── Stars: posisi deterministik (seeded) biar server & client sama ─
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PLANET = { x: 830, y: 100 };

const STARS = (() => {
  const rnd = mulberry32(7);
  const out: { cx: number; cy: number; r: number; o: number; tw: boolean; d: number }[] = [];
  while (out.length < 70) {
    const cx = +(rnd() * 900).toFixed(1);
    const cy = +(rnd() * 600).toFixed(1);
    const r = +(0.7 + rnd() * 1.0).toFixed(2);
    const o = +(0.25 + rnd() * 0.45).toFixed(2);
    const tw = rnd() > 0.75;
    const d = +(rnd() * 4).toFixed(1);
    // jangan numpuk di atas planet
    if (Math.hypot(cx - PLANET.x, cy - PLANET.y) < 50) continue;
    out.push({ cx, cy, r, o, tw, d });
  }
  return out;
})();

// ── Space ornaments — bintang banyak, 1 planet, orbit scroll ───────
function SpaceOrnaments({ orbitOffset }: { orbitOffset: number }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <style>{`
        @keyframes star-twinkle { 0%,100% { opacity: var(--o); } 50% { opacity: 0.08; } }
        .star-twinkle { animation: star-twinkle 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .star-twinkle { animation: none; } }
      `}</style>

      {/* stars */}
      <g>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#1a1a1a"
            opacity={s.o}
            className={s.tw ? "star-twinkle" : undefined}
            style={s.tw ? ({ "--o": s.o, animationDelay: `${s.d}s` } as React.CSSProperties) : undefined}
          />
        ))}
      </g>

      {/* satu-satunya planet: ringed, kanan atas */}
      <g>
        <ellipse cx={PLANET.x} cy={PLANET.y} rx="30" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
        <circle  cx={PLANET.x} cy={PLANET.y} r="20" fill="#e8e4dc" stroke="#1a1a1a" strokeWidth="1.5"/>
        <ellipse cx={PLANET.x} cy={PLANET.y} rx="30" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeDasharray="16 12" strokeDashoffset="8"/>
      </g>

      {/* orbit deco — dashoffset jalan saat scroll */}
      <ellipse
        cx="450" cy="310"
        rx="390" ry="115"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1"
        strokeDasharray="6 8"
        strokeDashoffset={-orbitOffset}
      />
    </svg>
  );
}

// ── Pesawat: roket + UFO, gerak abstrak, jejak cepat hilang ────────
const ROCKET_W = 22;
const ROCKET_H = 40;
const UFO_W = 34;
const UFO_H = 20;
const TRAIL_LIFE = 1600; // ms sebelum jejak hilang
const PUFF_EVERY = 80;   // ms antar titik jejak

type Puff = { x: number; y: number; t: number };

function CraftLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const ufoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const rocket = rocketRef.current;
    const ufo = ufoRef.current;
    if (!wrap || !canvas || !rocket || !ufo) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // hormati prefers-reduced-motion: roket & UFO tidak ditampilkan
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // lintasan abstrak roket: gabungan beberapa gelombang sin/cos
    const rocketPath = (t: number) => {
      const s = t * 0.001;
      return {
        x: w * (0.5 + 0.38 * Math.sin(s * 0.27) + 0.07 * Math.sin(s * 0.83 + 1.3)),
        y: h * (0.5 + 0.34 * Math.sin(s * 0.21 + 0.8) + 0.07 * Math.cos(s * 0.61)),
      };
    };

    // lintasan UFO: frekuensi & fase beda supaya tidak ikut jalur roket
    const ufoPath = (t: number) => {
      const s = t * 0.001;
      return {
        x: w * (0.5 + 0.36 * Math.sin(s * 0.19 + 2.1) + 0.09 * Math.sin(s * 0.71 + 0.4)),
        y: h * (0.5 + 0.3 * Math.sin(s * 0.33 + 1.7) + 0.08 * Math.cos(s * 0.47)),
      };
    };

    // pause kalau section tidak terlihat
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap);

    const rocketPuffs: Puff[] = [];
    const ufoPuffs: Puff[] = [];
    let lastRocketPuff = 0;
    let lastUfoPuff = 0;
    let raf = 0;

    const drawPuffs = (list: Puff[], now: number) => {
      while (list.length && now - list[0].t > TRAIL_LIFE) list.shift();
      for (const q of list) {
        const k = (now - q.t) / TRAIL_LIFE; // 0 → 1
        ctx.globalAlpha = 0.4 * (1 - k);
        ctx.beginPath();
        ctx.arc(q.x, q.y, 2.2 * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      // ── roket: hidung mengikuti arah gerak ──
      const p = rocketPath(now);
      const n = rocketPath(now + 40);
      const ang = Math.atan2(n.y - p.y, n.x - p.x);
      rocket.style.opacity = "1";
      rocket.style.transform = `translate3d(${p.x - ROCKET_W / 2}px, ${p.y - ROCKET_H / 2}px, 0) rotate(${ang + Math.PI / 2}rad)`;
      if (now - lastRocketPuff > PUFF_EVERY) {
        lastRocketPuff = now;
        const tail = ROCKET_H / 2 + 1;
        rocketPuffs.push({ x: p.x - Math.cos(ang) * tail, y: p.y - Math.sin(ang) * tail, t: now });
      }

      // ── UFO: tetap mendatar, hanya miring sedikit mengikuti gerak ──
      const u = ufoPath(now);
      const un = ufoPath(now + 40);
      const dx = un.x - u.x;
      const dy = un.y - u.y;
      const tilt = Math.max(-14, Math.min(14, dx * 2.5));
      ufo.style.opacity = "1";
      ufo.style.transform = `translate3d(${u.x - UFO_W / 2}px, ${u.y - UFO_H / 2}px, 0) rotate(${tilt}deg)`;
      if (now - lastUfoPuff > PUFF_EVERY) {
        lastUfoPuff = now;
        const len = Math.hypot(dx, dy) || 1;
        const back = UFO_W * 0.4;
        ufoPuffs.push({ x: u.x - (dx / len) * back, y: u.y - (dy / len) * back + 3, t: now });
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      drawPuffs(rocketPuffs, now);
      drawPuffs(ufoPuffs, now);
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* roket */}
      <div
        ref={rocketRef}
        className="absolute left-0 top-0"
        style={{ width: ROCKET_W, height: ROCKET_H, opacity: 0, willChange: "transform" }}
      >
        <svg viewBox="0 0 24 44" width="100%" height="100%" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          {/* api — berkedip */}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
            animate={{ scaleY: [1, 1.35, 0.85, 1.2, 1] }}
            transition={{ duration: 0.45, repeat: Infinity, ease: "linear" }}
          >
            <path d="M8.5 28 Q12 42 15.5 28 Z" />
            <path d="M10.6 28 Q12 35 13.4 28" />
          </motion.g>
          {/* sirip */}
          <path d="M8 21 L3 30 L8 28 Z" fill="#fff" />
          <path d="M16 21 L21 30 L16 28 Z" fill="#fff" />
          {/* badan */}
          <path d="M12 2 C16 8 17 17 16 28 L8 28 C7 17 8 8 12 2 Z" fill="#fff" />
          {/* jendela */}
          <circle cx="12" cy="14" r="2.4" />
        </svg>
      </div>

      {/* UFO */}
      <div
        ref={ufoRef}
        className="absolute left-0 top-0"
        style={{ width: UFO_W, height: UFO_H, opacity: 0, willChange: "transform" }}
      >
        <svg viewBox="0 0 40 24" width="100%" height="100%" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          {/* kubah */}
          <path d="M12 12 C12 3.5 28 3.5 28 12 Z" fill="#fff" />
          {/* badan piring */}
          <ellipse cx="20" cy="13" rx="18" ry="6" fill="#fff" />
          {/* lampu */}
          <circle cx="11" cy="14" r="1" fill="#1a1a1a" stroke="none" />
          <circle cx="20" cy="15" r="1" fill="#1a1a1a" stroke="none" />
          <circle cx="29" cy="14" r="1" fill="#1a1a1a" stroke="none" />
        </svg>
      </div>
    </div>
  );
}

// ── Project card — IDENTIK ─────────────────────────────────────────
function ProjectCard({ project, direction }: { project: typeof projects[0]; direction: number }) {
  return (
    <motion.div
      key={project.num}
      initial={{ opacity: 0, x: direction * 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -direction * 60 }}
      transition={{ duration: 0.5, ease: [0.77, 0, 0.18, 1] }}
      className="shrink-0 w-72 rounded-2xl p-5 flex flex-col gap-3 border-2 border-[#1a1a1a]"
      style={{
        background: project.dark ? "#1a1a1a" : "#fff8e8",
        color: project.dark ? "#f0ede6" : "#1a1a1a",
        boxShadow: "4px 4px 0 #1a1a1a",
        minHeight: 260,
      }}
    >
     {project.thumbnail && (
        <Image src={project.thumbnail} alt="" className="text-5xl font-black opacity-[1.5] rounded-lg leading-none" width={369} height={369} priority loading="eager"/>
      )}
      <span
        className="text-[8px] font-bold px-2 py-0.5 rounded self-start"
        style={{ background: project.dark ? "#2a2a2a" : "#f5c842", color: project.dark ? "#f0ede6" : "#1a1a1a" }}
      >
        {project.year}
      </span>
      <div>
        <div className="text-lg font-black tracking-tight leading-tight">{project.title}</div>
        <div className="text-[9px] opacity-45 tracking-widest uppercase mt-0.5">{project.sub}</div>
      </div>
      <div className="flex flex-wrap gap-1 mt-auto">
        {project.tags.map(t => (
          <span key={t} className="text-[7.5px] border border-current rounded px-1.5 py-0.5 opacity-70">{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Project detail — IDENTIK ───────────────────────────────────────
function ProjectDetail({ project, direction }: { project: typeof projects[0]; direction: number }) {
  return (
    <motion.div
      key={project.num}
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -direction * 40 }}
      transition={{ duration: 0.5, ease: [0.77, 0, 0.18, 1], delay: 0.08 }}
      className="flex flex-col gap-5"
    >
      <div className="mt-20">
        <div className="text-[8px] tracking-[.15em] opacity-40 uppercase mb-1 text-[#1a1a1a]">About</div>
        <p className="text-[13px] leading-relaxed opacity-75 text-[#1a1a1a]">{project.desc}</p>
      </div>
      <div className="flex gap-6">
        {project.stats.map(s => (
          <div key={s.key} className="flex flex-col gap-0.5">
            <span className="text-xl font-black tracking-tight text-[#1a1a1a]">{s.val}</span>
            <span className="text-[8px] opacity-40 uppercase tracking-widest text-[#1a1a1a]">{s.key}</span>
          </div>
        ))}
      </div>
         {/* video player */}
        {project.video && <Skiper67 videoPath={project.video} key={project.num} />}
     
      <div className="flex gap-3">
        <a
          href={project.demo}
          className="text-[10px] font-bold tracking-wide px-4 py-2 rounded-full border-2 border-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6]"
          style={{ background: "#f5c842", borderColor: "#f5c842", color: "#1a1a1a" }}
        >
          Live Demo →
        </a>
        <a
          href={project.gitLab}
          className="text-[10px] font-bold tracking-wide px-4 py-2 rounded-full border-2 border-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6]"
          style={{ color: "#1a1a1a" }}
        >
          GitLab
        </a>
      </div>
    </motion.div>
  );
}

// ── Main Section ───────────────────────────────────────────────────
export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cur, setCur]             = useState(0);
  const [direction, setDirection] = useState(1);
  const [orbitOffset, setOrbitOffset] = useState(0);

  // scroll setup — container tinggi = jumlah project × 100vh
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 18 });

  // orbit: dashoffset jalan seiring scroll
  const P = ellipsePerim(390, 115);
  useEffect(() => {
    return smooth.on("change", (v) => {
      setOrbitOffset(v * P * 0.05);

      // ganti project berdasarkan progress
      const idx = Math.min(projects.length - 1, Math.floor(v * projects.length));
      setCur(prev => {
        if (idx !== prev) setDirection(idx > prev ? 1 : -1);
        return idx;
      });
    });
  }, [smooth, P]);

  // keyboard fallback
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCur(c => { const n = Math.min(projects.length - 1, c + 1); setDirection(1); return n; });
      }
      if (e.key === "ArrowLeft") {
        setCur(c => { const n = Math.max(0, c - 1); setDirection(-1); return n; });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    // ── wrapper tinggi untuk scroll ──────────────────────────────────
    <div ref={containerRef} style={{ height: `${projects.length * 100}vh` }}>
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ background: "#fff", height: "100vh" }}
      >
        {/* heading */}
        <div className="absolute top-6 left-9 z-10 pointer-events-none">
          <h2 className="text-2xl font-black tracking-tight text-[#1a1a1a]">
            PROJECTS<span style={{ color: "#f5c842" }}>.</span>
          </h2>
          <p className="text-[9px] tracking-[.15em] opacity-35 mt-0.5 text-[#1a1a1a]">SELECTED WORK</p>
        </div>

        {/* progress dots */}
        <div className="absolute top-8 right-9 z-10 flex gap-2">
          {projects.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border-[1.5px] border-[#1a1a1a] transition-colors"
              style={{ background: i === cur ? "#1a1a1a" : "transparent" }}
            />
          ))}
        </div>

        {/* space ornaments layer */}
        <div className="absolute inset-0 pointer-events-none z-1">
          <SpaceOrnaments orbitOffset={orbitOffset} />
          <CraftLayer />
        </div>

        {/* main content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-9 gap-8">
          <AnimatePresence mode="wait" custom={direction}>
            <ProjectCard key={`card-${cur}`} project={projects[cur]} direction={direction} />
          </AnimatePresence>
          <div className="flex-1 max-w-md">
            <AnimatePresence mode="wait" custom={direction}>
              <ProjectDetail key={`detail-${cur}`} project={projects[cur]} direction={direction} />
            </AnimatePresence>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <span className="text-[10px] tracking-widest opacity-50 min-w-13 text-center text-[#1a1a1a]">
            0{cur + 1} / 0{projects.length}
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
            className="text-[#1a1a1a] opacity-30 text-xs"
          >
            ↓ scroll
          </motion.div>
        </div>
      </div>
    </div>
  );
}
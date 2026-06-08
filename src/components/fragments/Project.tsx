"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

const projects = [
  {
    num: "01",
    year: "2025",
    title: "StudyFirst",
    sub: "E-Learning Platform",
    tags: ["Next.js", "Golang", "Redis", "Midtrans"],
    desc: "Platform e-learning dengan fitur live class, payment integration Midtrans, dan admin dashboard lengkap untuk manajemen konten & user.",
    stats: [{ val: "3+", key: "Months" }, { val: "5k+", key: "Users" }, { val: "12", key: "Features" }],
    demo: "#", github: "#", dark: true,
  },
  {
    num: "02",
    year: "2024",
    title: "FlowByte",
    sub: "Analytics Dashboard",
    tags: ["React", "TypeScript", "D3.js", "Tailwind"],
    desc: "Analytics dashboard real-time dengan chart interaktif D3.js, dark mode, role-based access control, dan export laporan PDF otomatis.",
    stats: [{ val: "2+", key: "Months" }, { val: "8", key: "Charts" }, { val: "3", key: "Roles" }],
    demo: "#", github: "#", dark: false,
  },
  {
    num: "03",
    year: "2024",
    title: "DevChat",
    sub: "Realtime Chat App",
    tags: ["Golang", "WebSocket", "Redis", "Docker"],
    desc: "Aplikasi chat realtime berbasis WebSocket dengan room, typing indicator, read receipt, dan message history persistent di Redis.",
    stats: [{ val: "<50ms", key: "Latency" }, { val: "100+", key: "Concurrent" }, { val: "∞", key: "Rooms" }],
    demo: "#", github: "#", dark: true,
  },
  {
    num: "04",
    year: "2023",
    title: "IT Tracker",
    sub: "Gov Internal Tool",
    tags: ["Express", "MySQL", "Docker", "GSAP"],
    desc: "Sistem manajemen aset IT pemerintahan dengan QR code scan, laporan bulanan otomatis, dan multi-cabang. Digunakan aktif oleh Diskominfo Lebak.",
    stats: [{ val: "200+", key: "Assets" }, { val: "5", key: "Branches" }, { val: "Active", key: "Status" }],
    demo: "#", github: "#", dark: false,
  },
];

// ── Space ornaments (SVG sketchy, tone section 2) ──────────────────
function SpaceOrnaments() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* stars slow */}
      <g id="g-stars-slow">
        {[[55,90,1.4],[170,50,1],[840,80,1.5],[760,140,1.2],[90,490,1.3],[850,460,1],[430,555,1.4],[310,85,1]].map(([cx,cy,r],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="#1a1a1a"/>
        ))}
      </g>
      {/* stars fast */}
      <g id="g-stars-fast">
        {[[130,170,1.1],[800,220,1.3],[60,340,1],[870,380,1.2],[500,540,1]].map(([cx,cy,r],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="#1a1a1a"/>
        ))}
      </g>
      {/* sparkles */}
      <g id="g-sparkle">
        <path d="M 78 210 L 80 204 L 82 210 L 80 216 Z M 76 210 L 80 208 L 84 210 L 80 212 Z" fill="#1a1a1a"/>
        <path d="M 810 105 L 812 99 L 814 105 L 812 111 Z M 808 105 L 812 103 L 816 105 L 812 107 Z" fill="#1a1a1a"/>
        <path d="M 455 558 L 457 552 L 459 558 L 457 564 Z M 453 558 L 457 556 L 461 558 L 457 560 Z" fill="#1a1a1a"/>
      </g>
      {/* planet ringed top right */}
      <g id="g-planet1">
        <ellipse cx="830" cy="100" rx="30" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
        <circle  cx="830" cy="100" r="20" fill="#e8e4dc" stroke="#1a1a1a" strokeWidth="1.5"/>
        <ellipse cx="830" cy="100" rx="30" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeDasharray="16 12" strokeDashoffset="8"/>
      </g>
      {/* planet bottom left */}
      <g id="g-planet2">
        <circle  cx="75" cy="500" r="24" fill="#e8e4dc" stroke="#1a1a1a" strokeWidth="1.5"/>
        <ellipse cx="75" cy="500" rx="36" ry="10" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
      </g>
      {/* tiny planet mid left */}
      <g id="g-planet3">
        <circle cx="46" cy="240" r="13" fill="#f0ede6" stroke="#1a1a1a" strokeWidth="1.2"/>
        <line x1="30" y1="240" x2="62" y2="240" stroke="#1a1a1a" strokeWidth="1" opacity=".35"/>
      </g>
      {/* rocket */}
      <g id="g-satellite" transform="rotate(-25, 195, 135)">
  {/* body */}
  <rect x="188" y="126" width="20" height="14" rx="2"
    fill="#f5f4f0" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round"/>

  {/* solar panel kiri */}
  <rect x="160" y="128" width="24" height="10" rx="1.5"
    fill="#cce0ff" stroke="#1a1a1a" strokeWidth="1.2"/>
  {/* grid lines panel kiri */}
  <line x1="168" y1="128" x2="168" y2="138" stroke="#1a1a1a" strokeWidth=".6" opacity=".4"/>
  <line x1="176" y1="128" x2="176" y2="138" stroke="#1a1a1a" strokeWidth=".6" opacity=".4"/>
  {/* arm kiri */}
  <line x1="184" y1="133" x2="188" y2="133" stroke="#1a1a1a" strokeWidth="1.2"/>

  {/* solar panel kanan */}
  <rect x="212" y="128" width="24" height="10" rx="1.5"
    fill="#cce0ff" stroke="#1a1a1a" strokeWidth="1.2"/>
  {/* grid lines panel kanan */}
  <line x1="220" y1="128" x2="220" y2="138" stroke="#1a1a1a" strokeWidth=".6" opacity=".4"/>
  <line x1="228" y1="128" x2="228" y2="138" stroke="#1a1a1a" strokeWidth=".6" opacity=".4"/>
  {/* arm kanan */}
  <line x1="208" y1="133" x2="212" y2="133" stroke="#1a1a1a" strokeWidth="1.2"/>

  {/* antenna atas */}
  <line x1="198" y1="126" x2="198" y2="116" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
  <circle cx="198" cy="114" r="2.5" fill="none" stroke="#1a1a1a" strokeWidth="1"/>

  {/* antenna samping */}
  <line x1="208" y1="128" x2="214" y2="120" stroke="#1a1a1a" strokeWidth=".8" strokeLinecap="round"/>
  <circle cx="215" cy="119" r="1.5" fill="#1a1a1a" opacity=".4"/>

  {/* window kecil di body */}
  <circle cx="198" cy="133" r="3.5" fill="#2a6dd9" stroke="#1a1a1a" strokeWidth="1"/>
  <circle cx="198" cy="133" r="2"   fill="#cce0ff"/>

  {/* sinyal / transmisi — arc putus */}
  <path d="M 202 118 C 207 113, 213 113, 216 118"
    fill="none" stroke="#1a1a1a" strokeWidth=".8" strokeLinecap="round" strokeDasharray="2 2" opacity=".5"/>
  <path d="M 204 115 C 210 108, 218 108, 222 115"
    fill="none" stroke="#1a1a1a" strokeWidth=".6" strokeLinecap="round" strokeDasharray="2 2" opacity=".3"/>
</g>
      {/* asteroid top mid */}
      <g id="g-ast1">
        <path d="M 420 60 C 428 53,440 55,446 63 C 452 71,448 83,438 87 C 428 91,416 85,414 75 C 412 67,415 63,420 60 Z" fill="#e0dcd4" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round"/>
        <circle cx="424" cy="268" r="2"   fill="#1a1a1a" opacity=".18"/>
        <circle cx="436" cy="477" r="1.5" fill="#1a1a1a" opacity=".13"/>
      </g>
      {/* asteroid bottom right */}
      <g id="g-ast2">
        <path d="M 825 485 C 835 477,851 479,857 489 C 863 499,857 513,845 516 C 833 519,821 511,821 499 C 821 491,823 489,825 485 Z" fill="#e0dcd4" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round"/>
        <circle cx="531" cy="495" r="2.2" fill="#1a1a1a" opacity=".16"/>
      </g>
      {/* nebula */}
    <g id="g-nebula">
  <path d="M 395 435 C 407 423,427 421,439 431 C 453 421,469 427,465 441 C 477 449,473 465,459 468 C 453 479,437 483,427 473 C 413 481,397 475,395 463 C 381 457,379 443,395 435 Z" fill="none" stroke="#1a1a1a" strokeWidth="1" opacity=".45"/>
  <path d="M 407 439 C 415 431,429 431,437 439 C 447 433,457 441,453 451 C 459 457,455 467,445 468 C 441 475,429 478,421 471 C 411 475,401 469,401 459 C 393 453,393 443,407 439 Z" fill="none" stroke="#1a1a1a" strokeWidth=".6" strokeDasharray="3 3" opacity=".3"/>
  <circle cx="418" cy="445" r="1.1" fill="#1a1a1a" opacity=".45"/>
  <circle cx="436" cy="441" r=".9"  fill="#1a1a1a" opacity=".38"/>
  <circle cx="448" cy="453" r="1"   fill="#1a1a1a" opacity=".4"/>
  <circle cx="428" cy="463" r=".8"  fill="#1a1a1a" opacity=".35"/>
  <path d="M 465 443 C 473 438,479 435,485 431" fill="none" stroke="#1a1a1a" strokeWidth=".7" strokeLinecap="round" strokeDasharray="2 3" opacity=".28"/>
</g>
      {/* orbit deco */}
      <ellipse cx="450" cy="310" rx="390" ry="115" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="6 8" opacity="1.1"/>
    </svg>
  );
}

// ── Floating ornament wrapper (idle float) ─────────────────────────
const floatConfigs: Record<string, { amp: number; speed: number; phase: number }> = {
  "g-planet1": { amp: 3.5, speed: 0.7,  phase: 0   },
  "g-planet2": { amp: 2.5, speed: 0.55, phase: 1.2 },
  "g-planet3": { amp: 2,   speed: 0.9,  phase: 0.5 },
  "g-rocket":  { amp: 4,   speed: 0.65, phase: 0.8 },
  "g-ast1":    { amp: 3,   speed: 0.85, phase: 0.3 },
  "g-ast2":    { amp: 2,   speed: 0.6,  phase: 1.5 },
  "g-nebula":  { amp: 1.5, speed: 0.5,  phase: 0.9 },
};

function useIdleFloat(id: string) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const cfg = floatConfigs[id];
    if (!cfg) return;
    let raf: number;
    const loop = (ts: number) => {
      const y = Math.sin(ts * 0.001 * cfg.speed + cfg.phase) * cfg.amp;
      const x = Math.cos(ts * 0.001 * cfg.speed * 0.6 + cfg.phase) * cfg.amp * 0.4;
      setPos({ x, y });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id]);
  return pos;
}

// ── Project card (left) ────────────────────────────────────────────
function ProjectCard({ project, direction }: { project: typeof projects[0]; direction: number }) {
  return (
    <motion.div
      key={project.num}
      initial={{ opacity: 0, x: direction * 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -direction * 60 }}
      transition={{ duration: 0.5, ease: [0.77, 0, 0.18, 1] }}
      className="flex-shrink-0 w-72 rounded-2xl p-5 flex flex-col gap-3 border-2 border-[#1a1a1a]"
      style={{
        background: project.dark ? "#1a1a1a" : "#fff8e8",
        color: project.dark ? "#f0ede6" : "#1a1a1a",
        boxShadow: "4px 4px 0 #1a1a1a",
        minHeight: 260,
      }}
    >
      <span className="text-5xl font-black opacity-[0.07] leading-none">{project.num}</span>
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

// ── Project detail (right) ─────────────────────────────────────────
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
      <div>
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
      <div className="flex gap-3">
        <a
          href={project.demo}
          className="text-[10px] font-bold tracking-wide px-4 py-2 rounded-full border-2 border-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6]"
          style={{ background: "#f5c842", borderColor: "#f5c842", color: "#1a1a1a" }}
        >
          Live Demo →
        </a>
        <a
          href={project.github}
          className="text-[10px] font-bold tracking-wide px-4 py-2 rounded-full border-2 border-[#1a1a1a] transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6]"
          style={{ color: "#1a1a1a" }}
        >
          GitHub
        </a>
      </div>
    </motion.div>
  );
}

// ── Main Section ───────────────────────────────────────────────────
export default function ProjectsSection() {
  const [cur, setCur] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (idx: number) => {
    setDirection(idx > cur ? 1 : -1);
    setCur(idx);
  };
  const prev = () => cur > 0 && goTo(cur - 1);
  const next = () => cur < projects.length - 1 && goTo(cur + 1);

  // keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cur]);

  // idle float per ornament
  const planet1 = useIdleFloat("g-planet1");
  const planet2 = useIdleFloat("g-planet2");
  const planet3 = useIdleFloat("g-planet3");
  const rocket  = useIdleFloat("g-rocket");
  const ast1    = useIdleFloat("g-ast1");
  const ast2    = useIdleFloat("g-ast2");
  const nebula  = useIdleFloat("g-nebula");

  const floatStyle = (pos: { x: number; y: number }) => ({
    transform: `translate(${pos.x}px, ${pos.y}px)`,
  });

  return (
    <section
      className="relative w-full overflow-hidden h-full"
      style={{ background: "#f0ede6", minHeight: "100vh" }}
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
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-2 h-2 rounded-full border-[1.5px] border-[#1a1a1a] transition-colors text-[#1a1a1a] flex items-center justify-center"
            style={{ background: i === cur ? "#1a1a1a" : "transparent" }}
          />
        ))}
      </div>

      {/* space ornaments layer */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* apply idle float per group via wrapper divs overlaid on SVG */}
        <SpaceOrnaments />
        {/* float overlays — positioned to match SVG group centers */}
        {[
          { id: "planet1", pos: planet1, style: { position: "absolute" as const, top: 70,  right: 60,  width: 70, height: 30 } },
          { id: "planet2", pos: planet2, style: { position: "absolute" as const, bottom: 60, left: 40, width: 80, height: 60 } },
          { id: "planet3", pos: planet3, style: { position: "absolute" as const, top: 200, left: 20,  width: 40, height: 40 } },
          { id: "rocket",  pos: rocket,  style: { position: "absolute" as const, top: 60,  left: 140, width: 60, height: 80 } },
          { id: "ast1",    pos: ast1,    style: { position: "absolute" as const, top: 10,  left: "45%", width: 50, height: 45 } },
          { id: "ast2",    pos: ast2,    style: { position: "absolute" as const, bottom: 50, right: 50, width: 60, height: 50 } },
          { id: "nebula",  pos: nebula,  style: { position: "absolute" as const, bottom: 30, left: "42%", width: 120, height: 70 } },
        ].map(({ id, pos, style }) => (
          <div key={id} style={{ ...style, ...floatStyle(pos), transition: "transform 0.05s linear" }} />
        ))}
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

      {/* nav */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button
          onClick={prev}
          disabled={cur === 0}
          className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] flex items-center justify-center transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6] disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: "#f0ede6" }}
        >
          ←
        </button>
        <span className="text-[10px] tracking-widest opacity-50 min-w-[52px] text-center text-[#1a1a1a]">
          0{cur + 1} / 0{projects.length}
        </span>
        <button
          onClick={next}
          disabled={cur === projects.length - 1}
          className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] flex items-center justify-center transition-colors hover:bg-[#1a1a1a] hover:text-[#f0ede6] disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ background: "#f0ede6" }}
        >
          →
        </button>
      </div>
    </section>
  );
}
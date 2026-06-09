/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────
const experiences = [
  {
    year: "2024",
    company: "StudyFirst Indonesia",
    role: "Fullstack Developer Intern · Remote",
    desc: "Developed full-stack features on the core learning platform. Contributed to responsive UI components and RESTful API integrations in agile sprints.",
    tags: ["Node.js", "Express.js", "PostgreSQL","React", "REST API", "Agile"],
    dark: true,
    warm: false,
    note: "↗ most recent",
    side: "left" as const,
  },
  {
    year: "May – Jul 2024",
    company: "FlowByte Digital",
    role: "Frontend Developer Intern · Remote",
    desc: "Built optimized UI components with React.js & Tailwind CSS. Translated Figma mockups to pixel-perfect interfaces and integrated backend REST APIs.",
    tags: ["React.js", "Tailwind CSS", "Figma", "REST API"],
    dark: false,
    warm: true,
    note: null,
    side: "right" as const,
  },
  {
    year: "2023",
    company: "Diskominfo Lebak",
    role: "IT Support Intern · Lebak, Banten",
    desc: "Provided technical support for hardware, software & network. Diagnosed and resolved IT issues, maintaining system uptime and user productivity.",
    tags: ["IT Support", "Networking", "Hardware"],
    dark: false,
    warm: false,
    note: "where it started ↓",
    side: "left" as const,
  },
];

// zigzag waypoints (in SVG viewBox 900×480 coords)
const ZZ_WAYPOINTS = [
  { t: 0,    x: 450, y: 20  },
  { t: 0.25, x: 330, y: 160 },
  { t: 0.5,  x: 450, y: 240 },
  { t: 0.75, x: 570, y: 320 },
  { t: 1,    x: 450, y: 460 },
];

const ZZ_PATH = `
  M 450 20
  C 450 60, 420 100, 330 160
  C 240 220, 240 260, 330 160
  C 420 60,  450 100, 450 180
  C 450 220, 480 260, 570 320
  C 660 380, 660 400, 570 320
  C 480 240, 450 280, 450 340
  C 450 400, 450 440, 450 460
`;
const PATH_LEN = 1200;

// ── Helpers ────────────────────────────────────────────────────────
function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}
function rangeProg(v: number, s: number, e: number) {
  return easeOut((v - s) / (e - s));
}
function getTravelPos(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < ZZ_WAYPOINTS.length - 1; i++) {
    const a = ZZ_WAYPOINTS[i], b = ZZ_WAYPOINTS[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const local = easeOut((clamped - a.t) / (b.t - a.t));
      return { x: lerpN(a.x, b.x, local), y: lerpN(a.y, b.y, local) };
    }
  }
  return ZZ_WAYPOINTS[ZZ_WAYPOINTS.length - 1];
}

// ── Idle float hook ────────────────────────────────────────────────
const FLOAT_CONFIGS: Record<string, { amp: number; speed: number; phase: number }> = {
  planet1:   { amp: 3,   speed: 0.65, phase: 0   },
  satellite: { amp: 3.5, speed: 0.7,  phase: 0.8 },
  nebula:    { amp: 2,   speed: 0.5,  phase: 0.6 },
};

function useIdleFloat(id: string) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const cfg = FLOAT_CONFIGS[id];
    if (!cfg) return;
    let raf: number;
    const loop = (ts: number) => {
      const y = Math.sin(ts * 0.001 * cfg.speed + cfg.phase) * cfg.amp;
      const x = Math.cos(ts * 0.001 * cfg.speed * 0.6 + cfg.phase) * cfg.amp * 0.35;
      setPos({ x, y });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id]);
  return pos;
}

// ── Space ornaments ────────────────────────────────────────────────
function SpaceOrnaments({
  planet1, satellite, nebula,
}: { planet1: {x:number;y:number}; satellite: {x:number;y:number}; nebula: {x:number;y:number} }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* stars */}
      {([[820,80,1.5],[840,440,1.4],[55,100,1.2],[880,540,1],[60,480,1.1]] as [number,number,number][]).map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="#1a1a1a"/>
      ))}
      {/* sparkles */}
      <path d="M 830 120 L 832 114 L 834 120 L 832 126 Z M 828 120 L 832 118 L 836 120 L 832 122 Z" fill="#1a1a1a"/>
      <path d="M 58 460 L 60 454 L 62 460 L 60 466 Z M 56 460 L 60 458 L 64 460 L 60 462 Z" fill="#1a1a1a"/>

      {/* planet — idle float */}
      <g transform={`translate(${planet1.x},${planet1.y})`}>
        <ellipse cx="848" cy="180" rx="24" ry="9" fill="none" stroke="#1a1a1a" strokeWidth="1.1"/>
        <circle  cx="848" cy="180" r="16" fill="#e8e4dc" stroke="#1a1a1a" strokeWidth="1.3"/>
        <ellipse cx="848" cy="180" rx="24" ry="9" fill="none" stroke="#1a1a1a" strokeWidth="1.1" strokeDasharray="13 9" strokeDashoffset="6"/>
      </g>

      {/* satellite — idle float */}
      <g transform={`rotate(-20,820,360) translate(${satellite.x},${satellite.y})`}>
        <rect x="810" y="353" width="16" height="11" rx="2" fill="#f5f4f0" stroke="#1a1a1a" strokeWidth="1.2" strokeLinejoin="round"/>
        <rect x="793" y="355" width="14" height="7" rx="1" fill="#cce0ff" stroke="#1a1a1a" strokeWidth=".9"/>
        <line x1="799" y1="355" x2="799" y2="362" stroke="#1a1a1a" strokeWidth=".5" opacity=".4"/>
        <rect x="828" y="355" width="14" height="7" rx="1" fill="#cce0ff" stroke="#1a1a1a" strokeWidth=".9"/>
        <line x1="834" y1="355" x2="834" y2="362" stroke="#1a1a1a" strokeWidth=".5" opacity=".4"/>
        <line x1="808" y1="353" x2="808" y2="347" stroke="#1a1a1a" strokeWidth=".9" strokeLinecap="round"/>
        <circle cx="808" cy="345" r="1.8" fill="none" stroke="#1a1a1a" strokeWidth=".9"/>
        <circle cx="818" cy="358" r="2.8" fill="#2a6dd9" stroke="#1a1a1a" strokeWidth=".8"/>
        <circle cx="818" cy="358" r="1.6" fill="#cce0ff"/>
        <path d="M 811 366 C 814 362,818 362,820 366" fill="none" stroke="#1a1a1a" strokeWidth=".6" strokeLinecap="round" strokeDasharray="1.5 2" opacity=".45"/>
      </g>

      {/* nebula — idle float */}
      <g transform={`translate(${nebula.x},${nebula.y})`}>
        <path d="M 50 400 C 58 392,70 391,78 399 C 86 392,96 397,93 407 C 100 413,97 423,89 425 C 85 432,74 435,67 428 C 58 432,48 427,47 418 C 39 413,38 403,50 400 Z" fill="none" stroke="#1a1a1a" strokeWidth=".8" opacity=".38"/>
        <circle cx="58" cy="407" r=".9" fill="#1a1a1a" opacity=".38"/>
        <circle cx="70" cy="404" r=".7" fill="#1a1a1a" opacity=".33"/>
        <circle cx="80" cy="413" r=".8" fill="#1a1a1a" opacity=".36"/>
      </g>

      {/* orbit deco */}
      <ellipse cx="450" cy="300" rx="370" ry="95" fill="none" stroke="#1a1a1a" strokeWidth=".7" strokeDasharray="5 8" opacity=".07"/>
    </svg>
  );
}

// ── Zigzag SVG line ────────────────────────────────────────────────
function ZigzagLine({ smooth }: { smooth: MotionValue<number> }) {
const dashOffset = useTransform(smooth, [0, 0.65], [PATH_LEN, 0]); // ← 0.75 → 0.65

// nodes
const n0 = useTransform(smooth, [0.02, 0.18], [0, 1]);
const n1 = useTransform(smooth, [0.18, 0.36], [0, 1]);
const n2 = useTransform(smooth, [0.36, 0.54], [0, 1]);
const n3 = useTransform(smooth, [0.54, 0.68], [0, 1]);
  const nodes = [n0, n1, n2, n3];
  const nodePos = [
    { cx: 450, cy: 20  },
    { cx: 330, cy: 160 },
    { cx: 570, cy: 320 },
    { cx: 450, cy: 460 },
  ];

  // traveling dot
  const [dotPos, setDotPos] = useState({ x: 450, y: 20 });
  const [dotOpacity, setDotOpacity] = useState(0);
  useEffect(() => {
    return smooth.on("change", (v) => {
      const p = rangeProg(v, 0, 0.75);
      if (p > 0 && p < 1) {
        setDotPos(getTravelPos(rangeProg(v, 0, 0.65))); // ← 0.75 → 0.65
        setDotOpacity(0.9);
      } else {
        setDotOpacity(0);
      }
    });
  }, [smooth]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 900 480"
      preserveAspectRatio="none"
      style={{ zIndex: 6 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* glow bg */}
      <motion.path
        d={ZZ_PATH}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={0.07}
        filter="url(#glow)"
        style={{ pathLength: useTransform(smooth, [0, 0.75], [0, 1]) } as any}
      />

      {/* main line */}
      <motion.path
        d={ZZ_PATH}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray={PATH_LEN}
        style={{ strokeDashoffset: dashOffset } as any}
      />

      {/* node circles */}
      {nodePos.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r={6}
          fill="#f0ede6"
          stroke="#1a1a1a"
          strokeWidth={2}
          style={{ opacity: nodes[i] } as any}
        />
      ))}

      {/* traveling dot */}
      <circle
        cx={dotPos.x}
        cy={dotPos.y}
        r={4}
        fill="#1a1a1a"
        opacity={dotOpacity}
        style={{ transition: "opacity 0.1s" }}
      />
    </svg>
  );
}

// ── Pulse ring (CSS animation) ─────────────────────────────────────
function PulseRing({ lit }: { lit: boolean }) {
  return (
    <span
      className="absolute inset-0 rounded-full border-2 border-[#1a1a1a]"
      style={{
        animation: lit ? "pulseRing 1.2s ease-out infinite" : "none",
        opacity: lit ? 1 : 0,
      }}
    />
  );
}

// ── Experience card ────────────────────────────────────────────────
function ExpCard({
  exp,
  index,
  smooth,
}: {
  exp: typeof experiences[0];
  index: number;
  smooth: MotionValue<number>;
}) {
  const starts = [0.10, 0.28, 0.46];
  const ends   = [0.55, 0.72, 0.68];
  const isLeft = exp.side === "left";

  const opacity = useTransform(smooth, [starts[index], ends[index]], [0, 1]);
  const x = useTransform(
    smooth,
    [starts[index], ends[index]],
    [isLeft ? -28 : 28, 0]
  );
  const y = useTransform(smooth, [starts[index], ends[index]], [10, 0]);

  const nodeScale = useTransform(smooth, [starts[index] + 0.1, ends[index]], [0.3, 1]);
  const nodeProg  = useTransform(smooth, [starts[index] + 0.15, ends[index]], [0, 1]);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    return nodeProg.on("change", (v) => setLit(v > 0.7));
  }, [nodeProg]);

  const bg     = exp.dark ? "#1a1a1a" : exp.warm ? "#fff8e8" : "#f0ede6";
  const color  = exp.dark ? "#f0ede6" : "#1a1a1a";
  const yearBg = exp.dark ? "#2a2a2a" : "#f5c842";
  const yearCl = exp.dark ? "#f0ede6" : "#1a1a1a";
  const shadow = exp.dark
    ? "3px 3px 0 rgba(0,0,0,.2)"
    : "3px 3px 0 #1a1a1a";

  return (
    <motion.div
      className={`flex items-center w-full ${isLeft ? "justify-start pr-[52%]" : "justify-end pl-[52%]"}`}
      style={{ opacity }}
    >
      <motion.div
        className="relative w-full max-w-[340px] rounded-xl border-2 border-[#1a1a1a] p-3.5 cursor-default"
        style={{
          x, y,
          background: bg,
          color,
          boxShadow: shadow,
        }}
        whileHover={{
          y: -3,
          boxShadow: exp.dark
            ? "5px 5px 0 rgba(0,0,0,.3)"
            : "5px 5px 0 #1a1a1a",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* node dot */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#1a1a1a] ${isLeft ? "-right-[7px]" : "-left-[7px]"}`}
          style={{
            scale: nodeScale,
            backgroundColor: lit ? "#1a1a1a" : "#f0ede6",
          }}
        >
          <PulseRing lit={lit} />
        </motion.div>

        {/* year */}
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded inline-block mb-1.5"
          style={{ background: yearBg, color: yearCl }}
        >
          {exp.year}
        </span>

        <div className="text-[13px] font-black tracking-tight leading-tight">{exp.company}</div>
        <div className="text-[8.5px] opacity-45 uppercase tracking-wider mb-1.5">{exp.role}</div>
        <p className="text-[9.5px] leading-relaxed opacity-[.68] max-w-[300px]">{exp.desc}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {exp.tags.map((t) => (
            <span key={t} className="text-[7px] border border-current rounded px-1.5 py-0.5 opacity-65">{t}</span>
          ))}
        </div>

        {exp.note && (
          <span className="absolute right-2.5 bottom-2 text-[7.5px] opacity-[.28] italic">{exp.note}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main section ───────────────────────────────────────────────────
export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const planet1   = useIdleFloat("planet1");
  const satellite = useIdleFloat("satellite");
  const nebula    = useIdleFloat("nebula");

  return (
    <>
      {/* pulse ring keyframe */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: .5; }
          100% { transform: scale(2.4); opacity: 0;  }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden"
        style={{ background: "#f0ede6", minHeight: "100vh" }}
      >
        {/* heading */}
        <div className="absolute top-6 left-9 z-10 pointer-events-none">
          <h2 className="text-2xl font-black tracking-tight">
            EXPERIENCE<span style={{ color: "#f5c842" }}>.</span>
          </h2>
          <p className="text-[9px] tracking-[.15em] opacity-35 mt-0.5">WORK HISTORY</p>
        </div>

        {/* space ornaments */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <SpaceOrnaments planet1={planet1} satellite={satellite} nebula={nebula}/>
        </div>

        {/* main content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
          <div className="relative w-full max-w-3xl">

            {/* zigzag line */}
            <ZigzagLine smooth={smooth}/>

            {/* cards */}
            <div className="relative flex flex-col justify-around gap-10" style={{ minHeight: 480 }}>
              {experiences.map((exp, i) => (
                <ExpCard key={exp.company} exp={exp} index={i} smooth={smooth}/>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
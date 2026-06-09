"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Skiper39 } from "./skiper39";
import {
  Geist_Mono,
  Inter,
  Modak,
  Roboto,
  Sniglet,
  Syne,
} from "next/font/google";
import RotatingText from "./RotatingText";

// ─── Config ───────────────────────────────────────────────────────────────────
const WORDS = [
  { text: "Hello", lang: "English" },
  { text: "bonjour", lang: "France" },
  { text: "Ciao", lang: "Italy" },
  { text: "你好", lang: "China" },
  { text: "Guten tag", lang: "Germany" },
  { text: "안녕하세요", lang: "Korean" },
];

const CURVE_DURATION = 1.1; // s curtain naik
const CURVE_DEPTH = 120; // px kedalaman kurva ke bawah

// font
const Inters = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: "normal",
  weight: ["400", "500", "600", "700", "800"],
});

const Modaks = Modak({
  variable: "--font-modak",
  subsets: ["latin"],
  weight: ["400"],
});

// ─── SVG path helpers — curve SELALU convex ke bawah ─────────────────────────
const makePath = (bot: number, w: number) =>
  `M0 0 L${w} 0 L${w} ${bot} Q${w / 2} ${bot + CURVE_DEPTH} 0 ${bot} Z`;

// ─── Main preloader ───────────────────────────────────────────────────────────
interface WordsPreloaderProps {
  onComplete?: () => void;
}

export function WordsPreloader({ onComplete }: WordsPreloaderProps) {
  const [index, setIndex] = useState(0);
  const [curtainExit, setCurtainExit] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [dims, setDims] = useState({ w: 1440, h: 900 });
  const svgPathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);

  // viewport size
  useEffect(() => {
    const update = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // set initial curtain path
  useEffect(() => {
    if (svgPathRef.current) {
      svgPathRef.current.setAttribute("d", makePath(dims.h, dims.w));
    }
  }, [dims]);

  useEffect(() => {
    if (curtainExit) return;

    const duration = index === 0 ? 1000 : 200;

    const timer = setTimeout(() => {
      if (index < WORDS.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setCurtainExit(true);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [index, curtainExit]);

  // counter animation synced to words
  useEffect(() => {
    if (curtainExit) {
      const start = count;
      const startTime = performance.now();

      const rush = (ts: number) => {
        const p = Math.min((ts - startTime) / 400, 1);

        setCount(Math.round(start + (100 - start) * p));

        if (p < 1) {
          rafRef.current = requestAnimationFrame(rush);
        }
      };

      rafRef.current = requestAnimationFrame(rush);

      return () => cancelAnimationFrame(rafRef.current);
    }

    const target = Math.round(((index + 1) / WORDS.length) * 92);

    const startVal = count;
    const startTime = performance.now();

    const dur = index === 0 ? 1800 : 250;

    const tick = (ts: number) => {
      const p = Math.min((ts - startTime) / dur, 1);

      setCount(Math.round(startVal + (target - startVal) * p));

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [index, curtainExit]);

  // curtain SVG animation
  useEffect(() => {
    if (!curtainExit || !svgPathRef.current) return;
    const dur = CURVE_DURATION * 1000;
    const startTime = performance.now();
    const h = dims.h;
    const w = dims.w;
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const frame = (ts: number) => {
      const p = Math.min((ts - startTime) / dur, 1);
      const ep = ease(p);
      // bot goes from h → -h (naik keluar layar), curve tetap ke bawah
      const bot = h - h * 2 * ep;
      svgPathRef.current?.setAttribute("d", makePath(bot, w));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setDone(true);
          onComplete?.();
        }, 300);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [curtainExit]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex items-center justify-center">
      {/* Curtain SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="none"
      >
        <path ref={svgPathRef} fill="#0d0d0d" />
      </svg>

      {/* Word */}
      <div
        className={`relative z-10 overflow-hidden ${curtainExit ? "pointer-events-none" : ""}`}
      >
        <AnimatePresence mode="wait">
          {!curtainExit && (
            <div
              className={`text-white ${Inters.className}`}
              style={{
                fontSize: "clamp(10px, 5vw, 50px)",
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              <motion.div
                key={WORDS[index].text}
                initial={index === 0 ? { opacity: 0 } : false}
                animate={index === 0 ? { opacity: 1 } : {}}
                transition={{
                  duration: 0.8,
                }}
              >
                {WORDS[index].text}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Counter — bottom left */}
      <div
        className="absolute bottom-8 left-8 z-10 text-white/40 tabular-nums select-none"
        style={{
          fontFamily: "'Sniglet'",
          fontSize: "clamp(13px, 1.5vw, 16px)",
          letterSpacing: "0.02em",
        }}
      >
        {String(count).padStart(2, "0")}
      </div>

      {/* Language label — bottom right */}
      <div
        className="absolute bottom-8 right-8 z-10 text-white/30 uppercase tracking-[0.2em] select-none"
        style={{ fontFamily: "monospace", fontSize: "10px" }}
      >
        <AnimatePresence mode="wait">
          {!curtainExit && (
            <motion.span
              key={WORDS[index].lang}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {WORDS[index].lang}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
export default function WordsPreloaderDemo() {
  const [ready, setReady] = useState(false);

  return (
    <main className="relative min-h-screen">
      <AnimatePresence>
        {!ready && <WordsPreloader onComplete={() => setReady(true)} />}
      </AnimatePresence>

      {ready && (
        <motion.div
          className="flex flex-col items-center justify-center min-h-screen bg-white h-screen w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="top-22 md:top-12 lg:top-2 absolute left-1/2 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
            <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black after:content-['']">
              Hello
            </span>
          </div>
          <h1
            className={`font-extrabold mb-70 text-3xl md:text-5xl lg:text-9xl text-black text-center ${Modaks.className}`}
          >
            {`I'M MUHAMAD YOGA a`}{" "}
            <RotatingText
              texts={["SOFTWARE DEVELOPER", "CRAZY BUILDER"]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-transparent text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
              splitBy="characters"
              auto
              loop
            />
          </h1>
          <Skiper39 />
        </motion.div>
      )}
    </main>
  );
}

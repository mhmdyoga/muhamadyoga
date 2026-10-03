/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";

// Taruh foto di: public/yoga.jpg  (rasio 3:4, ±900px sudah cukup)
const PHOTO_SRC = "/yoga-kid.jpeg";

const MyTopClassicMusics = [
  {
    id: 1,
    title: "Liebestraum No. 3",
    composer: "Franz Liszt",
    year: 1850,
    iframe: (
      <iframe
        data-testid="embed-iframe"
        title="Liebestraum No. 3 - Franz Liszt"
        style={{ borderRadius: 12 }}
        src="https://open.spotify.com/embed/track/5qrNvWGqU4HToSj1B3x5bM?utm_source=generator&si=71d9f4c4cc3647c2"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    ),
  },
  {
    id: 2,
    title: "Andante Op.59 No. 2",
    composer: "Moritz Moszkowski",
    year: 1874,
    iframe: (
      <iframe
        data-testid="embed-iframe"
        title="Andante Op.59 No. 2 - Moritz Moszkowski"
        style={{ borderRadius: 12 }}
        src="https://open.spotify.com/embed/track/0XQgzDWNLiepjcHy96IjNh?utm_source=generator&si=1732406d7895417d"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    ),
  },
  {
    id: 3,
    title:
      "Rachmaninoff: Piano Concerto No. 2 in C Minor, Op. 18: II. Adagio sostenuto",
    composer: "Sergei Rachmaninoff",
    year: 1901,
    iframe: (
      <iframe
        data-testid="embed-iframe"
        title="Piano Concerto No. 2 II. Adagio sostenuto - Rachmaninoff"
        style={{ borderRadius: 12 }}
        src="https://open.spotify.com/embed/track/04V5CyzHYokKe1M3Hx8L7p?utm_source=generator&si=45ad777ea22649d5"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    ),
  },
  {
    id: 4,
    title: "Rachmaninoff: Piano Concerto No. 2 in C Minor, Op. 18: I. Moderato",
    composer: "Sergei Rachmaninoff",
    year: 1901,
    iframe: (
      <iframe
        data-testid="embed-iframe"
        title="Piano Concerto No. 2 I. Moderato - Rachmaninoff"
        style={{ borderRadius: 12 }}
        src="https://open.spotify.com/embed/track/5yvj4dLlGRgS727KSO53tZ?utm_source=generator&si=a360ccc30f3640d6"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    ),
  },
];

// link biasa ke Spotify (jalan keluar kalau embed gagal dimuat)
const spotifyUrl = (iframe: any): string =>
  String(iframe?.props?.src ?? "").replace("/embed/", "/").split("?")[0];

// ── Konstanta animasi roket ────────────────────────────────────────
const ROCKET_W = 24;
const ROCKET_H = 44;
const PAD = 48; // canvas melebar keluar area supaya jejak tidak terpotong
const FLIGHT_MS = 2800; // durasi roket terbang
const WIPE_MS = 450; // penyelesaian tirai setelah roket sampai
const TRAIL_LIFE = 1600;
const PUFF_EVERY = 70;
const EDGE = 20; // margin clip supaya bayangan/foto miring tidak terpotong

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Pt = { x: number; y: number };

// titik pada kurva bezier kubik
const bezier = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

// Potong persegi (w×h + margin) dengan setengah bidang { n·p <= t } → string clip-path
function halfPlaneClip(w: number, h: number, m: number, nx: number, ny: number, t: number) {
  const rect: Pt[] = [
    { x: -m, y: -m },
    { x: w + m, y: -m },
    { x: w + m, y: h + m },
    { x: -m, y: h + m },
  ];
  const out: Pt[] = [];
  for (let i = 0; i < rect.length; i++) {
    const c = rect[i];
    const n = rect[(i + 1) % rect.length];
    const dc = nx * c.x + ny * c.y - t;
    const dn = nx * n.x + ny * n.y - t;
    if (dc <= 0) out.push(c);
    if ((dc < 0 && dn > 0) || (dc > 0 && dn < 0)) {
      const k = dc / (dc - dn);
      out.push({ x: c.x + (n.x - c.x) * k, y: c.y + (n.y - c.y) * k });
    }
  }
  if (out.length < 3) return "inset(50%)";
  return `polygon(${out.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",")})`;
}

// ── Roket SVG monokrom (sama dengan di section Projects) ───────────
function RocketSvg() {
  return (
    <svg
      viewBox="0 0 24 44"
      width="100%"
      height="100%"
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
        animate={{ scaleY: [1, 1.35, 0.85, 1.2, 1] }}
        transition={{ duration: 0.45, repeat: Infinity, ease: "linear" }}
      >
        <path d="M8.5 28 Q12 42 15.5 28 Z" />
        <path d="M10.6 28 Q12 35 13.4 28" />
      </motion.g>
      <path d="M8 21 L3 30 L8 28 Z" fill="#fff" />
      <path d="M16 21 L21 30 L16 28 Z" fill="#fff" />
      <path d="M12 2 C16 8 17 17 16 28 L8 28 C7 17 8 8 12 2 Z" fill="#fff" />
      <circle cx="12" cy="14" r="2.4" />
    </svg>
  );
}

// ── Tirai roket: dari kiri-atas → melengkung ke kanan → turun ke tengah-bawah.
// Tepi tirai berupa garis diagonal yang menyapu mengikuti posisi roket.
function IntroReveal({
  onFinish,
  instant,
  children,
}: {
  onFinish: () => void;
  instant: boolean;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(instant); // dibaca sekali saat mount

  useEffect(() => {
    const wrap = wrapRef.current;
    const area = areaRef.current;
    const canvas = canvasRef.current;
    const rocket = rocketRef.current;
    if (!wrap || !area || !canvas || !rocket) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // sudah pernah tampil / prefers-reduced-motion: langsung tampil tanpa roket
    if (skipRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      area.style.clipPath = "none";
      onFinish();
      return;
    }

    area.style.clipPath = "inset(50%)";

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      const cw = w + PAD * 2;
      const ch = h + PAD * 2;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // lintasan: start kiri-atas, melengkung ke kanan, lalu turun ke tengah-bawah
    const pos = (p: number): Pt => {
      const p0 = { x: -16, y: -16 };
      const p1 = { x: w * 0.95, y: -h * 0.25 };
      const p2 = { x: w * 1.08, y: h * 0.8 };
      const p3 = { x: w * 0.5, y: h - ROCKET_H * 0.7 };
      return bezier(p0, p1, p2, p3, ease(p));
    };

    // arah sapuan tirai = dari kiri-atas ke tengah-bawah
    const dx = w * 0.5 + 16;
    const dy = h + 16;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const proj = (x: number, y: number) => nx * x + ny * y;
    const tStart = Math.min(proj(-EDGE, -EDGE), proj(w + EDGE, h + EDGE));
    const tFull = Math.max(proj(w + EDGE, -EDGE), proj(w + EDGE, h + EDGE), proj(-EDGE, h + EDGE));

    const start = performance.now();
    const puffs: { x: number; y: number; t: number }[] = [];
    let lastPuff = 0;
    let finished = false;
    let edge = tStart;
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / FLIGHT_MS);
      const cur = pos(p);
      const a = pos(Math.max(0, p - 0.004));
      const b = pos(Math.min(1, p + 0.004));
      const ang = Math.atan2(b.y - a.y, b.x - a.x);

      if (p < 1) {
        rocket.style.opacity = "1";
        rocket.style.transform = `translate3d(${cur.x - ROCKET_W / 2}px, ${cur.y - ROCKET_H / 2}px, 0) rotate(${ang + Math.PI / 2}rad)`;

        // tepi tirai tidak pernah mundur
        edge = Math.max(edge, proj(cur.x, cur.y));
        area.style.clipPath = halfPlaneClip(w, h, EDGE, nx, ny, edge);

        if (now - lastPuff > PUFF_EVERY) {
          lastPuff = now;
          const tail = ROCKET_H / 2 + 1;
          puffs.push({ x: cur.x - Math.cos(ang) * tail, y: cur.y - Math.sin(ang) * tail, t: now });
        }
      } else if (!finished) {
        rocket.style.opacity = "0";
        // roket sudah sampai: tirai menyapu sisa pojok kanan-bawah
        const q = Math.min(1, (elapsed - FLIGHT_MS) / WIPE_MS);
        const t = edge + (tFull + 4 - edge) * ease(q);
        area.style.clipPath = halfPlaneClip(w, h, EDGE, nx, ny, t);
        if (q >= 1) {
          finished = true;
          area.style.clipPath = "none";
          onFinish();
        }
      }

      while (puffs.length && now - puffs[0].t > TRAIL_LIFE) puffs.shift();

      ctx.clearRect(0, 0, w + PAD * 2, h + PAD * 2);
      ctx.fillStyle = "#1a1a1a";
      for (const q of puffs) {
        const k = (now - q.t) / TRAIL_LIFE;
        ctx.globalAlpha = 0.4 * (1 - k);
        ctx.beginPath();
        ctx.arc(q.x + PAD, q.y + PAD, 2.2 * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!finished || puffs.length) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [onFinish]);

  return (
    <div ref={wrapRef} className="relative w-full max-w-5xl">
      <div
        ref={areaRef}
        // eslint-disable-next-line react-hooks/refs
        style={{ clipPath: skipRef.current ? "none" : "inset(50%)" }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: -PAD, top: -PAD }}
      />
      <div
        ref={rocketRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: ROCKET_W, height: ROCKET_H, opacity: 0, willChange: "transform" }}
      >
        <RocketSvg />
      </div>
    </div>
  );
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-sm px-1 text-[#1a1a1a]" style={{ background: "#f5c842" }}>
      {children}
    </mark>
  );
}

// ── Foto (fallback inisial kalau file belum ada) ───────────────────
function Photo() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative mx-auto w-full max-w-[240px] md:max-w-[300px]">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border-2 border-[#1a1a1a]"
        style={{ background: "#f5c842" }}
      />
      <div
        className="relative aspect-[3/4] -rotate-2 overflow-hidden rounded-3xl border-2 border-[#1a1a1a]"
        style={{ background: "#fff8e8" }}
      >
        {failed ? (
          <div className="flex h-full w-full items-center justify-center text-6xl font-black text-[#1a1a1a]">
            MY
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={PHOTO_SRC}
            alt="Foto Muhamad Yoga Cahaya Pratama (Matthew)"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
            draggable={false}
          />
        )}
      </div>
      <span
        className="absolute -bottom-4 -left-2 rotate-3 rounded-full border-2 border-[#1a1a1a] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]"
        style={{ background: "#fff", boxShadow: "2px 2px 0 #1a1a1a" }}
      >
        Yoga
      </span>
    </div>
  );
}

// ── About me (tanpa kartu: foto + teks langsung di halaman) ────────
function AboutContent({ ready, onNext }: { ready: boolean; onNext: () => void }) {
  return (
    <div className="grid items-center gap-12 md:grid-cols-[300px_1fr] md:gap-14">
      <Photo />

      <div>
        <div className="mb-4 text-[10px] font-bold uppercase tracking-[.2em] text-[#1a1a1a] opacity-40">
          About me
        </div>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#1a1a1a]/85 md:text-base">
          <p>
            Aku Muhamad Yoga Cahaya Pratama tapi biasa dipanggil <Mark>Yoga</Mark> oleh teman
            teman sebaya ku, sebenarnya aku orang yang gak terlalu suka belajar tapi bukan berarti gk keinginan untuk belajar. Aku belajar hanya ketika aku punya sesuatu yang harus aku capai seperti hal nya <Mark>Pemogramman</Mark> karna bagi aku itu seru bangett. Dan selain itu aku suka banget mengunjungi tempat tempat baru dan impianku bukan menjadi <Mark>Software Engineer</Mark> tapi menjadi <Mark>Traveler</Mark> dan suatu hari nanti aku akan memulai backpackeran. I promise.
          </p>
          <p>
            Kegiatan ku ya kuliah pulang kuliah pulang atau <Mark>KUPU KUPU</Mark> tapi bukan males, 
            aku punya usaha di bidang jual beli sepeda listrik dan saat ini aku
            udah berhasil <Mark>jual 5 sepeda dalam 1 bulan</Mark> ini. Dan harapanku kedepannya aku bisa lebih banyak menjual unitku dan mengumpulkan 3 digit pertamaku sebagai modal untuk memulai perjalananku.
          </p>
          <p>
            Dan selain itu aku seneng banget buat platform platform kayak E-learning karna aku suka
            mengenai pendidikan, aku juga suka buat platform e-commerce dan saat ini lagi buat{" "}
            <Mark>Barkasnas</Mark> ( barang bekas nasional ) yang tujuannya mencangkup pasar seluruh
            indonesia dan saat ini baru tahap development aja sih tapi harapannya bisa dipakai
            di seluruh indonesia tinggal mikirin caranya bagaimana hehehe.
          </p>
          <p>
            Aku suka musik musik classic dan composer favoritku yaitu Franz Liszt dan Rachmaninoff,
            untuk detail nya klik tombol di bawah ya!!!
          </p>
        </div>

        <motion.button
          type="button"
          onClick={onNext}
          disabled={!ready}
          whileHover={ready ? { y: -2 } : undefined}
          whileTap={ready ? { x: 3, y: 3, boxShadow: "0px 0px 0 #1a1a1a" } : undefined}
          className="mt-8 rounded-full border-2 border-[#1a1a1a] px-7 py-3 text-xs font-black uppercase tracking-widest text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a] disabled:cursor-wait disabled:opacity-60"
          style={{ background: "#f5c842", boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          Lihat Music Favoritku →
        </motion.button>
      </div>
    </div>
  );
}

// ── Pemutar musik: satu karya per layar, geser pakai tombol / panah keyboard ──
function MusicPlayer({ onBack }: { onBack: () => void }) {
  const total = MyTopClassicMusics.length;
  const [[idx, dir], setPage] = useState<[number, number]>([0, 0]);

  const go = useCallback(
    (to: number, d: number) => setPage([((to % total) + total) % total, d]),
    [total]
  );
  const prev = useCallback(() => go(idx - 1, -1), [go, idx]);
  const next = useCallback(() => go(idx + 1, 1), [go, idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const item = MyTopClassicMusics[idx];
  const circleBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-white text-lg font-black text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a]";

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-[#1a1a1a]">
            TOP CLASSICS<span style={{ color: "#f5c842" }}>.</span>
          </h3>
          <p className="mt-0.5 text-[9px] tracking-[.15em] text-[#1a1a1a] opacity-35">
            {total} FAVORITE PIECES
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[10px] font-bold tracking-wide text-[#1a1a1a] underline underline-offset-4 hover:opacity-60"
        >
          ← About me
        </button>
      </div>

      <div className="relative overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={item.id}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 70 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -70 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.77, 0, 0.18, 1] }}
            className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12"
          >
            <div className="min-w-0">
              <span
                className="inline-block rounded px-2 py-0.5 text-[10px] font-bold text-[#1a1a1a]"
                style={{ background: "#f5c842" }}
              >
                {item.year}
              </span>
              <div className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-[#1a1a1a] md:text-5xl">
                {item.composer}
              </div>
              <div className="mt-3 text-[11px] uppercase leading-relaxed tracking-widest text-[#1a1a1a] opacity-50">
                {item.title}
              </div>
              <a
                href={spotifyUrl(item.iframe)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-[11px] font-bold tracking-wide text-[#1a1a1a] underline underline-offset-4 hover:opacity-60"
              >
                Buka di Spotify ↗
              </a>
            </div>

            {/* placeholder terlihat selagi embed dimuat / kalau gagal */}
            <div className="relative isolate h-[352px] w-full">
              <div
                className="absolute inset-0 -z-10 flex items-center justify-center rounded-xl text-[10px] uppercase tracking-widest text-[#1a1a1a]/40"
                style={{ background: "rgba(26,26,26,0.06)" }}
              >
                Memuat pemutar…
              </div>
              {item.iframe}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={prev} aria-label="Lagu sebelumnya" className={circleBtn}>
          ←
        </button>
        <div className="flex items-center gap-2">
          {MyTopClassicMusics.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => go(i, i > idx ? 1 : -1)}
              aria-label={`Lagu ${i + 1}: ${m.composer}`}
              aria-current={i === idx}
              className="h-9 min-w-9 rounded-full border-2 border-[#1a1a1a] px-2 text-[11px] font-black text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a]"
              style={{ background: i === idx ? "#f5c842" : "#fff" }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Lagu berikutnya" className={circleBtn}>
          →
        </button>
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────
type Phase = "idle" | "launching";
type View = "about" | "music";

export default function ExperienceSection() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [view, setView] = useState<View>("about");
  const [done, setDone] = useState(false); // roket selesai terbang (sekali saja)
  const handleFinish = useCallback(() => setDone(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative w-full bg-[#fff]" style={{ overflowX: "clip" }}>
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-20 md:px-9">
          <motion.h2
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-4xl font-black tracking-tight text-[#1a1a1a] md:text-6xl"
          >
            {view === "about" ? "Fun Fact about Me" : "My Favorites"}
            <span style={{ color: "#f5c842" }}>.</span>
          </motion.h2>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" ? (
              <motion.button
                key="cta"
                type="button"
                onClick={() => setPhase("launching")}
                whileHover={{ y: -2 }}
                whileTap={{ x: 3, y: 3, boxShadow: "0px 0px 0 #1a1a1a" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                className="rounded-full border-2 border-[#1a1a1a] px-8 py-3 text-xs font-black uppercase tracking-widest text-[#1a1a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a]"
                style={{ background: "#f5c842", boxShadow: "3px 3px 0 #1a1a1a" }}
              >
                Click Me
              </motion.button>
            ) : view === "about" ? (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                className="flex w-full justify-center"
              >
                <IntroReveal onFinish={handleFinish} instant={done}>
                  <AboutContent ready={done} onNext={() => setView("music")} />
                </IntroReveal>
              </motion.div>
            ) : (
              <motion.div
                key="music"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35 }}
                className="flex w-full justify-center"
              >
                <MusicPlayer onBack={() => setView("about")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  );
}
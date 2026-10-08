"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* 1. DATA — GANTI dengan sertifikat aslimu                           */
/*    x, y = posisi bintang di kanvas 600 × 400. Susunan posisi inilah */
/*    bentuk rasi yang muncul saat semua bintang sudah dibuka.         */
/* ------------------------------------------------------------------ */
export type Certificate = {
  id: string;
  title: string;
  image: string; // path gambar di /public — kosongkan ("") kalau belum ada
  issuer: string;
  year: string;
  x: number;
  y: number;
  url?: string; // tautan kredensial (opsional) — tombol muncul kalau diisi
};

// PLACEHOLDER: teks di bawah ini sengaja generik supaya tidak ada yang terlewat diganti.
// Posisinya membentuk rasi Biduk Besar (Big Dipper) untuk 7 bintang.
const DEFAULT_CERTIFICATES: Certificate[] = [
  { id: "c1", title: "Cloud Practitioner AWS Certificate", image: "/certificate-cloud-aws.jpg" ,issuer: "Dicoding ID", year: "2024", x: 70, y: 110 },
  { id: "c2", title: "Dasar Pemogramman Python", image: "/certificate-python.jpg" ,issuer: "Dicoding ID", year: "20XX", x: 150, y: 150 },
  { id: "c3", title: "Basic Visualizatioon", image: "/certificate-data-visualization.jpg" ,issuer: "Dicoding ID", year: "20XX", x: 235, y: 175 },
  { id: "c4", title: "Intern Certificate (IT Support) -Diskominfo Lebak", image: "" ,issuer: "Dinas Komunikasi dan Informatika Kab.Lebak", year: "2023", x: 305, y: 205 },
  { id: "c5", title: "Intern Certificate (Frontend Developer) - FlowByte Digital", image: "" ,issuer: "Digital Agency FlowByte Digital", year: "2024", x: 330, y: 305 },
  { id: "c6", title: "Intern Cerificate (Web Developer) - StudyFirst", image: "/Certificate-intern_web_developer.png" ,issuer: "StudyFirst Indonesia", year: "2025", x: 470, y: 290 },
  { id: "c7", title: "Ongoing...", image: "" ,issuer: "Penerbit", year: "20XX", x: 500, y: 175 },
];
// Garis rasi: pasangan id yang disambung. Garis baru tergambar saat kedua ujungnya sudah dibuka.
const DEFAULT_LINKS: [string, string][] = [
  ["c1", "c2"], ["c2", "c3"], ["c3", "c4"], ["c4", "c5"], ["c5", "c6"], ["c6", "c7"], ["c7", "c4"],
];

/* ------------------------------------------------------------------ */
/* 2. NAVIGASI NODE-KE-NODE (bukan physics): bintang terdekat searah   */
/* ------------------------------------------------------------------ */
type Dir = "left" | "right" | "up" | "down";
const VEC: Record<Dir, [number, number]> = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

export function neighbor(from: Certificate, dir: Dir, all: Certificate[]): Certificate | null {
  const [vx, vy] = VEC[dir];
  let best: Certificate | null = null;
  let bestScore = Infinity;
  let fallback: Certificate | null = null;
  let fallbackScore = Infinity;
  for (const c of all) {
    if (c.id === from.id) continue;
    const dx = c.x - from.x;
    const dy = c.y - from.y;
    const along = dx * vx + dy * vy;
    if (along <= 0) continue;
    const perp = Math.abs(dx * vy - dy * vx);
    const score = along + perp * 2; // lurus ke arah tombol lebih diutamakan
    if (perp <= along * 1.6 && score < bestScore) { best = c; bestScore = score; }
    if (score < fallbackScore) { fallback = c; fallbackScore = score; }
  }
  return best ?? fallback; // jangan sampai ada bintang yang tak terjangkau
}

/* ------------------------------------------------------------------ */
/* 3. KOMPONEN                                                         */
/* ------------------------------------------------------------------ */
const W = 600;
const H = 400;
const SPARK = "M0,-10 Q1.4,-1.4 10,0 Q1.4,1.4 0,10 Q-1.4,1.4 -10,0 Q-1.4,-1.4 0,-10Z";

const THEME = {
  "--jm-sea": "#0c1428",
  "--jm-land": "#27355c",
  "--jm-route": "#8fa0cc",
  "--jm-accent": "#ff7a45",
  "--jm-ink": "#eef1fb",
  "--jm-muted": "#8c97b8",
} as CSSProperties;

// Taburan bintang latar yang deterministik (aman untuk SSR/hydration)
const BACKDROP = (() => {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 46 }, () => ({ x: rnd() * W, y: rnd() * H, r: 0.5 + rnd() * 1.1, o: 0.15 + rnd() * 0.3 }));
})();

type Edge = { from: string; to: string };
type Props = { certificates?: Certificate[]; links?: [string, string][] };

const shortLabel = (t: string) => (t.length > 30 ? t.slice(0, 29) + "…" : t);

export default function CertificateConstellation({ certificates = DEFAULT_CERTIFICATES, links }: Props) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const total = certificates.length;
  const byId = useMemo(() => new Map(certificates.map((c) => [c.id, c])), [certificates]);
  const linkDefs = useMemo(() => {
    const defs =
      links ??
      (certificates === DEFAULT_CERTIFICATES
        ? DEFAULT_LINKS
        : certificates.slice(1).map((c, i): [string, string] => [certificates[i].id, c.id]));
    return defs.filter(([a, b]) => byId.has(a) && byId.has(b));
  }, [links, certificates, byId]);

  const [cursor, setCursor] = useState<string>(certificates[0]?.id ?? "");
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focused, setFocused] = useState(false);
  const [note, setNote] = useState("");
  const [zoom, setZoom] = useState(false); // lightbox gambar sertifikat
  const [broken, setBroken] = useState<string[]>([]); // id yang gambarnya gagal dimuat
  const starRefs = useRef<Record<string, SVGGElement | null>>({});
  const thumbRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const complete = total > 0 && visited.length === total;
  const cur = byId.get(cursor);
  const sel = selected ? byId.get(selected) : undefined;
  const selImage = sel && sel.image && !broken.includes(sel.id) ? sel.image : "";

  // fokus nyata ikut pindah bersama kursor (roving tabindex)
  useEffect(() => {
    if (focused && cursor && !zoom) starRefs.current[cursor]?.focus({ preventScroll: true });
  }, [cursor, focused, zoom]);

  // lightbox: Escape menutup, tombol tutup langsung fokus, scroll halaman dikunci
  useEffect(() => {
    if (!zoom) return;
    closeRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setZoom(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      thumbRef.current?.focus({ preventScroll: true });
    };
  }, [zoom]);

  // preload gambar sertifikat supaya muncul instan saat bintang dibuka
  useEffect(() => {
    certificates.forEach((c) => {
      if (!c.image) return;
      const img = new window.Image();
      img.src = c.image;
    });
  }, [certificates]);

  const activate = (id: string) => {
    setCursor(id);
    setSelected(id);
    setZoom(false);
    setNote("");
    if (visited.includes(id)) return;
    const fresh: Edge[] = linkDefs
      .filter(([a, b]) => a === id || b === id)
      .map(([a, b]): Edge => (a === id ? { from: b, to: a } : { from: a, to: b }))
      .filter((e) => visited.includes(e.from)); // digambar dari bintang yang sudah dibuka
    setVisited((v) => [...v, id]);
    if (fresh.length) setEdges((e) => [...e, ...fresh]);
  };

  const reset = () => {
    setVisited([]);
    setEdges([]);
    setSelected(null);
    setZoom(false);
    setNote("");
    setCursor(certificates[0]?.id ?? "");
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const dirs: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const dir = dirs[e.key];
    if (dir) {
      e.preventDefault();
      if (!cur) return;
      const next = neighbor(cur, dir, certificates);
      if (next) { setCursor(next.id); setNote(""); }
      else setNote("Tidak ada bintang ke arah itu.");
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (cursor) activate(cursor);
    } else if (["Home", "End", "PageUp", "PageDown"].includes(e.key)) {
      // jalur cadangan menurut urutan data: jaga-jaga tata letak aneh membuat bintang sulit dijangkau panah
      e.preventDefault();
      const i = certificates.findIndex((c) => c.id === cursor);
      const target =
        e.key === "Home" ? 0 : e.key === "End" ? total - 1 : e.key === "PageDown" ? Math.min(total - 1, i + 1) : Math.max(0, i - 1);
      const t = certificates[target];
      if (t) setCursor(t.id);
    }
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 30 };
  const kbd: CSSProperties = {
    display: "inline-block", minWidth: 22, padding: "1px 6px", borderRadius: 6, textAlign: "center",
    fontSize: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)",
    color: "var(--jm-ink)", fontFamily: "inherit",
  };

  /* ---- state kosong ---- */
  if (total === 0) {
    return (
      <section style={{ ...THEME, color: "var(--jm-ink)", padding: 24 }}>
        <p style={{ margin: 0, color: "var(--jm-muted)" }}>Belum ada sertifikat untuk ditampilkan.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${uid}-h`} style={{ ...THEME, color: "var(--jm-ink)", padding: "48px 24px", display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: "100%", maxWidth: 1040, display: "grid", gap: 32, alignItems: "center",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        }}
      >
        {/* ---------- kolom teks ---------- */}
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--jm-muted)" }}>
            Sertifikat · {String(visited.length).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <h2 id={`${uid}-h`} style={{ margin: "10px 0 0", fontSize: "clamp(2rem, 6vw, 3.25rem)", lineHeight: 1.05, color: "ActiveText" }}>
            Scorpio
          </h2>
          <p style={{ margin: "12px 0 0", color: "var(--jm-muted)", maxWidth: 420 }}>
            Tiap bintang menyimpan satu sertifikat. Buka semuanya untuk menyambung rasi.
          </p>

          <div aria-hidden style={{ display: "flex", gap: 6, margin: "18px 0" }}>
            {certificates.map((c) => (
              <span
                key={c.id}
                style={{
                  height: 4, flex: 1, maxWidth: 36, borderRadius: 2,
                  background: visited.includes(c.id) ? "var(--jm-accent)" : "rgba(255,255,255,.14)",
                  transition: "background .3s",
                }}
              />
            ))}
          </div>

          {/* kartu detail */}
          <div aria-live="polite" style={{ minHeight: 132 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={sel?.id ?? "kosong"}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                transition={{ duration: reduce ? 0 : 0.28 }}
                style={{
                  padding: "16px 18px", borderRadius: 16, background: "rgba(255,255,255,.04)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,.08)",
                }}
              >
                {sel ? (
                  <>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--jm-accent)", letterSpacing: ".08em" }}>
                      BINTANG {String(certificates.indexOf(sel) + 1).padStart(2, "0")}
                    </p>
                    <h3 style={{ margin: "6px 0 0", fontSize: 20, lineHeight: 1.25, color: "AccentColor" }}>{sel.title}</h3>
                    <p style={{ margin: "6px 0 0", color: "var(--jm-muted)" }}>
                      {sel.issuer} · {sel.year}
                    </p>

                    {/* gambar sertifikat: klik untuk memperbesar */}
                    {selImage && (
                      <button
                        ref={thumbRef}
                        type="button"
                        onClick={() => setZoom(true)}
                        aria-label={`Perbesar gambar sertifikat: ${sel.title}`}
                        style={{
                          display: "block", width: "100%", marginTop: 14, padding: 0, overflow: "hidden",
                          borderRadius: 10, cursor: "zoom-in", background: "rgba(0,0,0,.25)",
                          border: "1px solid rgba(255,255,255,.12)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selImage}
                          alt={`Sertifikat ${sel.title}`}
                          loading="lazy"
                          decoding="async"
                          onError={() => setBroken((b) => (b.includes(sel.id) ? b : [...b, sel.id]))}
                          style={{ display: "block", width: "100%", height: "auto", maxHeight: 200, objectFit: "contain" }}
                        />
                      </button>
                    )}

                    {sel.url && (
                      <a
                        href={sel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-block", marginTop: 12, color: "var(--jm-accent)", fontSize: 14 }}
                      >
                        Lihat kredensial →
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: 0, fontSize: 18, color: "GrayText" }}>Pilih bintang pertamamu</h3>
                    <p style={{ margin: "6px 0 0", color: "var(--jm-muted)", fontSize: 14 }}>
                      Pindahkan kursor ke sebuah bintang lalu buka. Detail sertifikat muncul di sini.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {complete && (
            <p
              role="status"
              style={{
                margin: "14px 0 0", padding: "10px 14px", borderRadius: 12, fontSize: 14,
                border: "1px solid var(--jm-accent)", color: "CaptionText",
              }}
            >
              Rasi lengkap — semua {total} sertifikat sudah dibuka.
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            disabled={visited.length === 0}
            style={{
              marginTop: 14, padding: "8px 14px", borderRadius: 10, fontSize: 13, font: "inherit",
              color: "AccentColor", background: "transparent", border: "1px solid rgba(255,255,255,.2)",
              cursor: visited.length === 0 ? "not-allowed" : "pointer", opacity: visited.length === 0 ? 0.4 : 1,
            }}
          >
            Susun ulang
          </button>
        </div>

        {/* ---------- kanvas ---------- */}
        <div style={{ width: "100%", maxWidth: 560, justifySelf: "center" }}>
          <div
            style={{
              borderRadius: 20, overflow: "hidden", background: "var(--jm-sea)",
              boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 24px 60px -24px rgba(0,0,0,.6)",
            }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              role="group"
              aria-label="Rasi sertifikat. Panah untuk pindah bintang, Enter atau Spasi untuk membuka."
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
              style={{ display: "block" }}
            >
              <defs>
                <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>
              <rect width={W} height={H} style={{ fill: "var(--jm-sea)" }} />

              <g aria-hidden>
                {BACKDROP.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={d.r} style={{ fill: "var(--jm-ink)", opacity: d.o }} />
                ))}
              </g>

              {/* cahaya saat rasi lengkap */}
              <motion.g
                aria-hidden
                initial={false}
                animate={{ opacity: complete ? 0.55 : 0 }}
                transition={{ duration: reduce ? 0 : 0.9 }}
                filter={`url(#${uid}-glow)`}
              >
                {edges.map((e) => {
                  const a = byId.get(e.from)!;
                  const b = byId.get(e.to)!;
                  return <line key={`g${e.from}${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={6} strokeLinecap="round" style={{ stroke: "var(--jm-accent)" }} />;
                })}
              </motion.g>

              {/* garis rasi: tergambar dari bintang yang sudah dibuka ke bintang baru */}
              <g aria-hidden>
                {edges.map((e) => {
                  const a = byId.get(e.from)!;
                  const b = byId.get(e.to)!;
                  return (
                    <motion.path
                      key={`${e.from}>${e.to}`}
                      d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
                      fill="none"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      style={{ stroke: "var(--jm-route)" }}
                      initial={{ pathLength: reduce ? 1 : 0, opacity: 0.9 }}
                      animate={{ pathLength: 1, opacity: 0.9 }}
                      transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  );
                })}
              </g>

              {/* bintang */}
              {certificates.map((c, i) => {
                const seen = visited.includes(c.id);
                return (
                  <g
                    key={c.id}
                    ref={(el) => { starRefs.current[c.id] = el; }}
                    transform={`translate(${c.x} ${c.y})`}
                    role="button"
                    tabIndex={c.id === cursor ? 0 : -1}
                    aria-label={`${c.title}, ${c.issuer} ${c.year}${seen ? ", sudah dibuka" : ""}`}
                    onClick={() => activate(c.id)}
                    style={{ cursor: "pointer", outline: "none" }}
                  >
                    <circle r={28} fill="transparent" />
                    {!seen && (
                      <>
                        <circle r={7} fill="none" strokeWidth={1} style={{ stroke: "var(--jm-muted)", opacity: 0.35 }} />
                        <motion.circle
                          r={3.2}
                          style={{ fill: "var(--jm-muted)" }}
                          animate={reduce ? undefined : { opacity: [0.55, 1, 0.55] }}
                          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.37, ease: "easeInOut" }}
                        />
                      </>
                    )}
                    {seen && (
                      <>
                        <motion.circle
                          fill="none"
                          strokeWidth={1.5}
                          style={{ stroke: "var(--jm-accent)" }}
                          initial={{ r: 4, opacity: reduce ? 0 : 0.9 }}
                          animate={{ r: 26, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
                        />
                        <motion.path
                          d={SPARK}
                          style={{ fill: "var(--jm-accent)", transformBox: "fill-box", transformOrigin: "center" }}
                          initial={{ scale: reduce ? 1 : 0.2 }}
                          animate={{ scale: complete && !reduce ? [1, 1.25, 1] : 1 }}
                          transition={{ duration: complete ? 0.9 : 0.4, ease: "easeOut", delay: complete ? i * 0.08 : 0 }}
                        />
                        <circle r={2.2} style={{ fill: "var(--jm-ink)" }} />
                      </>
                    )}
                  </g>
                );
              })}

              {/* kursor: reticle kecil yang meluncur ke bintang terpilih */}
              {cur && (
                <motion.g
                  aria-hidden
                  initial={false}
                  animate={{ x: cur.x, y: cur.y, opacity: focused ? 1 : 0.5 }}
                  transition={spring}
                  style={{ pointerEvents: "none" }}
                >
                  <motion.circle
                    r={15}
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="3 5"
                    style={{ stroke: "var(--jm-ink)", transformBox: "fill-box", transformOrigin: "center" }}
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  />
                  <path d="M0,-21 V-17 M0,21 V17 M-21,0 H-17 M21,0 H17" strokeWidth={1.6} strokeLinecap="round" style={{ stroke: "var(--jm-ink)" }} />
                </motion.g>
              )}

              {/* label bintang yang sedang disorot */}
              {cur && focused && (
                <motion.text
                  key={cur.id}
                  aria-hidden
                  x={cur.x}
                  y={cur.y > H - 70 ? cur.y - 30 : cur.y + 40}
                  textAnchor={cur.x < 110 ? "start" : cur.x > W - 110 ? "end" : "middle"}
                  fontSize={13}
                  fontWeight={600}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  style={{ fill: "var(--jm-ink)", stroke: "var(--jm-sea)", strokeWidth: 4, paintOrder: "stroke", pointerEvents: "none" }}
                >
                  {shortLabel(cur.title)}
                </motion.text>
              )}

              <motion.text
                aria-hidden
                x={W / 2}
                y={H - 22}
                textAnchor="middle"
                fontSize={12}
                letterSpacing="0.3em"
                initial={false}
                animate={{ opacity: complete ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.5 }}
                style={{ fill: "var(--jm-accent)", fontWeight: 700 }}
              >
                RASI LENGKAP
              </motion.text>
            </svg>
          </div>

          <p style={{ margin: "14px 4px 0", fontSize: 13, color: "var(--jm-muted)", lineHeight: 1.9 }}>
            <span style={kbd}>←</span> <span style={kbd}>↑</span> <span style={kbd}>↓</span> <span style={kbd}>→</span> pindah bintang
            {"  ·  "}
            <span style={kbd}>Enter</span> / <span style={kbd}>Spasi</span> buka
            {"  ·  "}atau ketuk bintangnya
          </p>
          <p aria-live="polite" style={{ margin: "2px 4px 0", fontSize: 13, color: "var(--jm-accent)", minHeight: 18 }}>
            {note}
          </p>
        </div>
      </div>

      {/* ---------- lightbox gambar sertifikat ---------- */}
      <AnimatePresence>
        {zoom && sel && selImage && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Sertifikat: ${sel.title}`}
            onClick={() => setZoom(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            style={{
              position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center",
              padding: 24, background: "rgba(8,12,24,.9)", cursor: "zoom-out",
            }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Tutup gambar"
              style={{
                position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 999,
                font: "inherit", fontSize: 20, lineHeight: 1, color: "var(--jm-ink)", cursor: "pointer",
                background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)",
              }}
            >
              ×
            </button>
            <motion.figure
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: reduce ? 1 : 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.96, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ margin: 0, maxWidth: "min(92vw, 1100px)", cursor: "default", textAlign: "center" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selImage}
                alt={`Sertifikat ${sel.title}`}
                style={{ display: "block", maxWidth: "100%", maxHeight: "80vh", margin: "0 auto", borderRadius: 8, background: "#fff" }}
              />
              <figcaption style={{ marginTop: 12, fontSize: 14, color: "var(--jm-muted)" }}>
                {sel.title} · {sel.issuer} · {sel.year}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
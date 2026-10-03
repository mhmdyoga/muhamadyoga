"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
// Dibuat oleh `node build-map.mjs` (data Natural Earth, area Asia–Eropa)
import { LAND_PATH } from "../asiaEuropeMap";

/* ------------------------------------------------------------------ */
/* 1. DATA — ubah urutan / kota di sini saja                          */
/* ------------------------------------------------------------------ */
const STOPS = [
  {city: "Rangkasbitung", country: "Indonesia", lon: 106.4, lat: -6.3},
  { city: "Makkah", country: "Arab Saudi", note: "Masjidil Haram", lon: 39.83, lat: 21.42 },
  { city: "Roma", country: "Italia", note: "Colosseum & Pisa", lon: 12.5, lat: 41.9 },
  {city: "Chongqing", country: "China", lon: 106.55, lat: 29.56},
  {city: "Xinjiang", country: "China", lon: 87.62, lat: 43.79},
  { city: "Leeds", country: "Inggris", lon: -1.55, lat: 53.8 },
  { city: "Prague", country: "Ceko", lon: 14.42, lat: 50.08 },
  { city: "Barcelona", country: "Spanyol", note: "Sagrada Família", lon: 2.17, lat: 41.39 },
  { city: "Istanbul", country: "Türkiye", note: "Hagia Sophia", lon: 28.98, lat: 41.01 },
  { city: "Amsterdam", country: "Belanda", lon: 4.9, lat: 52.37 },
  {city: "ST.Petersburg", country: "Rusia", lon: 30.31, lat: 59.94},
  {city: "Moscow", country: "Rusia", lon: 37.62, lat: 55.75},
  {city: "Tokyo", country: "Jepang", lon: 139.69, lat: 35.69},
  {city: "Lhasa", country: "Tibet", lon: 91.13, lat: 29.65},
  {city: "Almaty", country: "Kazakhstan", lon: 76.95, lat: 43.25},
  {city: "Budapest", country: "Hungaria", lon: 19.04, lat: 47.5},
  {city: "Halstatt", country: "Austria", lon: 13.65, lat: 47.56},
];

/* ------------------------------------------------------------------ */
/* 2. PROYEKSI & AREA — HARUS sama dengan build-map.mjs               */
/* ------------------------------------------------------------------ */
const K = 1000 / 360; // satuan SVG per derajat longitude
const LAT_MIN = -58;
const LAT_MAX = 80;
const merc = (lat: number) => {
  const l = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  return Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
};
const Y0 = merc(LAT_MAX);
const px = (lon: number) => (lon + 180) * K;
const py = (lat: number) => (Y0 - merc(lat)) * (180 / Math.PI) * K;

// Area peta yang sama dengan BBOX di build-map.mjs (= viewBox asia-europe-map.svg)
const BBOX = { lonMin: -25, lonMax: 150, latMin: -11, latMax: 75 };
const MAP = {
  x: px(BBOX.lonMin),
  y: py(BBOX.latMax),
  w: px(BBOX.lonMax) - px(BBOX.lonMin),
  h: py(BBOX.latMin) - py(BBOX.latMax),
};

/* ------------------------------------------------------------------ */
/* 3. KAMERA & ROKET — fungsi murni dari progress scroll (0..1)       */
/* ------------------------------------------------------------------ */
const VB_W = 400;
const VB_H = Math.round((VB_W * MAP.h) / MAP.w); // rasio sama dengan SVG peta
const CX = VB_W / 2;
const CY = VB_H / 2;
const FIT = VB_W / MAP.w; // skala supaya seluruh peta pas di kartu
const MAP_CENTER = { x: MAP.x + MAP.w / 2, y: MAP.y + MAP.h / 2 };
const ZOOM_STOP = 3.2; // zoom di tiap kota (hanya jika follow = true)
const DWELL = 0.18; // porsi segmen untuk "diam" di tiap kota

const P = STOPS.map((s) => ({ x: px(s.lon), y: py(s.lat) }));
const SEG = P.slice(0, -1).map((a, i) => {
  const b = P[i + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { len: Math.hypot(dx, dy), angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 };
});
// unwrap sudut supaya roket tidak muter 360°
for (let i = 1; i < SEG.length; i++) {
  while (SEG[i].angle - SEG[i - 1].angle > 180) SEG[i].angle -= 360;
  while (SEG[i].angle - SEG[i - 1].angle < -180) SEG[i].angle += 360;
}
const CUM = SEG.reduce((acc, s) => [...acc, acc[acc.length - 1] + s.len], [0]);
const TOTAL = CUM[CUM.length - 1];
const ROUTE_D = "M" + P.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L");

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

function sample(progress: number, follow: boolean) {
  const n = STOPS.length;
  const f = clamp(progress) * (n - 1);
  const i = Math.min(Math.floor(f), n - 2);
  const local = f - i;
  const u = clamp((local - DWELL) / (1 - 2 * DWELL));
  const a = P[i];
  const b = P[i + 1];

  const rocket = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
  let cam = MAP_CENTER;
  let s = FIT;
  if (follow) {
    // kamera sedikit "telat" dari roket -> roket kelihatan bergeser di layar
    const k = easeQuint(u);
    cam = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
    const zoomMid = clamp(ZOOM_STOP - SEG[i].len * 0.03, 1.5, ZOOM_STOP);
    s = ZOOM_STOP - (ZOOM_STOP - zoomMid) * Math.sin(Math.PI * u);
  }
  const rot =
    i > 0 && local < DWELL
      ? lerp(SEG[i - 1].angle, SEG[i].angle, smooth(local / DWELL))
      : SEG[i].angle;

  return { f, idx: Math.round(f), s, rocket, cam, rot, drawn: CUM[i] + SEG[i].len * u };
}

/* ------------------------------------------------------------------ */
/* 4. KOMPONEN                                                         */
/* ------------------------------------------------------------------ */
const THEME = {
  "--jm-sea": "#0c1428",
  "--jm-land": "#27355c",
  "--jm-route": "#8fa0cc",
  "--jm-accent": "#ff7a45",
  "--jm-ink": "#eef1fb",
  "--jm-muted": "#8c97b8",
};

type Props = {
  scrollLength?: string;
  /** false (default): seluruh peta Asia–Eropa tampil utuh, roket yang berpindah.
   *  true: kamera zoom & mengikuti roket di tiap kota. */
  follow?: boolean;
};

export default function RocketJourneyMap({ scrollLength = "600vh", follow = false }: Props) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<SVGGElement | null>(null);
  const rocketRef = useRef<SVGGElement | null>(null);
  const trailRef = useRef<SVGPathElement | null>(null);
  const routeRef = useRef<SVGPathElement | null>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const rocketScale = follow ? 1 : 0.62; // roket lebih kecil saat peta tampil utuh

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const apply = (p: number) => {
    const st = sample(p, follow);
    mapRef.current?.setAttribute(
      "transform",
      `translate(${CX - st.s * st.cam.x} ${CY - st.s * st.cam.y}) scale(${st.s})`
    );
    rocketRef.current?.setAttribute(
      "transform",
      `translate(${CX + st.s * (st.rocket.x - st.cam.x)} ${CY + st.s * (st.rocket.y - st.cam.y)}) rotate(${st.rot}) scale(${rocketScale})`
    );
    routeRef.current?.setAttribute("stroke-width", String(1 / st.s));
    trailRef.current?.setAttribute("stroke-width", String(1.8 / st.s));
    trailRef.current?.setAttribute("stroke-dasharray", `${st.drawn} ${TOTAL}`);
    P.forEach((pt, i) => {
      markerRefs.current[i]?.setAttribute("transform", `translate(${pt.x} ${pt.y}) scale(${1 / st.s})`);
      if (dotRefs.current[i]) dotRefs.current[i].style.fill = i <= st.f + 0.01 ? "var(--jm-accent)" : "var(--jm-sea)";
      if (labelRefs.current[i]) labelRefs.current[i].style.opacity = String(i === st.idx ? 1 : 0);
    });
    return st.idx;
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(apply(p)));
  // sinkronkan saat mount (mis. refresh di tengah halaman)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(apply(scrollYProgress.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = sample(0, follow);
  const stop = STOPS[active];
  const fade = reduce
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <section ref={sectionRef} style={{ position: "relative", height: scrollLength, ...THEME }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            display: "grid",
            gap: "32px",
            alignItems: "center",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          }}
        >
          {/* Caption */}
          <div style={{ color: "var(--jm-ink)" }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--jm-muted)" }}>
              Wishlist perjalanan · {String(active + 1).padStart(2, "0")} / {String(STOPS.length).padStart(2, "0")}
            </p>
            <div aria-live="polite" style={{ minHeight: 120, marginTop: 12 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stop.city}
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                  transition={fade}
                >
                  <h2 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 3.25rem)", lineHeight: 1.05, color: "var(--jm-accent)" }}>{stop.city}</h2>
                  <p style={{ margin: "8px 0 0", color: "var(--jm-land)" }}>
                    {stop.country}
                    {stop.note ? ` · ${stop.note}` : ""}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <ol style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: 13 }}>
              {STOPS.map((s, i) => (
                <li
                  key={s.city}
                  style={{
                    color: i === active ? "#111" : "var(--jm-muted)",
                    opacity: i <= active ? 1 : 0.55,
                    transition: "color .3s, opacity .3s",
                  }}
                >
                  {s.city}
                </li>
              ))}
            </ol>
          </div>

          {/* Peta */}
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              background: "var(--jm-sea)",
              boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 24px 60px -24px rgba(0,0,0,.6)",
              width: "100%",
              maxWidth: 520,
              justifySelf: "center",
            }}
          >
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              width="100%"
              role="img"
              aria-label={`Peta rute perjalanan: ${STOPS.map((s) => s.city).join(", ")}`}
              style={{ display: "block" }}
            >
              <rect width={VB_W} height={VB_H} style={{ fill: "var(--jm-sea)" }} />

              <g
                ref={mapRef}
                transform={`translate(${CX - init.s * init.cam.x} ${CY - init.s * init.cam.y}) scale(${init.s})`}
              >
                <path d={LAND_PATH} fillRule="evenodd" style={{ fill: "var(--jm-land)" }} />

                <path ref={routeRef} d={ROUTE_D} fill="none" strokeWidth={1 / init.s} strokeLinejoin="round" style={{ stroke: "var(--jm-route)", opacity: 0.3 }} />
                <path
                  ref={trailRef}
                  d={ROUTE_D}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8 / init.s}
                  strokeDasharray={`${init.drawn} ${TOTAL}`}
                  style={{ stroke: "var(--jm-accent)" }}
                />

                {STOPS.map((s, i) => (
                  <g key={s.city} ref={(el) => { markerRefs.current[i] = el; }} transform={`translate(${P[i].x} ${P[i].y}) scale(${1 / init.s})`}>
                    <circle ref={(el) => { dotRefs.current[i] = el; }} r={3.4} strokeWidth={1.4} style={{ fill: "var(--jm-sea)", stroke: "var(--jm-accent)" }} />
                    <text
                      ref={(el) => { labelRefs.current[i] = el; }}
                      y={-8}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight={600}
                      style={{ fill: "var(--jm-ink)", opacity: i === 0 ? 1 : 0, transition: "opacity .3s" }}
                    >
                      {s.city}
                    </text>
                  </g>
                ))}
              </g>

              {/* Roket — digambar di sekitar (0,0), menghadap ke atas */}
              <g ref={rocketRef} transform={`translate(${CX} ${CY}) rotate(${init.rot}) scale(${rocketScale})`}>
                <motion.g
                  style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
                  animate={reduce ? undefined : { scaleY: [1, 1.5, 1], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M0,9 C4,12 4,17 0,24 C-4,17 -4,12 0,9Z" fill="#ffc15a" />
                </motion.g>
                <path d="M-5,3 L-10,11 L-5,9Z M5,3 L10,11 L5,9Z" fill="#ff7a45" />
                <path d="M0,-14 C5,-8 6,0 5,9 L-5,9 C-6,0 -5,-8 0,-14Z" fill="#eef1fb" />
                <path d="M0,-14 C2.5,-11 4,-8 4.6,-5 L-4.6,-5 C-4,-8 -2.5,-11 0,-14Z" fill="#ff7a45" />
                <circle cx={0} cy={-1} r={2.3} fill="#0c1428" stroke="#8fa0cc" strokeWidth={0.8} />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
// Membuat peta Asia–Eropa dari data Natural Earth (via world-atlas).
//
//   npm i -D world-atlas topojson-client
//   node build-map.mjs ./src/components     (folder tujuan, default: folder saat ini)
//
// Hasil:
//   asia-europe-map.svg  -> SVG mandiri, bisa dibuka/dipakai di mana saja
//   asiaEuropeMap.js     -> export LAND_PATH, dipakai oleh RocketJourneyMap.jsx

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { feature } from "topojson-client";

// Resolusi: "land-50m.json" (detail, disarankan) atau "land-110m.json" (lebih kasar)
const SOURCE = "node_modules/world-atlas/land-50m.json";
const OUT_DIR = process.argv[2] ?? ".";

// Cakupan (area tampilan): Eropa barat (Islandia) sampai Asia timur (Jepang) & Indonesia
const BBOX = { lonMin: -25, lonMax: 150, latMin: -11, latMax: 75 };

// Proyeksi Mercator — HARUS sama dengan yang ada di RocketJourneyMap.jsx
const K = 1000 / 360;
const LAT_MIN = -58;
const LAT_MAX = 80;
const merc = (lat) => {
  const l = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  return Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
};
const Y0 = merc(LAT_MAX);
const px = (lon) => (lon + 180) * K;
const py = (lat) => (Y0 - merc(lat)) * (180 / Math.PI) * K;

const rect = {
  x0: px(BBOX.lonMin),
  x1: px(BBOX.lonMax),
  y0: py(BBOX.latMax),
  y1: py(BBOX.latMin),
};

// Tanpa clipping: memotong poligon cekung bisa menghasilkan garis "jembatan" palsu
// yang melintang di seluruh peta. Sebagai gantinya:
//  - ring yang sama sekali di luar area dibuang
//  - titik yang jauh di luar area dijarangkan (bentuk di luar layar tidak penting)
//  - titik di dalam area (+ margin) dipertahankan utuh
const MARGIN = 25; // satuan SVG di sekitar area yang tetap detail
const SPARSE = 15; // di luar margin, hanya simpan 1 dari tiap N titik
const inArea = ([x, y]) =>
  x >= rect.x0 - MARGIN && x <= rect.x1 + MARGIN && y >= rect.y0 - MARGIN && y <= rect.y1 + MARGIN;

function simplifyRing(pts) {
  const out = [];
  let skipped = 0;
  pts.forEach((p, i) => {
    if (inArea(p)) {
      out.push(p);
      skipped = 0;
    } else if (++skipped >= SPARSE || i === 0 || i === pts.length - 1) {
      out.push(p);
      skipped = 0;
    }
  });
  return out;
}

function build() {
  const topo = JSON.parse(readFileSync(SOURCE, "utf8"));
  const fc = feature(topo, topo.objects.land);
  const geoms = fc.features ? fc.features.map((f) => f.geometry) : [fc.geometry];

  let d = "";
  for (const g of geoms) {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      for (const ring of poly) {
        const pts = ring.slice(0, -1).map(([lo, la]) => [px(lo), py(la)]); // buang titik penutup
        if (!pts.some(inArea)) continue; // ring di luar area
        const kept = simplifyRing(pts);
        if (kept.length < 3) continue;
        d += "M" + kept.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
      }
    }
  }
  return d;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("build-map.mjs")) {
  const d = build();
  const w = rect.x1 - rect.x0;
  const h = rect.y1 - rect.y0;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rect.x0.toFixed(1)} ${rect.y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}">\n` +
    `  <path fill="#27355c" fill-rule="evenodd" d="${d}"/>\n</svg>\n`;
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "asia-europe-map.svg"), svg);
  writeFileSync(
    join(OUT_DIR, "asiaEuropeMap.js"),
    `// Dibuat otomatis oleh build-map.mjs — jangan diedit manual.\nexport const LAND_PATH = "${d}";\n`
  );
  console.log(`OK: ${(d.length / 1024).toFixed(0)} KB path -> ${OUT_DIR}`);
}

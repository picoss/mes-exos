// Génère les icônes du site (favicon SVG + PNG de l'appli installée) dans public/.
// Nécessite Inkscape : `npm run icons`. Les fichiers générés sont versionnés.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PUBLIC = new URL("../public/", import.meta.url).pathname;

const COLORS = {
  paper: "#e0f2fe",
  grid: "#bae6fd",
  margin: "#f87171",
  star: "#facc15",
  ink: "#0c4a6e",
};

function starPoints(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`,
    );
  }
  return points.join(" ");
}

/** `rounded` : coins arrondis (icône classique). Sinon carré plein (icône « maskable »). */
function iconSvg({ rounded, grid }) {
  const shape = rounded
    ? `<rect width="512" height="512" rx="112"/>`
    : `<rect width="512" height="512"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${COLORS.grid}" stroke-width="3"/>
    </pattern>
    <clipPath id="shape">${shape}</clipPath>
  </defs>
  <g clip-path="url(#shape)">
    <rect width="512" height="512" fill="${COLORS.paper}"/>
    ${grid ? `<rect width="512" height="512" fill="url(#grid)"/>` : ""}
    <rect x="86" width="8" height="512" fill="${COLORS.margin}" opacity="0.6"/>
  </g>
  <polygon points="${starPoints(268, 272, 168, 84)}" fill="${COLORS.star}" stroke="${COLORS.ink}" stroke-width="20" stroke-linejoin="round"/>
</svg>
`;
}

function toPng(svg, size, output) {
  const dir = mkdtempSync(join(tmpdir(), "icons-"));
  const input = join(dir, "icon.svg");
  writeFileSync(input, svg);
  execFileSync(
    "inkscape",
    [
      input,
      "--export-type=png",
      `--export-filename=${output}`,
      "-w",
      String(size),
      "-h",
      String(size),
    ],
    {
      stdio: "ignore",
    },
  );
  rmSync(dir, { recursive: true });
}

writeFileSync(join(PUBLIC, "favicon.svg"), iconSvg({ rounded: true, grid: false }));
toPng(iconSvg({ rounded: true, grid: true }), 192, join(PUBLIC, "icons/icon-192.png"));
toPng(iconSvg({ rounded: true, grid: true }), 512, join(PUBLIC, "icons/icon-512.png"));
toPng(iconSvg({ rounded: false, grid: true }), 512, join(PUBLIC, "icons/icon-maskable-512.png"));
console.log("Icônes générées dans public/");

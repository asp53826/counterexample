import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const width = 1200;
const height = 630;

const overlay = Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0d1114" stop-opacity="0.98"/>
        <stop offset="0.47" stop-color="#0d1114" stop-opacity="0.90"/>
        <stop offset="0.72" stop-color="#0d1114" stop-opacity="0.08"/>
        <stop offset="1" stop-color="#0d1114" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#shade)"/>
    <rect x="58" y="52" width="3" height="34" fill="#ff3c8f"/>
    <text x="76" y="67" fill="#9aa4a9" font-size="15" font-family="monospace" letter-spacing="3">PUBLIC ENGINEERING INSTITUTION</text>
    <text x="58" y="225" fill="#e8e9e4" font-size="98" font-family="Arial Narrow, sans-serif" font-weight="700" letter-spacing="-3">COUNTER</text>
    <text x="58" y="311" fill="#ff3c8f" font-size="98" font-family="Arial Narrow, sans-serif" font-weight="700" letter-spacing="-3">EXAMPLE</text>
    <text x="63" y="363" fill="#b1b8bb" font-size="22" font-family="Arial, sans-serif">A PUBLIC ENGINEERING FAILURE MUSEUM</text>
    <line x1="60" y1="405" x2="510" y2="405" stroke="#3a4348" stroke-width="1"/>
    <text x="62" y="447" fill="#899399" font-size="17" font-family="monospace">12 REAL FAILURES  /  08 SOURCE ENGINES</text>
    <text x="62" y="478" fill="#899399" font-size="17" font-family="monospace">EXACT COMMITS  /  SIGNED RECEIPTS</text>
    <rect x="60" y="526" width="244" height="45" fill="#ff3c8f"/>
    <text x="80" y="555" fill="#ffffff" font-size="15" font-family="monospace" font-weight="700" letter-spacing="1">OPERATE THE EVIDENCE</text>
    <text x="1098" y="575" text-anchor="end" fill="#9aa4a9" font-size="13" font-family="monospace" letter-spacing="2">REGISTER v1.0.0</text>
    <rect x="1120" y="557" width="10" height="10" rx="5" fill="#86d69b"/>
  </svg>
`);

await sharp(path.join(root, "assets", "og-aperture-base.png"))
  .resize(width, height, { fit: "cover" })
  .composite([{ input: overlay }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "public", "og-counterexample.png"));

console.log("Composed public/og-counterexample.png (1200x630)");

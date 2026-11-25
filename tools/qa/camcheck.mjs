// usage: node tools/qa/camcheck.mjs src/videos/igboshort [aspect=0.5625]
// Projects speaker (feet+head) into the camera for every shot; flags cut-off / off-screen subjects.
import { buildSync } from "esbuild";
const dir = process.argv[2], asp = +(process.argv[3] ?? 0.5625);
const out = "/tmp/qa_" + Date.now() + ".cjs";
buildSync({ entryPoints: [dir + "/story.ts"], bundle: true, platform: "node", format: "cjs", loader: { ".json": "json" }, outfile: out, logLevel: "error" });
const { createRequire } = await import("module");
const S = createRequire(import.meta.url)(out), P = createRequire(import.meta.url)(out.replace("qa_", "qa_"));
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const proj = (c, p) => { const f = nrm(sub(c.look, c.pos)), r = nrm(cross(f, [0,1,0])), u = cross(r, f), d = sub(p, c.pos), z = dot(d, f);
  if (z <= 0.1) return null; const t = Math.tan(c.fov * Math.PI / 360); return [dot(d, r) / z / (t * asp), dot(d, u) / z / t]; };
const out2 = out.replace(".cjs", "_p.cjs");
buildSync({ entryPoints: [dir + "/plan.ts"], bundle: true, platform: "node", format: "cjs", loader: { ".json": "json" }, outfile: out2, logLevel: "error" });
const { PLAN, posOf } = createRequire(import.meta.url)(out2);
let bad = 0;
for (const p of PLAN) {
  if (p.kind === "map") continue;
  const who = [p.who, ...(p.kind === "two" ? [p.other] : [])];
  const issues = new Set();
  for (let k = 0; k <= 4; k++) {
    const f = p.a + Math.floor((p.b - 1 - p.a) * k / 4), c = S.camAt(p.id, f);
    for (const w of who) { const q = posOf(p.ch, w);
      for (const [h, tag] of (p.kind === "single" ? [[1.2, "gezicht"], [1.9, "hoofd"]] : [[0.05, "voeten"], [2.05, "hoofd"]])) {
        const s = proj(c, [q[0], h, q[2]]);
        if (!s) issues.add(w + " achter camera"); else if (Math.abs(s[0]) > 0.97 || Math.abs(s[1]) > 0.98) if (w === p.who || tag === "hoofd") issues.add(`${w} ${tag} buiten beeld`);
      } }
  }
  if (issues.size) { bad++; console.log(`shot ${p.id} (${p.kind}, ${p.who}):`, [...issues].join("; ")); }
}
console.log(bad ? `${bad} shots met problemen` : "camcheck OK: alle sprekers in beeld");

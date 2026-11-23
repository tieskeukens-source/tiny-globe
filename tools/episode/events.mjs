import { build } from "esbuild";
import fs from "node:fs"; import { createRequire } from "node:module";
await build({ entryPoints: [`src/videos/${process.argv[2] ?? "igbo"}/plan.ts`], bundle: true, platform: "node", loader: { ".json": "json" }, outfile: "out/plan.cjs", logLevel: "error" });
const p = createRequire(import.meta.url)("../../out/plan.cjs");
fs.writeFileSync("out/events.json", JSON.stringify({ cuts: p.PLAN.map((s) => [s.a / 30, s.line, s.kind]), caps: p.CAPS.map((c) => [c.a, c.text]), kicks: p.KICKS.map((k) => k[0]), total: p.TOTAL / 30, hints: p.HINT_T ?? [], ask: p.ASK_T ?? null, wrong: p.CAPS.filter((c) => c.icon === "no").map((c) => c.a) }));
console.log("TOTAL_FRAMES=" + p.TOTAL);

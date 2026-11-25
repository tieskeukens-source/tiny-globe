import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { Pen, bodyFront, HOST, LOCAL, LOCAL2, LOCAL3, Expr } from "./toon";
const ROWS: [typeof HOST, Expr][] = [[HOST, "smile"], [HOST, "shock"], [HOST, "grin"], [LOCAL, "neutral"], [LOCAL2, "smile"], [LOCAL3, "grin"]];
export const CastSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.fillStyle = "#cfe3f2"; g.fillRect(0, 0, 1920, 1080);
    ROWS.forEach(([o, e], i) => { g.setTransform(1, 0, 0, 1, i * 320 - 20, 40); bodyFront(new Pen(g), o, { mode: "stand", expr: e, seed: i + 2, facing: i % 2 ? -1 : 1, wave: i === 2 ? 0.6 : undefined }); });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={1920} height={1080} /></AbsoluteFill>;
};

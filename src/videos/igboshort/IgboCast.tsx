import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { Pen, bodyFront, HOST, TWIN_A, TWIN_B, MAMA, CHIEF, DOCTOR, VILLAGER_F, VILLAGER_M, Expr } from "./toon";
const ROWS: [typeof HOST, Expr][] = [[HOST, "grin"], [TWIN_A, "laugh"], [TWIN_B, "laugh"], [MAMA, "smile_closed"], [CHIEF, "smile_closed"], [DOCTOR, "stern"], [VILLAGER_F, "grin"], [VILLAGER_M, "grin"]];
export const IgboCast: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.fillStyle = "#e9d7b0"; g.fillRect(0, 0, 1920, 1080);
    ROWS.forEach(([o, e], i) => { g.setTransform(0.5, 0, 0, 0.5, i * 240 - 30, 80); bodyFront(new Pen(g), o, { mode: "stand", expr: e, seed: i + 2, facing: i % 2 ? -1 : 1 }); });
  }, []);
  return <AbsoluteFill><canvas ref={ref} width={1920} height={1080} /></AbsoluteFill>;
};

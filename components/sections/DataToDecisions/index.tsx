"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Home / Intelligence — "Data to decisions".
 *
 * A pixel canvas where every pixel is an agent. Scroll drives a three-stage
 * morph (Framer `useScroll` → per-pixel lerp, no rAF loop):
 *
 *   p = 0    agent flood   — pixels scattered, muted, some amber (unverified)
 *   p ≈ 0.5  data points   — they snap into an ordered lattice, turning indigo
 *   p = 1    the graph     — they land as a rising bar chart; the top cell of
 *                            each bar is amber, tracing the trend/forecast
 *
 * Per-pixel left→right stagger makes it dissolve rather than snap. Theme-aware,
 * full-bleed, feathered edges. Reduced motion → the resolved graph, static.
 */

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const feather = (dir: "to bottom" | "to right", edge: number): React.CSSProperties => ({
  maskImage: `linear-gradient(${dir}, transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`,
  WebkitMaskImage: `linear-gradient(${dir}, transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`,
});
const FEATHER_V = feather("to bottom", 7);
const FEATHER_H = feather("to right", 4);

type RGB = [number, number, number];
interface Pixel {
  cx: number; cy: number; // chaos  (agent flood)
  gx: number; gy: number; // grid   (data points)
  hx: number; hy: number; // chart  (the graph)
  delay: number;
  amber: boolean; // crest of a bar → the trend highlight
  noise: boolean; // stray amber in the flood stage
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function DataToDecisions() {
  const reduce = useReducedMotion();
  const dark = useIsDark();
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((p: number) => void) | null>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    drawRef.current?.(reduce ? 1 : p);
  });

  // the insight callout resolves with the graph, filling the empty top-left
  const calloutOpacity = useTransform(scrollYProgress, [0.7, 0.94], [0, 1]);
  const calloutY = useTransform(scrollYProgress, [0.7, 0.94], [14, 0]);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const wrap = wrapEl;
    const canvas = canvasEl;
    const ctx = context;

    // muted (flood) → indigo (measured) → amber (trend crest)
    const MUTED: RGB = dark ? [150, 152, 175] : [122, 126, 150];
    const INDIGO: RGB = dark ? [126, 116, 235] : [91, 79, 209];
    const AMBER: RGB = [229, 131, 19];

    let W = 0;
    let H = 0;
    let cell = 10;
    let pixels: Pixel[] = [];

    function build() {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = Math.max(7, Math.min(13, Math.round(W / 130)));
      const cols = Math.max(8, Math.floor(W / cell));
      const rows = Math.max(6, Math.floor(H / cell));

      // ---- stage 3: the bar chart (rising trend + a little noise) ----
      const chart: { x: number; y: number; crest: boolean }[] = [];
      const chartTop = Math.floor(rows * 0.12);
      for (let c = 0; c < cols; c++) {
        const t = c / (cols - 1);
        const trend = 0.18 + 0.62 * t; // rises left → right
        const wob = Math.sin(t * 9) * 0.05 + Math.sin(t * 23) * 0.025;
        const h = Math.max(2, Math.round((trend + wob) * (rows - chartTop)));
        for (let k = 0; k < h; k++) {
          chart.push({
            x: c * cell,
            y: H - (k + 1) * cell,
            crest: k === h - 1, // top of the bar → amber trend line
          });
        }
      }
      // left→right so the morph reads as an organising sweep
      chart.sort((a, b) => a.x - b.x || b.y - a.y);

      const N = chart.length;

      // ---- stage 2: the ordered lattice (data points) ----
      const gCols = Math.ceil(Math.sqrt(N * (W / Math.max(H, 1))));
      const gRows = Math.ceil(N / gCols);
      const padX = W * 0.06;
      const padY = H * 0.14;
      const gw = (W - padX * 2) / Math.max(gCols - 1, 1);
      const gh = (H - padY * 2) / Math.max(gRows - 1, 1);

      // ---- stage 1: the agent flood (chaos), sorted by x to limit crossing ----
      const chaos = Array.from({ length: N }, () => ({
        x: Math.random() * (W - cell),
        y: Math.random() * (H - cell),
      })).sort((a, b) => a.x - b.x);

      pixels = chart.map((h, i) => {
        const gi = i;
        return {
          cx: chaos[i].x,
          cy: chaos[i].y,
          gx: padX + (gi % gCols) * gw,
          gy: padY + Math.floor(gi / gCols) * gh,
          hx: h.x,
          hy: h.y,
          delay: (h.x / Math.max(W, 1)) * 0.28 + Math.random() * 0.06,
          amber: h.crest,
          noise: Math.random() < 0.07,
        };
      });
    }

    function draw(p: number) {
      ctx.clearRect(0, 0, W, H);
      const size = Math.max(3, cell - 2);
      const MAXD = 0.34;

      for (const px of pixels) {
        const lp = clamp01((p - px.delay) / (1 - MAXD));
        let x: number;
        let y: number;
        if (lp < 0.5) {
          const t = easeInOut(lp / 0.5);
          x = lerp(px.cx, px.gx, t);
          y = lerp(px.cy, px.gy, t);
        } else {
          const t = easeInOut((lp - 0.5) / 0.5);
          x = lerp(px.gx, px.hx, t);
          y = lerp(px.gy, px.hy, t);
        }

        // colour: muted flood → indigo (measured) → amber crest at the end
        const target: RGB = px.amber ? AMBER : INDIGO;
        const cMix = easeInOut(clamp01(lp * 1.6)); // colour resolves slightly ahead of position
        const from: RGB = px.noise ? AMBER : MUTED;
        const r = Math.round(lerp(from[0], target[0], cMix));
        const g = Math.round(lerp(from[1], target[1], cMix));
        const b = Math.round(lerp(from[2], target[2], cMix));
        const alpha = lerp(dark ? 0.5 : 0.4, px.amber ? 1 : 0.92, cMix);

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      }
    }

    drawRef.current = draw;

    function rebuild() {
      build();
      draw(reduce ? 1 : scrollYProgress.get());
    }

    rebuild();

    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      drawRef.current = null;
    };
  }, [dark, reduce, scrollYProgress]);

  return (
    <section data-screen-label="data-to-decisions" className="bg-canvas">
      <div ref={trackRef} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-28">
          {/* heading stays put while the pixels resolve */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-content px-[clamp(20px,5vw,48px)] text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold tracking-display text-content md:text-5xl"
            >
              Data to decisions
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-[820px] text-pretty text-xl text-content-secondary md:text-2xl"
            >
              Our intelligence platform helps you understand how agent traffic affects your business —
              and forecasts the metrics you need to act on the future.
            </motion.p>
          </motion.div>

          {/* full-bleed pixel field */}
          <div className="relative left-1/2 mt-10 w-screen flex-1 -translate-x-1/2" style={FEATHER_H}>
            <div ref={wrapRef} className="h-full w-full" style={FEATHER_V}>
              <canvas ref={canvasRef} className="block h-full w-full" />
            </div>

            {/* insight callout — lands in the graph's empty top-left as it resolves */}
            <motion.div
              style={reduce ? { opacity: 1 } : { opacity: calloutOpacity, y: calloutY }}
              className="pointer-events-none absolute inset-x-0 top-0"
            >
              <div className="mx-auto max-w-content px-[clamp(20px,5vw,48px)] pt-6">
                <p className="font-mono text-xs uppercase tracking-caps text-content-muted">
                  Projected impact
                </p>
                <p className="mt-2 font-mono text-4xl font-extrabold tracking-display text-content md:text-5xl">
                  +$8.4k
                </p>
                <p className="mt-1 text-sm text-content-secondary">
                  revenue from agents · next 30 days
                </p>

                <div className="mt-5 space-y-1.5">
                  <span className="flex items-center gap-2 text-xs text-content-muted">
                    <span className="h-2.5 w-2.5" style={{ background: "var(--brand)" }} />
                    Measured agent traffic
                  </span>
                  <span className="flex items-center gap-2 text-xs text-content-muted">
                    <span className="h-2.5 w-2.5" style={{ background: "var(--accent)" }} />
                    Forecast crest
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

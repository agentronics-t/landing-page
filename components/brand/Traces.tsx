import { cn } from "@/lib/cn";

/**
 * The signature motif: thin copper traces with verdigris solder points.
 * Purely decorative (aria-hidden). `.trace-live` draws the copper in.
 */

/** Traces that run in from both edges of the hero and end at the URL box. */
export function HeroTraces({ className }: { className?: string }) {
  // viewBox is 1200 wide; the URL box sits around x 330–870, y ≈ 400.
  const left = [
    { d: "M0 250 H120 L180 310 H250 L300 360 V400 H330", len: 470 },
    { d: "M0 470 H90 L140 420 H330", len: 380 },
    { d: "M0 560 H200 L260 500 H300 L330 470", len: 420 },
  ];
  const right = [
    { d: "M1200 220 H1060 L1000 280 H950 L900 330 V400 H870", len: 500 },
    { d: "M1200 450 H1110 L1060 420 H870", len: 370 },
    { d: "M1200 590 H1010 L950 530 H900 L870 470", len: 420 },
  ];
  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      // fade toward the centre column so traces lead into the URL box without crossing the copy
      style={{
        maskImage: "linear-gradient(90deg, #000 0%, #000 18%, transparent 30%, transparent 70%, #000 82%, #000 100%)",
        WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 18%, transparent 30%, transparent 70%, #000 82%, #000 100%)",
      }}
      aria-hidden
    >
      {[...left, ...right].map((t, i) => (
        <g key={i}>
          <path d={t.d} fill="none" stroke="var(--trace-off)" strokeWidth="1.5" />
          <path
            d={t.d}
            fill="none"
            stroke="var(--copper)"
            strokeWidth="1.5"
            className="trace-live"
            style={{ ["--len" as string]: t.len, animationDelay: `${0.25 + i * 0.12}s` } as React.CSSProperties}
          />
        </g>
      ))}
      {[
        [180, 310], [140, 420], [260, 500], [1000, 280], [1060, 420], [950, 530],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="var(--verdigris)" className="node-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}

/** A horizontal trace between two Bone sections: copper line, verdigris joints. */
export function TraceDivider({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex max-w-content items-center px-4 sm:px-[clamp(20px,5vw,48px)]", className)} aria-hidden>
      <span className="h-2 w-2 rounded-full bg-verdigris" />
      <span className="h-px flex-1 bg-copper opacity-70" />
      <span className="h-2 w-2 rounded-full bg-verdigris" />
      <span className="h-px w-16 bg-copper opacity-70" />
      <span className="h-2 w-2 rounded-full bg-verdigris" />
    </div>
  );
}

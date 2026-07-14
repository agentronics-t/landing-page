"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";

/**
 * Home / Intelligence — "Data to decisions". A full-bleed cinematic video that
 * the reader *scrubs by scrolling*: the section pins while scroll progress maps
 * linearly to the clip's currentTime (Apple-style scroll-scrubbing via Framer
 * `useScroll` → `video.currentTime`). Theme-swapped source (light/dark), edges
 * feathered so it melts into the canvas. Reduced-motion / no-pin: a quiet
 * autoplaying loop. This is the page's <h1>.
 */

/** Track the active theme so we can swap the light/dark master. */
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

// All four edges melt into the canvas. Two mask gradients on ONE element
// default to *union* (mask-composite quirk) which leaves the top/bottom centres
// hard-cut — so instead we nest single-direction masks: horizontal feather on
// the wrapper, vertical feather on the video. Each is one gradient, so both work
// reliably across browsers.
const feather = (dir: "to bottom" | "to right", edge: number): React.CSSProperties => ({
  maskImage: `linear-gradient(${dir}, transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`,
  WebkitMaskImage: `linear-gradient(${dir}, transparent, #000 ${edge}%, #000 ${100 - edge}%, transparent)`,
});
const FEATHER_V = feather("to bottom", 11); // top + bottom (on the video)
const FEATHER_H = feather("to right", 6); // left + right (on the wrapper)

export function DataToDecisions() {
  const reduce = useReducedMotion();
  const dark = useIsDark();
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const src = dark ? "/data-decisions-dark.mp4" : "/data-decisions-light.mp4";
  const poster = dark ? "/data-decisions-dark.jpg" : "/data-decisions-light.jpg";

  // scroll drives the clip's timeline across the pinned track
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const vid = videoRef.current;
    if (reduce || !vid || !vid.duration || Number.isNaN(vid.duration)) return;
    const t = Math.min(vid.duration - 0.05, Math.max(0, v * vid.duration));
    if (Math.abs(vid.currentTime - t) > 0.015) vid.currentTime = t;
  });

  // when the source swaps (theme toggle), re-seek to the current scroll spot
  useEffect(() => {
    const vid = videoRef.current;
    if (reduce || !vid) return;
    const onMeta = () => {
      const v = scrollYProgress.get();
      vid.currentTime = Math.min(vid.duration - 0.05, Math.max(0, v * vid.duration));
    };
    vid.addEventListener("loadedmetadata", onMeta);
    return () => vid.removeEventListener("loadedmetadata", onMeta);
  }, [src, reduce, scrollYProgress]);

  return (
    <section
      data-screen-label="data-to-decisions"
      className="bg-canvas px-[clamp(20px,5vw,48px)] pt-16 md:pt-20"
    >
      {/* heading + subcopy */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto max-w-content text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-bold tracking-display text-content md:text-5xl"
        >
          Data to decisions
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-[680px] text-pretty text-lg text-content-secondary"
        >
          Our intelligence platform helps you understand how agent traffic affects your business —
          and forecasts the metrics you need to act on the future.
        </motion.p>
      </motion.div>

      {reduce ? (
        // reduced motion — quiet autoplay loop, no scrubbing
        <div className="relative left-1/2 mt-14 w-screen -translate-x-1/2" style={FEATHER_H}>
          <video
            key={src}
            className="h-[70vh] w-full object-contain"
            style={FEATHER_V}
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      ) : (
        // scroll-scrub track — pin the clip and map scroll → currentTime.
        // 162vh ≈ 62vh of scrub travel (~10% more than the previous 56vh).
        <div ref={trackRef} className="relative mt-14 h-[162vh]">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="relative left-1/2 w-screen -translate-x-1/2" style={FEATHER_H}>
              <video
                key={src}
                ref={videoRef}
                className="h-screen w-full object-contain"
                style={FEATHER_V}
                src={src}
                poster={poster}
                preload="auto"
                muted
                playsInline
                // seek-only: never plays on its own
                onLoadedMetadata={(e) => {
                  e.currentTarget.pause();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

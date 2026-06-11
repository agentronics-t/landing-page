"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { StaticFallback } from "./StaticFallback";

// Three.js + GSAP only ship when this section actually mounts the WebGL path.
const ParticleMorph = dynamic(
  () => import("./ParticleMorph").then((m) => m.ParticleMorph),
  { ssr: false, loading: () => <div className="h-screen bg-canvas" /> },
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Spec 02 wrapper — WebGL morph, or static 3-tile fallback under reduced-motion / no-WebGL. */
export function DataToInsights() {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  // null = not yet measured (avoid SSR/hydration flash) → render static until known
  if (webgl === null || reduce || !webgl) return <StaticFallback />;
  return <ParticleMorph />;
}

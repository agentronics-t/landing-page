"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/layout/Eyebrow";

gsap.registerPlugin(ScrollTrigger);

const BRAND = new THREE.Color("#736ced");
const AMBER = new THREE.Color("#ff9e1c");
const CHAOS_A = new THREE.Color("#939bac");
const CHAOS_B = new THREE.Color("#2081c3");

/**
 * Spec 02 — single THREE.Points morphs chaos → Agentronics logomark → network.
 * Scroll-pinned across a 300vh track via GSAP ScrollTrigger (scrub + pin).
 * Positions/colors are lerped from precomputed targets each frame (no re-instantiation).
 */
export function ParticleMorph() {
  const mountRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const track = trackRef.current;
    if (!mount || !track) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 700 : 1600;

    // ---- scene ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 120;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ---- targets ----
    const chaos = new Float32Array(COUNT * 3);
    const logo = new Float32Array(COUNT * 3);
    const chaosColor = new Float32Array(COUNT * 3);
    const logoColor = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // chaos: random spherical-ish volume
      const r = 40 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const c = Math.random() > 0.5 ? CHAOS_A : CHAOS_B;
      chaosColor[i * 3] = c.r;
      chaosColor[i * 3 + 1] = c.g;
      chaosColor[i * 3 + 2] = c.b;

      // logo: portal "A" shape
      const [lx, ly, isAmber] = sampleLogoPoint();
      logo[i * 3] = lx;
      logo[i * 3 + 1] = ly;
      logo[i * 3 + 2] = (Math.random() - 0.5) * 6;
      const lc = isAmber ? AMBER : BRAND;
      logoColor[i * 3] = lc.r;
      logoColor[i * 3 + 1] = lc.g;
      logoColor[i * 3 + 2] = lc.b;
    }

    // ---- points ----
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(chaos);
    const colors = new Float32Array(chaosColor);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: isMobile ? 1.6 : 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // ---- precomputed nearest-neighbour lines on the logo shape ----
    const linePairs = computeLinePairs(logo, COUNT, isMobile ? 7 : 5.5);
    const lineGeom = new THREE.BufferGeometry();
    const linePos = new Float32Array(linePairs.length * 6);
    const lineCol = new Float32Array(linePairs.length * 6);
    for (let k = 0; k < linePairs.length; k++) {
      const [a, b] = linePairs[k];
      for (let j = 0; j < 3; j++) {
        linePos[k * 6 + j] = logo[a * 3 + j];
        linePos[k * 6 + 3 + j] = logo[b * 3 + j];
        lineCol[k * 6 + j] = logoColor[a * 3 + j];
        lineCol[k * 6 + 3 + j] = logoColor[b * 3 + j];
      }
    }
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeom.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
    });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lines);

    // ---- scroll-driven progress ----
    const state = { progress: 0 };
    const st = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      pin: mount,
      pinSpacing: false,
      onUpdate: (self) => {
        state.progress = self.progress;
      },
    });

    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geom.getAttribute("color") as THREE.BufferAttribute;
    const tmpA = new THREE.Color();
    const tmpB = new THREE.Color();

    let raf = 0;
    const render = () => {
      const p = state.progress;
      // morph factor: 0 until 0.3, ramps to 1 by 0.6
      const m = THREE.MathUtils.clamp((p - 0.3) / 0.3, 0, 1);
      const eased = m * m * (3 - 2 * m); // smoothstep

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        posAttr.array[ix] = lerp(chaos[ix], logo[ix], eased);
        posAttr.array[ix + 1] = lerp(chaos[ix + 1], logo[ix + 1], eased);
        posAttr.array[ix + 2] = lerp(chaos[ix + 2], logo[ix + 2], eased);

        tmpA.setRGB(chaosColor[ix], chaosColor[ix + 1], chaosColor[ix + 2]);
        tmpB.setRGB(logoColor[ix], logoColor[ix + 1], logoColor[ix + 2]);
        tmpA.lerp(tmpB, eased);
        colAttr.array[ix] = tmpA.r;
        colAttr.array[ix + 1] = tmpA.g;
        colAttr.array[ix + 2] = tmpA.b;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // line constellation fades in over 0.6 → 1
      lineMat.opacity = THREE.MathUtils.clamp((p - 0.6) / 0.4, 0, 1) * 0.6;

      // slow rotation in chaos; settle to face-on at the logo
      const rot = (1 - eased) * 0.4;
      points.rotation.y = rot + p * 0.2;
      lines.rotation.y = points.rotation.y;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    // ---- resize ----
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      st.kill();
      geom.dispose();
      mat.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={trackRef} data-screen-label="data-to-insights" className="relative bg-canvas" style={{ height: "300vh" }}>
      <div ref={mountRef} className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-[12vh] z-10 px-[clamp(20px,5vw,48px)] text-center">
          <Eyebrow>Ingestion → insight</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
            Data to decisions
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-content-secondary">
            Agentronics turns disparate, unstructured agent traffic into structured, governable
            intelligence.
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-caps text-content-muted">
            Scroll to resolve ↓
          </p>
        </div>
      </div>
    </div>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Sample a point on the portal "A" mark. Returns [x, y, isAmber]. */
function sampleLogoPoint(): [number, number, boolean] {
  const S = 1.0; // overall scale (shape spans roughly ±48)
  const roll = Math.random();
  const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

  if (roll < 0.26) {
    // top bar (indigo)
    return [rand(-30, 30) * S, rand(30, 46) * S, false];
  } else if (roll < 0.5) {
    // left leg (indigo)
    return [rand(-30, -16) * S, rand(-46, 32) * S, false];
  } else if (roll < 0.74) {
    // right leg (indigo)
    return [rand(16, 30) * S, rand(-46, 32) * S, false];
  } else if (roll < 0.86) {
    // crossbar (amber)
    return [rand(-12, 12) * S, rand(8, 20) * S, true];
  } else if (roll < 0.97) {
    // three input node clusters off the left (amber)
    const yc = [22, 0, -22][Math.floor(Math.random() * 3)];
    return [rand(-50, -40) * S, (yc + rand(-5, 5)) * S, true];
  } else {
    // one output node off the right (amber)
    return [rand(40, 50) * S, rand(-6, 6) * S, true];
  }
}

/** Precompute nearest-neighbour pairs (each particle → up to 2 neighbours below threshold). */
function computeLinePairs(logo: Float32Array, count: number, threshold: number): [number, number][] {
  const pairs: [number, number][] = [];
  const seen = new Set<string>();
  const t2 = threshold * threshold;
  for (let i = 0; i < count; i++) {
    let found = 0;
    for (let j = i + 1; j < count && found < 2; j++) {
      const dx = logo[i * 3] - logo[j * 3];
      const dy = logo[i * 3 + 1] - logo[j * 3 + 1];
      const dz = logo[i * 3 + 2] - logo[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < t2) {
        const key = `${i}-${j}`;
        if (!seen.has(key)) {
          seen.add(key);
          pairs.push([i, j]);
          found++;
        }
      }
    }
  }
  return pairs;
}

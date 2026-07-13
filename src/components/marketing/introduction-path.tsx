"use client";

import { useEffect, useRef, useState } from "react";

// The signature element: a single thread connecting the three steps of an
// introduction, from a consumer's request to the professional who takes it
// on. Draws itself in once the section scrolls into view — the one
// orchestrated motion moment on the page, everything else stays still.
export function IntroductionPath({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [revealed, setRevealed] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 40 620"
      className={className}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMin meet"
    >
      <path
        d="M 20 20 C 20 140, 20 180, 20 310 S 20 480, 20 600"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray={620}
        strokeDashoffset={revealed ? 0 : 620}
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.65, 0, 0.35, 1)" }}
      />
      {[20, 310, 600].map((cy, i) => (
        <circle
          key={cy}
          cx={20}
          cy={cy}
          r={5}
          fill="currentColor"
          style={{
            opacity: revealed ? 1 : 0,
            transition: `opacity 0.4s ease ${0.3 + i * 0.45}s`,
          }}
        />
      ))}
    </svg>
  );
}

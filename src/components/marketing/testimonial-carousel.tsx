"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/testimonials";

const ADVANCE_INTERVAL_MS = 7000;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-[#B08A4E]" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            d="M10 1.5l2.47 5.29 5.53.7-4.07 3.96.96 5.55L10 14.27 5.11 17l.96-5.55L2 7.49l5.53-.7L10 1.5z"
            fill={i < count ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1}
          />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoAdvance = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, ADVANCE_INTERVAL_MS);
    return stopAutoAdvance;
  }, [testimonials.length, stopAutoAdvance]);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[index];

  return (
    <section className="border-y border-[#16201B]/10 bg-[#EBE6D9]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <p className="font-[family-name:var(--font-plex-mono)] text-[11px] uppercase tracking-[0.2em] text-[#B08A4E]">
          What people say
        </p>

        <figure className="mt-8 min-h-[180px]" aria-live="polite">
          <Stars count={testimonial.stars} />
          <blockquote className="mt-5 max-w-2xl font-[family-name:var(--font-fraunces)] text-2xl leading-snug text-[#16201B] sm:text-3xl">
            “{testimonial.quote}”
          </blockquote>
          <figcaption className="mt-5 text-sm text-[#16201B]/60">
            <span className="font-medium text-[#16201B]/85">{testimonial.name}</span>
            {" · "}
            {testimonial.service}
          </figcaption>
        </figure>

        {testimonials.length > 1 && (
          <div className="mt-8 flex gap-2" role="tablist" aria-label="Testimonials">
            {testimonials.map((entry, i) => (
              <button
                key={entry.name + i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => {
                  stopAutoAdvance();
                  setIndex(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-[#1F4A3C]" : "w-2 bg-[#16201B]/25 hover:bg-[#16201B]/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

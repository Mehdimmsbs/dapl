"use client";

import { useEffect, useRef } from "react";

const SURFACES = ".stat, .task, .carryItem, .quickGrid button, .brandIdentity";

/* Adds a visual response without intercepting clicks or touch scrolling. */
export default function DepthExperience() {
  const marker = useRef(null);

  useEffect(() => {
    const root = marker.current?.closest(".appShell");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let surface = null;
    let frame = 0;
    let resetTimer = 0;

    function reset() {
      cancelAnimationFrame(frame);
      clearTimeout(resetTimer);
      if (!surface) return;
      surface.classList.remove("depthEngaged");
      surface.style.removeProperty("--depth-rx");
      surface.style.removeProperty("--depth-ry");
      surface = null;
    }

    function respond(event) {
      if (reducedMotion.matches || document.hidden) return;
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("input, select, textarea, [role=listbox]")) return;
      const next = event.target.closest(SURFACES);
      if (!next || !root.contains(next)) { reset(); return; }
      if (surface !== next) { reset(); surface = next; }

      clearTimeout(resetTimer);
      cancelAnimationFrame(frame);
      const bounds = next.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      const angle = event.pointerType === "touch" ? 2 : 4;
      frame = requestAnimationFrame(() => {
        next.style.setProperty("--depth-rx", `${-y * angle}deg`);
        next.style.setProperty("--depth-ry", `${x * angle}deg`);
        next.classList.add("depthEngaged");
      });
    }

    function move(event) {
      // Touch movement belongs to scrolling; only the initial tap tilts.
      if (event.pointerType !== "touch") respond(event);
    }

    function release(event) {
      if (event.pointerType !== "mouse") resetTimer = window.setTimeout(reset, 160);
    }

    function visibility() {
      root.classList.toggle("depthPaused", document.hidden);
      if (document.hidden) reset();
    }

    root.classList.add("depthExperience");
    visibility();
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerdown", respond, { passive: true });
    root.addEventListener("pointerup", release, { passive: true });
    root.addEventListener("pointerleave", reset);
    root.addEventListener("pointercancel", reset);
    root.addEventListener("scroll", reset, true);
    document.addEventListener("visibilitychange", visibility);
    reducedMotion.addEventListener("change", reset);

    return () => {
      reset();
      root.classList.remove("depthExperience", "depthPaused");
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", respond);
      root.removeEventListener("pointerup", release);
      root.removeEventListener("pointerleave", reset);
      root.removeEventListener("pointercancel", reset);
      root.removeEventListener("scroll", reset, true);
      document.removeEventListener("visibilitychange", visibility);
      reducedMotion.removeEventListener("change", reset);
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" />;
}
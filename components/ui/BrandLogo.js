"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./BrandLogo.module.scss";

/* Shared animated badge, with the original logo as a permanent fallback. */
export default function BrandLogo({ width = 52, className = "" }) {
  const host = useRef(null);
  const canvas = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = host.current;
    const surface = canvas.current;
    let cancelled = false;
    let dispose = () => {};

    async function start() {
      const THREE = await import("three");
      if (cancelled || !element || !surface) return;

      const resources = [];
      const renderer = new THREE.WebGLRenderer({
        canvas: surface,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1.5, 0.1, 20);
      camera.position.z = 5;
      const badge = new THREE.Group();
      scene.add(badge);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7770bb, 3));
      const light = new THREE.DirectionalLight(0xffffff, 4);
      light.position.set(-3, 4, 5);
      scene.add(light);

      const shape = new THREE.Shape();
      const x = -0.98,
        y = -0.64,
        w = 1.96,
        h = 1.28,
        r = 0.22;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.045,
        bevelThickness: 0.045,
      });
      geometry.translate(0, 0, -0.1);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xf2efff,
        metalness: 0.16,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
      });
      badge.add(new THREE.Mesh(geometry, material));
      resources.push(geometry, material);

      let visible = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const resize = () => {
        if (cancelled) return;
        const { width: w, height: h } = element.getBoundingClientRect();
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      visibility.observe(element);
      const lost = (event) => {
        event.preventDefault();
        renderer.setAnimationLoop(null);
        if (!cancelled) setReady(false);
      };
      surface.addEventListener("webglcontextlost", lost);
      dispose = () => {
        observer.disconnect();
        visibility.disconnect();
        surface.removeEventListener("webglcontextlost", lost);
        renderer.setAnimationLoop(null);
        resources.forEach((item) => item.dispose());
        renderer.dispose();
      };
      resize();
      const texture = await new THREE.TextureLoader().loadAsync(
        "/icons/my-day-logo.png",
      );
      if (cancelled) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      const front = new THREE.PlaneGeometry(1.92, 1.28);
      const ink = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const logo = new THREE.Mesh(front, ink);
      logo.position.z = 0.075;
      badge.add(logo);
      resources.push(texture, front, ink);
      setReady(true);
      renderer.setAnimationLoop((milliseconds) => {
        if (cancelled || !visible || document.hidden) return;
        const time = milliseconds * 0.001;
        badge.rotation.y = reduced.matches
          ? -0.1
          : Math.sin(time * 0.65) * 0.24;
        badge.rotation.x = reduced.matches ? 0.05 : Math.cos(time * 0.5) * 0.1;
        badge.position.y = reduced.matches ? 0 : Math.sin(time * 0.9) * 0.055;
        renderer.render(scene, camera);
      });
    }

    start().catch(() => {
      if (!cancelled) {
        dispose();
        setReady(false);
      }
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <span
      ref={host}
      className={`brandLogo ${styles.logo} ${className}`.trim()}
      style={{ "--brand-logo-width": `${width}px` }}
      aria-hidden="true"
    >
      <Image
        src="/icons/my-day-logo.png"
        alt=""
        width={width}
        height={Math.round((width * 2) / 3)}
        className={styles.image}
        style={{ opacity: ready ? 0 : 1 }}
      />
      <canvas
        ref={canvas}
        className={styles.canvas}
        style={{ opacity: ready ? 1 : 0 }}
      />
    </span>
  );
}

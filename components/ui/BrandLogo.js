"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../../styles/components/_brand-logo.module.scss";

/* Original logo with layered depth; no added badge or camera padding. */
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
      // Orthographic framing preserves the original image dimensions.
      const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1, -1, 0.1, 20);
      camera.position.z = 5;
      const badge = new THREE.Group();
      scene.add(badge);

      let visible = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const resize = () => {
        if (cancelled) return;
        const { width: w, height: h } = element.getBoundingClientRect();
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        const aspect = w / h;
        camera.left = -aspect;
        camera.right = aspect;
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
      const front = new THREE.PlaneGeometry(3, 2);
      // Transparent copies add thickness only to the original logo silhouette.
      const edge = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0x6550ab,
        transparent: true,
        alphaTest: 0.15,
        depthWrite: false,
      });
      for (let index = 1; index <= 7; index += 1) {
        const layer = new THREE.Mesh(front, edge);
        layer.position.z = -index * 0.025;
        layer.renderOrder = 8 - index;
        badge.add(layer);
      }
      resources.push(edge);
      const ink = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const logo = new THREE.Mesh(front, ink);
      logo.position.z = 0;
      logo.renderOrder = 10;
      badge.add(logo);
      resources.push(texture, front, ink);
      setReady(true);
      renderer.setAnimationLoop((milliseconds) => {
        if (cancelled || !visible || document.hidden) return;
        const time = milliseconds * 0.001;
        badge.rotation.y = reduced.matches ? 0 : Math.sin(time * 1.2) * 0.65;

        badge.rotation.x = reduced.matches ? 0 : Math.sin(time * 0.8) * 0.16;

        badge.position.y = reduced.matches ? 0 : Math.sin(time * 1.4) * 0.025;
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

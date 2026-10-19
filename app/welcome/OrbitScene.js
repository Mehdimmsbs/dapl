"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../../styles/pages/_welcome.module.scss";

const ENTRIES = [
  { id: "today", href: "/", color: "#e4d9ff", symbol: "✓" },
  { id: "calendar", href: "/calendar", color: "#ffe2c7", symbol: "▦" },
  { id: "routines", href: "/routines", color: "#cceee0", symbol: "↻" },
  { id: "settings", href: "/settings", color: "#f4d7e5", symbol: "⚙" },
];

/* Real mesh cards; native HTML links keep touch and keyboard navigation. */
export default function OrbitScene({ copy, locale, onEnter }) {
  const host = useRef(null);
  const canvas = useRef(null);
  const links = useRef([]);
  const paused = useRef(false);
  const hovered = useRef(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};
    const hostElement = host.current;
    const canvasElement = canvas.current;
    if (!hostElement || !canvasElement) return;
    paused.current = false;
    hovered.current = -1;
    setReady(false);
    async function setup() {
      try {
        const T = await import("three");
        await document.fonts.ready;
        if (cancelled || !hostElement.isConnected) return;
        const renderer = new T.WebGLRenderer({
          canvas: canvasElement,
          alpha: true,
          antialias: true,
        });
        const disposables = [];
        const textures = [];
        const resources = [];
        let cleaned = false;
        teardown = () => {
          if (cleaned) return;
          cleaned = true;
          renderer.setAnimationLoop(null);
          disposables.forEach((dispose) => dispose());
          resources.forEach((resource) => resource.dispose());
          textures.forEach((texture) => texture.dispose());
          renderer.dispose();
        };
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.outputColorSpace = T.SRGBColorSpace;
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 1.1, 10);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight(0xffffff, 0x8e75a6, 2.6));
        const light = new T.DirectionalLight(0xffffff, 3);
        light.position.set(-3, 6, 7);
        scene.add(light);
        function roundedShape(w, h, r) {
          const shape = new T.Shape();
          shape.moveTo(-w / 2 + r, -h / 2);
          shape.lineTo(w / 2 - r, -h / 2);
          shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
          shape.lineTo(w / 2, h / 2 - r);
          shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
          shape.lineTo(-w / 2 + r, h / 2);
          shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
          shape.lineTo(-w / 2, -h / 2 + r);
          shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
          return shape;
        }
        const geometry = new T.ExtrudeGeometry(roundedShape(1.35, 0.98, 0.14), {
          depth: 0.12,
          bevelEnabled: true,
          bevelThickness: 0.04,
          bevelSize: 0.035,
          bevelSegments: 3,
          steps: 1,
        });
        resources.push(geometry);
        const cards = ENTRIES.map((item) => {
          const card = new T.Group();
          const material = new T.MeshStandardMaterial({
            color: item.color,
            roughness: 0.3,
            metalness: 0.04,
          });
          resources.push(material);
          card.add(new T.Mesh(geometry, material));
          const face = document.createElement("canvas");
          face.width = 640;
          face.height = 420;
          const ctx = face.getContext("2d");
          ctx.fillStyle = item.color;
          ctx.fillRect(0, 0, 640, 420);
          ctx.fillStyle = "#6a568f";
          ctx.font = "94px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.symbol, 320, 170);
          const font = getComputedStyle(hostElement).fontFamily;
          ctx.direction = ["fa", "ar"].includes(locale) ? "rtl" : "ltr";
          let size = 48;
          do {
            ctx.font = `600 ${size}px ${font}`;
            size -= 2;
          } while (ctx.measureText(copy[item.id]).width > 560 && size > 20);
          ctx.fillStyle = "#30243e";
          ctx.fillText(copy[item.id], 320, 310);
          const texture = new T.CanvasTexture(face);
          texture.colorSpace = T.SRGBColorSpace;
          textures.push(texture);
          const frontMaterial = new T.MeshBasicMaterial({ map: texture });
          resources.push(frontMaterial);
          const planeGeometry = new T.PlaneGeometry(1.28, 0.87);
          resources.push(planeGeometry);
          const plane = new T.Mesh(planeGeometry, frontMaterial);
          plane.position.z = 0.166;
          card.add(plane);
          scene.add(card);
          return card;
        });
        // A small solid mascot: no duplicated logo or image assets.
        const thinker = new T.Group();
        scene.add(thinker);
        function sphere(radius, color, scale, position, parent = thinker) {
          const geo = new T.SphereGeometry(radius, 40, 28);
          const mat = new T.MeshStandardMaterial({
            color,
            roughness: 0.28,
            metalness: 0.02,
          });
          resources.push(geo, mat);
          const mesh = new T.Mesh(geo, mat);
          mesh.scale.set(...scale);
          mesh.position.set(...position);
          parent.add(mesh);
          return mesh;
        }
        sphere(0.68, 0xbba5ef, [1, 1.06, 0.84], [0, 0, 0]);
        sphere(0.2, 0xd7c8f7, [0.65, 1.1, 0.65], [-0.63, -0.15, -0.02]);
        sphere(0.2, 0xd7c8f7, [0.65, 1.1, 0.65], [0.63, -0.15, -0.02]);
        sphere(0.18, 0x9d83ce, [1.2, 0.5, 1.1], [-0.28, -0.68, 0.1]);
        sphere(0.18, 0x9d83ce, [1.2, 0.5, 1.1], [0.28, -0.68, 0.1]);
        sphere(0.13, 0xf6afce, [1, 0.5, 0.2], [-0.48, -0.13, 0.45]);
        sphere(0.13, 0xf6afce, [1, 0.5, 0.2], [0.48, -0.13, 0.45]);
        // One curl and an asymmetrical brow give it a thoughtful expression.
        sphere(0.13, 0x9e83d7, [0.55, 1.3, 0.6], [0.08, 0.72, 0]);
        const eyes = [-0.25, 0.25].map((x) => {
          const group = new T.Group();
          group.position.set(x, 0.13, 0.54);
          thinker.add(group);
          sphere(0.23, 0xfffefa, [0.95, 1.12, 0.6], [0, 0, 0], group);
          const pupil = new T.Group();
          group.add(pupil);
          sphere(0.105, 0x322449, [0.88, 1.12, 0.48], [0, 0, 0.14], pupil);
          sphere(0.035, 0xffffff, [1, 1, 0.6], [-0.025, 0.035, 0.19], pupil);
          return { group, pupil };
        });
        const brow = sphere(
          0.11,
          0x796297,
          [1.7, 0.24, 0.35],
          [-0.25, 0.43, 0.5],
        );
        brow.rotation.z = -0.15;
        const otherBrow = sphere(
          0.11,
          0x796297,
          [1.6, 0.24, 0.35],
          [0.25, 0.46, 0.5],
        );
        otherBrow.rotation.z = 0.2;
        const smileGeo = new T.TorusGeometry(0.1, 0.017, 8, 24, Math.PI);
        const smileMat = new T.MeshStandardMaterial({ color: 0x796297 });
        resources.push(smileGeo, smileMat);
        const smile = new T.Mesh(smileGeo, smileMat);
        smile.rotation.z = Math.PI;
        smile.position.set(0, -0.2, 0.56);
        thinker.add(smile);
        const ringGeo = new T.TorusGeometry(2.3, 0.009, 8, 100);
        const ringMat = new T.MeshStandardMaterial({
          color: 0xb4a2cf,
          transparent: true,
          opacity: 0.45,
        });
        resources.push(ringGeo, ringMat);
        const ring = new T.Mesh(ringGeo, ringMat);
        ring.rotation.x = 1.2;
        scene.add(ring);
        let width = 1,
          height = 1,
          angle = 0,
          last = 0,
          visible = true;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        function fit() {
          if (cancelled || cleaned || !hostElement.isConnected) return;
          width = hostElement.clientWidth;
          height = hostElement.clientHeight;
          if (width < 1 || height < 1) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.position.z = camera.aspect < 1 ? 11.5 : 9.5;
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
        }
        const resize = new ResizeObserver(fit);
        disposables.push(() => resize.disconnect());
        resize.observe(hostElement);
        fit();
        const observer = new IntersectionObserver((entries) => {
          if (!cancelled && !cleaned && entries[0])
            visible = entries[0].isIntersecting;
        });
        disposables.push(() => observer.disconnect());
        observer.observe(hostElement);
        const projected = new T.Vector3();
        const edge = new T.Vector3();
        function render(now) {
          const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
          last = now;
          if (
            cancelled ||
            cleaned ||
            !hostElement.isConnected ||
            !visible ||
            document.hidden
          )
            return;
          if (!paused.current && !motion.matches) angle += delta * 0.18;
          cards.forEach((card, i) => {
            const a = angle + (i * Math.PI) / 2 + 0.45;
            card.position.set(
              Math.cos(a) * 2.35,
              Math.sin(a) * 0.85,
              Math.sin(a) * 1.4,
            );
            card.rotation.set(-0.07, Math.sin(a) * -0.12, Math.cos(a) * 0.06);
            const link = links.current[i];
            if (!link) return;
            projected.copy(card.position).project(camera);
            edge.copy(card.position);
            edge.x += 0.77;
            edge.project(camera);
            const size = Math.abs(edge.x - projected.x) * width;
            link.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
            link.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`;
            link.style.width = `${size}px`;
            link.style.height = `${size * 0.76}px`;
            link.style.zIndex = String(Math.round(card.position.z * 10) + 30);
          });
          const target =
            hovered.current >= 0
              ? cards[hovered.current]
              : cards.reduce((front, card) =>
                  card.position.z > front.position.z ? card : front,
                );
          const gazeX = T.MathUtils.clamp(
            target.position.x * 0.03,
            -0.08,
            0.08,
          );
          const gazeY = T.MathUtils.clamp(
            target.position.y * 0.065,
            -0.06,
            0.06,
          );
          const smoothing = 1 - Math.exp(-delta * 7);
          eyes.forEach(({ group, pupil }) => {
            pupil.position.x = T.MathUtils.lerp(
              pupil.position.x,
              gazeX,
              smoothing,
            );
            pupil.position.y = T.MathUtils.lerp(
              pupil.position.y,
              gazeY,
              smoothing,
            );
            const cycle = (now / 1000) % 5.3;
            const blink =
              !motion.matches && cycle > 5.1
                ? Math.max(0.12, Math.abs(cycle - 5.2) * 10)
                : 1;
            group.scale.y = blink;
          });
          thinker.rotation.y = T.MathUtils.lerp(
            thinker.rotation.y,
            gazeX * 1.5,
            smoothing,
          );
          thinker.rotation.z = T.MathUtils.lerp(
            thinker.rotation.z,
            -gazeX * 0.3,
            smoothing,
          );
          thinker.position.y = motion.matches ? 0 : Math.sin(angle * 2) * 0.06;
          renderer.render(scene, camera);
        }
        const lose = (event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          if (!cancelled) setReady(false);
        };
        canvasElement.addEventListener("webglcontextlost", lose);
        disposables.push(() =>
          canvasElement.removeEventListener("webglcontextlost", lose),
        );
        if (cancelled) {
          teardown();
          return;
        }
        setReady(true);
        renderer.setAnimationLoop(render);
      } catch {
        teardown();
        if (!cancelled) setReady(false);
      }
    }
    setup();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [copy, locale]);

  return (
    <div className={styles.orbitStage}>
      <div
        ref={host}
        className={`${styles.orbitHost} ${ready ? styles.webglReady : ""}`}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <nav
          aria-label={copy.explore}
          className={ready ? styles.sceneLinks : styles.sceneFallback}
        >
          {ENTRIES.map((item, index) => (
            <Link
              key={item.id}
              ref={(element) => {
                links.current[index] = element;
              }}
              href={item.href}
              onPointerEnter={() => {
                paused.current = true;
                hovered.current = index;
              }}
              onPointerLeave={() => {
                paused.current = false;
                hovered.current = -1;
              }}
              onPointerDown={() => {
                paused.current = true;
                hovered.current = index;
              }}
              onPointerCancel={() => {
                paused.current = false;
                hovered.current = -1;
              }}
              onFocus={() => {
                paused.current = true;
                hovered.current = index;
              }}
              onBlur={() => {
                paused.current = false;
                hovered.current = -1;
              }}
              className={styles.sceneLink}
              style={
                ready
                  ? undefined
                  : { left: "auto", top: "auto", width: "auto", height: "auto" }
              }
              onClick={(event) => onEnter(event, item.href, item.id)}
              aria-label={copy[item.id]}
            >
              <span>{copy[item.id]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* Animated shader waves run on the GPU, with a CSS fallback. */
export function WaveBackdrop() {
  const canvas = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};
    const canvasElement = canvas.current;
    if (!canvasElement) return;
    import("three")
      .then((T) => {
        if (cancelled) return;
        try {
          const renderer = new T.WebGLRenderer({
            canvas: canvasElement,
            alpha: true,
            antialias: false,
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
          const scene = new T.Scene();
          const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
          const uniforms = {
            time: { value: 0 },
            dark: { value: 0 },
            aspect: { value: 1 },
          };
          const material = new T.ShaderMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            uniforms,
            vertexShader:
              "varying vec2 uvp;void main(){uvp=uv;gl_Position=vec4(position.xy,0.,1.);}",
            fragmentShader: `precision mediump float;varying vec2 uvp;uniform float time;uniform float dark;uniform float aspect;
          void main(){vec2 p=uvp;float t=time*.12;float a=p.y+.10*sin(p.x*5.+t)+.06*sin(p.x*9.-t*.7);float b=p.y+.12*cos(p.x*4.-t*.8);
          float violet=exp(-pow((a-.62)*7.,2.));float mint=exp(-pow((b-.78)*10.,2.));float blue=exp(-pow((a-.9)*6.,2.));
          vec3 base=mix(vec3(.975,.98,1.),vec3(.075,.08,.14),dark);
          vec3 col=mix(base,vec3(.62,.55,.94),violet*.38);col=mix(col,vec3(.49,.94,.86),mint*.38);col=mix(col,vec3(.55,.76,1.),blue*.22);
          gl_FragColor=vec4(col,1.);}`,
          });
          const geo = new T.PlaneGeometry(2, 2);
          scene.add(new T.Mesh(geo, material));
          function resize() {
            if (cancelled || !canvasElement.isConnected) return;
            renderer.setSize(window.innerWidth, window.innerHeight, false);
            uniforms.aspect.value = window.innerWidth / window.innerHeight;
          }
          resize();
          window.addEventListener("resize", resize);
          const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
          let previous = 0;
          let elapsed = 0;
          renderer.setAnimationLoop((now) => {
            const delta = previous ? Math.min(now - previous, 100) : 0;
            if (now - previous < 33) return;
            previous = now;
            if (cancelled || !canvasElement.isConnected || document.hidden)
              return;
            if (!motion.matches) elapsed += delta / 1000;
            uniforms.time.value = elapsed;
            uniforms.dark.value = document.documentElement.classList.contains(
              "dark",
            )
              ? 1
              : 0;
            renderer.render(scene, camera);
          });
          teardown = () => {
            window.removeEventListener("resize", resize);
            renderer.setAnimationLoop(null);
            geo.dispose();
            material.dispose();
            renderer.dispose();
          };
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      teardown();
    };
  }, []);
  return (
    <div className={styles.waveBackdrop} aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}

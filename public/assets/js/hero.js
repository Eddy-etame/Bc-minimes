/* =====================================================================
   MINIMES · hero.js — A/B hero with toggle
   A "Pochoir"  : real training footage shows THROUGH the word MINIMES
                  (black multiply panel + white letters = video knockout)
   B "Shader"   : Three.js video-texture, duotone (black→bone, faint red),
                  pointer ripple + RGB-shift (Lusion / Active Theory lesson)
   Red stays a spark.
   ===================================================================== */
const gsap = window.gsap;
const THREE = window.THREE;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  setupToggle(hero);
  intro(hero);
  if (THREE && !reduce) { try { initWebGL(hero); } catch (e) { /* B falls back to plain video */ } }
}

function setupToggle(hero) {
  const btn = document.getElementById("hero-toggle");
  if (!btn) return;
  const label = btn.querySelector("span");
  const set = (mode) => {
    hero.dataset.hero = mode;
    /* the static "Vue : " text node already prefixes the span — only the
       mode word belongs in the span (else it reads "Vue : Vue : Pochoir") */
    if (label) label.textContent = mode === "a" ? "Pochoir" : "Shader";
    /* c'est un contrôle à deux états : l'état DOIT être exposé. Avant, un
       aria-label écrasait le texte visible et le lecteur d'écran n'entendait
       jamais le seul mot que l'utilisateur voyant lit (Pochoir / Shader). */
    btn.setAttribute("aria-pressed", String(mode === "b"));
    try { localStorage.setItem("bc-hero", mode); } catch (e) {}
  };
  const saved = (() => { try { return localStorage.getItem("bc-hero"); } catch (e) { return null; } })();
  set(saved === "b" ? "b" : "a");
  btn.addEventListener("click", () => set(hero.dataset.hero === "a" ? "b" : "a"));
}

function intro(hero) {
  const fades = hero.querySelectorAll("[data-reveal]");
  fades.forEach((el) => (el.dataset.revBound = "1"));
  const chars = [];
  hero.querySelectorAll(".hero__word [data-split]").forEach((w) => window.BC.split(w).forEach((c) => chars.push(c)));
  if (reduce) return;
  gsap.set(chars, { yPercent: 118, opacity: 0 });
  gsap.set(fades, { opacity: 0, y: 26 });
  gsap.set(".hero__src", { scale: 1.18 });
  gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
    .to(".hero__src", { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
    .to(chars, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.04 }, 0.35)
    .to(fades, { opacity: 1, y: 0, duration: 0.85, stagger: 0.09 }, 0.9);
  gsap.to(".hero__stage", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
}

function initWebGL(hero) {
  const canvas = document.getElementById("hero-canvas");
  const video = document.getElementById("hero-video");
  if (!canvas || !video) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tex = new THREE.VideoTexture(video);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
  const u = {
    uTex: { value: tex }, uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) }, uTexRes: { value: new THREE.Vector2(16, 9) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uHover: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }",
    fragmentShader: `precision highp float; varying vec2 vUv;
      uniform sampler2D uTex; uniform vec2 uRes,uTexRes,uMouse; uniform float uTime,uHover;
      void main(){
        vec2 uv=vUv; float sA=uRes.x/uRes.y, tA=uTexRes.x/uTexRes.y; vec2 c=uv;
        if(sA>tA){ c.y=(uv.y-0.5)*(tA/sA)+0.5; } else { c.x=(uv.x-0.5)*(sA/tA)+0.5; }
        float d=distance(uv,uMouse);
        float fall=smoothstep(0.45,0.0,d)*(0.35+uHover);
        vec2 off=normalize(uv-uMouse+0.0001)*sin(d*28.0-uTime*3.0)*0.006*fall;
        float sh=0.006*fall;
        float r=texture2D(uTex,c+off+vec2(sh,0.0)).r;
        float g=texture2D(uTex,c+off).g;
        float b=texture2D(uTex,c+off-vec2(sh,0.0)).b;
        float l=dot(vec3(r,g,b),vec3(0.299,0.587,0.114));
        vec3 sdw=vec3(0.02), mid=vec3(0.30,0.05,0.04), hi=vec3(0.95,0.93,0.89);
        vec3 col=mix(sdw,mid,smoothstep(0.0,0.5,l));
        col=mix(col,hi,smoothstep(0.5,1.0,l));
        float v=distance(uv,vec2(0.5)); col*=1.0-0.55*v*v;
        gl_FragColor=vec4(col,1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    u.uRes.value.set(r.width, r.height);
  };
  resize(); addEventListener("resize", resize);
  video.addEventListener("loadedmetadata", () => u.uTexRes.value.set(video.videoWidth || 16, video.videoHeight || 9));
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    u.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  });
  hero.addEventListener("mouseenter", () => gsap.to(u.uHover, { value: 1, duration: 0.6 }));
  hero.addEventListener("mouseleave", () => gsap.to(u.uHover, { value: 0, duration: 0.8 }));
  hero.classList.add("is-webgl");
  gsap.ticker.add(() => {
    u.uTime.value += 0.016;
    if (hero.dataset.hero === "b" && video.readyState >= 2) {
      try { renderer.render(scene, cam); } catch (e) { /* never break the shared ticker */ }
    }
  });
}

/* =====================================================================
   MINIMES · hero.js — A/B hero with toggle
   A "Pochoir"  : real training footage shows THROUGH the word MINIMES
                  (black multiply panel + white letters = video knockout)
   B "Shader"   : video-texture en WebGL brut, duotone (fond profond → navy
                  → os), ondulation au pointeur + décalage RVB.
   Le bleu est la braise, pas le décor.

   Pourquoi WebGL brut et plus three.js : le mode B n’est qu’un quad
   plein écran avec UN fragment shader. On importait 608 ko de moteur 3D
   (152 ko gzip) pour six classes — sur la page d’accueil, c’est-à-dire
   sur le LCP, et pour une vue qui n’est même pas celle par défaut.
   Le shader ci-dessous est repris CARACTÈRE POUR CARACTÈRE : le rendu
   est le même pixel pour pixel, il ne reste que le moteur en moins.
   ===================================================================== */
const gsap = window.gsap;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  setupToggle(hero);
  intro(hero);
  if (!reduce && gsap) { try { initWebGL(hero); } catch (e) { /* B falls back to plain video */ } }
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
    /* c’est un contrôle à deux états : l’état DOIT être exposé. Avant, un
       aria-label écrasait le texte visible et le lecteur d’écran n’entendait
       jamais le seul mot que l’utilisateur voyant lit (Pochoir / Shader). */
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
  if (reduce || !gsap) return;
  gsap.set(chars, { yPercent: 118, opacity: 0 });
  gsap.set(fades, { opacity: 0, y: 26 });
  gsap.set(".hero__src", { scale: 1.18 });
  gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
    .to(".hero__src", { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
    .to(chars, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.04 }, 0.35)
    .to(fades, { opacity: 1, y: 0, duration: 0.85, stagger: 0.09 }, 0.9);
  gsap.to(".hero__stage", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
}

/* Le fragment shader, inchangé (GLSL ES 1.00, comme sous three.js). */
const FRAG = `precision highp float; varying vec2 vUv;
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
        /* duotone de la charte : ombre = fond profond, MÉDIUM = navy #182848,
           haute lumière = os #eef1f6. Le rouge a quitté le shader. */
        vec3 sdw=vec3(0.039,0.063,0.125), mid=vec3(0.094,0.157,0.282), hi=vec3(0.933,0.945,0.965);
        vec3 col=mix(sdw,mid,smoothstep(0.0,0.5,l));
        col=mix(col,hi,smoothstep(0.5,1.0,l));
        float v=distance(uv,vec2(0.5)); col*=1.0-0.55*v*v;
        gl_FragColor=vec4(col,1.0);
      }`;

/* Même quad que PlaneGeometry(2,2) : position déjà en espace de clip,
   uv.y = 1 en haut. On ne déclare que ce que three.js injectait. */
const VERT = `attribute vec3 position; attribute vec2 uv;
      varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}

function initWebGL(hero) {
  const canvas = document.getElementById("hero-canvas");
  const video = document.getElementById("hero-video");
  if (!canvas || !video) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true })
          || canvas.getContext("experimental-webgl", { antialias: false, alpha: true });
  if (!gl) return;   /* pas de WebGL → le mode B retombe sur la vidéo nue */

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  gl.useProgram(prog);

  /* TRIANGLE_STRIP : 4 sommets, position (xyz) + uv entrelacés. */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0, 0, 0,
     1, -1, 0, 1, 0,
    -1,  1, 0, 0, 1,
     1,  1, 0, 1, 1,
  ]), gl.STATIC_DRAW);
  const STRIDE = 5 * 4;
  const aPos = gl.getAttribLocation(prog, "position");
  const aUv = gl.getAttribLocation(prog, "uv");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, STRIDE, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, STRIDE, 3 * 4);

  /* Texture vidéo : LINEAR sans mipmap + CLAMP — obligatoire en NPOT,
     et c’est exactement ce que faisait THREE.VideoTexture ici. */
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  /* three.js posait flipY : sans lui la vidéo sort à l’envers. */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const loc = (n) => gl.getUniformLocation(prog, n);
  const uTex = loc("uTex"), uTime = loc("uTime"), uRes = loc("uRes"),
        uTexRes = loc("uTexRes"), uMouse = loc("uMouse"), uHover = loc("uHover");
  gl.uniform1i(uTex, 0);

  /* Objets nus, mais de la même FORME que les uniformes three.js :
     gsap.to(u.uHover, {value: …}) continue de marcher tel quel. */
  const u = {
    time: 0, hover: { value: 0 },
    res: [1, 1], texRes: [16, 9], mouse: [0.5, 0.5],
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const pr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * pr)), h = Math.max(1, Math.round(r.height * pr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    /* uRes ne sert qu’au RATIO : on garde les unités CSS, comme avant. */
    u.res[0] = r.width; u.res[1] = r.height;
  };
  resize(); addEventListener("resize", resize);

  video.addEventListener("loadedmetadata", () => {
    u.texRes[0] = video.videoWidth || 16; u.texRes[1] = video.videoHeight || 9;
  });
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    u.mouse[0] = (e.clientX - r.left) / r.width;
    u.mouse[1] = 1 - (e.clientY - r.top) / r.height;
  });
  hero.addEventListener("mouseenter", () => gsap.to(u.hover, { value: 1, duration: 0.6 }));
  hero.addEventListener("mouseleave", () => gsap.to(u.hover, { value: 0, duration: 0.8 }));

  let lost = false;
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; });
  canvas.addEventListener("webglcontextrestored", () => { lost = true; /* on n’y revient pas : la vidéo nue reprend */ });

  hero.classList.add("is-webgl");
  gsap.ticker.add(() => {
    u.time += 0.016;
    if (lost || hero.dataset.hero !== "b" || video.readyState < 2) return;
    try {
      gl.useProgram(prog);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.uniform1f(uTime, u.time);
      gl.uniform1f(uHover, u.hover.value);
      gl.uniform2f(uRes, u.res[0], u.res[1]);
      gl.uniform2f(uTexRes, u.texRes[0], u.texRes[1]);
      gl.uniform2f(uMouse, u.mouse[0], u.mouse[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } catch (e) { /* never break the shared ticker */ }
  });
}

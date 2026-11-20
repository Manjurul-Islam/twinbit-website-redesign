/* Hero cursor trail — WebGL2 port of "Custom-Shaped Cursor Trail" (Bautista Berto, Codrops 2026, MIT).
   Same pipeline and default values as the demo:
     - 202×202 float "memory" grid; the cursor stamps a crossSquareCorner brush into it every frame
       (R = inverted dx flow, G = dy flow, B = speed). Decay .9/frame @60fps (demo: .97) for a quicker recovery
     - fragment shader: 9-tap blurred trail → warps the source UV → samples the hero (title + phone)
     - 3-stop speed trail (#eb0000 → #ffd70f → #ffa600) with bloom, masked to the shapes
     - intro: a virtual cursor sweeps across at 15° with a .2 wave while the shapes fade in from a blur
   Only the title lines and the mockup react to the pointer.
   The DOM title/phone stay in the page for layout, SEO and screen readers; the canvas paints them. */
(() => {
  const P = {
    grid: 202, radius: 0.05, strength: 0.7, influenceGain: 0.3, influenceGamma: 0.9,
    decay: 0.9, // per 60fps frame; demo uses .97 — .9 clears in ~0.6s instead of ~2s
    brushFalloff: 2.6, brushScale: 2, patternThickness: 0.1, patternWidth: 0.92,
    warpStrength: 0.5, trailBlurRadius: 0.02, trailIntensity: 4.5, bloomEdge: 0.05, bloomExp: 1.4,
    colorLow: [0xeb, 0x00, 0x00], colorMid: [0xff, 0xd7, 0x0f], colorHigh: [0xff, 0xa6, 0x00],
    introDuration: 1.4, introBlur: 0.01, introDirection: 15, introWave: 0.2,
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

  const VS = `#version 300 es
  in vec2 p; out vec2 vUv;
  void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 vUv; out vec4 o;
  uniform sampler2D uTrail, uSrc;
  uniform float uWarp, uBlurR, uIntensity, uReveal, uIntroBlur, uEdge, uExp;
  uniform vec3 cLow, cMid, cHigh;
  vec4 T(vec2 d){ return texture(uTrail, vUv + d); }
  vec4 S(vec2 uv){ return texture(uSrc, uv); }
  void main(){
    float r = uBlurR;
    vec4 t = (T(vec2(-r,-r)) + T(vec2(r,-r)) + T(vec2(-r,r)) + T(vec2(r,r))
            + 2.*(T(vec2(0.,-r)) + T(vec2(-r,0.)) + T(vec2(r,0.)) + T(vec2(0.,r))) + 4.*T(vec2(0.))) / 16.;
    vec2 flow = t.rg; float speed = clamp(t.b, 0., 1.);
    vec2 uv = vUv + flow * uWarp;
    float br = max(uIntroBlur * (1. - uReveal), 0.);
    vec4 s = (S(uv) + S(uv + vec2(br, br)) + S(uv + vec2(-br, br)) + S(uv + vec2(br, -br)) + S(uv + vec2(-br, -br))) / 5.;
    float mask = s.a * clamp(uReveal, 0., 1.);
    vec3 base = s.a > 0. ? s.rgb / s.a : vec3(0.);
    vec3 tc = mix(mix(cLow, cMid, smoothstep(0., .5, speed)), cHigh, smoothstep(.5, 1., speed));
    float glow = clamp(pow(uEdge / max(1. - speed, .001), uExp), 0., 4.);
    vec3 col = min(base + tc * speed * (1. + glow) * uIntensity, vec3(1.));
    o = vec4(col * mask, mask);
  }`;

  function create(stage, opts = {}) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero__gl';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    const hex = a => a.map(v => v / 255);
    gl.uniform1i(U('uTrail'), 0); gl.uniform1i(U('uSrc'), 1);
    gl.uniform1f(U('uWarp'), P.warpStrength); gl.uniform1f(U('uBlurR'), P.trailBlurRadius); gl.uniform1f(U('uIntensity'), P.trailIntensity);
    gl.uniform1f(U('uIntroBlur'), P.introBlur); gl.uniform1f(U('uEdge'), P.bloomEdge); gl.uniform1f(U('uExp'), P.bloomExp);
    gl.uniform3fv(U('cLow'), hex(P.colorLow)); gl.uniform3fv(U('cMid'), hex(P.colorMid)); gl.uniform3fv(U('cHigh'), hex(P.colorHigh));
    const uReveal = U('uReveal');
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // trail grid (float RGBA, nearest — keeps the pixel-block stamps)
    const N = P.grid, data = new Float32Array(4 * N * N);
    const trailTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, N, N, 0, gl.RGBA, gl.FLOAT, data);

    // source texture: title + phone painted from their live DOM layout
    const src = document.createElement('canvas'), sctx = src.getContext('2d');
    const srcTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, srcTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const PAD = 60; // room around the stage so warped edges are never cut
    let W = 0, H = 0, dpr = 1, box = null;
    const phC = document.createElement('canvas'); let phKey = '';
    const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

    function paint() {
      const sr = stage.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.round(sr.width + PAD * 2); H = Math.round(sr.height + PAD * 2);
      box = { left: -PAD, top: -PAD };
      Object.assign(canvas.style, { left: -PAD + 'px', top: -PAD + 'px', width: W + 'px', height: H + 'px' });
      const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = src.width = cw; canvas.height = src.height = ch; } // only reallocate on resize — scroll repaints stay cheap
      const c = sctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      const ox = sr.left - PAD, oy = sr.top - PAD;

      // mockup: the device image itself (it carries its own frame), shadow follows its alpha. Cached per size/theme.
      const ph = stage.querySelector('.phone'), img = stage.querySelector('.phone__img');
      if (ph && img && img.naturalWidth) {
        const r = ph.getBoundingClientRect(), w = r.width, h = r.height;
        const lightT = document.documentElement.dataset.theme === 'light';
        const key = [Math.round(w), Math.round(h), dpr, lightT, img.currentSrc].join('|');
        if (phKey !== key) {
          phKey = key; const SP = 60;
          phC.width = Math.round((w + SP * 2) * dpr); phC.height = Math.round((h + SP * 2) * dpr);
          const pc = phC.getContext('2d'); pc.setTransform(dpr, 0, 0, dpr, 0, 0); pc.clearRect(0, 0, w + SP * 2, h + SP * 2);
          pc.shadowColor = lightT ? 'rgba(60,40,20,.15)' : 'rgba(0,0,0,.42)'; pc.shadowBlur = lightT ? 22 : 30; pc.shadowOffsetY = lightT ? 14 : 22;
          pc.imageSmoothingQuality = 'high'; pc.drawImage(img, SP, SP, w, h);
        }
        c.drawImage(phC, r.left - ox - 60, r.top - oy - 60, phC.width / dpr, phC.height / dpr);
      }
      // title lines, drawn on their real baselines
      stage.querySelectorAll('[data-hero-title] .ln>span').forEach(el => {
        const cs = getComputedStyle(el), r = el.getBoundingClientRect();
        const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.2;
        c.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
        c.fontStretch = ({ '75%': 'condensed', '87.5%': 'semi-condensed', '112.5%': 'semi-expanded' })[cs.fontStretch] || 'normal'; c.fontKerning = 'normal';
        c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
        c.fillStyle = cs.color; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
        const m = c.measureText('Hg'), A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
        c.fillText(el.textContent, r.left - ox, r.top - oy + (lh - (A + D)) / 2 + A);
      });
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.viewport(0, 0, canvas.width, canvas.height);
      rects = [];
      canvas.style.visibility = '';
      wake();
    }

    // pointer → [0,2] space of the canvas (0 = left / top), exactly like the demo hook
    let raw = null, override = null; const prev = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
    // only the heading lines and the mockup react — the pointer is ignored everywhere else in the hero
    const targets = () => [...stage.querySelectorAll('[data-hero-title] .ln>span, .phone')].map(el => el.getBoundingClientRect());
    let rects = [];
    const TOL = 6;
    const hit = (x, y) => rects.some(r => x >= r.left - TOL && x <= r.right + TOL && y >= r.top - TOL && y <= r.bottom + TOL);
    const onMove = e => {
      if (!rects.length) rects = targets();
      if (!hit(e.clientX, e.clientY)) { if (raw) { raw = null; vel.x = vel.y = 0; } return; }
      const b = canvas.getBoundingClientRect();
      const next = { x: clamp((e.clientX - b.left) / b.width * 2, 0, 2), y: clamp((e.clientY - b.top) / b.height * 2, 0, 2) };
      if (!raw) { prev.x = next.x; prev.y = next.y; } // entering a shape: no velocity jump from the last exit point
      raw = next;
      wake();
    };
    const refreshRects = () => { rects = []; };
    addEventListener('scroll', refreshRects, { passive: true });
    addEventListener('resize', refreshRects);
    const onLeave = () => { raw = null; vel.x = vel.y = 0; };
    const host = opts.host || stage;
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    addEventListener('blur', onLeave);

    function step(dt) {
      const decay = Math.pow(P.decay, dt * 60); let max = 0; // per-frame decay normalised to 60fps, so recovery time is the same on any display
      for (let i = 0; i < data.length; i += 4) { data[i] *= decay; data[i + 1] *= decay; const b = (data[i + 2] *= decay); if (b > max) max = b; }
      const ptr = override || raw;
      if (ptr) {
        vel.x = ptr.x - prev.x; vel.y = ptr.y - prev.y; prev.x = ptr.x; prev.y = ptr.y;
        const R = N * P.radius, cx = ptr.x * .5 * N - R * .5, cy = (2 - ptr.y) * .5 * N + R * .5;
        const vx = vel.x * (N / 2), vy = -vel.y * (N / 2), sp = Math.hypot(vx, vy);
        const g = P.influenceGamma, vxc = Math.sign(vx) * Math.abs(vx) ** g, vyc = Math.sign(vy) * Math.abs(vy) ** g, spc = sp ** g;
        const len = Math.hypot(vxc, vyc) || 1, ndx = vxc / len, ndy = vyc / len;
        const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(N - 1, Math.ceil(cx + R));
        const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(N - 1, Math.ceil(cy + R));
        if (spc > 0) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
          const dx = x + .5 - cx, dy = y + .5 - cy, d2 = dx * dx + dy * dy;
          if (d2 >= R * R || d2 <= 0) continue;
          // crossSquareCorner brush
          const lx = dx / R, ly = dy / R, rN = Math.sqrt(d2) / R;
          const cross = Math.min(1, (Math.abs(lx) <= P.patternThickness) + (Math.abs(ly) <= P.patternThickness));
          const rux = (lx - ly) * Math.SQRT1_2, ruy = (lx + ly) * Math.SQRT1_2;
          const diag = Math.min(1, (1 - Math.abs(rux) >= P.patternWidth) + (1 - Math.abs(ruy) >= P.patternWidth));
          const mask = Math.min(1, (1 - cross) + diag);
          const force = (1 - rN) ** P.brushFalloff * mask * P.brushScale;
          if (force <= 0) continue;
          const sc = P.influenceGain * P.strength * force, disp = sc * spc, k = 4 * (x + N * y);
          data[k] += disp * -ndx; data[k + 1] += disp * ndy;
          data[k + 2] = Math.min(1, data[k + 2] + sc * spc);
        }
        vel.x *= decay; vel.y *= decay;
        if (Math.abs(vel.x) < 1e-3) vel.x = 0; if (Math.abs(vel.y) < 1e-3) vel.y = 0;
        max = 1;
      }
      return max;
    }

    // intro: virtual cursor + fade-in from blur (smoothstep), handed back to the mouse at the end
    let introT = 1, reveal = 1, introDone = null;
    function intro() {
      introT = 0; reveal = 0; wake();
      return new Promise(r => { introDone = r; });
    }
    function tickIntro(dt) {
      if (introT >= 1) return;
      introT = Math.min(1, introT + dt / P.introDuration);
      const p = introT; reveal = p * p * (3 - 2 * p);
      const t = 1 - (1 - p) ** 3, rad = P.introDirection * Math.PI / 180;
      const dx = Math.cos(rad), dy = Math.sin(rad), span = Math.abs(dx) + Math.abs(dy);
      const swing = Math.sin(t * Math.PI * 2) * P.introWave * .5;
      const ux = .5 + dx * (t - .5) * span - dy * swing, uy = .5 + dy * (t - .5) * span + dx * swing;
      override = introT >= 1 ? null : { x: ux * 2, y: (1 - uy) * 2 };
      if (introT >= 1) { reveal = 1; introDone && introDone(); introDone = null; }
    }

    let raf = 0, last = 0, visible = true, idle = 0;
    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
      tickIntro(dt);
      const energy = step(dt);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trailTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.FLOAT, data);
      gl.uniform1f(uReveal, reveal);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      idle = energy < 1e-4 && introT >= 1 && !raw ? idle + 1 : 0;
      if (visible && idle < 30) raf = requestAnimationFrame(frame); else last = 0; // sleep when the trail has fully faded
    }
    function wake() { if (!raf && visible) { idle = 0; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(stage);

    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 150); });
    canvas.style.visibility = 'hidden'; // shown after the first real paint (never a blank 300×150 box)
    stage.appendChild(canvas);
    return { canvas, paint, intro, wake, setReveal: v => { reveal = v; wake(); } };
  }

  window.HeroTrail = { create, params: P };
})();

/* Twinbit redesign — interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ---------- clock ---------- */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
  const tick = () => { const t = fmt.format(new Date()); const a = $('#clock'), b = $('#clock2'); if (a) a.textContent = 'Dhaka ' + t; if (b) b.textContent = t; };
  tick(); setInterval(tick, 15000);

  /* ---------- reviews (real App Store quotes from twinbit.net) ---------- */
  const quotes = [
    ['I like this app because it can make your song better in many ways.', 'Equalizer Fx'],
    ['Unique collection, better wallpaper and all side is good. It’s really easy to use.', 'Live Wallpaper 4K'],
    ['I tried others and this one works the best.', 'Twinbit user'],
    ['I love this ringtone maker app. All ringtones are so good to listen.', 'Ringtone Maker Garage'],
    ['Love this app! Lets me add music to videos, which is exactly what I needed!', 'Video Editor'],
    ['I love how you can choose any color to change it with. I would definitely recommend it.', 'Photo Editor & Filters'],
  ];

  /* ---------- tech data ---------- */
  const tech = [
    ['AI Image Processing', 'Enhance, restore, edit and transform images with visual processing built for mobile-first experiences.', 'Used in — Photo Editor, Wallpaper 4K'],
    ['Smart Video Tools', 'Video editing, screen recording, trimming, exporting and creative media features optimised for iOS.', 'Used in — Video Editor'],
    ['Scalable API Systems', 'Backend APIs built for fast responses, secure data flow, app configuration, content delivery and analytics.', 'Used in — every app'],
    ['App Store Product Engineering', 'From idea to launch: polished iOS products with clean UX, stable performance and App Store-ready quality.', 'Discipline — iOS · ASO · QA'],
    ['Automation & Personalization', 'Personalised experiences driven by smart rules, user behaviour, dynamic content and automated workflows.', 'Used in — Ringtones, Wallpapers'],
    ['Cloud-Ready Infrastructure', 'Backend systems built for growth: scaling, storage and reliable content delivery across regions.', 'Serving — global users'],
  ];

  /* ---------- dial data ---------- */
  const steps = [
    ['Research', 'Read App Store demand before writing a line of code.'],
    ['Design', 'Shape the experience around one job done well.'],
    ['Build', 'Native iOS on our in-house stack, by one team.'],
    ['Publish', 'Ship to the App Store and own the listing.'],
    ['Analyze', 'Read real usage, ratings and retention.'],
    ['Improve', 'Iterate, release, and start the loop again.'],
  ];
  const ring = $('#dialRing');
  if (ring) steps.forEach(([s], i) => {
    const a = (i * 60 - 90) * Math.PI / 180, r = 40;
    const n = document.createElement('div'); n.className = 'dial__node' + (i === 0 ? ' is-on' : '');
    n.style.left = 50 + r * Math.cos(a) + '%'; n.style.top = 50 + r * Math.sin(a) + '%';
    n.innerHTML = `<b><i></i>${s}</b>`; ring.appendChild(n);
  });

  if (!hasGsap) { $('#hdr').classList.add('is-in'); document.body.classList.remove('is-loading'); $('#loader')?.remove(); $$('.fade').forEach(e => e.style.cssText = 'opacity:1;transform:none'); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out' });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault(); closeMenu(); scrollTo(id === '#top' ? document.body : id);
  }));

  /* ---------- split helpers ---------- */
  function splitWords(el, cls) {
    const out = [];
    const walk = (node, wrapTag) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = cls;
            if (cls === 'wm') { const inner = document.createElement('span'); inner.textContent = part; w.appendChild(inner); out.push(inner); }
            else { w.textContent = part; out.push(w); }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return out;
  }
  const styleWm = document.createElement('style');
  styleWm.textContent = '.wm{display:inline-block;overflow:hidden;vertical-align:top;padding:.04em .14em .22em .04em;margin:-.04em -.14em -.22em -.04em}.wm.is-open{overflow:visible}.wm>span{display:inline-block;will-change:transform}';
  document.head.appendChild(styleWm);


  /* ---------- hero prep ---------- */
  const heroLines = $$('[data-hero-title] .ln>span');
  gsap.set($$('[data-hero-fade]'), { opacity: 0, y: 24 });
  // WebGL cursor trail on title + mockup (falls back to the DOM version without WebGL2 / with reduced motion)
  const heroGL = !reduce && window.HeroTrail ? window.HeroTrail.create($('.hero__stage'), { host: $('.hero') }) : null;
  if (heroGL) {
    $('.hero').classList.add('is-gl');
    heroGL.setReveal(0);
    const paintGL = () => heroGL.paint();
    const imgReady = i => i.complete && i.naturalWidth ? 1 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
    Promise.all([document.fonts ? document.fonts.ready : 0, ...$$('.hero img').map(imgReady)]).then(paintGL);
    addEventListener('load', paintGL, { once: true }); // safety repaint once everything has loaded
  } else {
    gsap.set(heroLines, { yPercent: 115 });
  }
  gsap.set('.hero__tilt', heroGL ? {} : { opacity: 0, y: 120, rotateX: 18, scale: .92 });
  gsap.set('.hero__halo', { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0, scale: .6 });

  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if (heroGL) tl.add(() => heroGL.intro(), .05);
    else tl.to('.hero__tilt', { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 2 }, 0)
      .to(heroLines, { yPercent: 0, duration: 1.4, stagger: .1, onComplete: () => $$('[data-hero-title] .ln').forEach(l => l.style.overflow = 'visible') }, .3);
    tl.to('.hero__halo', { opacity: 1, scale: 1, duration: 2.4 }, .1)
      .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.2, stagger: .08 }, .5)
      .add(() => $('#hdr').classList.add('is-in'), .5);
    return tl;
  }

  /* ---------- LOADER ---------- */
  const code = $('#loaderCode');
  (window.TB_LOGO || []).forEach((l, i) => {
    const g = document.createElement('div'); g.className = 'loader__glyph' + (i > 3 ? ' is-bit' : '');
    if (i) g.style.marginLeft = `calc(var(--lh) * ${l.g})`;
    const svg = `<svg viewBox="${l.vb.join(' ')}" aria-hidden="true">${l.svg.replace(/fill="#f1ebe1"/g, 'style="fill:var(--bone)"').replace(/stroke="#f1ebe1"/g, 'style="stroke:var(--bone)"')}</svg>`;
    g.innerHTML = `<div class="ch"><b>${svg}</b></div><span class="twin"><i></i><i></i></span>`;
    code.appendChild(g);
  });
  const glyphs = $$('.loader__glyph', code);
  gsap.set($$('.ch b', code), { yPercent: 110 });
  gsap.set($$('.twin', code), { opacity: 0, y: 8 });

  const loaded = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...$$('.hero img').map(img => img.complete ? 1 : new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })),
  ]);
  const counter = { v: 0 };
  const countEl = $('#loaderCount'), barEl = $('#loaderBar');
  const setCount = () => { countEl.textContent = String(Math.round(counter.v)).padStart(3, '0'); barEl.style.transform = `scaleX(${counter.v / 100})`; };

  let finished = false, intro = null;
  function exitLoader() {
    if (finished) return; finished = true;
    if (intro) { intro.progress(1); intro.kill(); }
    const tl = gsap.timeline({ onComplete: () => { $('#loader').remove(); } });
    tl.to(counter, { v: 100, duration: .35, ease: 'power2.out', onUpdate: setCount })
      .to($$('.ch b', code), { yPercent: -110, duration: .6, stagger: .03, ease: 'expo.in' }, '+=.05')
      .to($$('.twin', code), { opacity: 0, y: -8, duration: .5, stagger: .03, ease: 'expo.in' }, '<.05')
      .to('.loader__top, .loader__bottom, .loader__code', { opacity: 0, duration: .4 }, '<')
      .to('.loader__seam', { scaleX: 1, duration: .7, ease: 'expo.inOut' }, '-=.4')
      .add(() => { document.body.classList.remove('is-loading'); lenis && lenis.start(); }, '+=.05')
      .to('.loader__half--t', { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, '<')
      .to('.loader__half--b', { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, '<')
      .to('.loader__seam', { opacity: 0, duration: .5 }, '<.2')
      .add(heroIn(), '<.2');
  }

  const viaPT = document.documentElement.classList.contains('pt-in'); // arrived from another page: the curtain replaces the loader
  if (reduce || viaPT) {
    $('#loader').remove(); document.body.classList.remove('is-loading'); lenis && lenis.start();
    if (viaPT) Promise.race([loaded, new Promise(r => setTimeout(r, 1500))]).then(() => window.PT.reveal()).then(() => {
      heroIn();
      if (location.hash && $(location.hash)) { ScrollTrigger.refresh(); scrollTo(location.hash); }
    });
    else heroIn().progress(1);
  } else {
    intro = gsap.timeline();
    intro.to(counter, { v: 86, duration: 1.9, ease: 'power1.inOut', onUpdate: setCount }, 0);
    glyphs.forEach((g, i) => {
      intro.to($('.ch b', g), { yPercent: 0, duration: 1, ease: 'expo.out' }, .15 + i * .17)
           .to($('.twin', g), { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }, .3 + i * .17)
           .add(() => g.classList.add('is-on'), .75 + i * .17);
    });
    Promise.all([Promise.race([loaded, new Promise(r => setTimeout(r, 3000))]), new Promise(r => intro.eventCallback('onComplete', r))]).then(exitLoader);
    setTimeout(exitLoader, 6000); // safety: never trap the user
  }

  /* ---------- theme toggle (white / dark) ---------- */
  const tg = $('#themeTg'), root = document.documentElement;
  const setLabel = () => tg && tg.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark mode' : 'Switch to white mode');
  function applyTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem('tb-theme', next); } catch (e) {}
    $('meta[name=theme-color]').content = next === 'light' ? '#f3eee6' : '#0b0a09';
    setLabel();
    heroGL && heroGL.paint(); // repaint the WebGL hero with the new text colour
  }
  function toggleTheme(e) {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    const b = tg.getBoundingClientRect();
    const x = e && e.clientX ? e.clientX : b.left + b.width / 2, y = e && e.clientY ? e.clientY : b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (document.startViewTransition && !reduce) {
      const vt = document.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 900, easing: 'cubic-bezier(.77,0,.175,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
    } else {
      root.classList.add('theming'); applyTheme(next);
      setTimeout(() => root.classList.remove('theming'), 600);
    }
  }
  if (tg) { setLabel(); tg.addEventListener('click', toggleTheme); }
  addEventListener('keydown', e => { if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName)) toggleTheme(); });

  /* ---------- header ---------- */
  const hdr = $('#hdr'); let last = 0;
  const onScroll = y => {
    hdr.classList.toggle('is-scrolled', y > 40);
    const menuOpen = document.body.classList.contains('menu-open');
    hdr.classList.toggle('is-hidden', !menuOpen && y > last && y > 240);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  function closeMenu() { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeLb(); } });

  /* ---------- section rail + nav active ---------- */
  const railLinks = $$('#rail a'), navLinks = $$('.nav a');
  $$('[data-sec]').forEach((sec, i) => ScrollTrigger.create({
    trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onToggle: self => {
      if (!self.isActive) return;
      railLinks.forEach((a, j) => a.classList.toggle('is-on', j === i));
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + sec.id));
    },
  }));

  ScrollTrigger.create({ trigger: '#cta', start: 'top 70%', onEnter: () => $('#rail').classList.add('is-off'), onLeaveBack: () => $('#rail').classList.remove('is-off') });

  /* ---------- word-mask heading reveals ---------- */
  $$('[data-split]').forEach(el => {
    const words = splitWords(el, 'wm');
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.3, stagger: .05, ease: 'expo.out', onComplete: () => words.forEach(w => w.parentNode.classList.add('is-open')) }) });
  });

  /* ---------- fades ---------- */
  ScrollTrigger.batch('.fade', {
    start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, stagger: .08, ease: 'expo.out', overwrite: true }),
  });

  /* ---------- about: word-by-word light-up ---------- */
  const aboutWords = splitWords($('[data-words]'), 'w');
  if (aboutWords.length) ScrollTrigger.create({
    trigger: '[data-words]', start: 'top 78%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const lit = s.progress * aboutWords.length * 1.05; aboutWords.forEach((w, i) => { w.style.opacity = i < lit ? 1 : .16; }); },
  });

  /* ---------- hero: scroll out ---------- */
  if (!reduce) {
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    // scroll split: left words drift left, right words drift right, the mockup rises — all scrubbed, so it reverses on scroll-up
    let glQueued = false;
    const repaint = () => { if (!heroGL || glQueued) return; glQueued = true; requestAnimationFrame(() => { glQueued = false; heroGL.paint(); }); };
    const split = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...heroST, onUpdate: repaint, onRefresh: repaint } });
    $$('.hl').forEach(l => split.to(l, { x: () => +l.dataset.dir * Math.min(innerWidth * .07, 140), }, 0));
    split.to('.hero__tilt', { y: () => -Math.min(innerHeight * .16, 150) }, 0) // inner wrapper: never fights the device's CSS centring
         .to('.hero__stage', { opacity: 0, ease: 'power1.in' }, 0);
    // lower hero content stays fully visible until a quarter of the hero has scrolled away, then dims out
    gsap.fromTo('.hero__bar', { opacity: 1, y: 0 }, { opacity: 0, y: -32, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: '25% top', end: '55% top', scrub: true } });
  }
  if (fine && !reduce && !heroGL) {
    const rx = gsap.quickTo('.hero__tilt', 'rotationX', { duration: 1.2, ease: 'power3' }), ry = gsap.quickTo('.hero__tilt', 'rotationY', { duration: 1.2, ease: 'power3' });
    const hx = gsap.quickTo('.hero__halo', 'x', { duration: 1.6, ease: 'power3' }), hy = gsap.quickTo('.hero__halo', 'y', { duration: 1.6, ease: 'power3' });
    $('.hero').addEventListener('mousemove', e => {
      const cx = e.clientX / innerWidth - .5, cy = e.clientY / innerHeight - .5;
      ry(cx * 16); rx(-cy * 12); hx(-cx * 30); hy(-cy * 24);
    });
    $('.hero').addEventListener('mouseleave', () => { rx(0); ry(0); hx(0); hy(0); });
  }

  /* ---------- marquee with velocity ---------- */
  const mt = $('#marq');
  if (mt) {
    mt.innerHTML += mt.innerHTML;
    let x = 0, speed = 0.6, vel = 0; const half = () => mt.scrollWidth / 2;
    const skew = gsap.quickTo(mt, 'skewX', { duration: .6, ease: 'power3' });
    if (lenis) lenis.on('scroll', e => { vel = e.velocity; skew(gsap.utils.clamp(-5, 5, e.velocity * .25)); });
    gsap.ticker.add(() => {
      if (reduce) return;
      x -= speed + Math.abs(vel) * .35; vel *= .92;
      if (-x >= half()) x += half();
      mt.style.transform = `translate3d(${x}px,0,0) skewX(${gsap.getProperty(mt, 'skewX')}deg)`;
    });
  }

  /* ---------- apps: pinned horizontal rail ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
    const track = $('#appsTrack'), cards = $$('.app', track);
    const view = $('.apps__view');
    const dist = () => Math.max(0, track.scrollWidth - view.clientWidth);
    const tw = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#appsPin', pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => {
          const idx = Math.min(cards.length, Math.max(1, Math.round(s.progress * (cards.length - 1)) + 1));
          $('#appsIdx').textContent = String(idx).padStart(2, '0');
        },
      },
    });
    return () => gsap.set(track, { clearProps: 'all' });
  });

  /* ---------- tech console ---------- */
  const items = $$('.tech__item'); let cur = 0, auto = null, inView = false;
  const DUR = 6;
  // fade out any finished/partial bar except the active one
  function clearBars(except) {
    items.forEach((b, j) => {
      if (j === except) return;
      const p = $('.pg', b);
      if (gsap.getProperty(p, 'scaleX') === 0) return;
      gsap.killTweensOf(p);
      gsap.to(p, { opacity: 0, duration: .6, ease: 'power2.out', onComplete: () => gsap.set(p, { scaleX: 0, opacity: 1 }) });
    });
  }
  function selectTech(i) {
    items.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', j === i); });
    const tgt = ['#techNum', '#techTitle', '#techDesc', '#techTag'];
    gsap.timeline()
      .to(tgt, { opacity: 0, y: -14, duration: .35, stagger: .03, ease: 'power2.in', overwrite: true })
      .add(() => {
        $('#techNum').textContent = String(i + 1).padStart(2, '0');
        $('#techTitle').textContent = tech[i][0]; $('#techDesc').textContent = tech[i][1]; $('#techTag').textContent = tech[i][2];
        $('#techTab').textContent = String(i + 1).padStart(2, '0') + ' / 06';
      })
      .fromTo(tgt, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .05, ease: 'expo.out' });
    cur = i; clearBars(i); startBar();
  }
  function startBar() {
    if (auto) auto.kill();
    const p = $('.pg', items[cur]);
    gsap.killTweensOf(p);
    auto = gsap.fromTo(p, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: DUR, ease: 'none', paused: !inView || reduce,
      onComplete: () => selectTech((cur + 1) % items.length) });
  }
  items.forEach((b, i) => b.addEventListener('click', () => selectTech(i)));
  $('#techList').addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return; e.preventDefault();
    const n = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; selectTech(n); items[n].focus();
  });
  startBar();
  ScrollTrigger.create({ trigger: '.tech', start: 'top 70%', end: 'bottom 30%', onToggle: s => { inView = s.isActive; if (auto && !reduce) inView ? auto.resume() : auto.pause(); } });

  /* ---------- operating-model dial ---------- */
  const nodes = $$('.dial__node'), pills = $$('#modelPills span'); let step = -1;
  const arc = $('#dialArc'), C = 251.3;
  function setStep(i) {
    if (i === step) return; step = i;
    nodes.forEach((n, j) => n.classList.toggle('is-on', j === i));
    pills.forEach((p, j) => p.classList.toggle('is-on', j === i));
    $('#dialIdx').textContent = String(i + 1).padStart(2, '0') + ' / 06';
    gsap.timeline().to(['#dialStep', '#dialDesc'], { opacity: 0, y: -10, duration: .25, ease: 'power2.in' })
      .add(() => { $('#dialStep').textContent = steps[i][0]; $('#dialDesc').textContent = steps[i][1]; })
      .fromTo(['#dialStep', '#dialDesc'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: 'expo.out' });
  }
  setStep(0);
  if (!reduce) {
    const labels = $$('.dial__node b');
    const rot = gsap.quickTo(ring, 'rotation', { duration: .9, ease: 'power3' });
    ScrollTrigger.create({
      trigger: '.model', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: s => {
        const p = s.progress, f = p * 5;
        const snap = Math.round(f);
        rot(-snap * 60 - (f - snap) * 18);
        labels.forEach(l => gsap.to(l, { rotation: snap * 60 + (f - snap) * 18, duration: .9, ease: 'power3', overwrite: 'auto' }));
        arc.style.strokeDashoffset = C * (1 - Math.min(1, (p * 5 + 1) / 6));
        setStep(Math.min(5, snap));
      },
    });
    nodes.forEach((n, i) => { n.style.cursor = 'pointer'; n.addEventListener('click', () => {
      const st = ScrollTrigger.getAll().find(t => t.trigger === $('.model') && t.vars.scrub === true);
      if (st && lenis) lenis.scrollTo(st.start + (st.end - st.start) * (i / 5) + 2, { duration: 1.4 });
    }); });
  } else { arc.style.strokeDashoffset = 0; }

  /* ---------- stat count-up ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, dec = +(el.dataset.dec || 0), pad = +(el.dataset.pad || 0), o = { v: 0 };
    const render = () => { let s = o.v.toFixed(dec); if (pad) s = s.padStart(pad, '0'); el.textContent = s; };
    render();
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: render }) });
  });

  /* ---------- reviews slider ---------- */
  const vQ = $('#vQ');
  if (vQ) {
    let vi = 0, vt = null; const VD = 7;
    const render = i => { vQ.innerHTML = `<span class="qm">“</span>${quotes[i][0]}<span class="qm">”</span>`; $('#vBy').textContent = quotes[i][1]; $('#vIdx').textContent = String(i + 1).padStart(2, '0'); };
    const run = () => { if (vt) vt.kill(); vt = gsap.fromTo('#vProg', { scaleX: 0 }, { scaleX: 1, duration: VD, ease: 'none', paused: reduce || !vOn, onComplete: () => go(vi + 1) }); };
    let vOn = false;
    const go = (i, dir = 1) => {
      vi = (i + quotes.length) % quotes.length;
      gsap.timeline()
        .to([vQ, '#vBy'], { opacity: 0, y: -16 * dir, duration: .4, ease: 'power2.in', overwrite: true })
        .add(() => render(vi))
        .fromTo([vQ, '#vBy'], { opacity: 0, y: 22 * dir }, { opacity: 1, y: 0, duration: 1, stagger: .06, ease: 'expo.out' });
      run();
    };
    render(0); run();
    // keep the static line-cover sized to the current quote
    const fitCover = () => $('.voice__main').style.setProperty('--qh', vQ.offsetHeight + 'px');
    fitCover(); new ResizeObserver(fitCover).observe(vQ);
    $('#vNext').addEventListener('click', () => go(vi + 1, 1));
    $('#vPrev').addEventListener('click', () => go(vi - 1, -1));
    ScrollTrigger.create({ trigger: '.voice', start: 'top 85%', end: 'bottom 10%', onToggle: s => { vOn = s.isActive; if (!reduce) vOn ? vt.resume() : vt.pause(); } });
  }

  /* ---------- gallery: data-driven mosaic + full-view viewer ---------- */
  const photos = (window.TB_GALLERY || []).filter(p => p && p.src);
  const grid = $('#galGrid'), LIMIT = 9;
  const ZOOM = '<svg viewBox="0 0 14 14"><path d="M8.5 1.5h4v4M12.5 1.5 8 6M5.5 12.5h-4v-4M1.5 12.5 6 8" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>';
  const layout = n => { // groups of 3, mirrored; remainder 2 → halves, 1 → full
    const out = []; let g = 0, i = 0;
    while (n - i >= 3 && !(n - i === 4)) { const flip = g++ % 2; out.push(...(flip ? ['half', 'big ph--right', 'half'] : ['big', 'half', 'half'])); i += 3; }
    if (n - i === 4) { out.push('duo', 'duo', 'duo', 'duo'); i += 4; }
    if (n - i === 2) out.push('duo', 'duo'); else if (n - i === 1) out.push('full');
    return out;
  };
  if (grid) {
    const kinds = layout(photos.length);
    grid.innerHTML = photos.map((p, i) => `<figure class="ph ph--${kinds[i]}${i >= LIMIT ? ' is-extra' : ''}" tabindex="0" role="button" data-i="${i}" data-cursor="View" aria-label="Open photo: ${p.caption || p.alt || ''}">
      <img src="${p.src}" alt="${p.alt || ''}" loading="lazy" decoding="async">
      <span class="ph__zoom" aria-hidden="true">${ZOOM}</span>
      <figcaption><span>${p.caption || ''}</span><small>${p.tag ? p.tag + ' · ' : ''}${String(i + 1).padStart(2, '0')}</small></figcaption></figure>`).join('');
    $('#galCount').textContent = String(photos.length).padStart(2, '0');
    const more = $('#galMore');
    if (photos.length > LIMIT) {
      more.hidden = false; $('.roll>span', more).dataset.t = $('.roll>span', more).textContent = `Show All Photos (${photos.length})`;
      more.addEventListener('click', () => { $('#gal').classList.add('is-all'); more.hidden = true; ScrollTrigger.refresh(); revealTiles(); });
    }
    function revealTiles() {
      $$('.ph', grid).forEach(f => {
        if (f.dataset.rv || getComputedStyle(f).display === 'none') return; f.dataset.rv = 1;
        const img = $('img', f);
        gsap.set(f, { clipPath: 'inset(100% 0% 0% 0%)' });
        ScrollTrigger.create({ trigger: f, start: 'top 90%', once: true, onEnter: () => {
          gsap.to(f, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' });
          gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.9, ease: 'expo.out', clearProps: 'scale' });
        } });
        if (!reduce) gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
    revealTiles();
    grid.addEventListener('click', e => { const f = e.target.closest('.ph'); if (f) openViewer(+f.dataset.i, f); });
    grid.addEventListener('keydown', e => { const f = e.target.closest('.ph'); if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openViewer(+f.dataset.i, f); } });
  }

  const vw = $('#viewer'), vImg = $('#vwImg'), thumbs = $('#vwThumbs');
  let vi = 0, lastFocus = null, vOpen = false;
  if (thumbs) thumbs.innerHTML = photos.map((p, i) => `<button data-i="${i}" aria-label="Photo ${i + 1}"><img src="${p.src}" alt="" loading="lazy"></button>`).join('');
  const multi = photos.length > 1;
  if (vw) { $('#vwPrev').hidden = $('#vwNext').hidden = !multi; thumbs.hidden = !multi; $('#vwTotal').textContent = String(photos.length).padStart(2, '0'); }
  function showPhoto(i, dir = 0) {
    vi = (i + photos.length) % photos.length; const p = photos[vi];
    const swap = () => { vImg.src = p.src; vImg.alt = p.alt || ''; $('#vwCap').textContent = p.caption || ''; $('#vwIdx').textContent = String(vi + 1).padStart(2, '0'); };
    $$('button', thumbs).forEach((b, j) => b.classList.toggle('is-on', j === vi));
    const on = $$('button', thumbs)[vi]; on && on.scrollIntoView({ block: 'nearest', inline: 'center' });
    [vi - 1, vi + 1].forEach(k => { const q = photos[(k + photos.length) % photos.length]; if (q) new Image().src = q.src; });
    if (!dir) { swap(); gsap.fromTo(vImg, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .8, ease: 'expo.out' }); return; }
    gsap.timeline().to(vImg, { opacity: 0, x: -40 * dir, duration: .28, ease: 'power2.in' }).add(swap)
      .fromTo(vImg, { opacity: 0, x: 40 * dir }, { opacity: 1, x: 0, duration: .7, ease: 'expo.out' });
  }
  function openViewer(i, from) {
    if (!vw || !photos.length) return; lastFocus = from || document.activeElement; vOpen = true;
    vw.hidden = false; requestAnimationFrame(() => vw.classList.add('is-open'));
    lenis && lenis.stop(); document.documentElement.style.overflow = 'hidden';
    showPhoto(i); $('#vwClose').focus();
  }
  function closeLb() {
    if (!vOpen) return; vOpen = false; vw.classList.remove('is-open');
    setTimeout(() => { vw.hidden = true; }, 450);
    lenis && lenis.start(); document.documentElement.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  if (vw) {
    $('#vwClose').addEventListener('click', closeLb);
    $('#vwPrev').addEventListener('click', () => showPhoto(vi - 1, -1));
    $('#vwNext').addEventListener('click', () => showPhoto(vi + 1, 1));
    thumbs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showPhoto(+b.dataset.i, +b.dataset.i > vi ? 1 : -1); });
    $('#vwStage').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.classList.contains('viewer__fig')) closeLb(); });
    addEventListener('keydown', e => {
      if (!vOpen) return;
      if (e.key === 'ArrowRight' && multi) showPhoto(vi + 1, 1);
      else if (e.key === 'ArrowLeft' && multi) showPhoto(vi - 1, -1);
      else if (e.key === 'Tab') { const f = $$('button:not([hidden])', vw).filter(b => b.offsetParent); const a0 = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a0.focus(); } }
    });
    let sx = null;
    $('#vwStage').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    $('#vwStage').addEventListener('touchend', e => { if (sx === null || !multi) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showPhoto(vi + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); sx = null; });
  }

  /* ---------- value rows / perks / band scrub ---------- */
  if (!reduce) {
    gsap.fromTo('.values__list .val .t', { xPercent: -4 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.values__list', start: 'top bottom', end: 'center center', scrub: true } });
  }


  /* ---------- cursor ---------- */
  if (fine) {
    const cur = $('.cursor'), lbl = $('.cursor__lbl');
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', e => {
      const lab = e.target.closest('[data-cursor]');
      if (lab) { lbl.textContent = lab.dataset.cursor; cur.classList.add('is-label'); cur.classList.remove('is-hover'); return; }
      cur.classList.remove('is-label');
      // no enlarged circle over menus, category items or text buttons — the dot simply steps aside
      cur.classList.remove('is-hover');
      cur.classList.toggle('is-btn', !!e.target.closest('a,button,[role=tab],[role=button],.chip,.perk,.val,.tech__item'));
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();

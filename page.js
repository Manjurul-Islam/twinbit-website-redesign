/* Twinbit — inner pages (Contact, Open Positions). Shares the homepage's motion language. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;
  const pad = n => String(n).padStart(2, '0');

  /* Form delivery. Leave empty for demo mode (validates + shows the success state, sends nothing).
     Set to a form backend URL (Formspree, Web3Forms, your API…) that accepts multipart POST to go live. */
  const FORM_ENDPOINTS = { contact: '', apply: '' };

  if (typeof gsap === 'undefined') { root.classList.remove('pt-in'); $$('.fade').forEach(e => e.style.cssText = 'opacity:1;transform:none'); $('#hdr')?.classList.add('is-in'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- clock ---------- */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
  const tick = () => { const t = fmt.format(new Date()); $$('[data-clock]').forEach(e => e.textContent = t); const b = $('#clock2'); if (b) b.textContent = t; };
  tick(); setInterval(tick, 15000);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.5, easing: t => 1 - Math.pow(1 - t, 4), ...opts });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault(); closeMenu(); scrollTo(id === '#top' ? document.body : id);
  }));

  /* ---------- theme ---------- */
  const tg = $('#themeTg');
  const setLabel = () => tg && tg.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark mode' : 'Switch to white mode');
  function applyTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem('tb-theme', next); } catch (e) {}
    $('meta[name=theme-color]').content = next === 'light' ? '#f3eee6' : '#0b0a09';
    setLabel();
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
    } else applyTheme(next);
  }
  if (tg) { setLabel(); tg.addEventListener('click', toggleTheme); }
  addEventListener('keydown', e => { if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable) toggleTheme(); });

  /* ---------- header + mobile menu ---------- */
  const hdr = $('#hdr'); let last = 0;
  const onScroll = y => {
    hdr.classList.toggle('is-scrolled', y > 40);
    hdr.classList.toggle('is-hidden', !document.body.classList.contains('menu-open') && y > last && y > 240);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  const burger = $('#burger');
  let menuT = 0;
  function setMenu(open) {
    const b = document.body; if (open === b.classList.contains('menu-open')) return;
    clearTimeout(menuT);
    b.classList.toggle('menu-open', open); b.classList.toggle('menu-closing', !open);
    if (!open) menuT = setTimeout(() => b.classList.remove('menu-closing'), 1250); // links exit, panel wipes up, then reset
    burger && burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  function closeMenu() { setMenu(false); }
  burger && burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    setMenu(open);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- word-mask headings ---------- */
  function splitWords(el) {
    const out = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'wm';
          const inner = document.createElement('span'); inner.textContent = part; w.appendChild(inner); out.push(inner); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el); return out;
  }
  const st = document.createElement('style');
  st.textContent = '.wm{display:inline-block;overflow:hidden;vertical-align:top;padding:.04em .14em .22em .04em;margin:-.04em -.14em -.22em -.04em}.wm.is-open{overflow:visible}.wm>span{display:inline-block;will-change:transform}';
  document.head.appendChild(st);
  const openWords = (words, delay = 0) => gsap.to(words, { yPercent: 0, duration: 1.3, delay, stagger: .05, ease: 'expo.out', onComplete: () => words.forEach(w => w.parentNode.classList.add('is-open')) });

  const heroTitle = $('.phero__title');
  const heroWords = heroTitle ? splitWords(heroTitle) : [];
  gsap.set(heroWords, { yPercent: 115 });
  $$('[data-split]').forEach(el => {
    if (el === heroTitle) return;
    const words = splitWords(el); gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => openWords(words) });
  });

  /* ---------- page intro (after the curtain lifts) ---------- */
  const heroFades = $$('.phero .fade');
  gsap.set(heroFades, { opacity: 0, y: 28 });
  function intro() {
    hdr.classList.add('is-in');
    openWords(heroWords, .05);
    gsap.to(heroFades, { opacity: 1, y: 0, duration: 1.2, stagger: .08, delay: .35, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
    countUp($$('.phero [data-count]'), .5);
  }
  const start = () => (window.PT ? window.PT.reveal() : Promise.resolve()).then(intro);
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(start);

  /* ---------- fades ---------- */
  ScrollTrigger.batch($$('.fade').filter(e => !e.closest('.phero')), {
    start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, stagger: .08, ease: 'expo.out', overwrite: true }),
  });

  /* ---------- count-up ---------- */
  function countUp(els, delay = 0) {
    els.forEach(el => {
      const end = +el.dataset.count, o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, delay, ease: 'power3.out', onUpdate: () => { el.textContent = pad(Math.round(o.v)); } });
    });
  }

  /* ---------- copy to clipboard ---------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch (e) { const t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (er) {} t.remove(); }
    if (b.dataset.copied) { // text button: the label itself rolls to the confirmation
      const s = $('.roll>span', b); if (!b._orig) b._orig = s.firstChild.textContent;
      s.firstChild.textContent = b.dataset.copied; s.dataset.t = b.dataset.copied;
      clearTimeout(b._t); b._t = setTimeout(() => { s.firstChild.textContent = b._orig; s.dataset.t = b._orig; }, 1800);
      return;
    }
    b.classList.add('is-copied'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('is-copied'), 1600);
  }));

  /* ---------- roles (careers) ---------- */
  const list = $('#rolesList');
  if (list) {
    const roles = (window.TB_ROLES || []).filter(r => r && r.title);
    const PLUS = '<svg viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
    const ARROW = '<svg viewBox="0 0 14 14"><path d="M3 11 11 3M5 3h6v6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
    const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
    list.innerHTML = roles.map((r, i) => `
      <article class="role" data-dept="${esc(r.dept)}" data-q="${esc((r.title + ' ' + r.dept + ' ' + r.type + ' ' + r.level).toLowerCase())}" id="role-${esc(r.id)}">
        <button class="role__head g12" type="button" aria-expanded="false" aria-controls="rb-${esc(r.id)}">
          <span class="role__no label"><span>${pad(i + 1)}</span>${esc(r.dept)}</span>
          <span class="role__title">${esc(r.title)}</span>
          <span class="role__tags label"><span>${esc(r.type)}</span><span>${esc(r.level)} · Dhaka</span></span>
          <span class="role__ic ic-o" aria-hidden="true">${PLUS}</span>
        </button>
        <div class="role__body" id="rb-${esc(r.id)}" role="region">
          <div class="role__in g12">
            <p class="role__sum">${esc(r.summary)}</p>
            <div class="role__col"><span class="label">What you'll do</span><ul>${r.does.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div class="role__col"><span class="label">What you bring</span><ul>${r.needs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div class="role__side">
              <dl><dt>Team</dt><dd>${esc(r.dept)}</dd><dt>Type</dt><dd>${esc(r.type)}</dd><dt>Level</dt><dd>${esc(r.level)}</dd><dt>Office</dt><dd>Mirpur DOHS, Dhaka</dd></dl>
              <a class="btn btn--signal btn--sm" href="#apply" data-apply="${esc(r.id)}"><span class="roll"><span data-t="Apply For This Role">Apply For This Role</span></span><span class="ic">${ARROW}</span></a>
            </div>
          </div>
        </div>
      </article>`).join('');

    const rows = $$('.role', list);
    const total = $('#rolesTotal'), shown = $('#rolesShown'), empty = $('#rolesEmpty'), emptyTxt = $('#rolesEmptyTxt'), resetBtn = $('#rolesReset');
    if (total) total.textContent = pad(roles.length);
    $$('[data-roles-count]').forEach(e => e.dataset.count = roles.length);

    // department chips with live counts
    const depts = [...new Set(roles.map(r => r.dept))];
    const fwrap = $('#rolesFilters');
    fwrap.innerHTML = ['All', ...depts].map((d, i) => `<button class="fchip${i ? '' : ' is-on'}" type="button" data-f="${esc(d)}" aria-pressed="${i ? 'false' : 'true'}">${esc(d)} <b>${pad(i ? roles.filter(r => r.dept === d).length : roles.length)}</b></button>`).join('');
    let fDept = 'All', fQ = '';

    function apply(animate = true) {
      const vis = rows.filter(r => (fDept === 'All' || r.dataset.dept === fDept) && (!fQ || r.dataset.q.includes(fQ)));
      const swap = () => {
        rows.forEach(r => { r.hidden = !vis.includes(r); if (r.hidden && r.classList.contains('is-open')) toggle(r, false, true); });
        if (shown) shown.textContent = pad(vis.length);
        const none = !vis.length;
        empty.hidden = !none;
        if (none) {
          const noRoles = !roles.length;
          emptyTxt.textContent = noRoles ? 'No open roles right now — send us your resume and we\u2019ll be in touch.' : 'No roles match that filter yet. Try another team, or send a general application.';
          resetBtn.hidden = noRoles;
        }
        ScrollTrigger.refresh();
        if (animate && !reduce) gsap.fromTo(vis.concat(none ? [empty] : []), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .06, ease: 'expo.out' });
      };
      if (animate && !reduce) gsap.to(list.children.length ? [list, empty] : [empty], { opacity: 0, y: 8, duration: .22, ease: 'power2.in', onComplete: () => { gsap.set([list, empty], { opacity: 1, y: 0 }); swap(); } });
      else swap();
    }
    fwrap.addEventListener('click', e => {
      const b = e.target.closest('.fchip'); if (!b || b.classList.contains('is-on')) return;
      $$('.fchip', fwrap).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      fDept = b.dataset.f; apply();
    });
    const q = $('#rolesQ'); let qt;
    q && q.addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { fQ = e.target.value.trim().toLowerCase(); apply(); }, 180); });
    resetBtn.addEventListener('click', () => { if (q) q.value = ''; fQ = ''; fDept = 'All'; $$('.fchip', fwrap).forEach((x, i) => { x.classList.toggle('is-on', !i); x.setAttribute('aria-pressed', String(!i)); }); apply(); });

    function toggle(row, open, instant) {
      const body = $('.role__body', row), head = $('.role__head', row);
      row.classList.toggle('is-open', open); head.setAttribute('aria-expanded', String(open));
      gsap.killTweensOf(body);
      if (instant || reduce) { gsap.set(body, { height: open ? 'auto' : 0 }); ScrollTrigger.refresh(); return; }
      gsap.to(body, { height: open ? 'auto' : 0, duration: open ? 1 : .7, ease: open ? 'expo.out' : 'expo.inOut', onComplete: () => ScrollTrigger.refresh() });
      if (open) gsap.fromTo($$('.role__sum, .role__col, .role__side', body), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .9, stagger: .06, delay: .1, ease: 'expo.out' });
    }
    rows.forEach(row => $('.role__head', row).addEventListener('click', () => {
      const open = !row.classList.contains('is-open');
      rows.forEach(r => r !== row && r.classList.contains('is-open') && toggle(r, false));
      toggle(row, open);
    }));
    apply(false);
  }

  /* ---------- hiring steps ---------- */
  $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 82%', once: true, onEnter: () => s.classList.add('is-in') }));

  /* ---------- forms ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setupForm(form) {
    const kind = form.dataset.form;
    const sent = $('.sent', form.parentNode);
    const flds = $$('.fld', form);
    const msg = (f, m) => { f.classList.toggle('is-err', !!m); const e = $('.fld__err', f); if (e && m) e.textContent = m; f.classList.toggle('is-ok', !m && f.dataset.touched === '1'); };
    function check(f) {
      const el = $('input:not([type=checkbox]):not([type=radio]), select, textarea', f);
      if (!el) return true;
      const v = (el.type === 'file' ? (el.files[0] || null) : el.value.trim());
      let m = '';
      if (el.type === 'file') {
        if (el.required && !v) m = 'Attach your CV (PDF or Word).';
        else if (v && !/\.(pdf|docx?)$/i.test(v.name)) m = 'Use a PDF or Word file.';
        else if (v && v.size > 5 * 1024 * 1024) m = 'Keep the file under 5 MB.';
      } else if (el.required && !v) m = el.dataset.msg || 'This field is required.';
      else if (v && el.type === 'email' && !EMAIL.test(v)) m = 'Enter a valid email address.';
      else if (v && el.type === 'url' && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v)) m = 'Enter a valid link.';
      else if (v && el.type === 'tel' && !/^[+\d][\d\s()-]{6,}$/.test(v)) m = 'Enter a valid phone number.';
      else if (el.minLength > 0 && v && v.length < el.minLength) m = `A little more detail, please (${el.minLength}+ characters).`;
      msg(f, m); return !m;
    }
    flds.forEach(f => {
      const el = $('input, select, textarea', f); if (!el) return;
      const touch = () => { f.dataset.touched = '1'; check(f); };
      el.addEventListener('blur', touch);
      el.addEventListener(el.tagName === 'SELECT' || el.type === 'file' ? 'change' : 'input', () => { if (f.dataset.touched === '1' || f.classList.contains('is-err')) check(f); });
      if (el.tagName === 'TEXTAREA') {
        const cnt = $('.fld__count', f), max = +el.maxLength || 1000;
        const grow = () => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; if (cnt) cnt.textContent = `${el.value.length} / ${max}`; };
        el.addEventListener('input', grow); grow();
      }
    });
    // file drop
    $$('.drop', form).forEach(d => {
      const inp = $('input[type=file]', d), name = $('.drop__txt b', d), sub = $('.drop__txt span', d);
      const def = [name.textContent, sub.textContent];
      const show = () => {
        const f = inp.files[0];
        d.classList.toggle('has-file', !!f);
        name.textContent = f ? f.name : def[0];
        sub.textContent = f ? `${(f.size / 1024 / 1024).toFixed(f.size > 1048576 ? 1 : 2)} MB · ready to send` : def[1];
        if (f && !reduce) gsap.fromTo($('.drop__ic', d), { scale: .6 }, { scale: 1, duration: .7, ease: 'back.out(2.2)' });
      };
      inp.addEventListener('change', show);
      ['dragenter', 'dragover'].forEach(t => d.addEventListener(t, e => { e.preventDefault(); d.classList.add('is-over'); }));
      ['dragleave', 'drop'].forEach(t => d.addEventListener(t, () => d.classList.remove('is-over')));
      d.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) { inp.files = e.dataTransfer.files; inp.dispatchEvent(new Event('change', { bubbles: true })); } });
      $('.drop__x', d).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); inp.value = ''; show(); const f = d.closest('.fld'); if (f.dataset.touched === '1') check(f); });
    });
    const consent = $('.check', form);
    consent && $('input', consent).addEventListener('change', e => consent.classList.toggle('is-err', !e.target.checked && consent.dataset.touched === '1'));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true, first = null;
      flds.forEach(f => { f.dataset.touched = '1'; if (!check(f)) { ok = false; first = first || f; } });
      if (consent) { consent.dataset.touched = '1'; const c = $('input', consent).checked; consent.classList.toggle('is-err', !c); if (!c) { ok = false; first = first || consent; } }
      if (!ok) {
        scrollTo(first, { offset: -140, duration: 1 });
        const el = $('input, select, textarea', first); setTimeout(() => el && el.focus({ preventScroll: true }), 500);
        if (!reduce) gsap.fromTo(first, { x: -6 }, { x: 0, duration: .6, ease: 'elastic.out(1,.35)' });
        return;
      }
      const btn = $('button[type=submit]', form), lbl = $('.roll>span', btn), orig = lbl.dataset.t;
      btn.classList.add('is-busy'); lbl.firstChild.textContent = 'Sending…'; lbl.dataset.t = 'Sending…';
      try {
        const url = FORM_ENDPOINTS[kind];
        if (url) {
          const r = await fetch(url, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error('send failed');
        } else await new Promise(r => setTimeout(r, 1100)); // demo mode
        done();
      } catch (err) {
        btn.classList.remove('is-busy'); lbl.firstChild.textContent = 'Try Again'; lbl.dataset.t = 'Try Again';
        const n = $('.form__note', form); if (n) { n.textContent = 'Something went wrong. Please try again, or email us directly.'; n.style.color = 'var(--signal)'; }
        return;
      }
      function done() {
        btn.classList.remove('is-busy'); lbl.firstChild.textContent = orig; lbl.dataset.t = orig;
        const nm = $('[name=name]', form); const who = $('[data-who]', sent); if (who && nm) who.textContent = nm.value.trim().split(/\s+/)[0];
        const tl = gsap.timeline();
        tl.to(form, { opacity: 0, y: -18, filter: 'blur(6px)', duration: .6, ease: 'power3.in' })
          .add(() => { form.style.visibility = 'hidden'; sent.classList.add('is-on'); })
          .fromTo(sent, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' })
          .to($('.ring', sent), { strokeDashoffset: 0, duration: 1.1, ease: 'expo.inOut' }, '<.1')
          .to($('.sent__ic path', sent), { strokeDashoffset: 0, duration: .6, ease: 'power3.out' }, '-=.35');
        scrollTo(form.parentNode, { offset: -140, duration: 1 });
      }
    });
    // send another
    const again = $('[data-again]', sent);
    again && again.addEventListener('click', () => {
      form.reset(); flds.forEach(f => { f.classList.remove('is-err', 'is-ok'); delete f.dataset.touched; });
      $$('.drop', form).forEach(d => { d.classList.remove('has-file'); $('input', d).dispatchEvent(new Event('change')); });
      $$('textarea', form).forEach(t => t.dispatchEvent(new Event('input')));
      gsap.timeline()
        .to(sent, { opacity: 0, y: -16, duration: .45, ease: 'power3.in' })
        .add(() => { sent.classList.remove('is-on'); form.style.visibility = ''; gsap.set([$('.ring', sent), $('.sent__ic path', sent)], { clearProps: 'strokeDashoffset' }); })
        .fromTo(form, { opacity: 0, y: 18, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .9, ease: 'expo.out' });
    });
  }
  $$('form[data-form]').forEach(setupForm);

  /* role select: populate + deep link + "Apply for this role" */
  const roleSel = $('#fRole');
  if (roleSel) {
    (window.TB_ROLES || []).forEach(r => roleSel.insertAdjacentHTML('beforeend', `<option value="${r.id}">${r.title}</option>`));
    roleSel.insertAdjacentHTML('beforeend', '<option value="general">General application</option>');
    const pick = id => {
      if (![...roleSel.options].some(o => o.value === id)) return;
      roleSel.value = id; roleSel.dispatchEvent(new Event('change'));
      const f = roleSel.closest('.fld'); f.dataset.touched = '1'; f.classList.remove('is-err'); f.classList.add('is-ok');
    };
    const q = new URLSearchParams(location.search).get('role'); if (q) pick(q);
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-apply]'); if (!a) return;
      e.preventDefault(); e.stopImmediatePropagation();
      pick(a.dataset.apply);
      scrollTo('#apply');
      setTimeout(() => { $('#fName')?.focus({ preventScroll: true }); if (!reduce) gsap.fromTo(roleSel.closest('.fld'), { backgroundColor: 'color-mix(in srgb, var(--signal) 18%, transparent)' }, { backgroundColor: 'rgba(0,0,0,0)', duration: 1.6, ease: 'power2.out' }); }, 1300);
    }, true);
  }

  /* ---------- cursor ---------- */
  if (fine) {
    const cur = $('.cursor'), lbl = $('.cursor__lbl');
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('mouseover', e => {
      const lab = e.target.closest('[data-cursor]');
      if (lab) { lbl.textContent = lab.dataset.cursor; cur.classList.add('is-label'); return; }
      cur.classList.remove('is-label', 'is-hover');
      cur.classList.toggle('is-btn', !!e.target.closest('a,button,label,input,select,textarea,.drop,.role__head'));
    });
  }

  if (location.hash && $(location.hash)) setTimeout(() => scrollTo(location.hash, { duration: 1.2 }), 900);
  addEventListener('load', () => ScrollTrigger.refresh());
})();

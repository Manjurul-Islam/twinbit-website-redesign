/* Page transition — a grid-lined ink curtain wipes up over the page, the next page wipes it away.
   Arriving pages are covered before first paint by the inline head script (html.pt-in). */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const el = document.createElement('div');
  el.className = 'pt'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="pt__panel"><div class="pt__lines"><i></i><i></i><i></i><i></i></div><div class="pt__mark"><span class="twin"><i></i><i></i></span><span class="pt__lbl" id="ptLbl"></span></div></div>';
  const mount = () => document.body.appendChild(el);
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);

  let revealed = false;
  function reveal() {
    if (revealed || !root.classList.contains('pt-in')) { revealed = true; return Promise.resolve(); }
    revealed = true;
    return new Promise(res => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('is-out');
        root.classList.remove('pt-in');
        setTimeout(() => { el.classList.remove('is-out'); res(); }, reduce ? 0 : 1000);
      }));
    });
  }

  const label = href => {
    const u = new URL(href, location.href), f = u.pathname.split('/').pop() || 'index.html';
    return ({ 'careers.html': 'Open positions', 'contact.html': 'Contact' })[f] || 'Home';
  };
  function go(href) {
    try { sessionStorage.setItem('tb-pt', '1'); } catch (e) {}
    if (reduce) { location.href = href; return; }
    const lbl = el.querySelector('#ptLbl'); if (lbl) lbl.textContent = label(href);
    el.classList.add('is-cover');
    setTimeout(() => { location.href = href; }, 820);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin || !/(\.html|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname) return; // same page: anchors are handled by the page script
    e.preventDefault(); go(u.href);
  });
  // back/forward cache: never come back to a covered page
  addEventListener('pageshow', e => { if (e.persisted) { el.classList.remove('is-cover'); root.classList.remove('pt-in'); } });

  window.PT = { reveal, go, arrived: root.classList.contains('pt-in') };
})();

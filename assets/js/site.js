/* ════════════════════════════════════════════════════════════════════
   Naman Bhatt · Portfolio — site script
   Hydrates the page from content.json (edited via the developer console at
   admin.html). Static markup is the no-JS fallback. Also mounts every
   interaction: theme, typing, reveal, counters, spotlight, tilt, neural
   canvas, mobile nav, contact form. Supports ?preview=1 for the console.
   ════════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;
const PREVIEW = (() => { try { return new URLSearchParams(location.search).has('preview'); } catch (_) { return false; } })();

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fa = (name, kind = 'solid') => `<i class="fa-${kind} fa-${esc(name)}"></i>`;
const COLORV = { teal: 'acc', cyan: 'cy', green: 'gn', amber: 'am', pink: 'pk' };
const cvar = c => COLORV[c] || 'acc';

/* ── Theme ─────────────────────────────────────────────────────────── */
const root = document.documentElement;
const setTheme = t => {
  root.setAttribute('data-theme', t);
  const i = $('#themeIcon');
  if (i) i.className = t === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  try { localStorage.setItem('theme', t); } catch (_) {}
};
setTheme((() => {
  try { const s = localStorage.getItem('theme'); if (s) return s; } catch (_) {}
  return 'dark';
})());
$('#themeBtn')?.addEventListener('click', () =>
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

/* ── Content hydration ─────────────────────────────────────────────── */
const setText = (sel, v) => { if (v != null) $$(sel).forEach(el => { el.textContent = v; }); };

function render(c) {
  if (c.meta) {
    if (c.meta.title) document.title = c.meta.title;
    if (c.meta.description) $('meta[name="description"]')?.setAttribute('content', c.meta.description);
  }
  if (c.brand?.logo) {
    const parts = c.brand.logo.trim().split(/\s+/);
    const last = parts.length > 1 ? parts.pop() : '';
    const html = `${esc(parts.join(' '))} <span>${esc(last)}</span>`;
    $$('.nav-logo').forEach(el => { el.innerHTML = html; });
    $$('.foot-brand').forEach(el => { el.textContent = c.brand.logo; });
  }

  /* Hero */
  const h = c.hero || {};
  setText('[data-c="hero.availability"]', h.availability);
  if (h.headline1 != null && h.headline2 != null)
    $('#heroH1').innerHTML = `${esc(h.headline1)}<br><span class="grd-txt">${esc(h.headline2)}</span>`;
  setText('[data-c="hero.bio"]', h.bio);
  if (Array.isArray(h.stats))
    $('#heroStats').innerHTML = h.stats.map(s => `
      <div class="hst"><div class="hst-n" data-count="${esc(s.value)}"><span class="count-val">${esc(s.value)}</span></div>
      <div class="hst-l">${esc(s.label)}</div></div>`).join('');
  if (h.photo) $$('#heroImg').forEach(img => { img.src = h.photo; });
  if (Array.isArray(h.photoBadges))
    $('#photoStats').innerHTML = h.photoBadges.map(b =>
      `<div class="pst"><div class="pst-v">${esc(b.value)}</div><div class="pst-l">${esc(b.label)}</div></div>`).join('');

  /* Social + resume */
  const soc = c.social || {};
  const socHref = { linkedin: soc.linkedin, github: soc.github, email: soc.email ? `mailto:${soc.email}` : null };
  Object.entries(socHref).forEach(([k, v]) => { if (v) $$(`[data-soc="${k}"]`).forEach(a => { a.href = v; }); });
  if (c.resume?.file) $$('[data-resume]').forEach(a => { a.href = c.resume.file; a.setAttribute('download', c.resume.file); });

  /* About */
  const ab = c.about || {};
  setText('[data-c="about.label"]', ab.label);
  if (ab.headingPlain != null)
    $('#aboutH2').innerHTML = `${esc(ab.headingPlain)} <span class="grd-txt">${esc(ab.headingAccent || '')}</span>`;
  if (ab.image) $('#aboutImg').src = ab.image;
  if (Array.isArray(ab.badges))
    $('#aboutBadges').innerHTML = ab.badges.map(b => `<span class="chip">${fa(b.icon || 'location-dot')} ${esc(b.text)}</span>`).join('');
  if (Array.isArray(ab.paragraphs))
    $('#aboutParas').innerHTML = ab.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
  if (Array.isArray(ab.chips))
    $('#aboutChips').innerHTML = ab.chips.map(t => `<span class="chip">${esc(t)}</span>`).join('');

  /* Groups renderer (shared by Skills + Certifications) */
  const groupCard = g => `
    <div class="sk-card spotlight reveal">
      <div class="sk-head">
        <div class="sk-ico" style="color:var(--${cvar(g.color)})">${fa(g.icon || 'database')}</div>
        <div class="sk-title">${esc(g.title)}</div>
      </div>
      <div class="sk-pills">${(g.pills || []).map(p => `<span class="sk-pill">${esc(p)}</span>`).join('')}</div>
    </div>`;

  /* Skills */
  const sk = c.skills || {};
  setText('[data-c="skills.label"]', sk.label);
  setText('[data-c="skills.heading"]', sk.heading);
  setText('[data-c="skills.sub"]', sk.sub);
  if (Array.isArray(sk.groups)) $('#skGrid').innerHTML = sk.groups.map(groupCard).join('');
  if (Array.isArray(sk.logos))
    $('#logoTrack').innerHTML = sk.logos.map(l => `
      <a href="${esc(l.url || '#')}" target="_blank" rel="noopener" class="logo-item">
        <img src="${esc(l.img)}" alt="${esc(l.label)}" loading="lazy"><span>${esc(l.label)}</span></a>`).join('');

  /* Experience */
  const ex = c.experience || {};
  setText('[data-c="experience.label"]', ex.label);
  setText('[data-c="experience.heading"]', ex.heading);
  setText('[data-c="experience.sub"]', ex.sub);
  if (Array.isArray(ex.items))
    $('#timeline').innerHTML = ex.items.map((it, i) => {
      const edu = it.type === 'education';
      const dotStyle = edu ? ' style="background:linear-gradient(135deg,var(--cy),var(--gn));animation:none;box-shadow:0 0 0 3px rgba(34,211,238,.15),0 0 14px rgba(34,211,238,.4)"' : '';
      const cardStyle = edu ? ' style="border-color:rgba(34,211,238,.12)"' : '';
      const coStyle = edu ? ' style="color:var(--cy)"' : '';
      const bullets = (it.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
      const tags = (it.tags || []).map(t =>
        `<span class="chip"${edu ? ' style="color:var(--cy);border-color:rgba(34,211,238,.22)"' : ''}>${esc(t)}</span>`).join('');
      return `
      <div class="ti reveal">
        <div class="ti-dot"${dotStyle}></div>
        <div class="ti-card spotlight"${cardStyle}>
          <div class="ti-top">
            <div><div class="ti-role">${esc(it.role)}</div><div class="ti-co"${coStyle}>${esc(it.org)}</div></div>
            <span class="ti-date">${esc(it.date)}</span>
          </div>
          <div class="ti-loc">${fa(edu ? 'graduation-cap' : 'location-dot')}&nbsp;${esc(it.location)}</div>
          ${bullets ? `<div class="ti-body"><ul>${bullets}</ul></div>` : ''}
          ${tags ? `<div class="ti-tags">${tags}</div>` : ''}
        </div>
      </div>`;
    }).join('');

  /* Certifications */
  const ce = c.certifications || {};
  setText('[data-c="certifications.label"]', ce.label);
  setText('[data-c="certifications.heading"]', ce.heading);
  setText('[data-c="certifications.sub"]', ce.sub);
  if (Array.isArray(ce.items)) $('#certGrid').innerHTML = ce.items.map(groupCard).join('');

  /* CTA */
  const ct = c.cta || {};
  setText('[data-c="cta.badge"]', ct.badge);
  if (ct.title1 != null)
    $('#ctaTitle').innerHTML = `${esc(ct.title1)}<br><span class="grd-txt">${esc(ct.title2 || '')}</span>`;
  setText('[data-c="cta.sub"]', ct.sub);

  /* Contact */
  const co = c.contact || {};
  setText('[data-c="contact.label"]', co.label);
  setText('[data-c="contact.heading"]', co.heading);
  setText('[data-c="contact.sub"]', co.sub);
  setText('[data-c="contact.intro"]', co.intro);
  const strip = u => String(u || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const rows = [
    soc.email && { icon: 'envelope', kind: 'solid', label: 'email', text: soc.email },
    co.phone && { icon: 'phone', kind: 'solid', label: 'phone', text: co.phone },
    soc.linkedin && { icon: 'linkedin-in', kind: 'brands', label: 'linkedin', text: strip(soc.linkedin) },
    soc.github && { icon: 'github', kind: 'brands', label: 'github', text: strip(soc.github) },
    co.location && { icon: 'location-dot', kind: 'solid', label: 'location', text: co.location },
  ].filter(Boolean);
  if ($('#ctRows'))
    $('#ctRows').innerHTML = rows.map(r => `
      <div class="ct-row"><div class="ct-ico">${fa(r.icon, r.kind)}</div>
      <div class="ct-txt"><strong>${esc(r.label)}</strong>${esc(r.text)}</div></div>`).join('');

  /* Footer */
  setText('[data-c="footer.copyright"]', c.footer?.copyright);
  return c;
}

/* ── Interactions (after hydration so dynamic nodes are counted) ────── */
function mountContent(c) {
  /* Reveal on scroll */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('on'));
  }

  /* Typing loop */
  const typed = $('#typed');
  const words = (c.hero?.roles?.length ? c.hero.roles : ['Data Engineer']).map(String);
  if (typed) {
    if (reduceMotion || words.length === 1) typed.textContent = words[0];
    else {
      let wi = 0, ci = 0, del = false, t;
      const tick = () => {
        const w = words[wi];
        typed.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
        let next = del ? 38 : 62;
        if (!del && ci === w.length) { del = true; next = 2200; }
        else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
        t = setTimeout(tick, next);
      };
      tick();
      addEventListener('pagehide', () => clearTimeout(t));
    }
  }

  /* Counters — animate numeric part of each hero stat */
  const stats = $('#heroStats');
  const runCounters = () => $$('.count-val', stats).forEach(span => {
    const m = String((span.closest('.hst-n')?.dataset.count) || '').match(/^([^0-9]*)(\d+)(.*)$/);
    if (!m) return;
    const [, pre, num, suf] = m, target = +num, t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      span.textContent = `${pre}${Math.round(e * target)}${suf}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  if (stats && !reduceMotion && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { runCounters(); co.disconnect(); } }, { threshold: 0.5 });
    co.observe(stats);
  }

  /* Spotlight cursor tracking */
  if (finePointer)
    $$('.spotlight,.ti-card,.sk-card,.logo-item').forEach(el => el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true }));

  /* Hero photo tilt */
  const pw = $('#photoWrap'), pt = $('#photoTilt');
  if (pw && pt && finePointer && !reduceMotion) {
    pw.addEventListener('mousemove', e => {
      const r = pw.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 2;
      const y = ((e.clientY - r.top) / r.height - .5) * 2;
      pt.style.transition = 'transform .08s linear';
      pt.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) scale3d(1.02,1.02,1.02)`;
    }, { passive: true });
    pw.addEventListener('mouseleave', () => {
      pt.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
      pt.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  }
}

/* ── Chrome (independent of content) ───────────────────────────────── */
function mountChrome() {
  const pbar = $('#pbar');
  addEventListener('scroll', () => {
    if (pbar) pbar.style.transform = `scaleX(${scrollY / (document.body.scrollHeight - innerHeight || 1)})`;
  }, { passive: true });

  /* Mobile nav */
  const hbg = $('#hbg'), mob = $('#mobDrop');
  const closeMob = () => { mob?.classList.remove('op'); hbg?.classList.remove('op'); hbg?.setAttribute('aria-expanded', 'false'); };
  window.closeMob = closeMob;
  hbg?.addEventListener('click', () => {
    const open = !mob.classList.contains('op');
    mob.classList.toggle('op', open); hbg.classList.toggle('op', open);
    hbg.setAttribute('aria-expanded', String(open));
  });
  addEventListener('click', e => { if (hbg && !hbg.contains(e.target) && !mob.contains(e.target)) closeMob(); });

  /* Active nav link */
  const navAs = $$('.nav-links a');
  if ('IntersectionObserver' in window)
    $$('section[id]').forEach(s => new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) navAs.forEach(a => a.classList.toggle('act', a.getAttribute('href') === `#${e.target.id}`)); });
    }, { threshold: 0.35 }).observe(s));

  /* Neural network canvas */
  (() => {
    const canvas = $('#pcanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); let W, H, pts = [];
    const N = 52, MAX_D = 145;
    const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
    const mkPt = () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .32, vy: (Math.random() - .5) * .32, r: Math.random() * 1.4 + .4 });
    const init = () => { pts = Array.from({ length: N }, mkPt); };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const pc = root.getAttribute('data-theme') !== 'light' ? '45,212,191' : '13,148,136';
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${pc},.55)`; ctx.fill();
        for (let j = i + 1; j < N; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < MAX_D) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(${pc},${.18 * (1 - d / MAX_D)})`; ctx.lineWidth = .55; ctx.stroke(); }
        }
      });
      requestAnimationFrame(draw);
    };
    if (!reduceMotion) { resize(); init(); draw(); addEventListener('resize', () => { resize(); init(); }); }
  })();

  /* Contact form → Web3Forms (falls back to mailto until a key is set) */
  const W3F_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  $('#cForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (PREVIEW) return;
    const btn = this.querySelector('button[type=submit]');
    const msg = $('#fmsg');
    const email = ($('[data-soc="email"]')?.href || '').replace('mailto:', '') || 'viraajbhatt.1998@gmail.com';
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    if (msg) msg.style.display = 'none';
    const g = id => ($(id)?.value || '').trim();
    const [fname, femail, fcompany, frole, fmessage] = [g('#fn'), g('#fe'), g('#fc'), $('#ft')?.value || '', g('#fm')];
    const restore = () => { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message'; };
    if (W3F_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      const body = encodeURIComponent(`Name: ${fname}\nEmail: ${femail}\nCompany: ${fcompany || '—'}\nType: ${frole}\nMessage: ${fmessage || '—'}`);
      location.href = `mailto:${email}?subject=${encodeURIComponent(`Portfolio inquiry · ${fname} — ${frole}`)}&body=${body}`;
      restore(); return;
    }
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: W3F_KEY, name: fname, email: femail, company: fcompany || '—', role: frole, message: fmessage || '—', subject: `Portfolio inquiry · ${fname} — ${frole}`, from_name: 'Portfolio Contact Form' }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || 'Failed');
      msg.textContent = "✓ Message sent! I'll reply within 24 hours."; msg.className = 'ok'; msg.style.display = 'block'; this.reset();
    } catch (_) {
      msg.textContent = `✕ Could not send. Please email: ${email}`; msg.className = 'er'; msg.style.display = 'block';
    }
    restore();
  });
}

/* ── Live preview (driven by the developer console) ────────────────── */
function applyPreview(c) {
  try { render(c || {}); } catch (_) {}
  $$('.reveal').forEach(el => el.classList.add('on'));
  const typed = $('#typed');
  if (typed) { const roles = Array.isArray(c?.hero?.roles) ? c.hero.roles.map(String) : []; typed.textContent = roles[0] || typed.textContent || ''; }
}
async function initPreview() {
  try { const r = await fetch(`content.json?v=${Date.now()}`, { cache: 'no-cache' }); if (r.ok) applyPreview(await r.json()); } catch (_) {}
  addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === 'pf-preview') applyPreview(d.content);
    else if (d.type === 'pf-theme' && d.theme) setTheme(d.theme);
    else if (d.type === 'pf-scroll' && d.section) { const el = document.getElementById(d.section); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
  });
  try { parent.postMessage({ type: 'pf-ready' }, '*'); } catch (_) {}
}

/* ── Boot ───────────────────────────────────────────────────────────── */
const boot = async () => {
  mountChrome();
  if (PREVIEW) { initPreview(); return; }
  let content = {};
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(`content.json?v=${Date.now()}`, { signal: ctl.signal, cache: 'no-cache' });
    clearTimeout(timer);
    if (r.ok) content = render(await r.json());
  } catch (_) { /* static fallback stays */ }
  mountContent(content);
};
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();

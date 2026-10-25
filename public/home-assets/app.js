/* Agentronics — interactions + Agent Readiness scanner UI */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const API = window.AGENTRONICS_SCAN_API || '/api/scan';
  const ARROW = '<svg class="btn__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  document.documentElement.classList.add('app-ready');

  function track(name, props = {}) {
    (window.dataLayer = window.dataLayer || []).push({ event: name, ...props });
    window.dispatchEvent(new CustomEvent('agentronics:track', { detail: { name, ...props } }));
  }

  // Run fn once per element when it scrolls into view
  function onSeen(els, fn, opts = {}) {
    const list = [].concat(els).filter(Boolean);
    if (!('IntersectionObserver' in window)) return list.forEach(fn);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); }
      });
    }, { threshold: opts.threshold ?? 0.18, rootMargin: opts.rootMargin ?? '0px 0px -8% 0px' });
    list.forEach((el) => io.observe(el));
  }

  /* ---------- nav ---------- */
  const nav = $('[data-nav]');
  const setNav = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  setNav();
  addEventListener('scroll', setNav, { passive: true });

  /* ---------- reveal, highlights, counters ---------- */
  $$('[data-reveal]').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
  });
  onSeen($$('[data-reveal]'), (el) => el.classList.add('is-in'));
  onSeen($$('.mark'), (el) => el.classList.add('is-in'), { threshold: 0.6 });
  onSeen($$('.stack__card'), (el) => el.classList.add('is-in'), { threshold: 0.35 });

  function countUp(el, to, { duration = 1600, prefix = '', decimals = 0 } = {}) {
    if (reduce) { el.textContent = prefix + to.toFixed(decimals); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = prefix + (to * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  onSeen($$('[data-count]'), (el) => countUp(el, +el.dataset.count, { prefix: el.dataset.prefix || '' }), { threshold: 0.5 });

  /* ---------- hero: rotating word ---------- */
  const rot = $('[data-rotator]');
  if (rot) {
    const words = $$('.rotator__word', rot);
    let i = 0;
    const fit = () => { rot.style.width = `${words[i].offsetWidth}px`; };
    if (document.fonts?.ready) document.fonts.ready.then(fit);
    addEventListener('resize', fit);
    fit();
    if (!reduce) {
      setInterval(() => {
        if (document.hidden) return;
        const prev = words[i];
        i = (i + 1) % words.length;
        prev.classList.remove('is-on');
        prev.classList.add('is-out');
        words[i].classList.remove('is-out');
        words[i].classList.add('is-on');
        fit();
        setTimeout(() => prev.classList.remove('is-out'), 650);
      }, 2600);
    }
  }

  /* ---------- hero: spotlight dots ---------- */
  const hero = $('[data-spotlight]');
  if (hero && finePointer && !reduce) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
      hero.classList.add('is-lit');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('is-lit'));
  }

  /* ---------- hero: human view ↔ agent view beam ---------- */
  const stage = $('[data-duo-stage]');
  if (stage) {
    let x = 58, target = 58, auto = !reduce, t0 = performance.now(), visible = true, raf = 0;
    const AMP = 36;
    const frame = (now) => {
      if (auto) target = 50 + AMP * Math.sin((now - t0) / 1800);
      x += (target - x) * 0.14;
      stage.style.setProperty('--x', `${x.toFixed(2)}%`);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const point = (e) => {
      const r = stage.getBoundingClientRect();
      target = clamp(((e.clientX - r.left) / r.width) * 100, 3, 97);
      auto = false;
    };
    stage.addEventListener('pointermove', point);
    stage.addEventListener('pointerdown', point);
    stage.addEventListener('pointerleave', () => {
      if (reduce) return;
      // resume the sweep from where the beam is now
      t0 = performance.now() - Math.asin(clamp((x - 50) / AMP, -1, 1)) * 1800;
      auto = true;
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      }).observe(stage);
    }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- magnetic primary buttons ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.translate = `${dx * 0.18}px ${dy * 0.28}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
  }

  /* ---------- problem: live agent log ---------- */
  const logBox = $('[data-agentlog]');
  if (logBox) {
    const out = $('[data-agentlog-out]', logBox);
    const LINES = [
      ['d', '> task: buy trail runners, size 10, under $150'],
      ['', ''],
      ['w', '→ visiting your-site.com'],
      ['r', '  price ........ (empty, loads with JS)'],
      ['r', '  button "" .... buy or close?'],
      ['r', '  input ........ no label'],
      ['r', '  ✕ can’t complete task. leaving.'],
      ['', ''],
      ['w', '→ visiting competitor.com'],
      ['g', '  price ........ $124 ✓'],
      ['g', '  button ....... "Add to cart" ✓'],
      ['g', '  ✓ order placed'],
      ['', ''],
      ['a', '// your analytics: nothing happened.'],
      ['a', '// this is the sale you never see.'],
    ];
    let playing = false;
    const render = (lines) => lines.map(([c, t]) => `<span class="${c}">${esc(t)}</span>`).join('\n');
    const play = async () => {
      if (playing) return;
      playing = true;
      if (reduce) { out.innerHTML = render(LINES); return; }
      while (true) {
        const done = [];
        for (const [c, t] of LINES) {
          for (let k = 1; k <= t.length; k++) {
            out.innerHTML = render([...done, [c, t.slice(0, k)]]);
            await sleep(t.startsWith('  ') && k < 3 ? 0 : 16);
          }
          done.push([c, t]);
          out.innerHTML = render(done);
          await sleep(t ? (c === 'r' || c === 'g' ? 420 : 260) : 120);
        }
        await sleep(4200);
      }
    };
    onSeen(logBox, play, { threshold: 0.35 });
  }

  /* ---------- solution: PR merge moment ---------- */
  const pr = $('[data-pr]');
  if (pr) {
    onSeen(pr, async () => {
      pr.classList.add('is-in');
      if (reduce) { pr.classList.add('is-merged'); $('[data-pr-state]', pr).textContent = 'Merged'; $('[data-pr-merge]', pr).textContent = '✓ Merged'; return; }
      await sleep(1900);
      const btn = $('[data-pr-merge]', pr);
      btn.classList.add('is-pressed');
      await sleep(220);
      btn.classList.remove('is-pressed');
      pr.classList.add('is-merged');
      $('[data-pr-state]', pr).textContent = 'Merged';
      btn.textContent = '✓ Merged';
    }, { threshold: 0.5 });
  }

  /* ---------- solution: access rules ---------- */
  const rules = $('[data-rules]');
  if (rules) {
    const ask = $('[data-ask]', rules);
    $$('.seg', rules).forEach((seg) => {
      const opts = $$('.seg__opt', seg);
      const select = (opt) => {
        opts.forEach((o) => o.setAttribute('aria-checked', String(o === opt)));
        if (seg.closest('[data-rule-signup]')) ask.classList.toggle('is-hidden', opt.dataset.v !== 'ask');
      };
      opts.forEach((opt, idx) => {
        opt.addEventListener('click', () => select(opt));
        opt.addEventListener('keydown', (e) => {
          const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const next = opts[(idx + step + opts.length) % opts.length];
          select(next);
          next.focus();
        });
      });
    });
  }

  /* ---------- scroll-linked: stacked cards + steps line (GSAP if loaded) ---------- */
  const steps = $('[data-steps]');
  const gsap = window.gsap;
  if (gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(window.ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const cards = $$('[data-stack]');
      cards.forEach((card, idx) => {
        const next = cards[idx + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94 - (cards.length - idx - 2) * 0.02,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
        });
      });
      if (steps) {
        gsap.fromTo(steps, { '--p': 0 }, {
          '--p': 1, ease: 'none',
          scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 55%', scrub: true },
        });
      }
    });
  } else if (steps) {
    steps.style.transition = 'none';
    onSeen(steps, () => steps.style.setProperty('--p', 1));
  }

  /* =========================================================
     Agent Readiness scanner
     ========================================================= */
  const consoleEl = $('[data-console]');
  const mainForm = $('[data-main-scan]');
  const mainInput = mainForm && $('input', mainForm);
  const gaugeEl = $('[data-gauge]');
  const gFill = $('[data-gauge-fill]');
  const gNum = $('[data-gauge-num]');
  const gBand = $('[data-gauge-band]');
  const gSite = $('[data-gauge-site]');
  const statusEl = $('[data-status]');
  const statusBox = statusEl && statusEl.parentElement;
  const timerEl = $('[data-timer]');
  const reportEl = $('[data-report]');
  const ORDER = ['reachable', 'robots', 'sitemap', 'llms', 'ssr', 'schema', 'meta', 'markdown', 'buttons', 'forms', 'paths', 'actions'];
  const STEP = {
    reachable: 'Knocking as an AI agent', robots: 'Reading robots.txt', sitemap: 'Looking for a sitemap', llms: 'Looking for llms.txt',
    ssr: 'Reading your page without JavaScript', schema: 'Parsing structured data', meta: 'Checking title and headings', markdown: 'Asking for Markdown',
    buttons: 'Testing buttons and links', forms: 'Testing form fields', paths: 'Following key actions', actions: 'Looking for agent actions',
  };
  const BAND_CLASS = { not: 'is-not', partly: 'is-partly', ready: 'is-ready' };
  const BAND_COLOR = (s) => (s <= 40 ? 'var(--red)' : s <= 70 ? 'var(--amber)' : 'var(--lime)');
  let running = false;
  let lastResult = null;

  function cleanUrl(value) {
    let v = String(value || '').trim();
    if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = `https://${v.replace(/^\/+/, '')}`;
    try {
      const u = new URL(v);
      const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname);
      if (!u.hostname.includes('.') && !isIp) return null;
      if (/\s/.test(u.hostname)) return null;
      return u;
    } catch { return null; }
  }
  const display = (u) => (u.host + (u.pathname !== '/' ? u.pathname : '')).replace(/\/$/, '');

  function setButtons(scanning) {
    $$('[data-scan-form] button[type="submit"]').forEach((b) => {
      b.disabled = scanning;
      const t = $('.btn__text', b);
      if (t) t.textContent = scanning ? 'Scanning…' : 'Get my score';
    });
  }

  function resetRows() {
    ORDER.forEach((id) => {
      const row = $(`[data-check="${id}"]`, consoleEl);
      row.className = 'check';
      $$('.check__detail, .check__fix', row).forEach((n) => n.remove());
    });
    $$('[data-group]', consoleEl).forEach((col) => {
      $('[data-group-score]', col).textContent = '–';
      $('[data-group-bar]', col).style.setProperty('--v', '0%');
    });
  }

  function setGauge(value, band) {
    gFill.style.strokeDasharray = `${value} 200`;
    gNum.textContent = Math.round(value);
    gaugeEl.classList.remove('is-not', 'is-partly', 'is-ready');
    if (band) gaugeEl.classList.add(BAND_CLASS[band]);
  }

  function revealRow(check) {
    const row = $(`[data-check="${check.id}"]`, consoleEl);
    row.classList.remove('is-running');
    row.classList.add(check.pass ? 'is-pass' : 'is-fail');
    if (check.detail) row.insertAdjacentHTML('beforeend', `<span class="check__detail">${esc(check.detail)}</span>`);
    if (!check.pass && check.fix) row.insertAdjacentHTML('beforeend', `<span class="check__fix">${esc(check.fix)}</span>`);
  }

  function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusBox.classList.toggle('is-error', isError);
  }

  async function runScan(u) {
    const res = await fetch(`${API}?url=${encodeURIComponent(u.href)}`, { headers: { accept: 'application/json' } });
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!res.ok || !data || data.error) throw new Error((data && data.error) || 'The scanner isn’t reachable right now. Try again in a minute.');
    return data;
  }

  async function startScan(u) {
    if (running || !consoleEl) return null;
    running = true;
    lastResult = null;
    track('scan_start', { url: u.href });
    history.replaceState(null, '', `?url=${encodeURIComponent(display(u))}#score`);

    consoleEl.dataset.state = 'scanning';
    reportEl.hidden = true;
    reportEl.innerHTML = '';
    resetRows();
    setButtons(true);
    setGauge(0);
    gNum.textContent = '…';
    gBand.textContent = 'Checking what agents see…';
    gSite.textContent = display(u);

    const started = performance.now();
    const timer = setInterval(() => { timerEl.textContent = `${((performance.now() - started) / 1000).toFixed(1)}s`; }, 100);

    let result = null, error = null;
    const job = runScan(u).then((r) => { result = r; }, (e) => { error = e; });
    const revealed = new Set();
    const byId = (id) => result.checks.find((c) => c.id === id);

    // Show the work: each check lights up in turn and resolves as results arrive
    for (let k = 0; k < ORDER.length && !error; k++) {
      const id = ORDER[k];
      $(`[data-check="${id}"]`, consoleEl).classList.add('is-running');
      setStatus(`${STEP[id]}… ${revealed.size} of 12 done`);
      await sleep(reduce ? 40 : 480);
      if (result) {
        for (const pid of ORDER.slice(0, k + 1)) {
          if (!revealed.has(pid)) { revealRow(byId(pid)); revealed.add(pid); }
        }
      }
    }
    if (!result && !error) setStatus(`Still reading ${u.host}… ${revealed.size} of 12 done`);
    await job;
    clearInterval(timer);

    if (error) {
      resetRows();
      consoleEl.dataset.state = 'error';
      gNum.textContent = '?';
      gBand.textContent = 'We couldn’t scan that site';
      setStatus(error.message, true);
      timerEl.textContent = '';
      setButtons(false);
      running = false;
      track('scan_error', { url: u.href, message: error.message });
      throw error;
    }

    for (const id of ORDER) {
      if (revealed.has(id)) continue;
      revealRow(byId(id));
      revealed.add(id);
      setStatus(`Checking what agents see… ${revealed.size} of 12 done`);
      await sleep(reduce ? 0 : 110);
    }

    finish(result);
    setButtons(false);
    running = false;
    return result;
  }

  function finish(r) {
    lastResult = r;
    consoleEl.dataset.state = 'done';
    setStatus(`Done. ${r.passed} of ${r.total} checks passed · scanned ${r.host}`);

    // gauge
    const t0 = performance.now();
    const dur = reduce ? 1 : 1500;
    gBand.textContent = r.band.label;
    gaugeEl.classList.add(BAND_CLASS[r.band.key]);
    const tick = (now) => {
      const t = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setGauge(r.score * eased, r.band.key);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // groups
    for (const key of ['find', 'read', 'act']) {
      const col = $(`[data-group="${key}"]`, consoleEl);
      const s = r.groups[key].score;
      countUp($('[data-group-score]', col), s, { duration: 1200 });
      const bar = $('[data-group-bar]', col);
      bar.style.setProperty('--bar', BAND_COLOR(s));
      requestAnimationFrame(() => bar.style.setProperty('--v', `${s}%`));
    }

    renderReport(r);
    track('scan_complete', { url: r.url, score: r.score, band: r.band.key });
  }

  function renderReport(r) {
    const host = esc(r.host);
    const fails = r.checks.filter((c) => !c.pass);
    const tone = { not: 't-red', partly: 't-amber', ready: 't-lime' }[r.band.key];
    const verdict = {
      not: 'Most AI agents can’t use your site yet.',
      partly: 'Agents find you, then get stuck.',
      ready: 'Let’s keep it that way.',
    }[r.band.key];
    const site = encodeURIComponent(r.host);

    let path = '';
    if (r.score < 71 && r.path.fixes.length) {
      // biggest gains first until the listed points add up to Agent-ready
      const top = [];
      let projected = r.score;
      for (const f of r.path.fixes) {
        if (projected >= 71) break;
        top.push(f);
        projected += f.gain;
      }
      projected = Math.min(100, projected);
      path = `
        <div class="report__path">
          <p class="report__label">Path to Agent-ready</p>
          <p class="report__jump"><span class="${tone}">${r.score}</span><svg viewBox="0 0 46 20" aria-hidden="true"><path d="M2 10h40M34 3l8 7-8 7"/></svg><span class="t-lime">${projected}</span></p>
          <p class="report__jumpnote">${top.length} fix${top.length > 1 ? 'es' : ''} to reach Agent-ready (71+), based on each check’s real weight.</p>
          <ol class="report__fixes">${top.map((f) => `<li><b>+${f.gain}</b>${esc(f.title)}</li>`).join('')}</ol>
        </div>`;
    } else if (fails.length) {
      path = `
        <div class="report__path">
          <p class="report__label">Still open</p>
          <ol class="report__fixes">${r.path.fixes.map((f) => `<li><b>+${f.gain}</b>${esc(f.title)}</li>`).join('')}</ol>
        </div>`;
    }

    const miss = fails.slice().sort((a, b) => b.weight - a.weight).slice(0, 3);
    const missHtml = miss.length
      ? `<p class="report__label">What agents miss on your site today</p><ul class="report__miss">${miss.map((c) => `<li>${esc(c.detail)}</li>`).join('')}</ul>`
      : `<p class="report__label">Every check passed</p><p class="report__pass" style="margin:0 0 22px">Agents can find, read and act on ${host}. One new form or redesign can change that.</p>`;

    const cta = r.score >= 71
      ? `<div class="report__cta">
           <p><b>Keep it this way.</b> Starter re-checks your site after every code change and alerts you if your score drops.</p>
           <a class="btn btn--ink" href="/signup?plan=starter&site=${site}" data-plan="starter">Start Starter · $19/mo ${ARROW}</a>
           <a class="report__alt" href="/signup?plan=free&site=${site}" data-plan="free">Start free instead</a>
         </div>`
      : `<div class="report__cta">
           <p><b>Agent Nick writes these fixes.</b> You review one pull request and click Merge. Your site looks the same to people.</p>
           <a class="btn btn--ink" href="/signup?plan=free&site=${site}" data-plan="free">Fix it free with Agent Nick ${ARROW}</a>
           <a class="report__alt" href="/signup?plan=starter&site=${site}" data-plan="starter">Or Starter, $19/mo: re-checks after every code change</a>
         </div>`;

    reportEl.innerHTML = `
      <div>
        <p class="report__label">Your result · ${host}</p>
        <p class="report__verdict"><b class="${tone}">${esc(r.band.label)}.</b> ${verdict}</p>
        <p class="report__pass">You already pass <b>${r.passed} of ${r.total}</b> checks.</p>
        ${path}
      </div>
      <div>
        ${missHtml}
        ${cta}
        <div class="report__tools">
          <button type="button" data-scan-competitor>Scan a competitor</button>
          <button type="button" data-copy-link>Copy link to this report</button>
        </div>
      </div>`;
    reportEl.hidden = false;
  }

  // report buttons (delegated)
  reportEl?.addEventListener('click', async (e) => {
    const comp = e.target.closest('[data-scan-competitor]');
    const copy = e.target.closest('[data-copy-link]');
    if (comp) {
      mainInput.value = '';
      mainInput.placeholder = 'competitor.com';
      mainForm.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => mainInput.focus({ preventScroll: true }), reduce ? 0 : 500);
    }
    if (copy && lastResult) {
      const link = `${location.origin}${location.pathname}?url=${encodeURIComponent(lastResult.host)}#score`;
      try { await navigator.clipboard.writeText(link); copy.textContent = 'Link copied ✓'; } catch { copy.textContent = link; }
      track('share_score', { score: lastResult.score });
      setTimeout(() => { copy.textContent = 'Copy link to this report'; }, 2400);
    }
  });

  function goToScanner() {
    $('#score').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function submitUrl(raw, form) {
    const u = cleanUrl(raw);
    const err = form && $('.scanform__error', form);
    if (!u) {
      if (form) {
        form.classList.remove('is-invalid');
        void form.offsetWidth;
        form.classList.add('is-invalid');
        err.hidden = false;
        $('input', form).focus();
      }
      return null;
    }
    if (form) { form.classList.remove('is-invalid'); err.hidden = true; }
    mainInput.value = display(u);
    if (form !== mainForm) goToScanner();
    const p = sleep(form === mainForm || reduce ? 0 : 650).then(() => startScan(u));
    p.catch(() => {});
    return p;
  }

  $$('[data-scan-form]').forEach((form) => {
    const input = $('input', form);
    input.addEventListener('input', () => {
      if (form.classList.contains('is-invalid')) { form.classList.remove('is-invalid'); $('.scanform__error', form).hidden = true; }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = submitUrl(input.value, form);
      // WebMCP declarative tools: hand the scan result back to the calling agent
      if (p && typeof e.respondWith === 'function') {
        try { e.respondWith(p.then((r) => r || { error: 'A scan is already running.' })); } catch { /* not an agent submit */ }
      }
    });
  });

  // "Get my score" in the nav: scroll to the hero input and focus it
  $$('[data-goto-score]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const heroInput = $('#hero-url');
    if (scrollY < innerHeight * 0.5 && heroInput) { heroInput.focus(); return; }
    goToScanner();
    setTimeout(() => mainInput.focus({ preventScroll: true }), reduce ? 0 : 700);
  }));

  // "Scan this site yourself"
  $$('[data-scan-self]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const self = cleanUrl(location.origin.replace('//localhost', '//127.0.0.1'));
    goToScanner();
    if (!self) return;
    mainInput.value = display(self);
    sleep(reduce ? 0 : 650).then(() => startScan(self)).catch(() => {});
  }));

  $$('[data-plan]').forEach((a) => a.addEventListener('click', () => track('plan_click', { plan: a.dataset.plan })));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-report] [data-plan]');
    if (a) track('plan_click', { plan: a.dataset.plan, from: 'report' });
  });

  // Shared links: /?url=example.com#score runs the scan on arrival
  const initial = new URLSearchParams(location.search).get('url');
  if (initial && cleanUrl(initial) && mainInput) {
    mainInput.value = initial;
    setTimeout(() => { goToScanner(); sleep(reduce ? 0 : 600).then(() => startScan(cleanUrl(initial))).catch(() => {}); }, 300);
  }

  /* ---------- WebMCP (imperative): pricing tool for agents ---------- */
  const PLANS = [
    { plan: 'Free', priceUsdPerMonth: 0, sites: 1, fixRoundsPerMonth: 1, agentActions: 5, agentVisitsPerMonth: 5000, signup: '/signup?plan=free' },
    { plan: 'Starter', priceUsdPerMonth: 19, sites: 1, fixRoundsPerMonth: 5, agentActions: 15, agentVisitsPerMonth: 50000, mostPopular: true, signup: '/signup?plan=starter' },
    { plan: 'Pro', priceUsdPerMonth: 49, sites: 3, fixRoundsPerMonth: 30, agentActions: 'unlimited', agentVisitsPerMonth: 250000, signup: '/signup?plan=pro' },
    { plan: 'Enterprise', priceUsdPerMonth: 'custom', sites: 'unlimited', fixRoundsPerMonth: 'unlimited', agentActions: 'unlimited', agentVisitsPerMonth: 'unlimited', contact: '/demo' },
  ];
  try {
    const mc = navigator.modelContext;
    if (mc && typeof mc.registerTool === 'function') {
      mc.registerTool({
        name: 'get_pricing',
        description: 'Return Agentronics plans with monthly USD prices and limits. Every plan includes Agent Nick.',
        inputSchema: { type: 'object', properties: {} },
        async execute() { return { content: [{ type: 'text', text: JSON.stringify(PLANS) }] }; },
      });
    }
  } catch { /* WebMCP API not available or changed */ }
})();

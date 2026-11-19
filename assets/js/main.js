/* ==========================================================
   ALEX TEIH — interactions & motion
   GSAP + ScrollTrigger + Lenis
   ========================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.AT_COLLECTIONS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const pad2 = n => String(n).padStart(2, '0');
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = target => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === '#top' ? document.body : id);
  }));

  /* ---------- small utilities ---------- */
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  const nyTime = $('#nyTime');
  const tick = () => {
    if (!nyTime) return;
    const t = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    nyTime.textContent = 'NY ' + t;
  };
  tick(); setInterval(tick, 20000);

  // split [data-split] into masked lines
  $$('[data-split]').forEach(el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(p => `<span class="line"><span>${p.trim()}</span></span>`).join('');
  });

  // jagged "torn paper" polygon
  const tornPoints = (n, amp, seed = 1) => {
    let s = seed;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([i / n, rnd() * amp]);
    return pts;
  };

  /* ---------- header: hide on scroll down ---------- */
  const header = $('#header');
  let lastY = 0;
  const onScroll = y => {
    if (!header) return;
    if (y > lastY + 4 && y > 200 && !document.body.classList.contains('menu-open')) header.classList.add('is-hidden');
    else if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
  };
  lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* ---------- menu ---------- */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  const menuCols = $('#menuCollections'), menuImg = $('#menuImg');
  if (menuCols) {
    menuCols.innerHTML = C.map(c => `<li><a href="collection.html?c=${c.slug}" data-img="${c.cover}">${c.name}</a></li>`).join('');
    $$('a', menuCols).forEach(a => a.addEventListener('mouseenter', () => { menuImg.src = a.dataset.img; }));
  }
  let menuOpen = false;
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true; document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true');
    lenis && lenis.stop();
    if (hasGSAP) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' });
      gsap.fromTo($$('.menu__list a'), { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .35 });
      gsap.fromTo([$('.menu__side'), $('.menu__img')], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8, delay: .5, stagger: .1 });
    } else { menu.style.visibility = 'visible'; menu.style.clipPath = 'inset(0)'; }
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false; document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false');
    lenis && lenis.start();
    if (hasGSAP) gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    else { menu.style.visibility = 'hidden'; }
  }
  menuBtn && menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeLightbox(); } });

  /* ---------- custom cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && !isTouch && hasGSAP) {
    const xTo = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
    const c1 = $('#cur1'), c2 = $('#cur2');
    // delegated so it also works for elements rendered later
    let curEl = null;
    document.addEventListener('pointerover', e => {
      const el = e.target.closest('[data-cursor]');
      if (el === curEl) return;
      curEl = el;
      if (!el) { cursor.classList.remove('on'); return; }
      const card = e.target.closest('.card');
      c1.textContent = card && el.id === 'looksRow' ? 'DRAG' : (el.dataset.c1 || 'DRAG');
      c2.textContent = card && el.id === 'looksRow' ? 'VIEW' : (el.dataset.c2 || 'CLICK');
      cursor.classList.add('on');
    });
    document.addEventListener('pointerleave', () => { curEl = null; cursor.classList.remove('on'); });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbList = [], lbIndex = 0;
  function showLb() {
    const it = lbList[lbIndex];
    lbImg.src = it.src; lbImg.alt = it.cap;
    lbCap.textContent = `${it.cap}  —  ${pad2(lbIndex + 1)} / ${pad2(lbList.length)}`;
    if (hasGSAP) gsap.fromTo(lbImg, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
  }
  function openLightbox(list, i) {
    if (!lb) return;
    lbList = list; lbIndex = i; showLb();
    lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); lenis && lenis.stop();
  }
  function closeLightbox() {
    if (!lb || !lb.classList.contains('on')) return;
    lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); lenis && lenis.start();
  }
  if (lb) {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; showLb(); });
    $('#lbNext').addEventListener('click', () => { lbIndex = (lbIndex + 1) % lbList.length; showLb(); });
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'ArrowRight') $('#lbNext').click();
      if (e.key === 'ArrowLeft') $('#lbPrev').click();
    });
  }
  window.AT_openLightbox = openLightbox;

  /* ---------- card templates ---------- */
  const lookCard = (l, i) => `
    <article class="card" data-i="${i}">
      <div class="card__media">
        ${l.badge ? `<span class="card__badge">${l.badge}</span>` : ''}
        <span class="card__idx">${pad2(i + 1)}</span>
        <div class="card__quick"><span>[ VIEW LOOK ]</span><span>(BESPOKE)</span></div>
        <img src="${l.src}" alt="${l.collection} — look ${pad2(l.n)}" loading="lazy" draggable="false" />
        ${l.alt ? `<img src="${l.alt}" alt="" loading="lazy" draggable="false" />` : ''}
      </div>
      <div class="card__info">
        <div>
          <h3 class="card__name">${l.collection} — Look ${pad2(l.n)}</h3>
          <p class="card__price">MADE TO MEASURE</p>
        </div>
        <div class="card__sizes"><span>(${l.tag})</span></div>
      </div>
    </article>`;
  window.AT_lookCard = lookCard;

  /* ---------- draggable infinite row ---------- */
  function dragRow(row, track, { speed = .35, onClick } = {}) {
    if (!row || !track) return;
    const originals = [...track.children];
    // clone twice for seamless wrapping
    for (let k = 0; k < 2; k++) originals.forEach(n => track.appendChild(n.cloneNode(true)));
    let setW = 0;
    const measure = () => { setW = track.scrollWidth / 3; };
    measure(); addEventListener('resize', measure);
    addEventListener('load', measure);

    let x = 0, target = 0, dragging = false, startX = 0, startT = 0, moved = 0, vel = 0, lastX = 0, hover = false;
    const wrap = v => { if (!setW) return v; return ((v % setW) - setW) % setW; };
    row.addEventListener('pointerdown', e => {
      dragging = true; moved = 0; startX = lastX = e.clientX; startT = target;
      row.setPointerCapture(e.pointerId);
    });
    row.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      vel = e.clientX - lastX; lastX = e.clientX;
      target = startT + dx * 1.2;
    });
    const end = e => {
      if (!dragging) return; dragging = false;
      target += vel * 12;
      if (moved < 6 && onClick) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el && el.closest('[data-i]');
        if (card) onClick(+card.dataset.i, card);
      }
    };
    row.addEventListener('pointerup', end);
    row.addEventListener('pointercancel', end);
    row.addEventListener('pointerenter', () => (hover = true));
    row.addEventListener('pointerleave', () => (hover = false));
    // wheel horizontal
    row.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); target -= e.deltaX; } }, { passive: false });

    const loop = () => {
      if (!dragging && !reduced) target -= hover ? speed * .25 : speed;
      x += (target - x) * .09;
      track.style.transform = `translate3d(${wrap(x)}px,0,0)`;
      // subtle skew by velocity
      const sk = Math.max(-6, Math.min(6, (target - x) * .02));
      track.style.setProperty('--sk', sk);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ================== HOME PAGE ================== */
  const isHome = !!$('#hero');
  if (isHome) {
    /* looks */
    const picks = [
      ['haute-couture', 1, 2], ['ball-gown', 20, 0], ['slim-silhouette', 20, 9], ['white-nights', 6, 4], ['ball-gown', 11, 12],
      ['seductive-shimmer', 11, 12], ['haute-couture', 4, 3], ['slim-silhouette', 9, 4], ['ball-gown', 28, 23], ['endlessly-ethereal', 4, 5],
      ['ball-gown', 25, 21], ['haute-couture', 9, 6], ['slim-silhouette', 16, 17], ['white-nights', 1, 3],
    ];
    const bySlug = Object.fromEntries(C.map(c => [c.slug, c]));
    const fileNum = s => +s.match(/-(\d+)\.jpg$/)[1];
    const findLook = (c, n) => c.looks.find(s => fileNum(s) === n) || c.looks[0];
    const looks = picks.map(([slug, a, b], i) => {
      const c = bySlug[slug];
      return {
        src: findLook(c, a), alt: b ? findLook(c, b) : null, n: a, collection: c.name, tag: c.tag,
        badge: i < 3 ? 'NEW' : (i % 4 === 1 ? 'SIGNATURE' : ''),
      };
    });
    $('#looksTrack').innerHTML = looks.map(lookCard).join('');
    $('#looksLabels').innerHTML = [...new Set(looks.map(l => l.collection))].map(n => `<li>(${n})</li>`).join('');
    const lbLooks = looks.map(l => ({ src: l.src, cap: `${l.collection} — Look ${pad2(l.n)}` }));
    dragRow($('#looksRow'), $('#looksTrack'), { speed: .45, onClick: i => openLightbox(lbLooks, i) });
    // highlight aside label on hover
    $('#looksTrack').addEventListener('pointerover', e => {
      const card = e.target.closest('[data-i]'); if (!card) return;
      const name = looks[+card.dataset.i].collection;
      $$('#looksLabels li').forEach(li => li.classList.toggle('is-on', li.textContent === `(${name})`));
    });

    /* collections row */
    $('#catsTrack').innerHTML = C.map((c, i) => `
      <a class="cat" data-i="${i}" href="collection.html?c=${c.slug}">
        <div class="cat__media"><img src="${c.cover}" alt="${c.name} collection" loading="lazy" draggable="false" /></div>
        <span class="cat__vert">${c.name.split(' ')[0]}</span>
        <div class="cat__info"><h3 class="cat__name">${c.name}</h3><span class="mono">[ ${pad2(c.looks.length)} ]</span></div>
      </a>`).join('');
    // anchors inside the drag row: block native navigation, navigate on click only
    $('#catsTrack').addEventListener('click', e => e.preventDefault());
    dragRow($('#catsRow'), $('#catsTrack'), { speed: .3, onClick: i => goTo(`collection.html?c=${C[i].slug}`) });

    /* marquee */
    const mq = $('#marqueeTrack');
    const chunk = `<span>${C.map(c => `${c.name}<i>✦</i>`).join('')}</span>`;
    mq.innerHTML = chunk + chunk;

    /* about text */
    $('#aboutCols').innerHTML = window.AT_BIO.long.map(p => `<p data-reveal>${p}</p>`).join('');

    /* footer collections */
    $('#footerCollections').innerHTML = C.map(c => `<a class="u-link" href="collection.html?c=${c.slug}">${c.name.toUpperCase()}</a>`).join('');

    /* hero tear */
    const visual = $('#heroVisual'), mono = $('#heroMono'), tearSvg = $('#heroTear'), tearPath = $('#heroTearPath');
    const pts = tornPoints(46, 1, 7);
    const buildTear = () => {
      const W = visual.clientWidth, H = visual.clientHeight;
      const cx = W * .5, amp = 26;
      // svg strip (paper edge): left edge jagged, right edge jagged offset
      const left = pts.map(([t, r]) => [10 + r * 18, t * 1000]);
      const right = pts.map(([t, r], i) => [left[i][0] + 4 + ((i * 7) % 5), t * 1000]).reverse();
      tearPath.setAttribute('d', 'M' + [...left, ...right].map(p => p.join(',')).join('L') + 'Z');
      tearSvg.style.left = (cx - 20) + 'px';
      // mono half clip follows right edge of the strip (40 svg units -> 40px)
      const poly = pts.map(([t, r], i) => `${cx - 20 + 10 + r * 18 + 4 + ((i * 7) % 5)}px ${t * H}px`);
      mono.style.clipPath = `polygon(${poly.join(',')}, ${W}px ${H}px, ${W}px 0px)`;
      void amp;
    };
    buildTear(); addEventListener('resize', buildTear);

    /* hero collection cycle */
    const heroTitle = $('#heroTitle'), heroLink = $('#heroLink');
    const imgA = $('#heroImgA'), imgB = $('#heroImgB');
    const heroSeq = [1, 0, 2, 4, 3, 5]; // start with Haute Couture
    let heroI = 0;
    C.forEach(c => { const im = new Image(); im.src = c.cover; });
    const splitWord = w => [...w].map(ch => `<span class="ch">${ch}</span>`).join('');
    const setHero = (c, animate) => {
      const [w1, ...rest] = c.name.toUpperCase().split(' ');
      const html = `<span class="hero__w1 accent">${splitWord(w1)}</span> <span class="hero__w2">${splitWord(rest.join(' '))}</span>`;
      if (!animate || !hasGSAP) { heroTitle.innerHTML = html; imgA.src = imgB.src = c.cover; heroLink.href = `collection.html?c=${c.slug}`; return; }
      const tl = gsap.timeline();
      tl.to($$('.ch', heroTitle), { yPercent: -110, opacity: 0, duration: .5, stagger: .015, ease: 'power3.in' })
        .to([imgA, imgB], { opacity: 0, scale: 1.04, duration: .5, ease: 'power2.in' }, 0)
        .add(() => {
          heroTitle.innerHTML = html; imgA.src = imgB.src = c.cover; heroLink.href = `collection.html?c=${c.slug}`;
        })
        .fromTo(() => $$('.ch', heroTitle), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, stagger: .02, ease: 'expo.out' })
        .fromTo([imgA, imgB], { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }, '<');
    };
    setHero(C[heroSeq[0]], false);

    // collection index (left) + counter (right) with progress bars
    const heroIndex = $('#heroIndex'), heroCount = $('#heroCount');
    const HERO_DUR = 4.2;
    heroIndex.innerHTML = heroSeq.map((ci, k) =>
      `<li data-k="${k}"><button type="button"><span class="hi__n">${pad2(k + 1)}</span>${C[ci].name}</button><i class="hi__bar"><b></b></i></li>`).join('');
    let heroCall = null, barTween = null;
    const markHero = () => {
      $$('li', heroIndex).forEach((li, k) => li.classList.toggle('is-on', k === heroI));
      heroCount.textContent = pad2(heroI + 1);
      if (!hasGSAP) return;
      barTween && barTween.kill();
      gsap.set($$('.hi__bar b', heroIndex), { scaleX: 0 });
      if (!reduced) barTween = gsap.fromTo($$('.hi__bar b', heroIndex)[heroI], { scaleX: 0 }, { scaleX: 1, duration: HERO_DUR, ease: 'none' });
    };
    const goHero = (k, animate = true) => {
      heroI = (k + heroSeq.length) % heroSeq.length;
      setHero(C[heroSeq[heroI]], animate);
      markHero();
      if (heroCall) heroCall.kill();
      if (!reduced && hasGSAP) heroCall = gsap.delayedCall(HERO_DUR, () => goHero(heroI + 1));
    };
    $$('button', heroIndex).forEach((b, k) => b.addEventListener('click', () => { if (k !== heroI) goHero(k); }));
    markHero();
    const startHeroCycle = () => { if (!reduced && hasGSAP) { markHero(); heroCall = gsap.delayedCall(HERO_DUR, () => goHero(heroI + 1)); } };
    // pause cycle while hero is off-screen
    if (hasGSAP) ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom top',
      onLeave: () => { heroCall && heroCall.pause(); barTween && barTween.pause(); },
      onEnterBack: () => { heroCall && heroCall.resume(); barTween && barTween.resume(); },
    });
    visual.addEventListener('click', () => goTo(heroLink.href));

    // torn top edge on the hero photo
    const heroTop = tornPoints(40, 1, 11).map(([t, r]) => `${t * 100}% ${r * 14}px`);
    visual.style.clipPath = `polygon(${heroTop.join(',')}, 100% 100%, 0% 100%)`;

    /* hero mouse parallax */
    if (!isTouch && hasGSAP) {
      const hx = gsap.quickTo(visual, 'x', { duration: 1.2, ease: 'power3' });
      const bx = gsap.quickTo('.hero__brand', 'x', { duration: 1.4, ease: 'power3' });
      const tx = gsap.quickTo('.hero__tag', 'x', { duration: 1.4, ease: 'power3' });
      $('#hero').addEventListener('pointermove', e => {
        const r = (e.clientX / innerWidth - .5);
        hx(r * -18); bx(r * 24); tx(r * -24);
      });
    }

    /* ---------- preloader ---------- */
    const loader = $('#loader'), pctEl = $('#loaderPct'), stack = $('#loaderStack');
    const loadList = ['assets/img/hc-1.jpg', ...C.map(c => c.cover), 'assets/img/hero.jpg', 'assets/img/designer.jpg'];
    stack.innerHTML = loadList.slice(0, 7).map(s => `<img src="${s}" alt="" />`).join('');
    const stackImgs = $$('img', stack);
    let si = 0; stackImgs[0].classList.add('on');
    const flip = setInterval(() => { stackImgs[si].classList.remove('on'); si = (si + 1) % stackImgs.length; stackImgs[si].classList.add('on'); }, 160);

    let loaded = 0;
    const progress = { v: 0 };
    const loads = loadList.map(src => new Promise(res => { const im = new Image(); im.onload = im.onerror = () => { loaded++; res(); }; im.src = src; }));
    let seen = false;
    try { seen = sessionStorage.getItem('at_seen') === '1'; sessionStorage.setItem('at_seen', '1'); } catch (e) { /* storage blocked */ }
    const minTime = new Promise(r => setTimeout(r, reduced ? 200 : seen ? 700 : 1900));
    const counter = setInterval(() => {
      const goal = (loaded / loadList.length) * 100;
      progress.v += (goal - progress.v) * .18 + .4;
      pctEl.textContent = Math.min(99, Math.round(progress.v));
    }, 40);
    Promise.all([Promise.all(loads), minTime]).then(() => {
      clearInterval(counter); pctEl.textContent = '100';
      setTimeout(intro, 220);
    });

    function intro() {
      clearInterval(flip);
      document.body.classList.remove('is-loading');
      if (!hasGSAP) { loader.remove(); startHeroCycle(); return; }
      const tl = gsap.timeline({ onComplete: () => { loader.remove(); startHeroCycle(); ScrollTrigger.refresh(); } });
      tl.to(['.loader__word', '.loader__pct', '.loader__tag'], { opacity: 0, y: -20, duration: .5, ease: 'power2.in' })
        .to(stack, { scale: 1.6, opacity: 0, duration: .9, ease: 'expo.inOut' }, .1)
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, .3)
        .from(visual, { yPercent: 14, scale: .92, duration: 1.4, ease: 'expo.out' }, .7)
        .from('.hero__brand .line > span, .hero__tag .line > span', { yPercent: 110, duration: 1.1, stagger: .08, ease: 'expo.out' }, .9)
        .from($$('.ch', heroTitle), { yPercent: 110, opacity: 0, duration: .9, stagger: .025, ease: 'expo.out' }, 1)
        .from(['.hero__meta', '.hero__count', '.hero__bottom .bracket-link', '.hero__scroll'], { opacity: 0, y: 14, duration: .8, stagger: .06, clearProps: 'transform' }, 1.2)
        .from('.header', { opacity: 0, duration: .8, clearProps: 'opacity' }, 1.2);
    }

    /* ---------- scroll animations ---------- */
    if (hasGSAP && !reduced) {
      // hero exit
      gsap.to(visual, { yPercent: 12, scale: .94, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(['.hero__brand', '.hero__tag'], { yPercent: -60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

      // marquee: constant drift + scroll velocity boost
      const mqTween = gsap.to(mq, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        onUpdate: self => {
          const v = self.getVelocity() / 300;
          gsap.to(mqTween, { timeScale: Math.max(-4, Math.min(4, 1 + Math.abs(v))) * (self.direction || 1), duration: .3, overwrite: true });
        },
      });

      // section heads
      $$('.sec-head').forEach(h => gsap.from(h.children, { y: 20, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } }));

      // looks row entrance
      gsap.from('#looksTrack .card', { y: 80, opacity: 0, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '#looks', start: 'top 75%' } });
      gsap.from('#catsTrack .cat', { y: 80, opacity: 0, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '#collections', start: 'top 75%' } });

      // campaign parallax + title
      gsap.fromTo('.campaign__media', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#campaign', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.campaign__media img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#campaign', start: 'top bottom', end: 'center center', scrub: true } });
      gsap.from('.campaign__title .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.campaign__bottom', start: 'top 85%' } });
      gsap.from(['.campaign__paren', '.campaign__quote', '.campaign__foot'], { opacity: 0, y: 20, duration: 1, stagger: .1, scrollTrigger: { trigger: '.campaign__bottom', start: 'top 85%' } });

      // split images: clip reveal + inner parallax
      $$('.split__media').forEach(m => {
        gsap.fromTo(m, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: m, start: 'top 85%' } });
        gsap.fromTo($('img', m), { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      $$('.split__cap h3, .split__txt').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));

      // about (pinned, desktop only)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 761px)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '#aboutPin', start: 'top top', end: '+=140%', pin: true, scrub: 1 } });
        tl.fromTo('#aboutPortrait', { width: '22vw', rotate: -3 }, { width: '58vw', rotate: 0, ease: 'none' })
          .fromTo('.about__graffiti', { scale: .6, opacity: 0 }, { scale: 1.25, opacity: .9, ease: 'none' }, 0)
          .fromTo('.about__corner--tl', { x: 0 }, { x: -40, ease: 'none' }, 0)
          .fromTo('.about__corner--br', { x: 0 }, { x: 40, ease: 'none' }, 0)
          .to('.about__seal', { rotate: 360, ease: 'none' }, 0);

        // atelier dive
        const at = gsap.timeline({ scrollTrigger: { trigger: '#atelierStage', start: 'top top', end: '+=150%', pin: true, scrub: 1 } });
        at.to('#atelierFrame', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' })
          .to('#atelierFrame img', { scale: 1, ease: 'none' }, 0)
          .to('.atelier__tip', { opacity: 0, ease: 'none' }, 0)
          .to('#atelierOverlay', { opacity: 1, y: 0, ease: 'none' }, .55);
      });
      mm.add('(max-width: 760px)', () => {
        gsap.to('#atelierFrame', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '#atelierStage', start: 'top 80%', end: 'center center', scrub: true } });
        gsap.to('#atelierOverlay', { opacity: 1, scrollTrigger: { trigger: '#atelierStage', start: 'center 70%' } });
      });

      gsap.from('.atelier__head .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.atelier__head', start: 'top 80%' } });

      // footer big name
      gsap.from('.footer__big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 80%' } });
      gsap.from('.footer__cut', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    }

    /* footer tear */
    const ft = $('.footer__tear');
    if (ft) {
      const p = tornPoints(70, 1, 3).map(([t, r]) => `${t * 100}% ${40 + r * 55}%`);
      ft.style.clipPath = `polygon(0% 100%, ${p.join(',')}, 100% 100%)`;
    }

    /* appointment form -> mail client */
    const form = $('#apptForm'), note = $('#apptNote');
    form && form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const name = (d.get('name') || '').trim(), email = (d.get('email') || '').trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) { note.textContent = '( PLEASE ADD YOUR NAME AND A VALID EMAIL )'; return; }
      const body = `Name: ${name}\nEmail: ${email}\n\n${d.get('message') || ''}`;
      location.href = `mailto:${window.AT_CONTACT.email}?subject=${encodeURIComponent('Appointment request — ' + name)}&body=${encodeURIComponent(body)}`;
      note.textContent = '( THANK YOU — YOUR MAIL APP IS OPENING )';
      form.reset();
    });
  }

  /* generic reveal */
  if (hasGSAP && !reduced) {
    $$('[data-reveal]').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  }

  /* ---------- torn paper edges: [data-torn="top bottom"] ---------- */
  $$('[data-torn]').forEach((sec, si) => {
    sec.dataset.torn.split(' ').forEach((side, k) => {
      const edge = document.createElement('div');
      edge.className = `torn torn--${side}`;
      edge.setAttribute('aria-hidden', 'true');
      const pts = tornPoints(80, 1, 5 + si * 3 + k * 7);
      edge.style.clipPath = side === 'top'
        ? `polygon(0% 0%, 100% 0%, ${pts.reverse().map(([t, r]) => `${t * 100}% ${30 + r * 70}%`).join(',')})`
        : `polygon(${pts.map(([t, r]) => `${t * 100}% ${r * 70}%`).join(',')}, 100% 100%, 0% 100%)`;
      sec.appendChild(edge);
    });
  });

  /* ---------- text scramble on hover (mono links) ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/<>';
  const scramble = el => {
    if (el._scr) return;
    const orig = el.dataset.txt || (el.dataset.txt = el.textContent);
    let f = 0; const total = 14;
    el._scr = setInterval(() => {
      f++;
      el.textContent = [...orig].map((ch, i) => {
        if (ch === ' ' || ch === '[' || ch === ']' || i < (f / total) * orig.length) return ch;
        return GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }).join('');
      if (f >= total) { clearInterval(el._scr); el._scr = null; el.textContent = orig; }
    }, 28);
  };
  if (!reduced && !isTouch) {
    $$('.bracket-link, .header .u-link, .footer .u-link, .appt__btn, .lightbox__close').forEach(el => {
      if (el.children.length) return;
      el.addEventListener('mouseenter', () => scramble(el));
    });
  }

  /* ---------- page transition curtain ---------- */
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = '<span class="curtain__logo">ALEX TEIH</span>';
  document.body.appendChild(curtain);
  if (hasGSAP && !reduced) {
    if (!isHome) {
      gsap.set(curtain, { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut', delay: .1 });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      goTo(url.href);
    });
  }
  function goTo(href) {
    if (!hasGSAP || reduced) { location.href = href; return; }
    gsap.fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'expo.inOut', onComplete: () => { location.href = href; } });
  }
  window.AT_goTo = goTo;
  // restore when coming back via bfcache
  addEventListener('pageshow', e => { if (e.persisted && hasGSAP) gsap.set(curtain, { clipPath: 'inset(0% 0% 100% 0%)' }); });

  window.AT_dragRow = dragRow;
  window.AT_lenis = lenis;
})();

/* ==========================================================================
   مؤسسة الحديثة للسياحة والسفر — Interactions (home + service pages)
   Stack: GSAP 3.13 + ScrollTrigger + ScrollSmoother + SplitText
   Note: Arabic letters join, so text is split by WORDS (never by chars).
   Every init checks that its section exists, so one file serves all pages.
   ========================================================================== */

(() => {
  "use strict";

  const WHATSAPP = "963944377420";          // default number for [data-wa] links
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- 1. Progressive enhancements (no GSAP needed) ---------- */

  // Prefill WhatsApp messages: data-wa="message", optional data-wa-number="963…"
  $$("[data-wa]").forEach((link) => {
    const number = link.dataset.waNumber || WHATSAPP;
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(link.dataset.wa)}`;
  });

  // Copy-to-clipboard buttons (tel: links are unreliable in some viewers)
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const label = btn.textContent;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "تم النسخ";
      } catch {
        const value = btn.previousElementSibling;
        if (value) getSelection().selectAllChildren(value);
        btn.textContent = "حدّد وانسخ";
      }
      btn.classList.add("is-done");
      setTimeout(() => { btn.textContent = label; btn.classList.remove("is-done"); }, 1800);
    });
  });

  // Video slots: show the video once its file loads; keep the "فيديو N" placeholder otherwise.
  // Only one video plays at a time.
  const videos = $$("[data-video] video");
  videos.forEach((video) => {
    const slot = video.closest("[data-video]");
    const ready = () => slot.classList.add("is-ready");
    if (video.readyState >= 1) ready();
    video.addEventListener("loadedmetadata", ready);
    video.addEventListener("play", () => videos.forEach((v) => { if (v !== video) v.pause(); }));
  });

  // Hero: the office video fades in over the photo once its file has loaded
  const heroMedia = $("[data-hero-media]");
  if (heroMedia) {
    const video = $("video", heroMedia);
    const show = () => heroMedia.classList.add("is-ready");
    if (video.readyState >= 2) show();
    video.addEventListener("loadeddata", show);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) video.pause();
  }

  let smoother = null;      // set below when GSAP is available
  initMenu();

  /* ---------- 2. Motion ---------- */

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = window.gsap && window.ScrollTrigger && window.ScrollSmoother && window.SplitText;

  if (!hasGsap || reduceMotion) {
    initNavState();       // still give the nav its solid state on scroll
    return;               // content is fully visible without JS motion
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });

  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.15,
    smoothTouch: 0.1,
    effects: true,
  });

  initAnchors(smoother);
  initNavState(smoother);
  initBrandHero();
  initServiceHero();
  initComingSoon();

  // Wait for web fonts so SplitText measures the final glyphs
  document.fonts.ready.then(() => {
    initHeadings();
    initFades();
    reveal(".service", ".services__list", { x: -60 });
    initCounters();
    initCards();
    initPackage();
    initDestinations();
    reveal(".pillar", ".why__grid", { y: 60 });
    reveal(".svc-item", ".svc-items__grid", { y: 60 });
    reveal(".step", ".steps", { y: 40 });
    reveal(".svc-cta__box", ".svc-cta", { y: 50, scale: 0.97 });
    reveal(".mini-svc", ".mini-svc__grid", { y: 30 });
    reveal(".vid", ".vids", { y: 60, scale: 0.96 });
    reveal(".pkg", ".pkgs", { y: 70 });
    reveal(".footer__grid > *", ".footer", { y: 30 });
    reveal(".landmarks li", ".landmarks", { x: 40 });
    initMap();
    ScrollTrigger.refresh();
    scrollToHash(smoother);   // e.g. arriving from a service page at index.html#services
  });

  /* ---------- Heroes ---------- */

  // Home: the logo rises out of the seal while its rings draw in
  function initBrandHero() {
    const seal = $(".seal");
    if (!seal) return;

    gsap.timeline({ delay: 0.15 })
      .from(".seal", { scale: 0.86, autoAlpha: 0, duration: 1.4 })
      .from(".seal__ring--outer, .seal__ring--inner", { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%", stagger: 0.1, duration: 1.6 }, "<")
      .from(".seal__star", { autoAlpha: 0, duration: 1.6 }, "<0.2")
      .from(".seal__logo", { clipPath: "inset(100% 0% 0% 0%)", y: 30, duration: 1.6, ease: "expo.inOut", clearProps: "clipPath,y" }, "<0.1")
      .from('[data-hero="art"]', { y: 80, scale: 0.92, autoAlpha: 0, duration: 1.6 }, "<0.2")
      .from('[data-hero="actions"] > *', { y: 20, autoAlpha: 0, stagger: 0.1 }, "-=1")
      .from('[data-hero="card"]', { y: 30, autoAlpha: 0, duration: 1 }, "-=0.8");

    // gentle parallax on scroll: photo drifts down, seal drifts up a little
    const scrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to('[data-hero="art"] > :first-child', { yPercent: 12, ease: "none", scrollTrigger: scrub });
    gsap.to(".seal", { yPercent: -10, ease: "none", scrollTrigger: { ...scrub } });
  }

  // Service pages
  function initServiceHero() {
    if (!$(".svc-hero")) return;
    const q = (k) => `[data-svc="${k}"]`;

    const tl = gsap.timeline({ delay: 0.1 })
      .from(q("crumbs"), { y: 14, autoAlpha: 0, duration: 0.7 })
      .from(q("eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.45")
      .from(q("title"), { clipPath: "inset(0% 0% 0% 100%)", x: 40, duration: 1.4, ease: "expo.inOut", clearProps: "clipPath,x" }, "-=0.5")
      .from(q("tag"), { scale: 0.8, autoAlpha: 0, duration: 0.9 }, "-=0.6")
      .from(q("art"), { y: 70, scale: 0.94, autoAlpha: 0, duration: 1.5 }, "<")
      .from(q("lead"), { y: 24, autoAlpha: 0 }, "-=1.1")
      .from(`${q("actions")} > *`, { y: 20, autoAlpha: 0, stagger: 0.1 }, "-=0.9");

    if ($(q("note"))) tl.from(q("note"), { y: 30, autoAlpha: 0, duration: 1 }, "-=0.8");

    gsap.to(`${q("art")} > :first-child`, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: ".svc-hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  // Work residency: "قريباً" builds up, then the CSS shimmer / orbits keep it alive
  function initComingSoon() {
    if (!$(".soon")) return;
    const q = (k) => `[data-soon="${k}"]`;

    gsap.timeline({ delay: 0.1 })
      .from(".orbit-ring", { scale: 0.4, autoAlpha: 0, stagger: 0.15, duration: 1.8 })
      .from(q("crumbs"), { y: 14, autoAlpha: 0, duration: 0.7 }, 0.1)
      .from(q("emblem"), { scale: 0, rotate: -90, duration: 1.2, ease: "back.out(1.7)" }, 0.3)
      .from(q("eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.7")
      .from(q("title"), { y: 30, autoAlpha: 0, duration: 1 }, "-=0.6")
      .from(q("word"), { scale: 0.6, autoAlpha: 0, filter: "blur(18px)", duration: 1.6, clearProps: "filter" }, "-=0.7")
      .from(q("lead"), { y: 24, autoAlpha: 0 }, "-=1")
      .from(q("contact"), { y: 30, autoAlpha: 0 }, "-=0.8");
  }

  /* ---------- Sections ---------- */

  function initHeadings() {
    $$("[data-split]").forEach((el) => {
      SplitText.create(el, {
        type: "words",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.words, {
            yPercent: 70,
            rotate: -3,
            autoAlpha: 0,
            stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }),
      });
    });
  }

  function initFades() {
    $$("[data-fade]").forEach((el) => {
      gsap.from(el, { y: 30, autoAlpha: 0, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  }

  // generic staggered entrance for a group of items
  function reveal(items, trigger, from) {
    if (!$(trigger) || !$(items)) return;
    gsap.from(items, {
      ...from,
      autoAlpha: 0,
      stagger: 0.08,
      scrollTrigger: { trigger, start: "top 85%", once: true },
    });
  }

  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const state = { value: 0 };
      gsap.to(state, {
        value: Number(el.dataset.count),
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => { el.textContent = Math.round(state.value); },
      });
    });
    reveal(".stat", ".stats", { y: 30 });
  }

  function initCards() {
    const cards = $$(".card");
    if (!cards.length) return;

    gsap.set(cards, { y: 70, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 1.2 }),
    });

    // inner parallax on each card's art
    cards.forEach((card) => {
      const media = $(".art__img, .art__icon", card);   // photo if present, else icon
      if (!media) return;
      const isPhoto = media.classList.contains("art__img");
      gsap.fromTo(media, { yPercent: isPhoto ? -5 : 12 }, {
        yPercent: isPhoto ? 5 : -12,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  function initPackage() {
    const words = $$("[data-package] > span");
    if (!words.length) return;
    gsap.from(words, {
      yPercent: 60,
      autoAlpha: 0,
      scale: (i) => (words[i].classList.contains("plus") ? 0.2 : 1),
      stagger: 0.12,
      duration: 1.2,
      scrollTrigger: { trigger: "[data-package]", start: "top 82%", once: true },
    });
  }

  function initDestinations() {
    if (!$(".dest__pin")) return;

    gsap.matchMedia().add("(min-width: 900px)", () => {
      const pin = $(".dest__pin");
      const scroller = $(".dest__scroller");
      const track = $(".dest__track");

      // RTL: extra cards overflow to the left, so the track moves right (+x)
      const distance = () => {
        const pad = parseFloat(getComputedStyle(scroller).paddingLeft) * 2;
        return Math.max(0, track.scrollWidth - document.documentElement.clientWidth + pad);
      };

      gsap.to(track, {
        x: distance,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "center center",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    });

    reveal(".dest__card", ".dest__track", { y: 60 });
  }

  // Contact map: card rises, buildings settle, the pin drops on the office
  function initMap() {
    const card = $("[data-map]");
    if (!card) return;
    gsap.timeline({ scrollTrigger: { trigger: card, start: "top 80%", once: true } })
      .from(card, { y: 60, autoAlpha: 0, duration: 1.2 })
      .from(".map__blocks rect, .map__consulate, .map__office, .map__hotel", { autoAlpha: 0, scale: 0.9, transformOrigin: "50% 50%", stagger: 0.03, duration: 0.6 }, "-=0.8")
      .from(".map__route", { autoAlpha: 0, duration: 0.8 }, "-=0.3")
      .from(".map__pin", { y: -70, autoAlpha: 0, duration: 1, ease: "bounce.out" }, "-=0.4")
      .from(".map__labels text", { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.6 }, "-=0.5");
  }

  /* ---------- Shared behaviour ---------- */

  // Mobile menu: a circle opens from the burger, links rise in (CSS), page scroll pauses
  function initMenu() {
    const btn = $(".burger");
    const menu = $("#site-menu");
    if (!btn || !menu) return;
    const root = document.documentElement;
    const isOpen = () => menu.classList.contains("is-open");

    const open = () => {
      const r = btn.getBoundingClientRect();
      menu.style.setProperty("--mx", `${r.left + r.width / 2}px`);
      menu.style.setProperty("--my", `${r.top + r.height / 2}px`);
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "إغلاق القائمة");
      root.classList.add("menu-open");
      if (smoother) smoother.paused(true);
    };

    const close = () => {
      if (!isOpen()) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      menu.setAttribute("inert", "");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "فتح القائمة");
      root.classList.remove("menu-open");
      if (smoother) smoother.paused(false);
    };

    btn.addEventListener("click", () => (isOpen() ? close() : open()));
    // capture phase: close (and un-pause scrolling) before an in-page link scrolls
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(); }, true);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { close(); btn.focus(); } });
    matchMedia("(min-width: 1181px)").addEventListener("change", (e) => { if (e.matches) close(); });
  }

  function initAnchors(sm) {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = $(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        sm.scrollTo(target, true, "top 100px");
      });
    });
  }

  function scrollToHash(sm) {
    if (!location.hash) return;
    let target = null;
    try { target = $(decodeURIComponent(location.hash)); } catch { /* invalid selector */ }
    if (target) sm.scrollTo(target, false, "top 100px");
  }

  function initNavState(sm) {
    const nav = $(".nav");
    const update = (y) => nav.classList.toggle("is-solid", y > 40);   // header stays fixed; it only turns solid
    if (sm && window.ScrollTrigger) {
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => update(self.scroll()) });
    } else {
      addEventListener("scroll", () => update(scrollY), { passive: true });
    }
  }
})();

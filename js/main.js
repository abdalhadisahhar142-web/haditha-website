/* ==========================================================================
   مؤسسة الحديثة للسياحة والسفر — Interactions
   Stack: GSAP 3.13 + ScrollTrigger + ScrollSmoother + SplitText
   Note: Arabic letters join, so text is split by WORDS (never by chars).
   ========================================================================== */

(() => {
  "use strict";

  const WHATSAPP = "963944377420";
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- 1. Progressive enhancements (no GSAP needed) ---------- */

  // Prefill WhatsApp messages from data-wa
  $$("[data-wa]").forEach((link) => {
    link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(link.dataset.wa)}`;
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

  /* ---------- 2. Motion ---------- */

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = window.gsap && window.ScrollTrigger && window.ScrollSmoother && window.SplitText;

  if (!hasGsap || reduceMotion) {
    initNavState();       // still give the nav its solid state on scroll
    return;               // content is fully visible without JS motion
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.15,
    smoothTouch: 0.1,
    effects: true,
  });

  initAnchors(smoother);
  initNavState(smoother);
  initHero();

  // Wait for web fonts so SplitText measures the final glyphs
  document.fonts.ready.then(() => {
    initHeadings();
    initFades();
    initServices();
    initCounters();
    initCards();
    initPackage();
    initDestinations();
    initPillars();
    ScrollTrigger.refresh();
  });

  /* ---------- Sections ---------- */

  function initHero() {
    const q = (k) => `[data-hero="${k}"]`;
    const tl = gsap.timeline({ delay: 0.15 });

    tl.from(q("eyebrow"), { y: 20, autoAlpha: 0, duration: 0.8 })
      .from(q("small"), { y: 24, autoAlpha: 0, duration: 0.9 }, "-=0.55")
      // giant word wipes in from the right (reading direction)
      .from(q("word"), { clipPath: "inset(0% 0% 0% 100%)", x: 40, duration: 1.6, ease: "expo.inOut", clearProps: "clipPath,x" }, "-=0.5")
      .from(q("art"), { y: 80, scale: 0.92, autoAlpha: 0, duration: 1.6 }, "<0.2")
      .from(q("lead"), { y: 24, autoAlpha: 0 }, "-=1")
      .from(q("actions") + " > *", { y: 20, autoAlpha: 0, stagger: 0.1 }, "-=0.9")
      .from(q("card"), { y: 30, autoAlpha: 0, duration: 1 }, "-=0.8");

    // gentle parallax of the arch while leaving the hero
    gsap.to(q("art") + " > :first-child", {   // the arch SVG or the hero photo
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

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
      gsap.from(el, {
        y: 30,
        autoAlpha: 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  }

  function initServices() {
    const rows = $$(".service");
    gsap.from(rows, {
      x: -60,
      autoAlpha: 0,
      stagger: 0.08,
      scrollTrigger: { trigger: ".services__list", start: "top 80%", once: true },
    });
  }

  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const state = { value: 0 };
      gsap.to(state, {
        value: target,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => { el.textContent = Math.round(state.value); },
      });
    });
    gsap.from(".stat", {
      y: 30,
      autoAlpha: 0,
      stagger: 0.12,
      scrollTrigger: { trigger: ".stats", start: "top 85%", once: true },
    });
  }

  function initCards() {
    const cards = $$(".card");
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
    gsap.from(words, {
      yPercent: 60,
      autoAlpha: 0,
      scale: (i) => (words[i].classList.contains("plus") ? 0.2 : 1),
      stagger: 0.12,
      duration: 1.2,
      scrollTrigger: { trigger: "[data-package]", start: "top 82%", once: true },
    });
    gsap.from(".step", {
      y: 40,
      autoAlpha: 0,
      stagger: 0.12,
      scrollTrigger: { trigger: ".steps", start: "top 85%", once: true },
    });
  }

  function initDestinations() {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
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

    gsap.from(".dest__card", {
      y: 60,
      autoAlpha: 0,
      stagger: 0.08,
      scrollTrigger: { trigger: ".dest__track", start: "top 85%", once: true },
    });
  }

  function initPillars() {
    gsap.from(".pillar", {
      y: 60,
      autoAlpha: 0,
      stagger: 0.1,
      scrollTrigger: { trigger: ".why__grid", start: "top 85%", once: true },
    });
  }

  /* ---------- Shared behaviour ---------- */

  function initAnchors(sm) {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = $(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        sm.scrollTo(target, true, "top 80px");
      });
    });
  }

  function initNavState(sm) {
    const nav = $(".nav");
    let last = 0;
    const update = (y) => {
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", y > last && y > 240);
      last = y;
    };
    if (sm && window.ScrollTrigger) {
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => update(self.scroll()) });
    } else {
      addEventListener("scroll", () => update(scrollY), { passive: true });
    }
  }
})();

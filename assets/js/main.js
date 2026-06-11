/* ============================================================
   FC VALIANT — interactions
   - Lenis smooth scroll
   - text split reveals (chars / lines / wave)
   - image clip reveal, magnetic buttons, velocity marquee
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* ============================================================
     1. TEXT SPLITTING  (run early, before reveal)
     ============================================================ */
  function splitChars(el, step) {
    const text = el.textContent;
    el.textContent = "";
    let i = 0;
    for (const ch of text) {
      const cell = document.createElement("span");
      cell.className = "a-char";
      const inner = document.createElement("i");
      inner.textContent = ch === " " ? " " : ch;
      inner.style.setProperty("--d", (i * step).toFixed(3) + "s");
      cell.appendChild(inner);
      el.appendChild(cell);
      if (ch !== " ") i++;
    }
    el.classList.add("is-split");
  }

  function splitLines(el, step) {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = "";
    parts.forEach((p, idx) => {
      const line = document.createElement("span");
      line.className = "a-line";
      const inner = document.createElement("i");
      inner.innerHTML = p;
      inner.style.setProperty("--d", (idx * step).toFixed(3) + "s");
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.classList.add("is-split");
  }

  function splitWave(el, step) {
    const text = el.textContent;
    el.textContent = "";
    let i = 0;
    for (const ch of text) {
      const cell = document.createElement("span");
      cell.className = "a-wch";
      cell.textContent = ch === " " ? " " : ch;
      cell.style.setProperty("--d", (i * step).toFixed(3) + "s");
      el.appendChild(cell);
      i++;
    }
    el.classList.add("is-split");
  }

  const animEls = document.querySelectorAll("[data-anim]");
  if (reduceMotion) {
    animEls.forEach((el) => el.classList.add("is-split", "is-in"));
  } else {
    animEls.forEach((el) => {
      const type = el.getAttribute("data-anim");
      if (type === "chars") splitChars(el, 0.04);
      else if (type === "lines") splitLines(el, 0.11);
      else if (type === "wave") splitWave(el, 0.022);
    });
  }

  /* ============================================================
     2. PRELOADER
     ============================================================ */
  const preloader = document.getElementById("preloader");
  let started = false;

  function start() {
    if (started) return;
    started = true;
    if (preloader) preloader.classList.add("is-done");
    // kick off hero text (it sits in the first viewport)
    document
      .querySelectorAll("#heroContent [data-anim], .hero [data-reveal]")
      .forEach((el) => el.classList.add("is-in"));
    initObservers();
  }

  window.addEventListener("load", () => setTimeout(start, 850));
  setTimeout(start, 2600); // safety fallback

  /* ============================================================
     3. LENIS SMOOTH SCROLL
     ============================================================ */
  // Native scrolling (no inertia) — fast, 1:1 with the wheel/trackpad.
  let lenis = null;

  function scrollToTarget(target, offset) {
    if (lenis) lenis.scrollTo(target, { offset: offset || 0, duration: 0.9 });
    else {
      const top =
        (typeof target === "number"
          ? target
          : target.getBoundingClientRect().top + window.scrollY) + (offset || 0);
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  /* ============================================================
     4. NAV: smooth anchors + mobile menu
     ============================================================ */
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");

  function closeMenu() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target, -6);
    });
  });

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open) {
      if (lenis) lenis.stop();
      document.body.style.overflow = "hidden";
    } else {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    }
  });

  /* ============================================================
     5. SCROLL-DRIVEN UI (header, totop, parallax, velocity)
     ============================================================ */
  const totop = document.getElementById("totop");
  const heroImg = document.getElementById("heroImg");
  const visionBig = document.querySelector(".vision__big");
  const footerBig = document.querySelector(".footer__big");
  let lastY = 0;

  function onScroll(scroll, velocity) {
    const y = scroll;
    header.classList.toggle("is-solid", y > 80);
    header.classList.toggle("is-hidden", y > 420 && y > lastY + 2);
    totop.classList.toggle("is-show", y > 700);

    // hero parallax
    if (heroImg && y < window.innerHeight) {
      heroImg.style.transform = "translateY(" + y * 0.16 + "px) scale(1.05)";
    }

    // velocity-reactive skew on the giant FCV
    if (visionBig) {
      const v = Math.max(-18, Math.min(18, (velocity || 0) * 0.6));
      visionBig.style.transform = "skewX(" + (-v) + "deg)";
    }
    // footer wordmark horizontal drift
    if (footerBig) {
      const r = footerBig.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        const p = 1 - (r.top + r.height) / (window.innerHeight + r.height);
        footerBig.style.transform = "translateX(" + (-p * 14) + "%)";
      }
    }
    lastY = y;
  }

  if (lenis) {
    lenis.on("scroll", ({ scroll, velocity }) => onScroll(scroll, velocity));
  } else {
    let prev = 0;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        onScroll(y, y - prev);
        prev = y;
      },
      { passive: true }
    );
  }
  onScroll(0, 0);

  /* ============================================================
     6. OBSERVERS: reveal + counters + active nav
     ============================================================ */
  function initObservers() {
    const reveals = document.querySelectorAll("[data-reveal], [data-anim]");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => {
        if (!el.classList.contains("is-in")) io.observe(el);
      });
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }

    // image clip reveal
    const imgs = document.querySelectorAll("[data-img]");
    if ("IntersectionObserver" in window) {
      const iio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );
      imgs.forEach((el) => iio.observe(el));
    } else {
      imgs.forEach((el) => el.classList.add("is-in"));
    }

    // counters
    const counters = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window && counters.length) {
      const cio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((c) => cio.observe(c));
    }

    // active nav
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav a[data-scroll]");
    if ("IntersectionObserver" in window && navLinks.length) {
      const sio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            navLinks.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
            );
          });
        },
        { threshold: 0.4 }
      );
      sections.forEach((s) => sio.observe(s));
    }
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    const dur = 1300;
    const startT = performance.now();
    function tick(now) {
      const p = Math.min((now - startT) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     7. MAGNETIC BUTTONS (desktop pointer only)
     ============================================================ */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform =
          "translate(" + x * strength + "px," + y * strength + "px)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ============================================================
     8. CONTACT FORM (demo)
     ============================================================ */
  const cform = document.getElementById("cform");
  const note = document.getElementById("cformNote");
  if (cform) {
    cform.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!cform.checkValidity()) {
        cform.reportValidity();
        return;
      }
      if (note) note.hidden = false;
      const btn = cform.querySelector("button[type=submit]");
      if (btn) {
        btn.textContent = "送信しました ✓";
        btn.disabled = true;
        btn.style.opacity = ".7";
      }
    });
  }
})();

/* ============================================================
   FC VALIANT — interactions
   - Lenis smooth scroll
   - text split reveals (chars / lines / wave)
   - image clip reveal, magnetic buttons, velocity marquee
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     0. 紺の明るさプレビュー  ?navy=0〜4
     色決めのための一時的な仕組み。パラメータが無いときは何もしない。
     確定したら tools/set-navy.py で本適用し、このブロックは削除してよい。
     ============================================================ */
  (function navyPreview() {
    const lv = new URLSearchParams(location.search).get("navy");
    if (lv === null) return;
    const LEVELS = {
      0: ["#060f24", "#0a162f", "#0e1d3f", "#101c33"],
      1: ["#0a1730", "#0f2143", "#152b55", "#13223d"],
      2: ["#0d1c3a", "#142a52", "#1b3766", "#16294a"],
      3: ["#112445", "#1a3563", "#23447a", "#1b3158"],
      4: ["#162c52", "#204074", "#2b5190", "#203a68"]
    };
    const set = LEVELS[lv];
    if (!set) return;
    const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
    const r = document.documentElement.style;
    r.setProperty("--navy-deep", set[0]);
    r.setProperty("--navy", set[1]);
    r.setProperty("--navy-2", set[2]);
    r.setProperty("--ink", set[3]);
    r.setProperty("--navy-deep-rgb", rgb(set[0]));
    r.setProperty("--navy-rgb", rgb(set[1]));
    const tag = document.createElement("div");
    tag.textContent = "\u7d3a\u306e\u660e\u308b\u3055 \u30ec\u30d9\u30eb " + lv;
    tag.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:9999;background:" + set[1] +
      ";color:#e6c15c;border:1px solid #e6c15c;border-radius:999px;" +
      "padding:.45em 1.1em;font:600 12px/1 system-ui,sans-serif;letter-spacing:.08em;pointer-events:none";
    (document.body ? Promise.resolve() : new Promise((ok) => addEventListener("DOMContentLoaded", ok)))
      .then(() => document.body.appendChild(tag));
  })();

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

  // Esc closes the drawer and returns focus to the toggle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      burger.focus();
    }
  });

  /* ============================================================
     4b. SCHEDULE: next-match highlight / past dimming / season record
     - <time datetime="YYYY-MM-DD"> から自動判定（HTML側の手動クラス不要）
     - シーズン成績は結果バッジ（--win/--draw/--lose）から自動集計
     ============================================================ */
  (function initSchedule() {
    const fixtures = document.querySelectorAll("#fixtures .fixture");
    if (!fixtures.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let next = null;

    fixtures.forEach((f) => {
      const t = f.querySelector("time[datetime]");
      if (!t) return;
      const d = new Date(t.getAttribute("datetime") + "T00:00:00");
      if (isNaN(d)) return;
      if (d < today) {
        f.classList.add("is-past");
      } else if (!next) {
        next = f;
        f.classList.add("is-next");
        f.setAttribute("aria-label", "次の試合");
      }
    });

    const box = document.getElementById("seasonSummary");
    if (box) {
      const count = (cls) =>
        document.querySelectorAll("#fixtures .fixture__status--" + cls).length;
      const fill = (key, n) => {
        const el = box.querySelector('[data-season="' + key + '"]');
        if (!el) return;
        el.setAttribute("data-count", String(n)); // 既存カウントアップ演出に乗せる
        el.textContent = String(n);
      };
      fill("win", count("win"));
      fill("draw", count("draw"));
      fill("lose", count("lose"));
      box.hidden = false;
    }
  })();

  /* ============================================================
     4c. CTA → CONTACT 連携
     data-topic 付きリンク（体験参加/スポンサー）クリックで
     フォームの「お問い合わせ種別」を自動選択
     ============================================================ */
  document.querySelectorAll("[data-topic]").forEach((link) => {
    link.addEventListener("click", () => {
      const v = link.getAttribute("data-topic");
      const radio = document.querySelector(
        '.cform input[name="topic"][value="' + v + '"]'
      );
      if (radio) radio.checked = true;
    });
  });

  // 別ページの CTA から ?topic=... 付きで来た場合に種別を自動選択
  try {
    const topic = new URLSearchParams(location.search).get("topic");
    if (topic) {
      const radio = document.querySelector(
        '.cform input[name="topic"][value="' + topic + '"]'
      );
      if (radio) radio.checked = true;
    }
  } catch (e) {
    /* URLSearchParams 非対応環境は黙ってスキップ */
  }

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
            navLinks.forEach((l) => {
              const match = l.getAttribute("href") === "#" + id;
              l.classList.toggle("is-active", match);
              if (match) l.setAttribute("aria-current", "true");
              else l.removeAttribute("aria-current");
            });
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

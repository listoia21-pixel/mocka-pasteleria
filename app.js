// Mocka Pastelería — bar, reveals, folder previews, triceratops views, gallery index and the name builder.
(() => {
  const WA = "573006080239";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  /* iOS only paints :active while a touch listener exists: press feedback on the finger going down. */
  addEventListener("touchstart", () => {}, { passive: true });

  /* Bar: appears once the hero's own top row has scrolled away; its dot marks the section on screen. */
  const bar = document.querySelector("[data-bar]");
  const top = document.querySelector(".top");
  if (bar && top) {
    new IntersectionObserver(([e]) => bar.classList.toggle("is-on", !e.isIntersecting && e.boundingClientRect.top < 0)).observe(top);
    const links = [...bar.querySelectorAll("[data-spy]")];
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.getAttribute("href") === "#" + e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
      }
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach((s) => spy.observe(s));
  }

  /* Thumb: one pill behind a row of choices that slides to the chosen one. A CSS transition
     retargets from wherever the pill is, so a quick second choice redirects it mid-flight. */
  const thumbFor = (list, active) => {
    const thumb = document.createElement(list.tagName === "UL" ? "li" : "span");
    thumb.className = "thumb";
    thumb.setAttribute("aria-hidden", "true");
    list.prepend(thumb);
    list.classList.add("has-thumb");
    const place = (instant) => {
      const b = active();
      if (!b) return;
      if (instant) thumb.classList.add("is-instant");
      thumb.style.width = b.offsetWidth + "px";
      thumb.style.height = b.offsetHeight + "px";
      thumb.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
      if (instant) { thumb.offsetWidth; thumb.classList.remove("is-instant"); }
    };
    new ResizeObserver(() => place(true)).observe(list);
    document.fonts && document.fonts.ready.then(() => place(true));
    return place;
  };

  /* Reveals: once, as each part enters. */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-reveal], [data-grow], [data-draw]").forEach((el) => io.observe(el));

  /* Hero: each folder shows its cake on the front folder. */
  const stack = document.querySelector(".stack");
  if (stack) {
    const cakes = [...stack.querySelectorAll(".hero__cake img")];
    const show = (name) => cakes.forEach((img) => img.classList.toggle("is-on", img.dataset.cake === name));
    stack.querySelectorAll("[data-preview]").forEach((el) => {
      el.addEventListener("pointerenter", () => { if (fine.matches) show(el.dataset.preview); });
      el.addEventListener("focus", () => show(el.dataset.preview));
    });
    stack.addEventListener("pointerleave", () => show("triceratops"));
    stack.addEventListener("focusout", (e) => { if (!stack.contains(e.relatedTarget)) show("triceratops"); });
  }

  /* Showcase: three views of the triceratops, as tabs. */
  const tablist = document.querySelector(".show__tabs");
  const tabs = [...document.querySelectorAll(".show__tabs [role=tab]")];
  const views = [...document.querySelectorAll(".show__plate img")];
  const placeTab = tablist ? thumbFor(tablist, () => tablist.querySelector('[aria-selected="true"]')) : () => {};
  const pick = (i, focus) => {
    tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    views.forEach((v) => v.classList.toggle("is-on", v.dataset.view === String(i)));
    placeTab();
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", () => pick(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); pick((i + 1) % tabs.length, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); pick((i - 1 + tabs.length) % tabs.length, true); }
    });
  });

  /* Gallery: one frame; the names change it, and it moves on by itself while on screen. */
  const gal = document.querySelector(".gal");
  if (gal) {
    const captions = [
      "Diseño original y muy alegre, con calavera, papel picado y guitarra.",
      "La petición fue clara: «quiero que se vea horrorosa». Y así quedó.",
      "Chocolatoso, con fantasmitas, calabazas y hongos entre los árboles.",
      "La cumpleañera con su compañero de cuatro patas. Todo comestible.",
      "Un rincón con teteras, tazas y postres, dentro de la torta.",
      "Versión Coachella 2025, para los little monsters.",
      "Torta y cake pops a juego para el cumpleañero.",
      "Minimalista, con textura de piedra y huellas sobre la crema.",
    ];
    const slides = [...gal.querySelectorAll(".gal__window img")];
    const buttons = [...gal.querySelectorAll("[data-slide]")];
    const caption = gal.querySelector(".gal__caption");
    const list = gal.querySelector(".gal__list");
    const win = gal.querySelector(".gal__window");
    const placeGal = thumbFor(list, () => list.querySelector('[aria-pressed="true"]'));
    let at = 0, timer = 0, visible = false, held = false;
    const go = (i) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("is-on", j === at));
      buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === at)));
      caption.textContent = captions[at];
      placeGal();
      const next = slides[(at + 1) % slides.length];
      if (next.loading === "lazy") next.loading = "eager";
      const prev = slides[(at - 1 + slides.length) % slides.length];
      if (prev.loading === "lazy") prev.loading = "eager";
    };
    const tick = () => {
      clearTimeout(timer);
      if (visible && !held && !document.hidden && !reduce.matches) timer = setTimeout(() => { go(at + 1); tick(); }, 3400);
    };
    document.addEventListener("visibilitychange", tick);

    /* Swipe: the photo follows the finger 1:1 and the neighbour it is heading to shows underneath;
       on release the throw is projected forward (Apple's deceleration formula) and that landing
       point decides whether it goes on or settles back. */
    const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
    const project = (v /* px/ms */, rate = 0.998) => v * rate / (1 - rate);
    const offset = (img) => new DOMMatrixReadOnly(getComputedStyle(img).transform).m41;
    let drag = null, swiped = false;
    // while the finger owns a photo, the slow Ken Burns transition must not lag it
    const hold = (img, z) => {
      clearTimeout(img.settleTimer);
      if (img.settleAnim) img.settleAnim.cancel();
      img.style.transition = "none";
      img.style.zIndex = z;
    };
    const letGo = (img) => ["transition", "transform", "opacity", "filter", "z-index"].forEach((p) => img.style.removeProperty(p));
    const settle = (img, from, to, ms) => {
      img.style.transition = "opacity 600ms ease, filter 600ms ease";
      ["transform", "opacity", "filter"].forEach((p) => img.style.removeProperty(p));
      img.settleAnim = img.animate([{ transform: from }, { transform: to }], { duration: ms, easing: EASE });
      img.settleTimer = setTimeout(() => letGo(img), ms + 40);
    };
    win.addEventListener("pointerdown", (e) => {
      if (drag || e.button > 0) return;
      swiped = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, base: 0, dx: 0, dir: 0, peek: null, axis: "", trail: [[e.timeStamp, e.clientX]] };
    });
    win.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const mx = e.clientX - drag.x, my = e.clientY - drag.y;
      const img = slides[at], w = win.clientWidth;
      if (!drag.axis) {
        if (Math.hypot(mx, my) < 10) return;
        drag.axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
        if (drag.axis === "y") { drag = null; return; }
        win.setPointerCapture(drag.id);
        held = true; tick();
        // grab it where it is on screen, even mid-settle, so a second flick never jumps
        drag.base = offset(img);
        hold(img, 1);
      }
      const dx = drag.dx = drag.base + mx;
      const dir = dx < 0 ? 1 : -1;
      if (dir !== drag.dir) {
        if (drag.peek) letGo(drag.peek);
        drag.dir = dir;
        drag.peek = slides[(at + dir + slides.length) % slides.length];
        hold(drag.peek, 0);
        drag.peek.style.opacity = "1";
        drag.peek.style.filter = "none";
      }
      drag.peek.style.transform = `translateX(${dir * 0.35 * Math.max(0, w - Math.abs(dx))}px)`;
      drag.trail.push([e.timeStamp, e.clientX]);
      if (drag.trail.length > 5) drag.trail.shift();
      img.style.transform = `translateX(${dx}px)`;
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (d.axis !== "x") return;
      swiped = true;
      held = false;
      // velocity over the last 100ms only: a finger that stopped before lifting threw nothing
      const recent = [...d.trail, [e.timeStamp, e.clientX]].filter(([t]) => t >= e.timeStamp - 100);
      const [t0, x0] = recent[0], [t1, x1] = recent[recent.length - 1];
      const v = t1 > t0 ? (x1 - x0) / (t1 - t0) : 0;
      const landing = d.dx + project(v);
      const w = win.clientWidth, cur = slides[at], peek = d.peek;
      const from = `translateX(${d.dx}px)`, peekFrom = `translateX(${offset(peek)}px)`;
      if (e.type !== "pointercancel" && Math.abs(landing) > w * 0.3 && (landing < 0 ? 1 : -1) === d.dir) {
        settle(cur, from, `translateX(${-d.dir * w}px)`, 600);
        go(at + d.dir);
        settle(peek, peekFrom, "translateX(0px)", 520);
      } else {
        settle(cur, from, "translateX(0px)", 420);
        settle(peek, peekFrom, `translateX(${d.dir * 0.35 * w}px)`, 420);
      }
      tick();
    };
    win.addEventListener("pointerup", end);
    win.addEventListener("pointercancel", end);
    buttons.forEach((b, j) => {
      b.addEventListener("click", () => { go(j); tick(); });
      b.addEventListener("pointerenter", () => { if (fine.matches) { held = true; go(j); tick(); } });
      b.addEventListener("focus", () => { held = true; tick(); });
      b.addEventListener("blur", () => { held = false; tick(); });
    });
    list.addEventListener("pointerleave", () => { held = false; tick(); });
    win.addEventListener("click", () => { if (swiped) { swiped = false; return; } go(at + 1); tick(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: 0.3 }).observe(gal);
  }

  /* The reel of named cakes plays only while on screen, and never under reduced motion. */
  const loop = document.querySelector("[data-loop]");
  const pause = document.querySelector("[data-pause]");
  if (loop) {
    let stopped = reduce.matches;
    const sync = (on) => { if (on && !stopped) loop.play().catch(() => {}); else loop.pause(); };
    const label = () => { pause.textContent = stopped ? "Reproducir" : "Pausar"; pause.setAttribute("aria-pressed", String(stopped)); };
    new IntersectionObserver(([e]) => sync(e.isIntersecting), { threshold: 0.25 }).observe(loop);
    pause.addEventListener("click", () => { stopped = !stopped; label(); sync(!stopped); });
    label();
  }

  /* Order: the name written in the five letters' colours, sent to WhatsApp. */
  const form = document.querySelector("[data-order]");
  if (form) {
    const out = document.querySelector("[data-name]");
    const input = form.querySelector("#nombre");
    const chips = form.querySelector(".chips");
    let last = "";
    const fit = () => {
      out.style.removeProperty("--fit");
      const max = parseFloat(getComputedStyle(out).fontSize);
      const inner = out.firstElementChild;
      if (inner && inner.scrollWidth > out.clientWidth) out.style.setProperty("--fit", Math.max(28, max * (out.clientWidth / inner.scrollWidth) * 0.98) + "px");
    };
    const render = () => {
      const name = input.value.trim();
      const text = name || "Tu nombre";
      const wrap = document.createElement("span");
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "ch" + (name && i >= last.length || name && last[i] !== ch ? " is-new" : "");
        s.textContent = ch;
        wrap.append(s);
      });
      out.replaceChildren(wrap);
      last = name;
      fit();
    };
    input.addEventListener("input", render);
    addEventListener("resize", fit);
    document.fonts && document.fonts.ready.then(fit);
    render();

    document.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => {
      const value = a.dataset.pick;
      let radio = [...chips.querySelectorAll("input")].find((r) => r.value === value);
      if (!radio) {
        const label = document.createElement("label");
        label.innerHTML = '<input type="radio" name="tipo"><span></span>';
        radio = label.querySelector("input");
        radio.value = value;
        label.querySelector("span").textContent = value;
        chips.append(label);
      }
      radio.checked = true;
      setTimeout(() => input.focus({ preventScroll: true }), 700);
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("nombre") || "").toString().trim();
      const kind = (data.get("tipo") || "una torta").toString();
      const date = (data.get("fecha") || "").toString();
      const when = date ? new Date(date + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }) : "";
      const lines = [
        `Hola Mocka, quiero cotizar: ${kind}${name ? ` para ${name}` : ""}.`,
        when ? `La fecha del evento es el ${when}.` : "",
        "Mi idea es: ",
      ].filter(Boolean);
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
    });
  }
})();

// Mocka Pastelería — reveals, folder previews, triceratops views, gallery index and the name builder.
(() => {
  const WA = "573006080239";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

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
  const tabs = [...document.querySelectorAll(".show__tabs [role=tab]")];
  const views = [...document.querySelectorAll(".show__plate img")];
  const pick = (i, focus) => {
    tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    views.forEach((v) => v.classList.toggle("is-on", v.dataset.view === String(i)));
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
    let at = 0, timer = 0, visible = false, held = false;
    const go = (i) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("is-on", j === at));
      buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === at)));
      caption.textContent = captions[at];
      const next = slides[(at + 1) % slides.length];
      if (next.loading === "lazy") next.loading = "eager";
    };
    const tick = () => {
      clearTimeout(timer);
      if (visible && !held && !reduce.matches) timer = setTimeout(() => { go(at + 1); tick(); }, 3400);
    };
    buttons.forEach((b, j) => {
      b.addEventListener("click", () => { go(j); tick(); });
      b.addEventListener("pointerenter", () => { if (fine.matches) { held = true; go(j); tick(); } });
      b.addEventListener("focus", () => { held = true; tick(); });
      b.addEventListener("blur", () => { held = false; tick(); });
    });
    gal.querySelector(".gal__list").addEventListener("pointerleave", () => { held = false; tick(); });
    gal.querySelector(".gal__window").addEventListener("click", () => { go(at + 1); tick(); });
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

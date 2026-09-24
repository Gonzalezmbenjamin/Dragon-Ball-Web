
"use strict";

/* =========================================================
   DRAGON BALL — JavaScript multipágina
   Cada módulo comprueba que sus elementos existan antes
   de inicializarse. Así el mismo script funciona en todos
   los HTML sin errores por elementos nulos.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCurrentYear();
  initCurrentPageNavigation();
  initHeaderAndMenu();
  initNavDropdown();
  initReveal();
  initMotionLayer();
  initMobileImageFade();
  initParallax();
  initSagaVisualEnhancements();
  initTransformations();
  initLightbox();
  initContactForm();
  initMediaFallbacks();
  initMovieFilter();
});

/* ---------- Utilidades ---------- */

function syncBodyLock() {
  const body = document.body;
  const shouldLock =
    body.classList.contains("menu-open") ||
    body.classList.contains("lightbox-open");

  body.style.overflow = shouldLock ? "hidden" : "";
}

function initCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

/* ---------- Navegación multipágina ---------- */

function initCurrentPageNavigation() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  const isCurrentHref = (href) => {
    const fileName = (href || "").split("/").pop();
    return (
      (currentPage === "inicio" && fileName === "index.html") ||
      fileName === `${currentPage}.html`
    );
  };

  document
    .querySelectorAll(".nav-link[href], .nav-dropdown-link[href]")
    .forEach((link) => {
      const isCurrent = isCurrentHref(link.getAttribute("href"));
      link.classList.toggle("active", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

  // El elemento padre "Universo" se marca activo si Sagas o Películas lo están.
  document.querySelectorAll("[data-dropdown]").forEach((dropdown) => {
    const hasActiveChild = dropdown.querySelector(".nav-dropdown-link.active");
    const toggle = dropdown.querySelector(".nav-link-dropdown");

    dropdown.classList.toggle("active", Boolean(hasActiveChild));
    if (toggle) toggle.classList.toggle("active", Boolean(hasActiveChild));
  });
}

/* ---------- Header y menú hamburguesa ---------- */

function initHeaderAndMenu() {
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const mainMenu = document.getElementById("mainMenu");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 18);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (!menuToggle || !mainMenu) return;

  const closeMenu = () => {
    mainMenu.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
    syncBodyLock();
  };

  const openMenu = () => {
    mainMenu.classList.add("open");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
    syncBodyLock();

    const activeLink = mainMenu.querySelector(".nav-link.active");
    (activeLink || mainMenu.querySelector(".nav-link"))?.focus();
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = mainMenu.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  mainMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainMenu.classList.contains("open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780 && mainMenu.classList.contains("open")) {
      closeMenu();
    }
  });
}

/* ---------- Dropdown "Universo" (Sagas / Películas) ---------- */

function initNavDropdown() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  if (!dropdowns.length) return;

  const closeDropdown = (dropdown) => {
    const toggle = dropdown.querySelector(".nav-link-dropdown");
    dropdown.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  const closeAllDropdowns = () => dropdowns.forEach(closeDropdown);

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-link-dropdown");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = dropdown.classList.contains("open");

      dropdowns.forEach((other) => {
        if (other !== dropdown) closeDropdown(other);
      });

      if (isOpen) {
        closeDropdown(dropdown);
      } else {
        dropdown.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Clic fuera del dropdown lo cierra (comportamiento de escritorio y táctil).
  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });

  // Si se cierra el menú móvil completo, el submenú también debe cerrarse.
  const mainMenu = document.getElementById("mainMenu");
  if (mainMenu) {
    const observer = new MutationObserver(() => {
      if (!mainMenu.classList.contains("open")) closeAllDropdowns();
    });
    observer.observe(mainMenu, { attributes: true, attributeFilter: ["class"] });
  }
}

/* ---------- Reveal al hacer scroll ---------- */

function initReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -4% 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}


/* ---------- Capa final de motion / microinteracciones ---------- */

function initMotionLayer() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileLike = window.matchMedia("(max-width: 780px), (hover: none) and (pointer: coarse)").matches;
  const prepared = new Set();

  const prepare = (element, delay = 0) => {
    if (!element || prepared.has(element)) return;
    prepared.add(element);
    element.classList.add("motion-reveal");
    element.style.setProperty("--motion-delay", `${delay}ms`);
  };

  // Elementos editoriales que entran como una sola unidad.
  document
    .querySelectorAll(
      ".home-intro-layout, .catalog-intro, .transform-header, .transform-console, " +
      ".movie-era-head, .gallery-intro, .contact-page-copy, .contact-form-panel, " +
      ".saga-endcap-layout, .footer-top, " +
      "body[data-page=\"inicio\"] .split-heading, " +
      "body[data-page=\"inicio\"] .editorial-heading, " +
      "body[data-page=\"inicio\"] .center-action, " +
      "body[data-page=\"inicio\"] .manifesto-copy, " +
      "body[data-page=\"inicio\"] .manifesto-stats"
    )
    .forEach((element) => prepare(element));

  // Stagger corto y repetible dentro de grupos de cards. No cambia su layout.
  const staggerGroups = [
    [".preview-sagas", ".preview-saga"],
    [".home-characters-preview", ".character-strip"],
    [".home-movies-grid", ".home-movie-card"],
    [".character-wall", ".premium-character"],
    [".arc-grid", ".arc-entry"],
    [".movie-grid", ".movie-card"],
    [".gallery-grid", ".gallery-item"]
  ];

  staggerGroups.forEach(([containerSelector, itemSelector]) => {
    document.querySelectorAll(containerSelector).forEach((container) => {
      container.querySelectorAll(itemSelector).forEach((item, index) => {
        const step = mobileLike ? 34 : 65;
        prepare(item, Math.min(index % 6, 5) * step);
      });
    });
  });

  // En Inicio, el stagger móvil necesita más respiración: las cards entran
  // de manera progresiva en vez de aparecer casi todas a la vez.
  if (mobileLike && document.body?.dataset.page === "inicio") {
    [
      [".preview-sagas", ".preview-saga"],
      [".character-strips", ".character-strip"],
      [".home-movies-grid", ".home-movie-card"]
    ].forEach(([containerSelector, itemSelector]) => {
      document.querySelectorAll(containerSelector).forEach((container) => {
        container.querySelectorAll(itemSelector).forEach((item, index) => {
          item.style.setProperty("--motion-delay", `${Math.min(index, 4) * 86}ms`);
        });
      });
    });
  }

  if (!prepared.size) return;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    prepared.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, motionObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        motionObserver.unobserve(entry.target);
      });
    },
    {
      threshold: mobileLike ? 0.01 : 0.055,
      // En móvil empezamos el reveal antes de que el bloque entre en pantalla.
      // Así el usuario ve el movimiento ya en curso y no una aparición súbita.
      rootMargin: mobileLike ? "0px 0px -5% 0px" : "0px 0px -2% 0px"
    }
  );

  prepared.forEach((element) => observer.observe(element));
}


/* ---------- Fade de imágenes en móvil ---------- */

function initMobileImageFade() {
  const isMobileLike = window.matchMedia("(max-width: 780px), (hover: none) and (pointer: coarse)").matches;
  if (!isMobileLike) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const images = document.querySelectorAll('main img[loading="lazy"]:not(#transformImage)');

  images.forEach((img) => {
    img.classList.add("mobile-image-fade");

    const show = () => {
      if (reducedMotion) {
        img.classList.add("is-loaded");
        return;
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => img.classList.add("is-loaded"));
      });
    };

    if (img.complete && img.naturalWidth > 0) {
      show();
    } else {
      img.addEventListener("load", show, { once: true });
      // Si una imagen falla, no queda invisible: el sistema de fallback
      // existente se ocupa de mostrar el placeholder correspondiente.
      img.addEventListener("error", () => img.classList.add("is-loaded"), { once: true });
    }
  });
}

/* ---------- Parallax sutil ---------- */

function initParallax() {
  const items = document.querySelectorAll("[data-parallax]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!items.length || reducedMotion) return;

  let ticking = false;

  const update = () => {
    if (window.innerWidth < 781) {
      items.forEach((item) => {
        item.style.transform = "";
      });
      ticking = false;
      return;
    }

    items.forEach((item) => {
      const speed = Number.parseFloat(item.dataset.parallax) || 0.02;
      const rect = item.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const itemCenter = rect.top + rect.height / 2;
      const offset = (viewportCenter - itemCenter) * speed;

      item.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

/* ---------- Sagas: navegación y capas visuales opcionales ---------- */

function initSagaVisualEnhancements() {
  if (document.body.dataset.page !== "sagas") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Índice de cada era: usa los anchors existentes y conserva el header visible.
  document.querySelectorAll(".era-index-nav a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = id ? document.querySelector(id) : null;
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", id);
      }
    });
  });

}

/* ---------- Transformaciones interactivas ---------- */

const TRANSFORMATION_DATA = {
  goku: {
    label: "Goku",
    base: { rgb: "255,196,0", accent: "#ffc400" },
    forms: [
      { id: "ssj", name: "Super Saiyan", code: "SSJ-01", ki: "Explosivo", rgb: "255,196,0", accent: "#ffc400", image: "img/transformaciones/goku-ssj.webp", copy: "El quiebre que convierte la leyenda saiyajin en realidad. Ira, pérdida y un nuevo umbral de poder." },
      { id: "ssj2", name: "Super Saiyan 2", code: "SSJ-02", ki: "Eléctrico", rgb: "255,222,70", accent: "#ffde46", image: "img/transformaciones/goku-ssj2.webp", copy: "Una evolución más eléctrica y precisa, asociada a una liberación completa de energía." },
      { id: "ssj3", name: "Super Saiyan 3", code: "SSJ-03", ki: "Extremo", rgb: "255,150,20", accent: "#ff9614", image: "img/transformaciones/goku-ssj3.webp", copy: "Poder extremo a costa de un desgaste enorme. Visualmente radical y físicamente exigente." },
      { id: "ssj4", name: "Super Saiyan 4", code: "SSJ-04", ki: "Primario", rgb: "255,90,40", accent: "#ff5a28", image: "img/transformaciones/goku-ssj4-daima.webp", copy: "Forma introducida en Dragon Ball DAIMA: una vuelta al instinto saiyajin más primitivo, con pelaje rojo y energía salvaje.", tag: "Dragon Ball DAIMA" },
      { id: "god", name: "Super Saiyan God", code: "GOD-05", ki: "Divino", rgb: "255,64,64", accent: "#ff4040", image: "img/transformaciones/goku-ssj-god.webp", copy: "Una forma divina de apariencia serena y energía refinada, basada en un tipo diferente de ki." },
      { id: "blue", name: "Super Saiyan Blue", code: "BLUE-06", ki: "Controlado", rgb: "31,174,255", accent: "#1faeff", image: "img/transformaciones/goku-ssj-blue.webp", copy: "Poder divino y control saiyajin combinados en una forma centrada en precisión y dominio." },
      { id: "ui", name: "Ultra Instinto incompleto", code: "UI-07", ki: "Reactivo", rgb: "210,235,255", accent: "#d2ebff", image: "img/transformaciones/goku-ultra-instinct-incompleto.webp", copy: "El cuerpo empieza a moverse por su cuenta, aunque el control consciente todavía interfiere." },
      { id: "uifull", name: "Ultra Instinto completo", code: "UI-08", ki: "Instintivo", rgb: "245,250,255", accent: "#f5faff", image: "img/transformaciones/goku-ultra-instinct-completo.webp", copy: "Calma total: el cuerpo reacciona sin pensar, con cabello plateado y una serenidad absoluta." }
    ]
  },
  vegeta: {
    label: "Vegeta",
    base: { rgb: "120,190,255", accent: "#78beff" },
    forms: [
      { id: "ssj", name: "Super Saiyan", code: "SSJ-01", ki: "Explosivo", rgb: "255,196,0", accent: "#ffc400", image: "img/transformaciones/vegeta-ssj.webp", copy: "El príncipe saiyajin alcanza por fin la forma legendaria que creía su derecho de nacimiento." },
      { id: "ssj2", name: "Super Saiyan 2", code: "SSJ-02", ki: "Eléctrico", rgb: "255,222,70", accent: "#ffde46", image: "img/transformaciones/vegeta-ssj2.webp", copy: "Mayor densidad de energía y una precisión de combate más agresiva y calculada." },
      { id: "ssj3", name: "Super Saiyan 3", code: "SSJ-03", ki: "Extremo", rgb: "255,150,20", accent: "#ff9614", image: "img/transformaciones/vegeta-ssj3-daima.webp", copy: "Vegeta accede a esta forma en Dragon Ball DAIMA, llevando su orgullo a un nivel de desgaste extremo.", tag: "Dragon Ball DAIMA" },
      { id: "god", name: "Super Saiyan God", code: "GOD-04", ki: "Divino", rgb: "255,64,64", accent: "#ff4040", image: "img/transformaciones/vegeta-ssj-god.webp", copy: "Ki divino aplicado a un estilo de pelea directo, sin la serenidad contemplativa de Goku." },
      { id: "blue", name: "Super Saiyan Blue", code: "BLUE-05", ki: "Controlado", rgb: "31,174,255", accent: "#1faeff", image: "img/transformaciones/vegeta-ssj-blue.webp", copy: "El equilibrio entre poder divino y técnica saiyajin, dominado a base de disciplina." },
      { id: "blueevo", name: "Super Saiyan Blue Evolution", code: "BLUE-06", ki: "Desbordado", rgb: "80,200,255", accent: "#50c8ff", image: "img/transformaciones/vegeta-ssj-blue-evolution.webp", copy: "Una evolución propia del Blue, nacida de empujar el límite del orgullo hasta romperlo." },
      { id: "ultraego", name: "Ultra Ego", code: "UE-07", ki: "Destructivo", rgb: "190,60,255", accent: "#be3cff", image: "img/transformaciones/vegeta-ultra-ego.webp", copy: "Forma del manga de Dragon Ball Super: canaliza el ki de la destrucción y se fortalece con cada golpe recibido.", tag: "Manga" }
    ]
  },
  gohan: {
    label: "Gohan",
    base: { rgb: "255,196,0", accent: "#ffc400" },
    forms: [
      { id: "ssj", name: "Super Saiyan", code: "SSJ-01", ki: "Explosivo", rgb: "255,196,0", accent: "#ffc400", image: "img/transformaciones/gohan-ssj.webp", copy: "El hijo de Goku accede muy joven a la forma legendaria, con un potencial que sorprende a todos." },
      { id: "ssj2", name: "Super Saiyan 2", code: "SSJ-02", ki: "Eléctrico", rgb: "255,222,70", accent: "#ffde46", image: "img/transformaciones/gohan-ssj2.webp", copy: "Su momento más recordado: la furia contenida se libera por completo frente a Cell." },
      { id: "mystic", name: "Estado Místico", code: "MYS-03", ki: "Latente", rgb: "255,140,220", accent: "#ff8cdc", image: "img/transformaciones/gohan-mistico.webp", copy: "Potencial desbloqueado sin necesidad de transformarse: poder máximo conservando su forma base." },
      { id: "beast", name: "Gohan Beast", code: "BST-04", ki: "Desatado", rgb: "255,60,150", accent: "#ff3c96", image: "img/transformaciones/gohan-beast.webp", copy: "Su forma más extrema, alcanzada al proteger a su familia, con cabello plateado y mirada roja.", tag: "Dragon Ball Super: Super Hero" }
    ]
  },
  piccolo: {
    label: "Piccolo",
    base: { rgb: "90,220,130", accent: "#5adc82" },
    forms: [
      { id: "awakened", name: "Potencial Despertado", code: "AWK-01", ki: "Latente", rgb: "60,220,120", accent: "#3cdc78", image: "img/transformaciones/piccolo-potencial-despertado.webp", copy: "Shenlong libera todo el potencial oculto del namekiano, multiplicando su poder sin cambiar su aspecto." },
      { id: "orange", name: "Orange Piccolo", code: "ORG-02", ki: "Namekiano puro", rgb: "255,150,40", accent: "#ff9628", image: "img/transformaciones/piccolo-orange.webp", copy: "Una transformación que remite al linaje del clan guerrero namekiano, con un tamaño y una fuerza descomunales.", tag: "Dragon Ball Super: Super Hero" }
    ]
  },
  trunks: {
    label: "Trunks",
    base: { rgb: "150,120,255", accent: "#9678ff" },
    forms: [
      { id: "ssj", name: "Super Saiyan", code: "SSJ-01", ki: "Explosivo", rgb: "255,196,0", accent: "#ffc400", image: "img/transformaciones/trunks-ssj.webp", copy: "La forma con la que llega desde el futuro para cambiar un destino ya escrito." },
      { id: "ssj2", name: "Super Saiyan 2", code: "SSJ-02", ki: "Eléctrico", rgb: "255,222,70", accent: "#ffde46", image: "img/transformaciones/trunks-ssj2.webp", copy: "Una versión más veloz y eléctrica, afinada por años de combate en una línea temporal devastada." },
      { id: "rage", name: "Super Saiyan Rage", code: "RAG-03", ki: "Furioso", rgb: "255,60,90", accent: "#ff3c5a", image: "img/transformaciones/trunks-ssj-rage.webp", copy: "Un estallido de furia y esperanza frente a Goku Black, con un aura azulada y relámpagos violentos." }
    ]
  }
};

function initTransformations() {
  const consoleElement = document.getElementById("transformConsole");
  if (!consoleElement) return;

  const section = consoleElement.closest(".transform-experience");
  const characterTabs = consoleElement.querySelectorAll(".character-chip");
  const menu = document.getElementById("transformMenu");
  const stage = document.getElementById("transformStage");
  const image = document.getElementById("transformImage");
  const frame = image ? image.closest(".media-frame") : null;
  const name = document.getElementById("transformName");
  const description = document.getElementById("transformDescription");
  const code = document.getElementById("transformCode");
  const ki = document.getElementById("transformKi");

  if (!section || !characterTabs.length || !menu || !stage || !image ||
      !name || !description || !code || !ki) {
    return;
  }

  let changeTimer;
  let transitionToken = 0;
  let currentCharacter = "goku";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const preloadCache = new Map();

  // El render principal de Transformaciones nunca debe depender de lazy-load.
  // Las formas cambian por interacción directa, así que priorizamos la respuesta.
  image.loading = "eager";
  image.decoding = "async";
  try { image.fetchPriority = "high"; } catch (_) {}

  const preloadImage = (src) => {
    if (preloadCache.has(src)) return preloadCache.get(src);

    const promise = new Promise((resolve) => {
      const loader = new Image();
      loader.decoding = "async";
      loader.onload = async () => {
        try {
          if (typeof loader.decode === "function") await loader.decode();
        } catch (_) {}
        resolve(true);
      };
      loader.onerror = () => resolve(false);
      loader.src = src;
    });

    preloadCache.set(src, promise);
    return promise;
  };

  const warmCharacter = (characterKey) => {
    const character = TRANSFORMATION_DATA[characterKey];
    if (!character) return;
    character.forms.forEach((form) => preloadImage(form.image));
  };

  // Precarga progresiva: primero Goku (estado inicial), luego el resto cuando
  // el navegador queda libre. Evita el micro-lag al tocar una forma por primera vez.
  warmCharacter("goku");
  const warmRemaining = () => {
    Object.keys(TRANSFORMATION_DATA).forEach((key) => warmCharacter(key));
  };
  if (!navigator.connection?.saveData && "requestIdleCallback" in window) {
    window.requestIdleCallback(warmRemaining, { timeout: 1800 });
  } else if (!navigator.connection?.saveData) {
    window.setTimeout(warmRemaining, 700);
  }

  // Cambio de forma con doble buffer lógico:
  // 1) ocultamos INMEDIATAMENTE el render anterior (sin fade-out lento),
  // 2) precargamos/decodificamos la nueva imagen,
  // 3) recién entonces la mostramos con un fade-in corto y fluido.
  // Esto evita que SSJ1 siga visible después de tocar SSJ2.
  const applyForm = async (characterKey, form, animate) => {
    const characterLabel = TRANSFORMATION_DATA[characterKey].label;
    const token = ++transitionToken;

    window.clearTimeout(changeTimer);

    // Estado y texto responden al click en el mismo frame.
    section.style.setProperty("--aura-rgb", form.rgb);
    section.style.setProperty("--accent-live", form.accent);
    section.dataset.form = form.id;
    name.textContent = form.name;
    description.textContent = form.copy;
    code.textContent = form.code;
    ki.textContent = form.ki;

    if (frame) {
      frame.classList.remove("media-missing");
      frame.dataset.fallback = "Imagen no disponible";
    }

    if (animate && !reducedMotion) {
      // is-swapping oculta el bitmap viejo SIN transición.
      stage.classList.add("is-swapping");
    } else {
      stage.classList.remove("is-swapping");
    }

    // Arrancamos la carga antes de tocar el src visible para que el navegador
    // no mantenga el bitmap anterior mientras decodifica el siguiente.
    const loaded = await preloadImage(form.image);
    if (token !== transitionToken) return;

    image.alt = `${characterLabel} — ${form.name}`;
    image.src = form.image;

    if (!loaded) {
      if (frame) frame.classList.add("media-missing");
      stage.classList.remove("is-swapping");
      return;
    }

    // Espera de decode del elemento visible cuando el navegador la soporte.
    try {
      if (typeof image.decode === "function") await image.decode();
    } catch (_) {}
    if (token !== transitionToken) return;

    // La imagen inicial de Transformaciones parte con src vacío en el HTML.
    // initMediaFallbacks puede verla momentáneamente como ausente mientras se
    // precarga la primera forma. Al confirmar que el bitmap nuevo ya está
    // cargado/decodificado, retiramos explícitamente ese fallback.
    if (frame) frame.classList.remove("media-missing");

    if (!animate || reducedMotion) {
      stage.classList.remove("is-swapping");
      return;
    }

    // Forzamos un frame oculto con la imagen NUEVA y después la hacemos entrar.
    // No hay timeout perceptible ni forma anterior visible.
    void image.offsetWidth;
    window.requestAnimationFrame(() => {
      if (token !== transitionToken) return;
      stage.classList.remove("is-swapping");
    });
  };

  const renderCharacter = (characterKey, animate) => {
    const character = TRANSFORMATION_DATA[characterKey];
    if (!character) return;

    currentCharacter = characterKey;
    menu.innerHTML = "";
    menu.setAttribute("aria-label", `Transformaciones de ${character.label}`);

    character.forms.forEach((form, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === 0 ? "transform-tab active" : "transform-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.setAttribute("aria-controls", "transformStage");
      button.tabIndex = index === 0 ? 0 : -1;
      button.textContent = form.name;

      if (form.tag) {
        const tag = document.createElement("em");
        tag.className = "transform-tab-tag";
        tag.textContent = form.tag;
        button.appendChild(tag);
      }

      button.addEventListener("click", () => {
        if (button.classList.contains("active")) return;

        menu.querySelectorAll(".transform-tab").forEach((other) => {
          other.classList.remove("active");
          other.setAttribute("aria-selected", "false");
          other.tabIndex = -1;
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        button.tabIndex = 0;
        applyForm(currentCharacter, form, true);
      });

      menu.appendChild(button);
    });

    applyForm(characterKey, character.forms[0], animate);
  };

  characterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("active")) return;

      characterTabs.forEach((other) => {
        other.classList.remove("active");
        other.setAttribute("aria-selected", "false");
        other.tabIndex = -1;
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.tabIndex = 0;
      warmCharacter(tab.dataset.character);
      renderCharacter(tab.dataset.character, true);
    });

    tab.addEventListener("keydown", (event) => {
      const tabs = Array.from(characterTabs);
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  menu.addEventListener("keydown", (event) => {
    const tabs = Array.from(menu.querySelectorAll(".transform-tab"));
    if (!tabs.length || !event.target.classList.contains("transform-tab")) return;

    const currentIndex = tabs.indexOf(event.target);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  });

  renderCharacter("goku", false);
}

/* ---------- Lightbox de galería ---------- */

function initLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item[data-full]"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCaptionText = document.getElementById("lightboxCaptionText");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const closeButton = document.getElementById("lightboxClose");
  const prevButton = document.getElementById("lightboxPrev");
  const nextButton = document.getElementById("lightboxNext");

  if (!items.length || !lightbox || !lightboxImage || !closeButton) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocusedElement = null;
  let currentIndex = 0;
  let switchTimer;

  const updateItem = (targetIndex) => {
    currentIndex = (targetIndex + items.length) % items.length;
    const item = items[currentIndex];
    const source = item.dataset.full;
    const imageInside = item.querySelector("img");

    if (!source) return;

    lightboxImage.src = source;
    lightboxImage.alt = imageInside?.alt || "Imagen ampliada de la galería";

    const caption = item.dataset.caption || "";
    if (lightboxCaptionText) {
      lightboxCaptionText.textContent = caption;
    } else if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    }
  };

  const renderItem = (index, animate = false) => {
    const targetIndex = (index + items.length) % items.length;
    window.clearTimeout(switchTimer);

    if (!animate || reducedMotion || !lightbox.classList.contains("open")) {
      lightbox.classList.remove("is-switching");
      updateItem(targetIndex);
      return;
    }

    lightbox.classList.add("is-switching");
    switchTimer = window.setTimeout(() => {
      updateItem(targetIndex);
      window.requestAnimationFrame(() => {
        lightbox.classList.remove("is-switching");
      });
    }, 115);
  };

  const closeLightbox = () => {
    window.clearTimeout(switchTimer);
    lightbox.classList.remove("open", "is-switching");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    syncBodyLock();

    window.setTimeout(() => {
      lightboxImage.src = "";
      lightboxImage.alt = "";
      if (lightboxCaptionText) lightboxCaptionText.textContent = "";
      if (lightboxCounter) lightboxCounter.textContent = "";
      if (lightboxCaption && !lightboxCaptionText) lightboxCaption.textContent = "";
    }, reducedMotion ? 0 : 220);

    lastFocusedElement?.focus();
  };

  const openLightbox = (item, index) => {
    lastFocusedElement = item;
    renderItem(index, false);

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    syncBodyLock();
    closeButton.focus();
  };

  const showPrevious = () => renderItem(currentIndex - 1, true);
  const showNext = () => renderItem(currentIndex + 1, true);

  items.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(item, index));
  });

  closeButton.addEventListener("click", closeLightbox);
  prevButton?.addEventListener("click", showPrevious);
  nextButton?.addEventListener("click", showNext);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
      return;
    }

    if (event.key === "Tab") {
      const focusable = [closeButton, prevButton, nextButton].filter(Boolean);
      const current = focusable.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      const next = (current + step + focusable.length) % focusable.length;
      event.preventDefault();
      focusable[next].focus();
    }
  });
}

/* ---------- Placeholder prolijo cuando falta una imagen real ---------- */

function initMediaFallbacks() {
  // transformImage es dinámico y arranca con src vacío a propósito; su propio
  // módulo administra carga/error. Incluirlo acá genera un falso
  // "Imagen no disponible" durante el primer render.
  const images = document.querySelectorAll(".media-frame img:not(#transformImage)");
  if (!images.length) return;

  images.forEach((image) => {
    const frame = image.closest(".media-frame");
    if (!frame) return;

    // Si la imagen ya falló antes de que se registre el listener
    // (por ejemplo, cache o carga instantánea de un 404).
    if (image.complete && image.naturalWidth === 0) {
      frame.classList.add("media-missing");
      return;
    }

    image.addEventListener(
      "error",
      () => frame.classList.add("media-missing"),
      { once: true }
    );
  });
}

/* ---------- Películas: filtro por etapa ---------- */

function initMovieFilter() {
  const filterBar = document.querySelector("[data-movie-filter]");
  const eraBlocks = Array.from(document.querySelectorAll("[data-movie-era]"));

  if (!filterBar || !eraBlocks.length) return;

  const buttons = filterBar.querySelectorAll(".movie-filter-btn");
  if (!buttons.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let filterTimer;

  const applyFilter = (selectedEra) => {
    const shouldShowBlock = (block) =>
      selectedEra === "todas" || block.dataset.movieEra === selectedEra;

    window.clearTimeout(filterTimer);

    if (reducedMotion) {
      eraBlocks.forEach((block) => {
        block.classList.remove("is-filtering-out", "is-filtering-in");
        block.hidden = !shouldShowBlock(block);
      });
      return;
    }

    // Primero se desvanece solamente lo que va a salir.
    eraBlocks.forEach((block) => {
      if (!block.hidden && !shouldShowBlock(block)) {
        block.classList.add("is-filtering-out");
      }
    });

    filterTimer = window.setTimeout(() => {
      eraBlocks.forEach((block) => {
        const shouldShow = shouldShowBlock(block);
        const wasHidden = block.hidden;

        block.classList.remove("is-filtering-out", "is-filtering-in");
        block.hidden = !shouldShow;

        if (shouldShow && wasHidden) {
          block.classList.add("is-filtering-in");
        }
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          eraBlocks.forEach((block) => block.classList.remove("is-filtering-in"));
        });
      });
    }, 150);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("active")) return;

      buttons.forEach((otherButton) => {
        otherButton.classList.remove("active");
        otherButton.setAttribute("aria-selected", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      applyFilter(button.dataset.filter);
    });
  });
}

/* ---------- Formulario de contacto: demo estática para GitHub Pages ---------- */

function initContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");

  if (!form || !success) return;

  const nameField = form.elements.namedItem("name");
  const emailField = form.elements.namedItem("email");
  const messageField = form.elements.namedItem("message");

  if (!nameField || !emailField || !messageField) return;

  const TEXT_SENT = "¡Demo completada correctamente!";
  const submitButton = form.querySelector('button[type="submit"]');
  const submitButtonHTML = submitButton ? submitButton.innerHTML : "";
  let isSending = false;

  // Recorta espacios (incluidos NBSP y caracteres invisibles de ancho cero)
  // al inicio y al final: un campo con solo espacios cuenta como vacío.
  const cleanText = (value) =>
    value.replace(/^[\s\u200B-\u200D\u2060\uFEFF]+|[\s\u200B-\u200D\u2060\uFEFF]+$/g, "");

  const setFieldError = (field, message) => {
    const wrapper = field.closest(".form-field");
    if (!wrapper) return;

    wrapper.classList.add("error");
    field.setAttribute("aria-invalid", "true");

    const messageElement = wrapper.querySelector(".error-message");
    if (messageElement) messageElement.textContent = message;
  };

  const clearFieldError = (field) => {
    const wrapper = field.closest(".form-field");
    if (!wrapper) return;

    wrapper.classList.remove("error");
    field.removeAttribute("aria-invalid");

    const messageElement = wrapper.querySelector(".error-message");
    if (messageElement) messageElement.textContent = "";
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (field) => {
    const value = cleanText(field.value);

    if (field === nameField && value.length < 2) {
      setFieldError(field, "Ingresá un nombre de al menos 2 caracteres.");
      return false;
    }

    if (field === nameField && value.length > 100) {
      setFieldError(field, "El nombre no puede superar los 100 caracteres.");
      return false;
    }

    if (field === emailField && (!isValidEmail(value) || value.length > 150)) {
      setFieldError(field, "Ingresá un email válido.");
      return false;
    }

    if (field === messageField && value.length < 10) {
      setFieldError(field, "El mensaje debe tener al menos 10 caracteres.");
      return false;
    }

    if (field === messageField && value.length > 5000) {
      setFieldError(field, "El mensaje no puede superar los 5000 caracteres.");
      return false;
    }

    clearFieldError(field);
    return true;
  };

  const showStatus = (text, isError) => {
    success.textContent = text;
    success.classList.toggle("is-error", Boolean(isError));
  };

  const setSending = (sending) => {
    isSending = sending;
    if (!submitButton) return;

    submitButton.disabled = sending;
    submitButton.setAttribute("aria-busy", sending ? "true" : "false");
    submitButton.innerHTML = sending
      ? 'Procesando... <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>'
      : submitButtonHTML;
  };

  [nameField, emailField, messageField].forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field);
      showStatus("", false);
    });

    field.addEventListener("blur", () => {
      if (field.value.trim()) validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isSending) return;
    showStatus("", false);

    const fields = [nameField, emailField, messageField];
    const results = fields.map(validateField);
    const firstInvalidIndex = results.findIndex((result) => !result);

    if (firstInvalidIndex !== -1) {
      fields[firstInvalidIndex].focus();
      return;
    }

    // Simula brevemente el envío para conservar el feedback visual del formulario.
    // No se envían ni se almacenan datos: GitHub Pages es un hosting estático.
    setSending(true);
    window.setTimeout(() => {
      form.reset();
      fields.forEach(clearFieldError);
      showStatus(TEXT_SENT, false);
      setSending(false);
    }, 450);
  });
}

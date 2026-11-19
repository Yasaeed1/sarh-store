const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

if (menu && navigation) {
  menu.closest("header").classList.add("menu-enabled");
  const setMenu = (open) => menu.setAttribute("aria-expanded", String(open));
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") === "false"));
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menu.focus();
    }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", () => setMenu(false));
}

const home = document.querySelector(".home-shell");
if (home && !motion.matches) {
  home.querySelectorAll("[data-words]").forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      if (index > 0) fragment.append(" ");
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      span.style.setProperty("--word", index);
      fragment.append(span);
    });
    line.replaceChildren(fragment);
  });
  home.classList.add("with-motion");

  const collection = home.querySelector("[data-reveal]");
  if ("IntersectionObserver" in window && collection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        collection.classList.add("is-visible");
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -6% 0px" });
    collection.classList.add("observe");
    observer.observe(collection);
    collection.addEventListener("focusin", () => {
      collection.classList.add("is-visible");
      observer.disconnect();
    }, { once: true });
  }
}

const preview = document.querySelector(".hero-preview");
if (preview) {
  const slides = [...preview.querySelectorAll("[data-slide]")];
  const steps = [...preview.querySelectorAll("[data-slide-to]")];
  const pause = preview.querySelector(".preview-pause");
  let current = 0;
  let paused = motion.matches;
  let timer;

  function showSlide(index) {
    current = index;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    steps.forEach((step, i) => step.setAttribute("aria-pressed", String(i === current)));
  }

  function scheduleSlide() {
    clearTimeout(timer);
    if (paused || document.hidden || preview.matches(":hover, :focus-within")) return;
    timer = setTimeout(() => {
      showSlide((current + 1) % slides.length);
      scheduleSlide();
    }, 3800);
  }

  function setPaused(value) {
    paused = value;
    pause.textContent = paused ? "▶" : "Ⅱ";
    pause.setAttribute("aria-label", paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي");
    scheduleSlide();
  }

  steps.forEach((step, index) => step.addEventListener("click", () => {
    showSlide(index);
    scheduleSlide();
  }));
  pause.addEventListener("click", () => setPaused(!paused));
  motion.addEventListener("change", () => setPaused(motion.matches));
  ["pointerenter", "pointerleave", "focusin", "focusout"].forEach((event) => {
    preview.addEventListener(event, () => requestAnimationFrame(scheduleSlide));
  });
  document.addEventListener("visibilitychange", scheduleSlide);
  preview.querySelector(".preview-controls").hidden = false;
  setPaused(paused);
}

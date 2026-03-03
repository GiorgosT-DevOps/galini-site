document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("galiniGalleryGrid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll(".gg-item"));
  const lb = document.getElementById("ggLightbox");
  const img = document.getElementById("ggImg");

  // Always show the thumbnails (fix for invisible grid)
  items.forEach(el => el.classList.add("gg-in"));

  if (!lb || !img || items.length === 0) return;

  const closeEls = lb.querySelectorAll("[data-gg-close]");
  const prevBtn = lb.querySelector("[data-gg-prev]");
  const nextBtn = lb.querySelector("[data-gg-next]");
  const zoomInBtn = lb.querySelector("[data-gg-zoomin]");
  const zoomOutBtn = lb.querySelector("[data-gg-zoomout]");
  const fitBtn = lb.querySelector("[data-gg-fit]");
  const resetBtn = lb.querySelector("[data-gg-reset]");

  let index = 0;
  let scale = 1;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setScale = (v) => {
    scale = clamp(v, 1, 3.25);
    img.style.transform = `scale(${scale})`;
  };

  const openAt = (i) => {
    index = clamp(i, 0, items.length - 1);
    const el = items[index];
    const full = el.getAttribute("data-full") || el.querySelector("img")?.src;
    if (!full) return;

    img.style.opacity = "0";
    img.src = full;
    img.alt = el.querySelector("img")?.alt || "Gallery image";
    setScale(1);

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => (img.style.opacity = "1"), 40);
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setScale(1);
  };

  const step = (dir) => openAt((index + dir + items.length) % items.length);

  // Open: click on the figure OR the button
  items.forEach((el, i) => {
    el.addEventListener("click", () => openAt(i));

    const btn = el.querySelector(".gg-open");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAt(i);
      });
    }
  });

  // Close
  closeEls.forEach((b) => b.addEventListener("click", close));

  // Prev/Next
  prevBtn?.addEventListener("click", () => step(-1));
  nextBtn?.addEventListener("click", () => step(+1));

  // Zoom controls
  zoomInBtn?.addEventListener("click", () => setScale(scale + 0.25));
  zoomOutBtn?.addEventListener("click", () => setScale(scale - 0.25));
  fitBtn?.addEventListener("click", () => setScale(1));
  resetBtn?.addEventListener("click", () => setScale(1));

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(+1);
  });

  // Wheel zoom
  lb.addEventListener("wheel", (e) => {
    if (!lb.classList.contains("is-open")) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    setScale(scale + (delta > 0 ? -0.15 : 0.15));
  }, { passive: false });
});
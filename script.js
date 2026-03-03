const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.add('active');
  menuToggle.classList.add('is-hidden');   // hide smoothly
});

menuClose.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
  menuToggle.classList.remove('is-hidden'); // show smoothly
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

(() => {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  // FORCE VISIBLE (TEST ONLY)
  btn.classList.add("is-visible");

  // Click => scroll to top
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.add('active');
  document.body.classList.add('menu-open');
});

menuClose.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
  document.body.classList.remove('menu-open');
});

// Reveal on scroll (Taratsa-like fade)
document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");

  // If IntersectionObserver isn't supported, just show everything
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // animate once like Taratsa
        }
      });
    },
    {
      threshold: 0.18,        // how much of element must be visible
      rootMargin: "0px 0px -10% 0px" // triggers a bit before fully in view
    }
  );

  revealEls.forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealEls.forEach((el) => observer.observe(el));
});


/* =========================================================
   MENU LIGHTBOX (silky)
   - Click a .menu-img link -> opens overlay
   - Click backdrop or X or press ESC -> closes
   - Locks body scroll while open
========================================================= */

(() => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  if (!lightbox || !lightboxImg) return;

  const closeTargets = lightbox.querySelectorAll("[data-close]");

  let lastFocused = null;

  function openLightbox(src, alt = "") {
    lastFocused = document.activeElement;

    lightboxImg.src = src;
    lightboxImg.alt = alt;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    // focus the close button for accessibility
    const closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    // silky close: remove class, then clear src after transition
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    const cleanup = () => {
      lightboxImg.src = "";
      lightboxImg.alt = "";
      lightbox.removeEventListener("transitionend", cleanup);

      // return focus
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus({ preventScroll: true });
      }
    };

    lightbox.addEventListener("transitionend", cleanup);
    document.body.classList.remove("lightbox-open"); 
  }

  // Open on clicking any menu image
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.menu-img");
    if (!link) return;

    // Only for menu page images
    const img = link.querySelector("img");
    const href = link.getAttribute("href");
    if (!href) return;

    e.preventDefault();

    const alt = img?.getAttribute("alt") || "";
    openLightbox(href, alt);
  });

  // Close on X or backdrop
  closeTargets.forEach((el) => {
    el.addEventListener("click", () => closeLightbox());
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // Prevent clicks inside panel from closing (only backdrop closes)
  lightbox.querySelector(".lightbox__panel")?.addEventListener("click", (e) => {
    e.stopPropagation();
  });
})();






(() => {
  const grid = document.getElementById("galleryGrid");
  const items = Array.from(grid.querySelectorAll(".g-item"));

  // ---------------------------
  // 1) Scroll-in animations
  // ---------------------------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach(el => io.observe(el));

  // ---------------------------
  // 2) Filters (chips)
  // ---------------------------
  const chips = Array.from(document.querySelectorAll(".chip"));
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;

      items.forEach(it => {
        const g = it.dataset.group;
        const show = (f === "all") || (g === f);
        it.classList.toggle("is-hidden", !show);
      });
    });
  });

  // ---------------------------
  // 3) Lightbox (Taratsa-like)
  // ---------------------------
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbTitle = document.getElementById("lbTitle");
  const lbCount = document.getElementById("lbCount");
  const stage = document.getElementById("lbStage");

  const btnClose = lb.querySelectorAll("[data-close]");
  const btnPrev = lb.querySelector("[data-prev]");
  const btnNext = lb.querySelector("[data-next]");
  const btnZoomIn = lb.querySelector("[data-zoom-in]");
  const btnZoomOut = lb.querySelector("[data-zoom-out]");
  const btnReset = lb.querySelector("[data-reset]");
  const btnFit = lb.querySelector("[data-fit]");

  // build visible set (respect filter)
  const getVisibleItems = () => items.filter(i => !i.classList.contains("is-hidden"));

  let currentIndex = 0;
  let scale = 1;

  // Transform state
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setScale = (next) => {
    scale = clamp(next, 1, 3.25);
    lbImg.style.transform = `scale(${scale})`;
  };

  const openLB = (index) => {
    const visible = getVisibleItems();
    if (!visible.length) return;

    currentIndex = clamp(index, 0, visible.length - 1);

    const el = visible[currentIndex];
    const full = el.dataset.full || el.querySelector("img").src;
    const cap = el.querySelector(".g-cap")?.textContent?.trim() || "";

    lbTitle.textContent = cap;
    lbCount.textContent = `${currentIndex + 1} / ${visible.length}`;

    // nice “fade in image”
    lbImg.style.opacity = "0";
    lbImg.src = full;
    lbImg.alt = el.querySelector("img")?.alt || cap || "Gallery image";

    setScale(1);

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // focus trap-ish (simple)
    setTimeout(() => {
      lbImg.style.opacity = "1";
    }, 60);
  };

  const closeLB = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setScale(1);
  };

  const showRelative = (dir) => {
    const visible = getVisibleItems();
    if (!visible.length) return;

    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    openLB(currentIndex);
  };

  // Click to open (whole card + zoom button)
  items.forEach((el) => {
    el.addEventListener("click", (e) => {
      // if you add links later, ignore them
      const visible = getVisibleItems();
      const idx = visible.indexOf(el);
      if (idx === -1) return;
      openLB(idx);
    });
  });

  btnClose.forEach(b => b.addEventListener("click", closeLB));
  btnPrev.addEventListener("click", () => showRelative(-1));
  btnNext.addEventListener("click", () => showRelative(+1));

  btnZoomIn.addEventListener("click", () => setScale(scale + 0.25));
  btnZoomOut.addEventListener("click", () => setScale(scale - 0.25));
  btnReset.addEventListener("click", () => setScale(1));

  btnFit.addEventListener("click", () => {
    // Fit feel = reset (kept as separate for Taratsa-style UI)
    setScale(1);
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") showRelative(-1);
    if (e.key === "ArrowRight") showRelative(+1);
    if (e.key === "+" || e.key === "=") setScale(scale + 0.25);
    if (e.key === "-" || e.key === "_") setScale(scale - 0.25);
  });

  // Wheel zoom (desktop luxury feel)
  lb.addEventListener("wheel", (e) => {
    if (!lb.classList.contains("is-open")) return;
    // Avoid page scroll
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    setScale(scale + (delta > 0 ? -0.15 : 0.15));
  }, { passive: false });

  // Mobile swipe (stage)
  let startX = 0;
  let startY = 0;
  let dragging = false;

  stage.addEventListener("touchstart", (e) => {
    if (!lb.classList.contains("is-open")) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dragging = true;
  }, { passive: true });

  stage.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    // If mostly vertical, let it be (don’t hijack scroll in some cases)
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 14) {
      e.preventDefault();
    }
  }, { passive: false });

  stage.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 52) {
      showRelative(dx > 0 ? -1 : +1);
    }
  }, { passive: true });

})();


/* =========================================================
   GALINI — Gallery (Taratsa-inspired viewer)
========================================================= */
(() => {
  const grid = document.getElementById("galiniGalleryGrid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll(".gg-item"));

  // 1) Reveal animation (silk)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("gg-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach((el) => io.observe(el));

  // 2) Lightbox
  const lb = document.getElementById("ggLightbox");
  const img = document.getElementById("ggImg");

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
    const full = el.getAttribute("data-full") || el.querySelector("img").src;

    img.style.opacity = "0";
    img.src = full;
    img.alt = el.querySelector("img")?.alt || "Gallery image";
    setScale(1);

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => { img.style.opacity = "1"; }, 60);
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setScale(1);
  };

  const step = (dir) => openAt((index + dir + items.length) % items.length);

  // Open: click figure OR button
  items.forEach((el, i) => {
    el.addEventListener("click", (e) => {
      // prevent double handling on button clicks
      if (e.target.closest(".gg-open")) {
        openAt(i);
        return;
      }
      openAt(i);
    });

    el.querySelector(".gg-open")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openAt(i);
    });
  });

  // Close
  closeEls.forEach((b) => b.addEventListener("click", close));

  // Prev/Next
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(+1));

  // Zoom controls
  zoomInBtn.addEventListener("click", () => setScale(scale + 0.25));
  zoomOutBtn.addEventListener("click", () => setScale(scale - 0.25));
  fitBtn.addEventListener("click", () => setScale(1));   // “Fit” = elegant reset
  resetBtn.addEventListener("click", () => setScale(1));

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(+1);
    if (e.key === "+" || e.key === "=") setScale(scale + 0.25);
    if (e.key === "-" || e.key === "_") setScale(scale - 0.25);
  });

  // Wheel zoom (desktop premium feel)
  lb.addEventListener("wheel", (e) => {
    if (!lb.classList.contains("is-open")) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    setScale(scale + (delta > 0 ? -0.15 : 0.15));
  }, { passive: false });

  // Swipe (mobile)
  let sx = 0, sy = 0, dragging = false;
  const stage = lb.querySelector(".gg-stage");

  stage.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY;
    dragging = true;
  }, { passive: true });

  stage.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 14) e.preventDefault();
  }, { passive: false });

  stage.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 52) step(dx > 0 ? -1 : +1);
  }, { passive: true });
})();






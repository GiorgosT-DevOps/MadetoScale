document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const goToTop = document.getElementById("goToTop");
  const openChatbot = document.getElementById("openChatbot");
  const chatbotFloatButton = document.getElementById("chatbotFloatButton");
  const pageTransition = document.getElementById("pageTransition");

  /* Page load / browser history transition reset */
  function resetPageTransition() {
    if (!pageTransition) return;

    pageTransition.classList.remove("is-leaving");
    pageTransition.classList.add("is-loaded");
  }

  if (pageTransition) {
    requestAnimationFrame(resetPageTransition);

    window.addEventListener("pageshow", resetPageTransition);
    window.addEventListener("pagehide", () => {
      pageTransition.classList.remove("is-leaving");
    });
    window.addEventListener("popstate", resetPageTransition);
  }

  /* Restore autoplay videos after browser Back/Forward navigation */
  function playHeroVideos() {
    document.querySelectorAll(".hero__video").forEach((video) => {
      video.muted = true;
      video.playsInline = true;

      const playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    });
  }

  requestAnimationFrame(playHeroVideos);
  window.addEventListener("pageshow", playHeroVideos);
  window.addEventListener("focus", playHeroVideos);

  /* Mobile menu */
  function openMenu() {
    if (!mobileMenu || !mobileMenuOverlay || !menuToggle) return;
    mobileMenu.classList.add("is-active");
    mobileMenuOverlay.classList.add("is-active");
    menuToggle.setAttribute("aria-expanded", "true");
    body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!mobileMenu || !mobileMenuOverlay || !menuToggle) return;
    mobileMenu.classList.remove("is-active");
    mobileMenuOverlay.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMenu);
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", closeMenu);
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  /* Go to top */
  function handleGoToTopVisibility() {
    if (!goToTop) return;

    if (window.scrollY > 180) {
      goToTop.classList.add("is-visible");
    } else {
      goToTop.classList.remove("is-visible");
    }
  }

  window.addEventListener("scroll", handleGoToTopVisibility, { passive: true });
  window.addEventListener("resize", handleGoToTopVisibility);
  handleGoToTopVisibility();

  if (goToTop) {
    goToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /* Fake chatbot */
  function openFakeChatbot() {
    alert("Chatbot panel will open here.");
  }

  if (openChatbot) {
    openChatbot.addEventListener("click", openFakeChatbot);
  }

  if (chatbotFloatButton) {
    chatbotFloatButton.addEventListener("click", openFakeChatbot);
  }

  /* Page-to-page transition */
  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        link.hasAttribute("target")
      ) {
        return;
      }

      const isExternal = link.origin !== window.location.origin;
      if (isExternal) return;

      if (!pageTransition) return;

      event.preventDefault();
      pageTransition.classList.remove("is-loaded");
      pageTransition.classList.add("is-leaving");

      setTimeout(() => {
        window.location.href = href;
      }, 450);
    });
  });
});

/* =========================================================
   MINI GALLERY — ROTATING SHOWCASE
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    const galleries = document.querySelectorAll(".js-rotating-gallery");

    galleries.forEach((rotatingGallery) => {
      const scene = rotatingGallery.querySelector("[data-rotating-gallery-scene]");
      const ring = rotatingGallery.querySelector("[data-rotating-gallery-ring]");
      const cards = Array.from(
        rotatingGallery.querySelectorAll(".rotating-gallery__card")
      );

      if (!scene || !ring || !cards.length) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const autoRotate = true;
      const rotateSpeed = 60;
      let startX = 0;
      let startY = 0;
      let deltaX = 0;
      let deltaY = 0;
      let rotateX = 0;
      let rotateY = 10;
      let inertiaFrame = 0;
      let hasStarted = false;

      const getRadius = () => {
        const radius = parseFloat(
          getComputedStyle(rotatingGallery).getPropertyValue("--gallery-radius")
        );

        return Number.isFinite(radius) ? radius : 480;
      };

      const positionCards = (delayTime) => {
        const radius = getRadius();

        cards.forEach((card, index) => {
          const angle = index * (360 / cards.length);

          card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
          card.style.transition = "transform 4s";
          card.style.transitionDelay = delayTime || `${(cards.length - index) / 4}s`;
        });
      };

      const applyTransform = () => {
        rotateY = Math.max(0, Math.min(180, rotateY));
        scene.style.transform = `rotateX(${-rotateY}deg) rotateY(${rotateX}deg)`;
      };

      const playSpin = (shouldPlay) => {
        ring.style.animationPlayState =
          shouldPlay && !prefersReducedMotion ? "running" : "paused";
      };

      const startInertia = () => {
        window.cancelAnimationFrame(inertiaFrame);

        const tick = () => {
          deltaX *= 0.95;
          deltaY *= 0.95;
          rotateX += deltaX * 0.1;
          rotateY += deltaY * 0.1;
          applyTransform();
          playSpin(false);

          if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
            playSpin(true);
            return;
          }

          inertiaFrame = window.requestAnimationFrame(tick);
        };

        inertiaFrame = window.requestAnimationFrame(tick);
      };

      const initGallery = () => {
        if (hasStarted) return;

        hasStarted = true;
        rotatingGallery.classList.add("is-visible");
        scene.style.transform = "rotateX(-7deg)";
        scene.style.transition = "transform 4s";
        scene.style.transitionDelay = "1s";

        scene.addEventListener(
          "transitionend",
          () => {
            scene.style.transition = "transform 0s";
            scene.style.transitionDelay = "0s";
          },
          { once: true }
        );

        positionCards();

        if (autoRotate && !prefersReducedMotion) {
          ring.style.animation = `miniGallerySpin ${Math.abs(
            rotateSpeed
          )}s infinite linear`;
        }
      };

      rotatingGallery.addEventListener("pointerdown", (event) => {
        if (!hasStarted) return;

        window.cancelAnimationFrame(inertiaFrame);
        playSpin(false);
        startX = event.clientX;
        startY = event.clientY;
        rotatingGallery.setPointerCapture(event.pointerId);
      });

      rotatingGallery.addEventListener("pointermove", (event) => {
        if (!hasStarted) return;
        if (!rotatingGallery.hasPointerCapture(event.pointerId)) return;

        deltaX = event.clientX - startX;
        deltaY = event.clientY - startY;
        rotateX += deltaX * 0.1;
        rotateY += deltaY * 0.1;
        applyTransform();
        startX = event.clientX;
        startY = event.clientY;
      });

      rotatingGallery.addEventListener("pointerup", (event) => {
        if (!hasStarted) return;

        if (rotatingGallery.hasPointerCapture(event.pointerId)) {
          rotatingGallery.releasePointerCapture(event.pointerId);
        }

        startInertia();
      });

      rotatingGallery.addEventListener("pointercancel", () => {
        playSpin(true);
      });

      window.addEventListener("resize", () => positionCards("0s"));

      if ("IntersectionObserver" in window) {
        const galleryObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              window.setTimeout(initGallery, 50);
              observer.unobserve(entry.target);
            });
          },
          {
            threshold: 0.01,
            rootMargin: "0px",
          }
        );

        galleryObserver.observe(rotatingGallery);
      } else {
        window.setTimeout(initGallery, 50);
      }
    });
  });
// Home sections smooth fade-in
(() => {
  const sections = document.querySelectorAll(
    ".home-about, .menu-showcase, .garden-section"
  );

  if (!sections.length) return;

  sections.forEach((section) => {
    section.classList.add("home-reveal");
  });

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => {
      section.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -80px 0px",
    }
  );

  sections.forEach((section) => {
    revealObserver.observe(section);
  });
})();


/* =========================================================
   GALLERY LIGHTBOX + SCROLL REVEAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  const lightbox = document.querySelector("#galleryLightbox");

  if (!cards.length || !lightbox) return;

  const stage = lightbox.querySelector(".gallery-lightbox__stage");
  const image = lightbox.querySelector(".gallery-lightbox__image");
  const closeBtn = lightbox.querySelector(".gallery-lightbox__close");
  const prevBtn = lightbox.querySelector(".gallery-lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".gallery-lightbox__nav--next");
  const currentEl = lightbox.querySelector(".gallery-lightbox__current");
  const totalEl = lightbox.querySelector(".gallery-lightbox__total");
  const zoomInBtn = lightbox.querySelector("[data-gallery-zoom='in']");
  const zoomOutBtn = lightbox.querySelector("[data-gallery-zoom='out']");
  const resetBtn = lightbox.querySelector("[data-gallery-reset]");

  const images = cards.map((card) => {
    const img = card.querySelector("img");

    return {
      src: img.currentSrc || img.src,
      alt: img.alt || "Colours Crêperie gallery image"
    };
  });

  let currentIndex = 0;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let isPinching = false;
  let didSwipeOrDrag = false;

  totalEl.textContent = images.length;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyTransform() {
    image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function preloadImage(index) {
    const safeIndex = (index + images.length) % images.length;
    const preloaded = new Image();
    preloaded.src = images[safeIndex].src;
  }

  function setImage(index, animate = true) {
    currentIndex = (index + images.length) % images.length;

    resetZoom();

    if (!animate) {
      image.src = images[currentIndex].src;
      image.alt = images[currentIndex].alt;
      currentEl.textContent = currentIndex + 1;
      preloadImage(currentIndex + 1);
      preloadImage(currentIndex - 1);
      return;
    }

    image.classList.add("is-changing");

    window.setTimeout(() => {
      image.src = images[currentIndex].src;
      image.alt = images[currentIndex].alt;
      currentEl.textContent = currentIndex + 1;
      image.classList.remove("is-changing");

      preloadImage(currentIndex + 1);
      preloadImage(currentIndex - 1);
    }, 120);
  }

  function openLightbox(index) {
    setImage(index, false);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-lightbox-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-lightbox-open");
    resetZoom();
  }

  function nextImage() {
    setImage(currentIndex + 1, true);
  }

  function prevImage() {
    setImage(currentIndex - 1, true);
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", nextImage);
  prevBtn.addEventListener("click", prevImage);

  zoomInBtn.addEventListener("click", () => {
    scale = clamp(scale + 0.25, 1, 3);
    applyTransform();
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = clamp(scale - 0.25, 1, 3);

    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }

    applyTransform();
  });

  resetBtn.addEventListener("click", resetZoom);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  stage.addEventListener("click", (event) => {
    if (event.target === stage && !didSwipeOrDrag) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") prevImage();
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      event.preventDefault();

      const amount = event.deltaY > 0 ? -0.12 : 0.12;
      scale = clamp(scale + amount, 1, 3);

      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }

      applyTransform();
    },
    { passive: false }
  );

  image.addEventListener("mousedown", (event) => {
    if (scale <= 1) return;

    isDragging = true;
    didSwipeOrDrag = true;

    startX = event.clientX;
    startY = event.clientY;

    lastX = translateX;
    lastY = translateY;

    image.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    translateX = lastX + event.clientX - startX;
    translateY = lastY + event.clientY - startY;

    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    image.style.cursor = "";

    window.setTimeout(() => {
      didSwipeOrDrag = false;
    }, 80);
  });

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      didSwipeOrDrag = false;

      if (event.touches.length === 1) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;

        lastX = translateX;
        lastY = translateY;

        isPinching = false;
      }

      if (event.touches.length === 2) {
        pinchStartDistance = getTouchDistance(event.touches);
        pinchStartScale = scale;
        isPinching = true;
        didSwipeOrDrag = true;
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.touches.length === 2) {
        event.preventDefault();

        const newDistance = getTouchDistance(event.touches);
        const ratio = newDistance / pinchStartDistance;

        scale = clamp(pinchStartScale * ratio, 1, 3);

        if (scale === 1) {
          translateX = 0;
          translateY = 0;
        }

        applyTransform();
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        event.preventDefault();

        translateX = lastX + event.touches[0].clientX - startX;
        translateY = lastY + event.touches[0].clientY - startY;

        didSwipeOrDrag = true;

        applyTransform();
      }
    },
    { passive: false }
  );

  stage.addEventListener(
    "touchend",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (isPinching) {
        isPinching = false;

        window.setTimeout(() => {
          didSwipeOrDrag = false;
        }, 100);

        return;
      }

      if (scale > 1) return;

      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY)) {
        didSwipeOrDrag = true;

        if (diffX < 0) {
          nextImage();
        } else {
          prevImage();
        }

        window.setTimeout(() => {
          didSwipeOrDrag = false;
        }, 120);
      }
    },
    { passive: true }
  );

  window.addEventListener("pageshow", () => {
    closeLightbox();
  });

  const revealItems = document.querySelectorAll(".gallery-reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
});

/* =========================================================
   GALLERY LIGHTBOX + SCROLL REVEAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const cards = Array.from(document.querySelectorAll(".gallery-card"));
  const lightbox = document.querySelector("#galleryLightbox");

  if (!body.classList.contains("gallery-page")) return;
  if (!cards.length || !lightbox) return;

  const stage = lightbox.querySelector(".gallery-lightbox__stage");
  const image = lightbox.querySelector(".gallery-lightbox__image");
  const closeBtn = lightbox.querySelector(".gallery-lightbox__close");
  const prevBtn = lightbox.querySelector(".gallery-lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".gallery-lightbox__nav--next");
  const currentEl = lightbox.querySelector(".gallery-lightbox__current");
  const totalEl = lightbox.querySelector(".gallery-lightbox__total");
  const zoomInBtn = lightbox.querySelector("[data-gallery-zoom='in']");
  const zoomOutBtn = lightbox.querySelector("[data-gallery-zoom='out']");
  const resetBtn = lightbox.querySelector("[data-gallery-reset]");

  const images = cards.map((card) => {
    const img = card.querySelector("img");

    return {
      src: img.currentSrc || img.src,
      alt: img.alt || "Colours Crêperie gallery image"
    };
  });

  let currentIndex = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  let scrollY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let isPinching = false;
  let movedDuringTouch = false;

  totalEl.textContent = images.length;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyTransform() {
    image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function lockPageScroll() {
    scrollY = window.scrollY || window.pageYOffset;
    body.style.top = `-${scrollY}px`;
    body.classList.add("gallery-lightbox-open");
  }

  function unlockPageScroll() {
    body.classList.remove("gallery-lightbox-open");
    body.style.top = "";
    window.scrollTo(0, scrollY);
  }

  function preloadImage(index) {
    const safeIndex = (index + images.length) % images.length;
    const preloaded = new Image();
    preloaded.src = images[safeIndex].src;
  }

  function setImage(index, animate = true) {
    currentIndex = (index + images.length) % images.length;

    resetZoom();

    if (!animate) {
      image.src = images[currentIndex].src;
      image.alt = images[currentIndex].alt;
      currentEl.textContent = currentIndex + 1;
      preloadImage(currentIndex + 1);
      preloadImage(currentIndex - 1);
      return;
    }

    image.classList.add("is-changing");

    window.setTimeout(() => {
      image.src = images[currentIndex].src;
      image.alt = images[currentIndex].alt;
      currentEl.textContent = currentIndex + 1;
      image.classList.remove("is-changing");

      preloadImage(currentIndex + 1);
      preloadImage(currentIndex - 1);
    }, 120);
  }

  function openLightbox(index) {
    setImage(index, false);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lockPageScroll();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    resetZoom();
    unlockPageScroll();
  }

  function nextImage() {
    setImage(currentIndex + 1, true);
  }

  function prevImage() {
    setImage(currentIndex - 1, true);
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", nextImage);
  prevBtn.addEventListener("click", prevImage);

  zoomInBtn.addEventListener("click", () => {
    scale = clamp(scale + 0.25, 1, 3);
    applyTransform();
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = clamp(scale - 0.25, 1, 3);

    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }

    applyTransform();
  });

  resetBtn.addEventListener("click", resetZoom);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  stage.addEventListener("click", (event) => {
    if (event.target === stage && !movedDuringTouch) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") prevImage();
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      event.preventDefault();

      const amount = event.deltaY > 0 ? -0.12 : 0.12;
      scale = clamp(scale + amount, 1, 3);

      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }

      applyTransform();
    },
    { passive: false }
  );

  image.addEventListener("mousedown", (event) => {
    if (scale <= 1) return;

    isDragging = true;
    movedDuringTouch = true;

    startX = event.clientX;
    startY = event.clientY;

    lastX = translateX;
    lastY = translateY;

    image.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    translateX = lastX + event.clientX - startX;
    translateY = lastY + event.clientY - startY;

    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    image.classList.remove("is-dragging");

    window.setTimeout(() => {
      movedDuringTouch = false;
    }, 90);
  });

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      movedDuringTouch = false;

      if (event.touches.length === 1) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        lastX = translateX;
        lastY = translateY;
        isPinching = false;
      }

      if (event.touches.length === 2) {
        pinchStartDistance = getTouchDistance(event.touches);
        pinchStartScale = scale;
        isPinching = true;
        movedDuringTouch = true;
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.touches.length === 2) {
        event.preventDefault();

        const newDistance = getTouchDistance(event.touches);
        const ratio = newDistance / pinchStartDistance;

        scale = clamp(pinchStartScale * ratio, 1, 3);

        if (scale === 1) {
          translateX = 0;
          translateY = 0;
        }

        applyTransform();
        return;
      }

      if (event.touches.length === 1 && scale > 1) {
        event.preventDefault();

        translateX = lastX + event.touches[0].clientX - startX;
        translateY = lastY + event.touches[0].clientY - startY;

        movedDuringTouch = true;
        applyTransform();
      }
    },
    { passive: false }
  );

  stage.addEventListener(
    "touchend",
    (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (isPinching) {
        isPinching = false;

        window.setTimeout(() => {
          movedDuringTouch = false;
        }, 120);

        return;
      }

      if (scale > 1) return;

      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY)) {
        movedDuringTouch = true;

        if (diffX < 0) {
          nextImage();
        } else {
          prevImage();
        }

        window.setTimeout(() => {
          movedDuringTouch = false;
        }, 140);
      }
    },
    { passive: true }
  );

  window.addEventListener("pageshow", () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("gallery-lightbox-open");
    body.style.top = "";
    resetZoom();
  });

  const revealItems = document.querySelectorAll(".gallery-reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }
});


/* =========================================================
   CONTACT PAGE JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const contactReveals = document.querySelectorAll(".contact-reveal");

  if (contactReveals.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    contactReveals.forEach((item) => revealObserver.observe(item));
  }

  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", () => {
      const submitButton = contactForm.querySelector(".contact-form__submit");

      if (!submitButton) return;

      submitButton.classList.add("is-sending");
      submitButton.innerHTML = 'Sending... <i data-lucide="loader-circle"></i>';

      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

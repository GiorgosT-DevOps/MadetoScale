const root = document.documentElement;
const storageKey = "made-to-scale-theme";
const themeToggle = document.querySelector("[data-theme-toggle]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");
const siteHeader = document.querySelector(".site-header");
const nav = document.querySelector("[data-primary-nav]");
const dropdownToggles = document.querySelectorAll("[data-dropdown-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const revealItems = document.querySelectorAll("[data-reveal]");
const modal = document.querySelector("[data-modal]");
const modalOpeners = document.querySelectorAll("[data-modal-open]");
const modalClosers = document.querySelectorAll("[data-modal-close]");
const plannerForm = document.querySelector("[data-planner-form]");
const filterButtons = document.querySelectorAll("[data-work-filter]");
const sliders = document.querySelectorAll("[data-slider]");
const backTopButtons = document.querySelectorAll("[data-back-top]");
const stickyContact = document.querySelector("[data-sticky-contact]");
const stickyContactRing = document.querySelector("[data-sticky-contact-ring]");
const siteFooter = document.querySelector(".footer");
const workMarqueeRows = document.querySelectorAll(".work-marquee__row");
const launchIntro = document.querySelector("[data-launch-intro]");
const launchFrameStopProgress = 0.55;
const launchContactRevealProgress = launchFrameStopProgress + 0.01;

function applyTheme(theme) {
  root.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    themeToggle.querySelector("[data-theme-label]").textContent =
      theme === "dark" ? "Light mode" : "Dark mode";
  }
}

const savedTheme = localStorage.getItem(storageKey);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

applyTheme(savedTheme || preferredTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(storageKey, nextTheme);
  applyTheme(nextTheme);
});

function getLaunchIntroProgress() {
  if (!launchIntro) return 1;

  const scrollableDistance = Math.max(launchIntro.offsetHeight - window.innerHeight, 1);
  const passedDistance = Math.min(Math.max(-launchIntro.getBoundingClientRect().top, 0), scrollableDistance);
  return passedDistance / scrollableDistance;
}

function isOverLaunchIntro() {
  if (!launchIntro) return false;

  const introBounds = launchIntro.getBoundingClientRect();
  return introBounds.bottom > 8 && introBounds.top < window.innerHeight;
}

function updateStickyContact() {
  if (!stickyContact) return;

  const hasPassedIntro = launchIntro
    ? getLaunchIntroProgress() >= launchContactRevealProgress
    : window.scrollY > window.innerHeight / 3;
  const footerBuffer = siteFooter ? siteFooter.offsetHeight + 120 : 1000;
  const isNearFooter = window.innerHeight + window.scrollY >= document.body.offsetHeight - footerBuffer;
  stickyContact.classList.toggle("is-visible", hasPassedIntro && !isNearFooter);

  if (stickyContactRing) {
    stickyContactRing.style.setProperty("--sticky-contact-rotation", `${window.scrollY / 10}deg`);
  }
}

window.addEventListener("scroll", updateStickyContact, { passive: true });
window.addEventListener("resize", updateStickyContact);
updateStickyContact();

let lastHeaderScrollY = window.scrollY;
let lastHeaderTouchY = null;

function closeMobileNavigation() {
  mobileToggle?.setAttribute("aria-expanded", "false");
  nav?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  dropdownToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
}

function setHeaderHiddenForDirection(isMovingDown) {
  if (!siteHeader) return;

  const navIsOpen = nav?.classList.contains("is-open");
  const currentScrollY = Math.max(window.scrollY, 0);
  if (navIsOpen || currentScrollY < 120) {
    siteHeader.classList.remove("is-hidden");
    return;
  }

  if (isMovingDown && currentScrollY > 320) {
    siteHeader.classList.add("is-hidden");
  } else if (!isMovingDown) {
    siteHeader.classList.remove("is-hidden");
  }
}

function updateHeaderState() {
  if (!siteHeader) return;

  const currentScrollY = Math.max(window.scrollY, 0);
  const scrollDelta = currentScrollY - lastHeaderScrollY;
  const isScrollingDown = scrollDelta > 6;
  const isScrollingUp = scrollDelta < -6;
  const navIsOpen = nav?.classList.contains("is-open");
  siteHeader.classList.toggle("is-over-launch", isOverLaunchIntro());
  siteHeader.classList.toggle("is-compact", currentScrollY > 18 || Boolean(navIsOpen));

  if (navIsOpen || currentScrollY < 120) {
    siteHeader.classList.remove("is-hidden");
  } else if (currentScrollY > 320 && isScrollingDown) {
    siteHeader.classList.add("is-hidden");
  } else if (isScrollingUp) {
    siteHeader.classList.remove("is-hidden");
  }

  lastHeaderScrollY = currentScrollY;
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", updateHeaderState);
window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 6) return;
    setHeaderHiddenForDirection(event.deltaY > 0);
  },
  { passive: true }
);
window.addEventListener(
  "touchstart",
  (event) => {
    lastHeaderTouchY = event.touches[0]?.clientY ?? null;
  },
  { passive: true }
);
window.addEventListener(
  "touchmove",
  (event) => {
    const currentTouchY = event.touches[0]?.clientY;
    if (currentTouchY === undefined || lastHeaderTouchY === null) return;
    const touchDelta = lastHeaderTouchY - currentTouchY;
    if (Math.abs(touchDelta) > 8) {
      setHeaderHiddenForDirection(touchDelta > 0);
      lastHeaderTouchY = currentTouchY;
    }
  },
  { passive: true }
);
updateHeaderState();

function setupCustomCursor() {
  const canUseCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUseCursor || prefersLessMotion) return;

  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);
  document.body.classList.add("has-custom-cursor");

  const interactiveSelector = "a, button, summary, label, input, select, textarea, [data-cursor-grow]";
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let cursorIsActive = false;
  let cursorFrame = 0;

  function moveCursor() {
    cursorFrame = 0;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) ${
      cursorIsActive ? "scale(1)" : "scale(0.9)"
    }`;
  }

  function scheduleCursorMove() {
    if (cursorFrame) return;
    cursorFrame = window.requestAnimationFrame(moveCursor);
  }

  function setCursorActive(isActive) {
    if (cursorIsActive === isActive) return;
    cursorIsActive = isActive;
    cursor.classList.toggle("is-active", isActive);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      const hoveredElement = document.elementFromPoint(cursorX, cursorY);
      setCursorActive(Boolean(hoveredElement?.closest(interactiveSelector)));
      cursor.classList.add("is-visible");
      scheduleCursorMove();
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
    setCursorActive(false);
  });
}

setupCustomCursor();

function setupLaunchIntro() {
  if (!launchIntro) return;

  const canvas = launchIntro.querySelector("[data-launch-canvas]");
  if (!canvas?.getContext) return;

  const context = canvas.getContext("2d");
  const frameCount = Math.max(Number(canvas.dataset.frameCount) || 0, 1);
  const framesPath = canvas.dataset.framesPath || "";
  const progressBar = launchIntro.querySelector("[data-launch-progress]");
  const content = launchIntro.querySelector("[data-launch-content]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const images = new Array(frameCount);
  const maxConcurrentLoads = 6;
  let nextPreloadIndex = 0;
  let activePreloads = 0;
  let activeFrame = 0;
  let renderedFrame = -1;
  let frameRequest = 0;
  function clampProgress(value) {
    return Math.min(Math.max(value, 0), 1);
  }

  function smoothStep(value) {
    const progress = clampProgress(value);
    return progress * progress * (3 - 2 * progress);
  }

  function getFrameUrl(index) {
    return `${framesPath}frame_${String(index + 1).padStart(4, "0")}.webp`;
  }

  function prepareCanvas(image) {
    if (canvas.width === image.naturalWidth && canvas.height === image.naturalHeight) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
  }

  function renderFrame(index) {
    const image = images[index];
    if (!image || !image.complete || !image.naturalWidth) {
      loadFrame(index);
      return;
    }

    if (renderedFrame === index) return;
    prepareCanvas(image);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    renderedFrame = index;
  }

  function loadFrame(index) {
    if (images[index]) return images[index];

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (index === activeFrame || renderedFrame < 0) {
        renderFrame(index);
      }
    };
    image.src = getFrameUrl(index);
    images[index] = image;
    return image;
  }

  function preloadFrames() {
    if (prefersReducedMotion) return;

    while (activePreloads < maxConcurrentLoads && nextPreloadIndex < frameCount) {
      const index = nextPreloadIndex;
      nextPreloadIndex += 1;

      if (images[index]) continue;

      activePreloads += 1;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        activePreloads -= 1;
        if (index === activeFrame || renderedFrame < 0) {
          renderFrame(index);
        }
        preloadFrames();
      };
      image.onerror = () => {
        activePreloads -= 1;
        preloadFrames();
      };
      image.src = getFrameUrl(index);
      images[index] = image;
    }
  }

  function getScrollProgress() {
    const scrollableDistance = Math.max(launchIntro.offsetHeight - window.innerHeight, 1);
    const passedDistance = Math.min(Math.max(-launchIntro.getBoundingClientRect().top, 0), scrollableDistance);
    return passedDistance / scrollableDistance;
  }

  function updateLaunchIntro() {
    frameRequest = 0;
    const progress = prefersReducedMotion ? 1 : getScrollProgress();
    const frameProgress = prefersReducedMotion ? 0 : clampProgress(progress / launchFrameStopProgress);
    const textProgress = prefersReducedMotion ? 1 : smoothStep((frameProgress - 0.05) / 0.28);
    const actionsProgress = prefersReducedMotion ? 1 : smoothStep((progress - launchFrameStopProgress) / 0.08);
    activeFrame = Math.round(frameProgress * (frameCount - 1));
    launchIntro.style.setProperty("--launch-progress", progress.toFixed(4));

    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.max(0.02, frameProgress).toFixed(4)})`;
    }

    if (content) {
      content.style.setProperty("--launch-copy-opacity", "1");
      content.style.setProperty("--launch-text-opacity", textProgress.toFixed(3));
      content.style.setProperty("--launch-text-y", `${(30 - 30 * textProgress).toFixed(2)}px`);
      content.style.setProperty("--launch-text-blur", `${(12 - 12 * textProgress).toFixed(2)}px`);
      content.style.setProperty("--launch-actions-opacity", actionsProgress.toFixed(3));
      content.style.setProperty("--launch-actions-y", `${(24 - 24 * actionsProgress).toFixed(2)}px`);
      content.style.setProperty("--launch-actions-scale", (0.94 + 0.06 * actionsProgress).toFixed(3));
      content.style.setProperty("--launch-actions-blur", `${(10 - 10 * actionsProgress).toFixed(2)}px`);
      content.style.setProperty("--launch-copy-y", `${(-18 * Math.min(progress, 1)).toFixed(2)}px`);
    }

    launchIntro.classList.toggle("is-actions-ready", actionsProgress > 0.94);

    renderFrame(activeFrame);
  }

  function requestLaunchUpdate() {
    if (frameRequest) return;
    frameRequest = window.requestAnimationFrame(updateLaunchIntro);
  }

  loadFrame(0);
  preloadFrames();
  requestLaunchUpdate();
  window.addEventListener("scroll", requestLaunchUpdate, { passive: true });
  window.addEventListener("resize", requestLaunchUpdate);
}

setupLaunchIntro();

function updateWorkMarqueePace() {
  if (!workMarqueeRows.length) return;

  const pixelsPerSecond = 68;
  workMarqueeRows.forEach((row) => {
    const distance = row.scrollWidth / 2;
    const duration = Math.max(18, distance / pixelsPerSecond);
    row.style.setProperty("--work-marquee-duration", `${duration.toFixed(2)}s`);
  });
}

updateWorkMarqueePace();
window.addEventListener("resize", updateWorkMarqueePace);

mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
  mobileToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
  if (isOpen) {
    dropdownToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  }
  updateHeaderState();
});

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    dropdownToggles.forEach((item) => item.setAttribute("aria-expanded", "false"));
    toggle.setAttribute("aria-expanded", String(!expanded));
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-dropdown]")) {
    dropdownToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileNavigation();
    closeModal();
  }
});

nav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link && nav.classList.contains("is-open")) {
    closeMobileNavigation();
    updateHeaderState();
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function setFormStatus(statusNode, message, isError = false) {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.classList.toggle("is-error", isError);
  statusNode.removeAttribute("hidden");
}

async function submitFormPayload(endpoint, payload) {
  if (!endpoint) {
    throw new Error("Missing form endpoint.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "The enquiry could not be sent.");
  }

  return result;
}

function setError(fieldName, message) {
  const messageNode = document.querySelector(`[data-error-for="${fieldName}"]`);
  const field = contactForm?.querySelector(`[name="${fieldName}"]`);

  if (messageNode) {
    messageNode.textContent = message;
  }

  if (field) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

function getCheckedServices() {
  return Array.from(contactForm.querySelectorAll('input[name="services"]:checked')).map(
    (input) => input.value
  );
}

function buildContactPayload(data) {
  const email = String(data.get("email") || "").trim();
  return {
    _subject: "New Made to Scale project enquiry",
    _template: "table",
    _captcha: "false",
    _replyto: email,
    Name: String(data.get("name") || "").trim(),
    Email: email,
    Phone: String(data.get("phone") || "Not provided").trim(),
    Business: String(data.get("business") || "Not provided").trim(),
    Services: getCheckedServices().join(", "),
    Referral: String(data.get("referral") || "Not provided").trim(),
    Message: String(data.get("message") || "").trim(),
    Consent: "Accepted"
  };
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(contactForm);
  const requiredFields = ["name", "email", "message"];
  let firstInvalidField = null;
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    const value = String(data.get(fieldName) || "").trim();
    const message = value ? "" : "Please complete this field.";
    setError(fieldName, message);
    if (message && !firstInvalidField) firstInvalidField = contactForm.elements[fieldName];
    isValid = isValid && !message;
  });

  const email = String(data.get("email") || "").trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (email && !emailIsValid) {
    setError("email", "Please enter a valid email address.");
    firstInvalidField = firstInvalidField || contactForm.elements.email;
    isValid = false;
  }

  const serviceCount = getCheckedServices().length;
  const servicesError = serviceCount ? "" : "Choose at least one option.";
  setError("services", servicesError);
  if (servicesError && !firstInvalidField) {
    firstInvalidField = contactForm.querySelector('input[name="services"]');
  }
  isValid = isValid && !servicesError;

  const privacyAccepted = contactForm.querySelector('input[name="privacy"]')?.checked;
  const privacyError = privacyAccepted ? "" : "Please accept the privacy notice.";
  setError("privacy", privacyError);
  if (privacyError && !firstInvalidField) {
    firstInvalidField = contactForm.querySelector('input[name="privacy"]');
  }
  isValid = isValid && !privacyError;

  if (String(data.get("company_url") || "").trim()) {
    isValid = false;
  }

  if (!isValid) {
    firstInvalidField?.focus();
    return;
  }

  const success = contactForm.querySelector("[data-form-success]");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.dataset.originalText || submitButton?.textContent || "Send enquiry";
  const endpoint = contactForm.dataset.formEndpoint;

  if (submitButton) {
    submitButton.dataset.originalText = originalButtonText;
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;
  }
  setFormStatus(success, "Sending your enquiry...");

  try {
    await submitFormPayload(endpoint, buildContactPayload(data));
    contactForm.reset();
    setFormStatus(success, "Thanks. Your enquiry has been sent.");
    if (submitButton) {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  } catch (error) {
    setFormStatus(success, "Sorry, the enquiry could not be sent. Please try again or email tomarasg@icloud.com.", true);
    if (submitButton) {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }
});

function openModal() {
  if (!modal) return;
  modal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  modal.querySelector("[data-modal-close]")?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
}

modalOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });
});

modalClosers.forEach((closer) => {
  closer.addEventListener("click", closeModal);
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.workFilter;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");

    document.querySelectorAll("[data-work-card]").forEach((card) => {
      const categories = (card.dataset.workCard || "").split(" ");
      const isVisible = filter === "all" || categories.includes(filter);
      card.toggleAttribute("hidden", !isVisible);
    });
  });
});

function updatePlannerStep(nextIndex) {
  const steps = plannerForm.querySelectorAll("[data-planner-step]");
  const dots = document.querySelectorAll("[data-planner-dot]");
  plannerForm.dataset.step = String(nextIndex);

  steps.forEach((step, index) => {
    step.toggleAttribute("hidden", index !== nextIndex);
  });

  dots.forEach((dot, index) => {
    dot.setAttribute("aria-current", index === nextIndex ? "step" : "false");
  });
}

function validatePlannerStep(step) {
  const requiredGroups = step.querySelectorAll("[data-required-group]");
  const requiredFields = step.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    const valid = field.type === "checkbox" ? field.checked : Boolean(field.value.trim());
    field.setAttribute("aria-invalid", valid ? "false" : "true");
    isValid = isValid && valid;
  });

  requiredGroups.forEach((group) => {
    const checked = group.querySelectorAll("input:checked").length > 0;
    const error = group.querySelector("[data-planner-error]");
    if (error) error.textContent = checked ? "" : "Choose at least one option.";
    isValid = isValid && checked;
  });

  return isValid;
}

function buildPlannerPayload(data) {
  const projectTypes = Array.from(plannerForm.querySelectorAll('input[name="project_type"]:checked')).map(
    (input) => input.value
  );
  const email = String(data.get("planner_email") || "").trim();

  return {
    _subject: "New Made to Scale project planner enquiry",
    _template: "table",
    _captcha: "false",
    _replyto: email,
    Name: String(data.get("planner_name") || "").trim(),
    Email: email,
    Business: String(data.get("planner_company") || "Not provided").trim(),
    "Project types": projectTypes.join(", "),
    "Budget range": String(data.get("planner_budget") || "Not sure").trim(),
    Timeline: String(data.get("planner_timeline") || "Flexible").trim(),
    "Project brief": String(data.get("planner_message") || "Not provided").trim(),
    Consent: "Accepted"
  };
}

plannerForm?.querySelectorAll("[data-planner-next]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const steps = Array.from(plannerForm.querySelectorAll("[data-planner-step]"));
    const currentIndex = Number(plannerForm.dataset.step || "0");
    const currentStep = steps[currentIndex];
    if (!validatePlannerStep(currentStep)) return;
    updatePlannerStep(Math.min(currentIndex + 1, steps.length - 1));
  });
});

plannerForm?.querySelectorAll("[data-planner-back]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const currentIndex = Number(plannerForm.dataset.step || "0");
    updatePlannerStep(Math.max(currentIndex - 1, 0));
  });
});

plannerForm?.addEventListener("click", (event) => {
  const nextButton = event.target.closest("[data-planner-next]");
  const backButton = event.target.closest("[data-planner-back]");
  const steps = Array.from(plannerForm.querySelectorAll("[data-planner-step]"));
  const currentIndex = Number(plannerForm.dataset.step || "0");
  const currentStep = steps[currentIndex];

  if (nextButton) {
    event.preventDefault();
    if (!validatePlannerStep(currentStep)) return;
    updatePlannerStep(Math.min(currentIndex + 1, steps.length - 1));
  }

  if (backButton) {
    event.preventDefault();
    updatePlannerStep(Math.max(currentIndex - 1, 0));
  }
});

plannerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const steps = Array.from(plannerForm.querySelectorAll("[data-planner-step]"));
  const currentIndex = Number(plannerForm.dataset.step || "0");
  const currentStep = steps[currentIndex];

  if (!validatePlannerStep(currentStep)) return;

  const data = new FormData(plannerForm);
  if (String(data.get("planner_url") || "").trim()) return;

  const success = plannerForm.querySelector("[data-planner-success]");
  const submitButton = plannerForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.dataset.originalText || submitButton?.textContent || "Send planner enquiry";
  const endpoint = plannerForm.dataset.formEndpoint;

  if (submitButton) {
    submitButton.dataset.originalText = originalButtonText;
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;
  }
  setFormStatus(success, "Sending your planner enquiry...");

  try {
    await submitFormPayload(endpoint, buildPlannerPayload(data));
    plannerForm.reset();
    updatePlannerStep(0);
    setFormStatus(success, "Thanks. Your planner enquiry has been sent.");
    if (submitButton) {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  } catch (error) {
    setFormStatus(success, "Sorry, the planner enquiry could not be sent. Please try again or email tomarasg@icloud.com.", true);
    if (submitButton) {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }
});

sliders.forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const next = slider.querySelector("[data-slider-next]");
  const prev = slider.querySelector("[data-slider-prev]");
  let activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.toggleAttribute("hidden", slideIndex !== activeIndex);
    });
  }

  next?.addEventListener("click", () => showSlide(activeIndex + 1));
  prev?.addEventListener("click", () => showSlide(activeIndex - 1));
  showSlide(0);
});

backTopButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

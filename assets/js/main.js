const root = document.documentElement;
const storageKey = "made-to-scale-theme";
const themeToggle = document.querySelector("[data-theme-toggle]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");
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

function updateStickyContact() {
  if (!stickyContact) return;

  const isMobileWheel = window.matchMedia("(max-width: 680px)").matches;
  const hasPassedIntro = isMobileWheel || window.scrollY > window.innerHeight / 3;
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

mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
  mobileToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
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
    dropdownToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    mobileToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    closeModal();
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

function buildEmailBody(data) {
  const lines = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone") || "Not provided"}`,
    `Business: ${data.get("business") || "Not provided"}`,
    `Services: ${getCheckedServices().join(", ")}`,
    `Referral: ${data.get("referral") || "Not provided"}`,
    "",
    "Project message:",
    data.get("message")
  ];

  return encodeURIComponent(lines.join("\n"));
}

contactForm?.addEventListener("submit", (event) => {
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
  const emailAddress = contactForm.dataset.email || "tomarasg@icloud.com";
  const subject = encodeURIComponent("New Made to Scale project enquiry");
  const body = buildEmailBody(data);

  success?.removeAttribute("hidden");
  submitButton.textContent = "Enquiry ready";
  submitButton.disabled = true;

  window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
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

function buildPlannerBody(data) {
  const projectTypes = Array.from(plannerForm.querySelectorAll('input[name="project_type"]:checked')).map(
    (input) => input.value
  );
  return encodeURIComponent(
    [
      `Name: ${data.get("planner_name")}`,
      `Email: ${data.get("planner_email")}`,
      `Business: ${data.get("planner_company") || "Not provided"}`,
      `Project types: ${projectTypes.join(", ")}`,
      `Budget range: ${data.get("planner_budget") || "Not sure"}`,
      `Timeline: ${data.get("planner_timeline") || "Flexible"}`,
      "",
      "Project brief:",
      data.get("planner_message") || "Not provided"
    ].join("\n")
  );
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

plannerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const steps = Array.from(plannerForm.querySelectorAll("[data-planner-step]"));
  const currentIndex = Number(plannerForm.dataset.step || "0");
  const currentStep = steps[currentIndex];

  if (!validatePlannerStep(currentStep)) return;

  const data = new FormData(plannerForm);
  if (String(data.get("planner_url") || "").trim()) return;

  const success = plannerForm.querySelector("[data-planner-success]");
  const emailAddress = plannerForm.dataset.email || "tomarasg@icloud.com";
  const subject = encodeURIComponent("New Made to Scale project planner enquiry");
  const body = buildPlannerBody(data);

  success?.removeAttribute("hidden");
  window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
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

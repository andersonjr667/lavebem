const config = {
  siteName: "LavaBem"
};

const trackingState = {
  pageUrl: window.location.href,
  deviceType: window.innerWidth <= 768 ? "mobile" : "desktop"
};

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function preserveNavigationParams() {
  const params = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "gclid"
  ];

  const current = new URLSearchParams(window.location.search);
  const session = new URLSearchParams(sessionStorage.getItem("lavabem_utm") || "");

  params.forEach((key) => {
    const value = current.get(key) || session.get(key);
    if (value) {
      session.set(key, value);
    }
  });

  if ([...session.keys()].length) {
    sessionStorage.setItem("lavabem_utm", session.toString());
  }
}

function getTrackedParams() {
  const session = new URLSearchParams(sessionStorage.getItem("lavabem_utm") || "");
  const extras = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "gclid"].forEach((key) => {
    const value = session.get(key) || getQueryParam(key);
    if (value) extras[key] = value;
  });

  return extras;
}

function attachTrackingToLink(link) {
  const url = new URL(link.href, window.location.origin);
  const tracked = getTrackedParams();
  Object.entries(tracked).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  link.href = url.toString();
}

function logEvent(eventName, payload = {}) {
  const eventPayload = {
    event: eventName,
    page_url: trackingState.pageUrl,
    device_type: trackingState.deviceType,
    ...payload,
    ...getTrackedParams()
  };

  if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...eventPayload });
  }

  if (window.gtag) {
    window.gtag("event", eventName, eventPayload);
  }
}

function trackLinkClick(event) {
  const trigger = event.currentTarget;
  const location = trigger.dataset.ctaLocation || "unknown";
  const eventName = trigger.dataset.event || "link_click";
  attachTrackingToLink(trigger);
  logEvent(eventName, {
    cta_location: location,
    page_url: window.location.href
  });
}

function bindLeadEvents() {
  document.querySelectorAll("[data-event]").forEach((element) => {
    if (element.tagName === "A") {
      element.addEventListener("click", trackLinkClick);
    }
  });

  const mobileMenuButton = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      const expanded = mobileMenuButton.getAttribute("aria-expanded") === "true";
      mobileMenuButton.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("is-open");
    });
  }

  const faqDetails = document.querySelectorAll(".faq-list details");
  faqDetails.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        const title = item.querySelector("summary")?.textContent?.trim() || "Pergunta frequente";
        logEvent("faq_open", { faq_title: title, cta_location: "faq" });
        faqDetails.forEach((otherItem) => {
          if (otherItem !== item) otherItem.removeAttribute("open");
        });
      }
    });
  });

}

function bindRevealAnimations() {
  const revealItems = document.querySelectorAll(".hero-copy, .hero-media, section > .container, .final-cta, .site-footer");
  revealItems.forEach((item) => item.setAttribute("data-reveal", ""));

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll("[data-reveal-group]").forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal], [data-reveal-group]").forEach((item) => observer.observe(item));
}

function init() {
  preserveNavigationParams();
  bindLeadEvents();
  bindRevealAnimations();
  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.href.includes("wa.me") || link.href.includes("tel:")) {
      attachTrackingToLink(link);
    }
  });
  logEvent("page_view", { page_url: window.location.href });
}

window.addEventListener("DOMContentLoaded", init);

window.LAVABEM_CONFIG = config;

"use strict";

function trackWhatsAppClick(event) {
  const link = event.currentTarget;
  const payload = {
    event: "whatsapp_click",
    cta_location: link.dataset.cta || "unknown",
    page_path: window.location.pathname
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", {
      cta_location: payload.cta_location,
      page_path: payload.page_path
    });
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.info("LavaBem WhatsApp CTA", payload);
  }
}

window.trackWhatsAppClick = trackWhatsAppClick;

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  link.addEventListener("click", trackWhatsAppClick);
});

const config = {
  siteName: "LavaBem"
};

const whatsappMessages = {
  header: "Oi, vim pelo site da LavaBem e queria entender melhor como funciona o atendimento para minha máquina.",
  hero: "Oi, encontrei a LavaBem pelo site. Minha máquina parou e gostaria de conversar com um técnico sobre o que pode estar acontecendo.",
  problems: "Oi, vi os problemas atendidos no site e quero enviar os detalhes do defeito da minha máquina para receber uma orientação.",
  process: "Oi, gostaria de marcar uma avaliação da minha máquina. Podem me dizer quais horários estão disponíveis para minha região?",
  coverage: "Oi, gostaria de confirmar se a LavaBem atende meu bairro e explicar o problema da minha máquina.",
  final: "Oi, estou no site da LavaBem e preciso de ajuda para decidir o próximo passo com minha máquina de lavar.",
  footer: "Oi, passei pelo rodapé do site e gostaria de conversar sobre o conserto da minha máquina.",
  mobile_bar: "Oi, estou pelo celular e preciso de ajuda com minha máquina de lavar. Podem me orientar?",
  floating_button: "Olá, quero entender melhor o serviço da LavaBem. Podem me explicar como funciona o atendimento?"
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
  const location = link.dataset.ctaLocation;
  const whatsappMessage = whatsappMessages[location];
  if (url.protocol === "http:" || url.protocol === "https:") {
    if (url.hostname === "wa.me" && whatsappMessage) {
      url.searchParams.set("text", whatsappMessage);
    }
    const tracked = getTrackedParams();
    Object.entries(tracked).forEach(([key, value]) => {
      if (url.protocol !== "tel:") {
        url.searchParams.set(key, value);
      }
    });
  }
  if (url.protocol === "tel:") {
    return;
  }
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

  if (eventName === "whatsapp_click" || eventName === "phone_click") {
    window.reportGoogleAdsConversion?.();
  }
}

function bindWhatsAppForm() {
  const form = document.querySelector("[data-whatsapp-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const location = String(data.get("location") || "").trim();
    const machine = String(data.get("machine") || "").trim();
    const problem = String(data.get("problem") || "").trim();
    const status = form.querySelector("[data-form-status]");

    if (!name || !location || !machine || !problem) {
      status.textContent = "Preencha nome, cidade, marca/modelo e o problema para continuar.";
      status.setAttribute("data-error", "true");
      return;
    }

    const message = `Oi, sou ${name}. Encontrei a LavaBem pelo site e queria uma orientação para minha máquina. Estou em ${location}, ela é uma ${machine} e está assim: ${problem}. Como podemos seguir?`;
    const whatsappUrl = `https://wa.me/5531992450936?text=${encodeURIComponent(message)}`;

    logEvent("whatsapp_form_submit", { cta_location: "footer_form" });
    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    window.reportGoogleAdsConversion?.();
    if (!popup) {
      status.textContent = "O navegador bloqueou a janela do WhatsApp. Use o botão de WhatsApp ou ligue para (31) 99245-0936.";
      status.setAttribute("data-error", "true");
      return;
    }

    status.textContent = "Abrimos o WhatsApp com sua mensagem pronta.";
    status.removeAttribute("data-error");
    form.reset();
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
  bindWhatsAppForm();
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

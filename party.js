const party = Object.freeze({
  rsvpDeadline: ""
});

(() => {
  const url = new URL(document.getElementById("rsvp-link").href);
  const longForm = url.protocol === "https:" && url.hostname === "docs.google.com" &&
    /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[^/]+\/viewform\/?$/.test(url.pathname);
  if (longForm) {
    const embed = document.getElementById("rsvp-embed");
    const wideScreen = window.matchMedia("(min-width: 641px)");
    const loadEmbed = () => {
      if (!wideScreen.matches || !embed.hidden) return;
      url.searchParams.set("embedded", "true");
      embed.src = url.href;
      embed.hidden = false;
      document.getElementById("rsvp").classList.add("has-embed");
    };
    loadEmbed();
    wideScreen.addEventListener("change", loadEmbed);
  }
  if (party.rsvpDeadline) {
    const deadline = document.getElementById("rsvp-deadline");
    deadline.textContent = `Please RSVP by ${party.rsvpDeadline}.`;
    deadline.hidden = false;
  }
})();

const invitationCard = document.querySelector(".invitation-card");
const confettiBurst = document.querySelector(".confetti-burst");
const confettiColors = ["#a569c2", "#e47480", "#e9b63e", "#5a9f87", "#6c93d1"];
const confettiCount = 28;
let lastBurst = -Infinity;
let clearConfetti;

function popConfetti(event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const now = performance.now();
  if (now - lastBurst < 1500) return;
  lastBurst = now;

  const card = invitationCard.getBoundingClientRect();
  confettiBurst.style.left = `${event.clientX - card.left}px`;
  confettiBurst.style.top = `${event.clientY - card.top}px`;

  const pieces = Array.from({ length: confettiCount }, (_, index) => {
    const piece = document.createElement("span");
    const angle = index * 2 * Math.PI / confettiCount;
    const distance = 5.5 + (index % 3) * 2.2;
    piece.style.setProperty("--piece-color", confettiColors[index % confettiColors.length]);
    piece.style.setProperty("--piece-x", `${Math.cos(angle) * distance}rem`);
    piece.style.setProperty("--piece-y", `${Math.sin(angle) * distance}rem`);
    piece.style.setProperty("--piece-spin", `${90 + index * 24}deg`);
    piece.style.setProperty("--piece-delay", `${(index % 5) * 24}ms`);
    return piece;
  });
  clearTimeout(clearConfetti);
  confettiBurst.replaceChildren(...pieces);
  clearConfetti = setTimeout(() => confettiBurst.replaceChildren(), 1420);
}

invitationCard.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch") popConfetti(event);
});
invitationCard.addEventListener("pointerup", (event) => {
  if (event.pointerType === "touch") popConfetti(event);
});

const photoViewer = document.querySelector(".photo-viewer");
if (photoViewer && typeof photoViewer.showModal === "function") {
  let lastPhoto;
  document.querySelectorAll("[data-photo]").forEach(photo => {
    photo.addEventListener("click", event => {
      event.preventDefault();
      lastPhoto = photo;
      const source = photo.querySelector("img");
      photoViewer.querySelector(".photo-full").src = photo.href;
      photoViewer.querySelector(".photo-full").alt = source.alt;
      photoViewer.querySelector(".photo-caption").textContent = photo.dataset.caption || "";
      photoViewer.showModal();
      document.body.classList.add("photo-is-open");
    });
  });
  photoViewer.querySelector(".photo-close").addEventListener("click", () => photoViewer.close());
  photoViewer.addEventListener("click", event => {
    const box = photoViewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) photoViewer.close();
  });
  photoViewer.addEventListener("close", () => {
    document.body.classList.remove("photo-is-open");
    lastPhoto?.focus({preventScroll:true});
  });
}

/* Content stays visible without JavaScript or scroll-animation support. */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  let observer;
  const targets = document.querySelectorAll(".snapshot-cluster, .inside-card, .information-section, .rsvp-panel, .closing-memories");
  function configureReveals() {
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const animation = entry.target.animate([
          {opacity:0.25, transform:"translateY(20px)"},
          {opacity:1, transform:"translateY(0)"}
        ], {duration:650, easing:"cubic-bezier(.2,.65,.3,1)"});
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      });
    }, {threshold:0.08});
    targets.forEach(target => observer.observe(target));
  }
  configureReveals();
  reducedMotion.addEventListener?.("change", configureReveals);
  function pauseWhenHidden() {
    document.body.classList.toggle("motion-paused", document.hidden);
  }
  document.addEventListener("visibilitychange", pauseWhenHidden);
  pauseWhenHidden();
})();

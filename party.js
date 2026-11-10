// Use the published Google Form responder link, never its private /edit URL.
const party = Object.freeze({
  rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdM5HC0R8ricC4-9P_1QMaPsA_pINJOzRDnY5neN-7pqtqB5Q/viewform?usp=header",
  rsvpDeadline: ""
});

(() => {
  if (!party.rsvpUrl) return;
  let url;
  try { url = new URL(party.rsvpUrl); } catch { return; }
  const longForm = url.protocol === "https:" && url.hostname === "docs.google.com" &&
    /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[^/]+\/viewform\/?$/.test(url.pathname);
  const shortForm = url.protocol === "https:" && url.hostname === "forms.gle" && /^\/[^/]+\/?$/.test(url.pathname);
  if (!longForm && !shortForm) return;
  const link = document.getElementById("rsvp-link");
  link.href = url.href;
  link.hidden = false;
  document.getElementById("rsvp-pending").hidden = true;
  document.getElementById("rsvp-preview").hidden = true;
  if (longForm) {
    const embed = document.getElementById("rsvp-embed");
    const embedUrl = new URL(url);
    embedUrl.searchParams.set("embedded", "true");
    embed.src = embedUrl.href;
    embed.hidden = false;
    document.getElementById("rsvp").classList.add("has-embed");
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

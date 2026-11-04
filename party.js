// Use the published Google Form responder link, never its private /edit URL.
const party = Object.freeze({
  rsvpUrl: "",
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

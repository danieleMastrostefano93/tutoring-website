import { getBackend } from "./backend.js";
import { levels, mode, plans, subjects } from "./site-data.js";

const navigation = document.querySelector("#site-nav");
const menuButton = document.querySelector("#menu-toggle");
navigation.classList.add("js-nav");
menuButton.hidden = false;

function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
navigation.addEventListener("click", closeMenu);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});
window.addEventListener("pageshow", closeMenu);

// Feedback dei controlli, senza alterare le azioni native.
const touchFeedbackSelector = ".button, .menu-toggle, .text-link, .site-nav a, .stars label";
let touchFeedback;
let touchPointer;
let touchFeedbackTimer;

function clearTouchFeedback() {
  clearTimeout(touchFeedbackTimer);
  touchFeedback?.classList.remove("is-touch-active");
  touchFeedback = undefined;
  touchPointer = undefined;
}

document.addEventListener("pointerdown", event => {
  clearTouchFeedback();
  if (!event.isPrimary || !["touch", "pen"].includes(event.pointerType)) return;
  const target = event.target instanceof Element ? event.target.closest(touchFeedbackSelector) : null;
  if (!target || target.matches(":disabled, [aria-disabled='true']")) return;
  touchFeedback = target;
  touchPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  target.classList.add("is-touch-active");
}, { passive: true });

document.addEventListener("pointermove", event => {
  if (event.pointerId !== touchPointer?.id) return;
  if (Math.hypot(event.clientX - touchPointer.x, event.clientY - touchPointer.y) > 10) clearTouchFeedback();
}, { passive: true });

document.addEventListener("pointerup", event => {
  if (event.pointerId !== touchPointer?.id) return;
  touchPointer = undefined;
  touchFeedbackTimer = setTimeout(clearTouchFeedback, 200);
}, { passive: true });

document.addEventListener("pointercancel", event => {
  if (event.pointerId === touchPointer?.id) clearTouchFeedback();
}, { passive: true });
document.addEventListener("scroll", clearTouchFeedback, { passive: true, capture: true });
window.addEventListener("blur", clearTouchFeedback);
window.addEventListener("pagehide", clearTouchFeedback);
window.addEventListener("pageshow", clearTouchFeedback);

// Durante lo scroll nativo i Pointer Events possono essere annullati:
// i Touch Events mantengono la posizione del dito fino al suo sollevamento.
let cardTouch;
let touchedCard;
let cardTouchFrame;

function updateTouchedCard() {
  cardTouchFrame = undefined;
  const next = cardTouch
    ? document.elementFromPoint(cardTouch.x, cardTouch.y)?.closest(".plan, .review-card")
    : null;
  if (next === touchedCard) return;
  touchedCard?.classList.remove("is-under-touch");
  touchedCard = next;
  touchedCard?.classList.add("is-under-touch");
}

function clearCardTouch() {
  cardTouch = undefined;
  cancelAnimationFrame(cardTouchFrame);
  updateTouchedCard();
}

function scheduleCardTouch() {
  if (cardTouch && !cardTouchFrame) cardTouchFrame = requestAnimationFrame(updateTouchedCard);
}

document.addEventListener("touchstart", event => {
  if (event.touches.length !== 1) return clearCardTouch();
  const touch = event.touches[0];
  cardTouch = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
  updateTouchedCard();
}, { passive: true });
document.addEventListener("touchmove", event => {
  if (!cardTouch) return;
  if (event.touches.length !== 1) return clearCardTouch();
  const touch = Array.from(event.touches).find(touch => touch.identifier === cardTouch.id);
  if (!touch) return clearCardTouch();
  cardTouch.x = touch.clientX;
  cardTouch.y = touch.clientY;
  scheduleCardTouch();
}, { passive: true });
document.addEventListener("touchend", clearCardTouch, { passive: true });
document.addEventListener("touchcancel", clearCardTouch, { passive: true });
// Anche se il dito resta fermo, il contenuto può scorrere sotto di esso.
// Nessun effetto durante lo scorrimento inerziale dopo il rilascio.
document.addEventListener("scroll", scheduleCardTouch, { passive: true, capture: true });
window.addEventListener("blur", clearCardTouch);
window.addEventListener("pagehide", clearCardTouch);
window.addEventListener("pageshow", clearCardTouch);

class FormError extends Error {}

function formText(data, name) {
  return String(data.get(name) ?? "").trim();
}

function requiredText(data, name, label, max) {
  const value = formText(data, name);
  if (!value || value.length > max) throw new FormError(`Controlla il campo ${label}.`);
  return value;
}

function emailAddress(data) {
  const email = requiredText(data, "email", "email", 150);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new FormError("Inserisci un indirizzo email valido.");
  return email;
}

function phoneNumber(data) {
  const phone = formText(data, "phone").replace(/[\s().-]/g, "");
  if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new FormError("Inserisci un numero di telefono valido, anche con il prefisso internazionale.");
  }
  return phone;
}

function messageIn(element, message, error = false) {
  element.hidden = !message;
  element.textContent = message;
  element.classList.toggle("is-error", error);
}

function userMessage(error) {
  if (error instanceof FormError) return error.message;
  return "L’operazione non è riuscita. Controlla la connessione e riprova tra poco.";
}

function bindForm(form, action, afterReset) {
  const submit = form.querySelector('[type="submit"]');
  const result = form.querySelector(".form-result");
  submit.disabled = false;
  form.addEventListener("input", () => {
    if (result.classList.contains("is-error")) messageIn(result, "");
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    messageIn(result, "");
    try {
      const confirmation = await action(new FormData(form));
      form.reset();
      afterReset?.();
      messageIn(result, confirmation || "");
    } catch (error) {
      messageIn(result, userMessage(error), true);
      if (import.meta.env.DEV && !(error instanceof FormError)) console.error(error);
    } finally {
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

const contact = document.querySelector('[data-form="contact"]');
if (contact) {
  const params = new URLSearchParams(location.search);
  const requestedSubject = params.get("materia");
  const subject = Object.hasOwn(subjects, requestedSubject) ? requestedSubject : "";
  const plan = plans.find(item => item.id === params.get("pacchetto"));
  const selection = document.querySelector("#contact-selection");
  const labels = [subjects[subject], plan && `${plan.title} · ${plan.price} €`].filter(Boolean);
  if (labels.length) {
    selection.textContent = labels.join(" · ");
    selection.hidden = false;
  }
  if (subject) {
    contact.elements.message.placeholder = `Indicami l’argomento di ${subjects[subject].toLowerCase()} e quando vorresti iniziare.`;
  }

  bindForm(contact, async data => {
    const education = formText(data, "education");
    if (!Object.hasOwn(levels, education)) throw new FormError("Scegli il livello scolastico.");
    const request = {
      name: requiredText(data, "name", "nome", 80),
      email: emailAddress(data),
      education,
      phone: phoneNumber(data),
      message: requiredText(data, "message", "messaggio", 1200),
      subject,
      plan: plan?.id ?? ""
    };
    await (await getBackend()).sendContact(request);
    return mode === "demo" ? "Invio di prova completato." : "Messaggio inviato. Ti risponderò all’indirizzo email che hai indicato.";
  });
}

const review = document.querySelector('[data-form="review"]');
if (review) {
  const stars = [...review.querySelectorAll('.stars input[name="rating"]')];
  function updateRating() {
    const rating = Number(review.elements.rating.value);
    for (const star of stars) {
      star.nextElementSibling.classList.toggle("is-filled", Number(star.value) <= rating);
    }
    document.querySelector("#rating-value").textContent = rating ? `${rating} su 5 stelle` : "Seleziona da 1 a 5 stelle.";
    document.querySelector("#review-length").textContent = `${review.elements.review.value.length} / 150 caratteri`;
  }

  review.addEventListener("input", updateRating);
  bindForm(review, async data => {
    const rating = Number(data.get("rating"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new FormError("Scegli una valutazione da 1 a 5 stelle.");
    await (await getBackend()).sendReview({
      rating,
      comment: requiredText(data, "review", "recensione", 150),
      name: formText(data, "name")
    });
    return mode === "demo" ? "Invio di prova completato." : "Grazie per la recensione. Sarà visibile dopo l’approvazione.";
  }, updateRating);
}

function ratingStars(rating, label) {
  const stars = document.createElement("span");
  stars.className = "rating-stars";
  stars.setAttribute("role", "img");
  const score = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(rating);
  stars.setAttribute("aria-label", `${label}: ${score} su 5 stelle`);
  for (let index = 0; index < 5; index++) {
    const star = document.createElement("span");
    star.className = "rating-star";
    star.setAttribute("aria-hidden", "true");
    star.style.setProperty("--fill", `${Math.max(0, Math.min(1, rating - index)) * 100}%`);
    stars.append(star);
  }
  return stars;
}

async function showReviews() {
  const list = document.querySelector("#published-review-list");
  const status = document.querySelector("#review-load-status");
  const inviteTitle = document.querySelector("#review-invite-title");
  status.textContent = "Caricamento delle recensioni…";
  status.hidden = false;
  try {
    const rows = (await (await getBackend()).listReviews()).filter(row =>
      Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5 && typeof row.comment === "string"
    );
    for (const row of rows) {
      const item = document.createElement("li");
      item.className = "review-card";
      const header = document.createElement("div");
      header.className = "review-card-header";
      const quote = document.createElement("span");
      quote.className = "review-quote";
      quote.setAttribute("aria-hidden", "true");
      quote.textContent = "“";
      header.append(ratingStars(row.rating, "Valutazione"), quote);
      const comment = document.createElement("blockquote");
      comment.textContent = row.comment;
      const author = document.createElement("figcaption");
      author.className = "review-author";
      const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : "Anonimo";
      const initial = document.createElement("span");
      initial.className = "review-initial";
      initial.setAttribute("aria-hidden", "true");
      initial.textContent = Array.from(name)[0].toLocaleUpperCase("it");
      const signature = document.createElement("span");
      signature.textContent = name;
      author.append(initial, signature);
      const figure = document.createElement("figure");
      figure.className = "review-card-body";
      figure.append(comment, author);
      item.append(header, figure);
      list.append(item);
    }
    if (rows.length) {
      const average = rows.reduce((sum, row) => sum + row.rating, 0) / rows.length;
      document.querySelector("#review-average").replaceChildren(ratingStars(average, "Valutazione media"));
      document.querySelector("#review-count").textContent = `${rows.length} ${rows.length === 1 ? "recensione ricevuta" : "recensioni ricevute"}`;
      document.querySelector("#published-reviews").hidden = false;
      inviteTitle.textContent = "Racconta la tua esperienza";
    }
    status.hidden = true;
  } catch (error) {
    status.textContent = "Le recensioni non sono disponibili in questo momento.";
    inviteTitle.textContent = "Racconta la tua esperienza";
    if (import.meta.env.DEV) console.error(error);
  }
}

if (document.querySelector("#published-review-list") && mode !== "demo") void showReviews();

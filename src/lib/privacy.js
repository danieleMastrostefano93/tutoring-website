import policy from "./privacy-policy.json" with { type: "json" };

export { policy };
export const privacyComplete = policy.controllerConfirmed && policy.detailsConfirmed
  && ["controllerName", "controllerAddress", "contactEmail", "contactRetention",
    "pendingReviewRetention", "publishedReviewRetention", "technicalRetention", "providerDetails"]
    .every(key => typeof policy[key] === "string" && policy[key].trim());

export function resolvePrivacyUrl(value = "/privacy/") {
  const url = value?.trim() || "/privacy/";
  if (url.startsWith("/") && !url.startsWith("//") && !/[\\\s]/.test(url)) {
    const parsed = new URL(url, "https://tutoronline.invalid");
    if (parsed.origin === "https://tutoronline.invalid") return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) return parsed.href;
  } catch {}
  throw new Error("PRIVACY_URL deve essere un percorso locale assoluto o un URL HTTPS.");
}

export const privacyUrl = resolvePrivacyUrl(import.meta.env?.PRIVACY_URL);

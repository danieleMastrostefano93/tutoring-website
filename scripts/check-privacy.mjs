import { readFileSync } from "node:fs";
const policy = JSON.parse(readFileSync(new URL("../src/lib/privacy-policy.json", import.meta.url)));
const required = ["controllerName", "controllerAddress", "contactEmail", "contactRetention",
  "pendingReviewRetention", "publishedReviewRetention", "technicalRetention", "providerDetails"];
const missing = required.filter(key => typeof policy[key] !== "string" || !policy[key].trim());
if (!policy.controllerConfirmed) missing.push("controllerConfirmed");
if (!policy.detailsConfirmed) missing.push("detailsConfirmed");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policy.contactEmail)) missing.push("contactEmail valido");
if (missing.length) {
  console.error("Informativa incompleta; rilascio live bloccato. Completare src/lib/privacy-policy.json:", missing.join(", "));
  process.exit(1);
}
console.log("Informativa completa: dati del titolare e trattamento confermati.");

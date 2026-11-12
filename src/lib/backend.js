import { mode } from "./site-data.js";

let backendPromise;
function createDemoBackend() {
  return {
    mode,
    async sendContact() {},
    async sendReview() {},
    async listReviews() { return []; }
  };
}

export function getBackend() {
  backendPromise ??= mode === "demo"
    ? Promise.resolve().then(createDemoBackend)
    : import("./firebase-backend.js").then(({ createFirebaseBackend }) => createFirebaseBackend(mode));
  return backendPromise;
}

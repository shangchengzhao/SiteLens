type Listener = () => void;

let failed = false;
const listeners = new Set<Listener>();

export function markMapsAuthFailure() {
  if (failed) return;
  failed = true;
  listeners.forEach((listener) => listener());
}

export function isMapsAuthFailed() {
  return failed;
}

export function subscribeMapsAuthFailure(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

if (typeof window !== "undefined") {
  window.gm_authFailure = markMapsAuthFailure;
}

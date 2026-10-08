/** `crypto.randomUUID` only exists in secure contexts (https/localhost), so fall back elsewhere, e.g. on a LAN IP. */
export const createId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

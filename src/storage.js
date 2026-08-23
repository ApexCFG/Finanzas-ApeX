// Reemplazo de window.storage para uso fuera de Claude (sitio publicado).
// Los datos personales se guardan en el navegador de cada persona (localStorage).
const PREFIX = "cuartel-finanzas:";

function installStorageShim() {
  if (typeof window === "undefined" || window.storage) return;

  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) throw new Error("not found");
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + prefix))
        .map((k) => k.slice(PREFIX.length));
      return { keys, prefix, shared: false };
    },
  };
}

export default installStorageShim;

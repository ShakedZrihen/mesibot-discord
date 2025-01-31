export const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
export const BASE_URL = import.meta.env.VITE_BASE_URL || `http://localhost:3000`;
export const BASE_DOMAIN = BASE_URL?.replace(/^https?:\/\//, "");

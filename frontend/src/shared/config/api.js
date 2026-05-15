const trimTrailingSlash = (value) => value?.trim().replace(/\/$/, "") || "";

const stripEnvAssignment = (value) => {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";

  const match = trimmed.match(/^VITE_API_URL\s*=\s*(.+)$/);
  return match ? match[1].trim() : trimmed;
};

const normalizeProtocol = (value) => value.replace(/^(https?):\/(?!\/)/i, "$1://");

const normalizeApiOrigin = (value) => {
  const rawValue = stripEnvAssignment(value).replace(/^['"]|['"]$/g, "");
  const normalizedValue = normalizeProtocol(trimTrailingSlash(rawValue));

  if (!normalizedValue) return "";

  try {
    const url = new URL(normalizedValue);
    return url.pathname === "/api/v1" ? url.origin : normalizedValue;
  } catch {
    console.warn(`Invalid VITE_API_URL value: ${normalizedValue}`);
    return "";
  }
};

const envApiOrigin = normalizeApiOrigin(import.meta.env.VITE_API_URL);
const devFallbackOrigin = import.meta.env.DEV ? "http://localhost:8000" : "";

export const API_ORIGIN = envApiOrigin || devFallbackOrigin;
export const API_V1_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api/v1` : "";

if (import.meta.env.PROD && !envApiOrigin) {
  console.warn("VITE_API_URL is not configured for this build.");
}

const TRACKING_CODE_PREFIX = "VD";
const TRACKING_CODE_RANDOM_LENGTH = 6;
const TRACKING_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const normalizeTrackingCode = (value = "") =>
  String(value).trim().toUpperCase();

const generateRandomTrackingSuffix = () =>
  Array.from({ length: TRACKING_CODE_RANDOM_LENGTH }, () => {
    const randomIndex = Math.floor(Math.random() * TRACKING_CODE_CHARACTERS.length);
    return TRACKING_CODE_CHARACTERS[randomIndex];
  }).join("");

export const generateTrackingCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${TRACKING_CODE_PREFIX}${date}${generateRandomTrackingSuffix()}`;
};

export const createUniqueTrackingCode = (existingTrackingCodes = []) => {
  const trackingCodeSet = new Set(
    existingTrackingCodes
      .map((code) => normalizeTrackingCode(code))
      .filter(Boolean)
  );

  let trackingCode = generateTrackingCode();

  while (trackingCodeSet.has(trackingCode)) {
    trackingCode = generateTrackingCode();
  }

  return trackingCode;
};

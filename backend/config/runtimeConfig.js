const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_VNPAY_HOST = "https://sandbox.vnpayment.vn";

export const trimTrailingSlashes = (value = "") =>
    String(value || "").trim().replace(/\/+$/, "");

export const getFrontendBaseUrl = () =>
    trimTrailingSlashes(process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL);

export const parseBooleanEnv = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const normalizeVnpayHost = (value) => {
    const rawValue = trimTrailingSlashes(value || DEFAULT_VNPAY_HOST);

    try {
        return new URL(rawValue).origin;
    } catch {
        return rawValue;
    }
};

export const getVnpayRuntimeConfig = () => {
    const vnpayHost = normalizeVnpayHost(
        process.env.VNPAY_HOST ||
        process.env.VNP_HOST ||
        process.env.VNP_URL ||
        DEFAULT_VNPAY_HOST
    );

    return {
        tmnCode: process.env.VNP_TMN_CODE,
        secureSecret: process.env.VNP_HASH_SECRET,
        vnpayHost,
        testMode: parseBooleanEnv(
            process.env.VNPAY_TEST_MODE ?? process.env.VNP_TEST_MODE,
            vnpayHost.includes("sandbox") || process.env.NODE_ENV !== "production"
        ),
        returnUrl: trimTrailingSlashes(process.env.VNP_RETURN_URL || ""),
    };
};

export const requireVnpayRuntimeConfig = () => {
    const config = getVnpayRuntimeConfig();
    const missing = [];

    if (!config.tmnCode) missing.push("VNP_TMN_CODE");
    if (!config.secureSecret) missing.push("VNP_HASH_SECRET");
    if (!config.returnUrl) missing.push("VNP_RETURN_URL");

    if (missing.length > 0) {
        throw new Error(`Missing VNPay environment variables: ${missing.join(", ")}`);
    }

    return config;
};

export const getAllowedFrontendOrigins = () => {
    const origins = [getFrontendBaseUrl()];

    if (process.env.NODE_ENV !== "production") {
        origins.push("http://localhost:5173", "http://localhost:5174", "http://localhost:3000");
    }

    return [...new Set(origins.filter(Boolean))];
};

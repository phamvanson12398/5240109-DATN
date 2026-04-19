import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

let envLoaded = false;
let envMetadata = {
    source: "process",
    loadedAt: null,
    envPath: null,
    loadedFingerprint: null,
    loadedMtimeMs: null
};

const buildFingerprint = (content = "") =>
    crypto.createHash("sha1").update(content).digest("hex").slice(0, 12);

const readEnvFileMetadata = (envPath) => {
    if (!envPath || !fs.existsSync(envPath)) {
        return null;
    }

    const content = fs.readFileSync(envPath, "utf8");
    const stats = fs.statSync(envPath);

    return {
        envPath,
        fingerprint: buildFingerprint(content),
        mtimeMs: stats.mtimeMs
    };
};

export const loadEnvironment = () => {
    if (envLoaded) {
        return;
    }

    const loadedAt = new Date().toISOString();

    if (!process.env.VERCEL) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.resolve(__dirname, "config.env");
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            console.error("Loi khi nap config.env:", result.error);
        } else {
            const count = Object.keys(result.parsed || {}).length;
            console.log(`[loadEnv] Da nap ${count} bien tu ${envPath}`);
        }

        const fileMetadata = readEnvFileMetadata(envPath);
        envMetadata = {
            source: "config.env",
            loadedAt,
            envPath,
            loadedFingerprint: fileMetadata?.fingerprint || null,
            loadedMtimeMs: fileMetadata?.mtimeMs || null
        };
    } else {
        envMetadata = {
            source: "platform-env",
            loadedAt,
            envPath: null,
            loadedFingerprint: null,
            loadedMtimeMs: null
        };
    }

    envLoaded = true;
};

export const getEnvironmentStatus = () => {
    const baseStatus = {
        ...envMetadata,
        canCheckForChanges: false,
        stale: false,
        currentFingerprint: envMetadata.loadedFingerprint,
        currentMtimeMs: envMetadata.loadedMtimeMs,
        missing: false
    };

    if (!envMetadata.envPath) {
        return baseStatus;
    }

    const currentMetadata = readEnvFileMetadata(envMetadata.envPath);

    if (!currentMetadata) {
        return {
            ...baseStatus,
            canCheckForChanges: true,
            currentFingerprint: null,
            currentMtimeMs: null,
            missing: true
        };
    }

    return {
        ...baseStatus,
        canCheckForChanges: true,
        currentFingerprint: currentMetadata.fingerprint,
        currentMtimeMs: currentMetadata.mtimeMs,
        stale: Boolean(
            envMetadata.loadedFingerprint &&
            envMetadata.loadedFingerprint !== currentMetadata.fingerprint
        )
    };
};

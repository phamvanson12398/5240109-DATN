
import connectMongoDatabase from "./db.js";
import { loadEnvironment } from "./loadEnv.js";

let bootstrapPromise = null;

export const initializeApp = async () => {
    loadEnvironment();

    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            await connectMongoDatabase();
        })().catch((error) => {
            bootstrapPromise = null;
            throw error;
        });
    }

    return bootstrapPromise;
};
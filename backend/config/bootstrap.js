
import connectMongoDatabase from "./db.js";
import { loadEnvironment } from "./loadEnv.js";
import { v2 as cloudinary } from "cloudinary";
let bootstrapPromise = null;

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUNDINARY_NAME || process.env.CLOUDINARY_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });
};

export const initializeApp = async () => {
    loadEnvironment();

    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            configureCloudinary();
            await connectMongoDatabase();
        })().catch((error) => {
            bootstrapPromise = null;
            throw error;
        });
    }

    return bootstrapPromise;
};
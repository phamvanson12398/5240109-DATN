
import mongoose from "mongoose";

const globalMongoose = globalThis;

if (!globalMongoose.mongooseCache) {
    globalMongoose.mongooseCache = {
        conn: null,
        promise: null
    };
}

const cached = globalMongoose.mongooseCache;

const connectMongoDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.DB_URI) {
        throw new Error("DB_URI is not defined");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.DB_URI).then((data) => {
            console.log(`Database connected successfully to ${data.connection.host}`);
            return data;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
};

export default connectMongoDatabase;

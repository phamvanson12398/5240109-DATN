import app from '../app.js';
import { initializeApp } from '../config/bootstrap.js';

let isInitialized = false;

export default async function handler(req, res) {
  try {
    if (!isInitialized) {
      await initializeApp();
      isInitialized = true;
    }
    return app(req, res);
  } catch (err) {
    console.error("Vercel Function Error:", err);
    res.status(500).json({ 
        success: false, 
        message: "Serverless Function Execution Error",
        error: err.message, 
        hint: "Check environment variables and server logs" 
    });
  }
}

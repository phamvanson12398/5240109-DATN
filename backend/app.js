import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

import express from 'express';

const app = express();








app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && isAllowedOrigin(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running'
  });
});


export default app;

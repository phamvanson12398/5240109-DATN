import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

import user from './routes/userRoutes.js';
import product from './routes/productRoutes.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from "passport";
import { configurePassport } from "./config/passportConfig.js";
import fileUpload from 'express-fileupload';
import cart from './routes/cartRoutes.js';
import order from './routes/orderRoutes.js';
import admin from './routes/adminRoutes.js';
import settings from './routes/settingsRoutes.js';
import address from './routes/addressRoute.js';
import payment from './routes/paymentRoutes.js';

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(fileUpload());
configurePassport();
app.use(passport.initialize());





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

app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1/cart", cart);
app.use("/api/v1", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1", settings);
app.use("/api/v1/address", address);
app.use("/api/v1", payment);
export default app;

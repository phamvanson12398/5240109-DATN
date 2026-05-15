import { loadEnvironment } from "./config/loadEnv.js";

loadEnvironment();

import express from 'express';
import product from './routes/productRoutes.js';
import user from './routes/userRoutes.js';
import order from './routes/orderRoutes.js';
import admin from './routes/adminRoutes.js';
import settings from './routes/settingsRoutes.js';
import address from './routes/addressRoute.js';
import payment from './routes/paymentRoutes.js';
import cart from './routes/cartRoutes.js';
import vouchers from './routes/promoRoutes.js';
import notifications from './routes/notificationRoutes.js';
import userVouchers from './routes/userVoucherRoutes.js';

import errorHandleMiddleware from './middleware/error.js';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import passport from 'passport';
import { configurePassport } from './config/passportConfig.js';
const app = express();

configurePassport();
app.use(passport.initialize());

app.set('trust proxy', 1);
app.set('query parser', 'extended');

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
].filter(Boolean);

// Allow any localhost port in development
const isAllowedOrigin = (origin) => {
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return true;
    return false;
};

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`
    );

    next();
});

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1", settings);
app.use("/api/v1/address", address);
app.use("/api/v1", payment);
app.use("/api/v1/cart", cart);
app.use("/api/v1/vouchers", vouchers);
app.use("/api/v1/user-vouchers", userVouchers);
app.use("/api/v1/notifications", notifications);

app.use(errorHandleMiddleware);

export default app;

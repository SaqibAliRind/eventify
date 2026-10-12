import express from 'express';
import UserRouter from './Routes/UserRouter.js';
import AdminRouter from './Routes/AdminRouter.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import { xssSanitizeMiddleware } from './Middleware/Sanitize.js';
import logger from './Utils/logger.js';
import Event from './Models/EventSchema.js';

dotenv.config({ quiet: true });

const app = express();

// ─── Trust Proxy Settings (Phase 6) ───────────────────────────────────────────
const trustProxyEnv = process.env.TRUST_PROXY;
if (trustProxyEnv === 'true') {
    app.set('trust proxy', true);
} else if (trustProxyEnv === 'false') {
    app.set('trust proxy', false);
} else if (trustProxyEnv && !isNaN(Number(trustProxyEnv))) {
    app.set('trust proxy', Number(trustProxyEnv));
} else {
    // Default to trusting 1 reverse proxy hop (standard for AWS ALB, Nginx, Render, Heroku)
    app.set('trust proxy', 1);
}

// ─── Request Compression & Logging (Phase 6) ──────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Security: Helmet ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Security: CORS – restrict to env-specified origins or vercel ─────────────
const rawAllowed = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawAllowed.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server (no origin)
        if (!origin) return callback(null, true);
        // Exact match in allowed origins list
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow vercel preview deployments if VERCEL is enabled or in allowed patterns
        if (/\.vercel\.app$/.test(new URL(origin).hostname)) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked: ${origin} is not allowed`));
    },
    credentials: true
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Security: NoSQL Injection & XSS Sanitization ──────────────────────────────
app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        mongoSanitize.sanitize(req.body);
    }
    if (req.params && typeof req.params === 'object') {
        mongoSanitize.sanitize(req.params);
    }
    next();
});
app.use(xssSanitizeMiddleware);

// ─── Health Check Endpoint ───────────────────────────────────────────────────
app.get('/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        success: isDbConnected,
        status: isDbConnected ? 'UP' : 'DEGRADED',
        database: isDbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ─── Dynamic Sitemap Endpoint (Phase 5 item 3) ────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
    try {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const events = await Event.find({ status: { $in: ['published', 'Active'] } }).select('slug _id updatedAt');

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        const staticPages = ['', '/events', '/about', '/contact', '/faq', '/privacy', '/terms'];
        for (const p of staticPages) {
            xml += `  <url><loc>${clientUrl}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }
        for (const ev of events) {
            const loc = `${clientUrl}/events/${ev.slug || ev._id}`;
            const lastmod = ev.updatedAt ? ev.updatedAt.toISOString().split('T')[0] : '';
            xml += `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
        }
        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        logger.error({ err: err.message }, 'Sitemap generation error');
        res.status(500).send('Error generating sitemap');
    }
});

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Strict limiter for sensitive auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 requests per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please wait 15 minutes before trying again.'
    }
});

// Moderate limiter for public API endpoints
const publicApiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 requests per 10 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

// Rate limiter for reviews (prevent spam submissions)
const reviewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // max 10 reviews per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Review rate limit reached. Please wait before submitting more reviews.'
    }
});

// Rate limiter for chat message HTTP endpoints
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, // max 30 messages per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Chat rate limit reached. Please wait a moment.'
    }
});

// ─── Apply Rate Limiting ───────────────────────────────────────────────────────
// Strict on auth endpoints
app.use('/user/login', authLimiter);
app.use('/user/register', authLimiter);
app.use('/user/forgot-password', authLimiter);
app.use('/user/resend-code', authLimiter);

// Public consultation limiter
app.use('/user/consultation', publicApiLimiter);

// Review submission limiter
app.use('/user/reviews', reviewLimiter);

// Chat endpoints limiter
app.use('/user/chat', chatLimiter);
app.use('/admin/chat', chatLimiter);

// ─── Routers ──────────────────────────────────────────────────────────────────
app.use('/user', UserRouter);
app.use('/admin', AdminRouter);

// ─── Global Error Handling Middleware ─────────────────────────────────────────
app.use((err, req, res, next) => {
    // Multer file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`
        });
    }

    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // CORS error
    if (err.message && err.message.includes('CORS blocked')) {
        return res.status(403).json({
            success: false,
            message: err.message
        });
    }

    logger.error({ err }, 'Unhandled Application Error');

    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred',
        ...(isProduction ? {} : { stack: err.stack })
    });
});

export default app;
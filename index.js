import { config } from 'dotenv';
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import timeout from 'connect-timeout';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import client from 'prom-client'

config()
const app = express();

import * as token from './utils/middlewares/token.js'

// Route handlers
import homeHandler from './routes/home.js'
import loginHandler from './routes/login.js'
import signUpHandler from './routes/signUp.js'
import notesHandler from './routes/notes.js'
import pdfHandler from './routes/pdf.js'
import quizHandler from './routes/quiz.js'
import googleAuthHandler from './utils/googleAuth.js'

// Register default metrics (CPU, memory, garbage collection, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // Collect metrics every 5 seconds

// Create a custom counter metric
const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests received',
    labelNames: ['method', 'route', 'status_code'],
});
  
// Create a custom histogram to track request durations
const requestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Histogram for tracking request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5], // Buckets for response time (seconds)
});

const staticFileCaching = { 
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
    }
}

const corsConfig = { 
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true
}

const rateLimitConfig = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 100,
    // handler: (req, res, /*next*/) => {
    //     res.redirect('/?message=' + encodeURIComponent("You have exceeded the 100 requests in 24 hrs limit!"));
    // },
    message: 'You have exceeded the 100 requests in 24 hrs limit!', 
    standardHeaders: true,
    legacyHeaders: false,
})

app.set('view engine','ejs') // Set the view engine to ejs
app.use(express.static('public', staticFileCaching)); 
app.use(express.static('icons')); //PWA icons
app.use(express.urlencoded({extended: true, limit: '10mb'}))
app.use(cookieParser())
// app.use(token.checkToken) // Check for token in cookies
// app.use(helmet()); // Adds various HTTP headers for security
app.use(morgan('common'));
app.use(compression()); // Compress responses
app.use(timeout('60s')); // Request for timeout after specified time
app.use(cors(corsConfig));
// app.use(rateLimitConfig);

// Route redirection
app.use('/',loginHandler)
app.use('/signUp',signUpHandler)
app.use('/home',token.checkToken,homeHandler)
app.use('/notes',token.checkToken,notesHandler)
app.use('/pdf',token.checkToken,pdfHandler)
app.use('/quiz',token.checkToken,quizHandler)
app.use('/auth/google', googleAuthHandler)

// Middleware to track metrics
app.use((req, res, next) => {
    const end = requestDuration.startTimer({ method: req.method, route: req.path });
    res.on('finish', () => {
      end({ status_code: res.statusCode });
      requestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
    });
    next();
});

app.use((err, req, res, next) => {
    if (req.timedout) {
        res.redirect('/home?message=' + encodeURIComponent("Request timed out. Please try again"));
    } else {
        next(err);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
    // console.log(`Metrics exposed on ${port}/metrics`);
})
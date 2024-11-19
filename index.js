import { config } from 'dotenv';
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import timeout from 'connect-timeout';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
config()
const app = express();

// Route handlers
import homeHandler from './routes/home.js'
import loginHandler from './routes/login.js'
import signUpHandler from './routes/signUp.js'
import notesHandler from './routes/notes.js'
import pdfHandler from './routes/pdf.js'
import quizHandler from './routes/quiz.js'
import googleAuthHandler from './utils/googleAuth.js'

app.set('view engine','ejs') // Set the view engine to ejs
app.use(express.static('public',{ //CSS, JS, Images
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
    }
})); 
app.use(express.static('icons')); //PWA icons
app.use(express.urlencoded({extended: true, limit: '10mb'}))
app.use(cookieParser())
app.use(helmet()); // Adds various HTTP headers for security
app.use(morgan('common'));
app.use(compression()); // Compress responses
app.use(timeout('5s')); // Request for timeout after specified time
app.use(haltOnTimedout); // Middleware to halt on timeout
app.use(cors({ // CORS management
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true
}));
app.use(rateLimit({ // Rate limiting
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));

// Route redirection
app.use('/',loginHandler)
app.use('/signUp',signUpHandler)
app.use('/home',homeHandler)
app.use('/notes',notesHandler)
app.use('/pdf',pdfHandler)
app.use('/quiz',quizHandler)
app.use('/auth/google', googleAuthHandler)

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

function haltOnTimedout(req, res, next) {
    if (!req.timedout) 
        next();
    else
        res.redirect('/home?message=' + encodeURIComponent("Request timed out. Please try again"));
}

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
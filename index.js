import { config } from 'dotenv';
import express, { json } from 'express'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import * as db from './database.js'
// __dirname is not available in ECS6 modules, creating an equivalent using impoirt.meta.url and url module
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Route handlers
import homeHandler from './routes/home.js'
import loginHandler from './routes/login.js'
import signUpHandler from './routes/signUp.js'
import notesHandler from './routes/notes.js'
import pdfHandler from './routes/pdf.js'
import quizHandler from './routes/quiz.js'
import googleAuthHandler from './utils/googleAuth.js'

config()
const app = express();

app.set('view engine','ejs') // Set the view engine to ejs
app.use(express.static('public')); //CSS, JS, Images
app.use(express.static('notes')); //PDF files
app.use(express.static('icons')); //PWA icons
app.use(express.static('.well-known')); 
app.use(express.static('routes')); //Route handlers
app.use(express.urlencoded({extended: true})) // To parse req.body
app.use(cookieParser()) // To parse cookies

app.use((req, res, next) => { // Middleware to log requests
    console.log(`Request URL: ${req.url}`);
    next();
});

// Route redirection
app.use('/',loginHandler)
app.use('/signUp',signUpHandler)
app.use('/home',homeHandler)
app.use('/notes',notesHandler)
app.use('/pdf',pdfHandler)
app.use('/quiz',quizHandler)
app.use('/auth/google', googleAuthHandler)

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
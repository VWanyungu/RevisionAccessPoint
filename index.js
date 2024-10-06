import { config } from 'dotenv';
import express, { json } from 'express'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
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

const keys = {
  google: {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // redirectURI: 'http://localhost:3030/auth/google/callback'
    redirectURI: process.env.REDIRECT_URI
  }
};
const client = new OAuth2Client(keys.google.clientID, keys.google.clientSecret, keys.google.redirectURI) 
// Generate the URL for Google authentication
app.get('/auth/google', (req, res) => {
    console.log("Authenticating via google...")
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']
    })
    res.redirect(url)
});

// Handle the callback after Google has authenticated the user
app.get('/auth/google/callback', async (req, res) => {
    console.log("Callback from google...")
    const code = req.query.code;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: keys.google.clientID
    })
    const payload = ticket.getPayload();
    console.log("1. Payload loaded: " + payload.email)
    if(!payload){
        return res.redirect('/?message=' + encodeURIComponent("User does not exist. Please sign up."))
    }
    try{
        const loginStatus = await db.login(payload.email, payload.sub)
        if(!loginStatus){
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'lax',
            })
            let signUpstatus = await db.signUp(`${payload.given_name} ${payload.family_name}`, payload.email, payload.sub)
            if(!signUpstatus){
                return res.redirect('/?message=' + encodeURIComponent("User does not exist. Error occured during sign up."))
            }
        }
        const user = { "email": payload.email, "role": loginStatus.role}
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents access from JavaScript
            sameSite: 'lax', // Prevents CSRF
            maxAge: 3600000, // 1 hour in milliseconds
        })
        if(res.get('Set-Cookie')){ // Check if cookie was set
            return res.redirect('/home')
        }
    }catch(e){
        console.log(`Error posting login page: ${e}`)
        return res.redirect('/signUp?message=' + encodeURIComponent("An error occurred. Please try again."))
    }
    
})


app.listen(3030,()=>{
    console.log('Server is running on port 3030');
})
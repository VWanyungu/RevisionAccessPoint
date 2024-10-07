import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'
import * as db from '../database.js'
import { config } from 'dotenv';
config()
const router = express.Router();

const keys = {
    google: {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectURI: 'http://localhost:3030/auth/google/callback'
        // redirectURI: process.env.REDIRECT_URI
    }
}
const client = new OAuth2Client(keys.google.clientID, keys.google.clientSecret, keys.google.redirectURI) 
// Generate the URL for Google authentication
router.get('/', (req, res) => {
    console.log("Authenticating via google...")
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']
    })
    res.redirect(url)
})

router.get('/callback', async (req, res) => {
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

export default router;
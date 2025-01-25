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
        redirectURI: process.env.REDIRECT_URI
    }
}
const client = new OAuth2Client(keys.google.clientID, keys.google.clientSecret, keys.google.redirectURI) 

router.get('/', (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']
    })
    res.redirect(url)
})

// Callback route after google login
router.get('/callback', async (req, res) => {
    const code = req.query.code;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: keys.google.clientID
    })
    const payload = ticket.getPayload(); // data from google
    
    if(!payload){
        return res.redirect('/?message=' + encodeURIComponent("User not found"))
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
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents access from JavaScript
            sameSite: 'lax', // Prevents CSRF
            maxAge: 3600000 * 24, // 1 hour in milliseconds
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
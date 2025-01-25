import express from 'express';
import jwt from 'jsonwebtoken';
import * as db from '../database.js'
import cache from '../utils/cache.js';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',(req,res)=>{
    try{
        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
        });

        let message = req.query.message
        res.render('index.ejs',{message})
    }catch(e){
        console.log(`Error loading login page: ${e}`)
    }
})

router.post('/', async (req,res)=>{
    try{
        // Get the request body and validate
        let email = req.body.email
        let password = req.body.password
        if(!req.body || email == "" || password == ""){
            return res.redirect('/?message=' + encodeURIComponent("Fill in all the details"))
        }

        // Login user
        const userData = await db.login(email,password)
        if(!userData){
            res.redirect('/?message=' + encodeURIComponent("Email or password is wrong"));
        }

        // Create token and redirect
        const user = { "email": userData.email, "role":userData.role }
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents access from JavaScript
            sameSite: 'strict', // Prevents CSRF
            maxAge: 3600000 * 24, // 1 hour in milliseconds
        })
        res.redirect('/home?message=' + encodeURIComponent("Login successful"))
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

export default router;
import express from 'express';
import jwt from 'jsonwebtoken';
import * as db from '../database.js'
import cache from '../utils/cache.js';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',cache(),(req,res)=>{
    try{
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
        let email = req.body.email
        let password = req.body.password
        if(!req.body || email == "" || password == ""){
            return res.redirect('/?message=' + encodeURIComponent("Fill in all the details"))
        }
        const userData = await db.login(email,password)
        if(!userData){
            res.redirect('/?message=' + encodeURIComponent("Email or password is wrong"));
        }
        const user = { "email": userData.email, "role":userData.role }
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents access from JavaScript
            sameSite: 'strict', // Prevents CSRF
            maxAge: 3600000, // 1 hour in milliseconds
        })
        res.redirect('/home?message=' + encodeURIComponent("Login successful"))
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

export default router;
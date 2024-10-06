import express from 'express';
import jwt from 'jsonwebtoken';
import bycrypt from 'bcrypt';
import * as db from '../database.js'
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',(req,res)=>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict',
            path: '/'
        });

        let message = req.query.message
        res.render('index.ejs',{message})
    }catch(e){
        console.log(`Error loading login page: ${e}`)
    }
})

router.post('/', async (req,res)=>{
    if(!req.body){
        res.redirect('/')
    }
    try{
        let email = req.body.email
        let password = req.body.password
        const userData = await db.login(email,password)
        if(!userData){
            res.redirect('/?message=' + encodeURIComponent("User does not exist"));
        }
        const user = { "email": userData.email, "role":userData.role }
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true, // Prevents access from JavaScript
            sameSite: 'strict', // Prevents CSRF
            maxAge: 3600000, // 1 hour in milliseconds
        })
        res.redirect('/home')
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

export default router;
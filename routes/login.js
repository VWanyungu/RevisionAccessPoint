import express from 'express';
import jwt from 'jsonwebtoken';
import * as db from '../database.js'
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',(req,res)=>{
    try{
        let message = req.query.message
        res.render('index.ejs',{message})
    }catch(e){
        console.log(`Error loading login page: ${e}`)
    }
})

router.post('/', async (req,res)=>{
    try{
        if(!req.body){
            res.redirect('/')
        }else {
            let email = req.body.email
            let password = req.body.password
        
            const userData = await db.login(email,password)

            if(userData){
                const user = { "email": userData.email, "role":userData.role }

                const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            
                res.cookie('token', token, {
                    httpOnly: true, // Prevents access from JavaScript
                    sameSite: 'strict', // Prevents CSRF
                    maxAge: 3600000 // 1 hour in milliseconds
                });

                console.log(`User logged in: ${userData.email}`)
            
                res.redirect('/home')
            }else {
                console.log(userData)

                // The message query parameter is used to display a message to the user
                res.redirect('/?message=' + encodeURIComponent("User does not exist"));
            }
        }
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

export default router;
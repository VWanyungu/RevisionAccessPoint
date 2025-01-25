import express from 'express';
import * as db from '../database.js'
const router = express.Router();

router.get('/',(req,res)=>{
    try{
        let message = req.query.message

        res.render('signUp.ejs',{message})
    }catch(e){
        console.log(`Error loading sign up page: ${e}`)
    }
})

router.post('/',async (req,res)=>{
    try{
        // Get the request body and validate
        let username = req.body.signUpName
        let password = req.body.signUpPassword
        let email = req.body.signUpEmail
        if(!req.body || email == "" || password == "" || username == ""){
            return res.redirect('/signUp?message=' + encodeURIComponent("Fill in all the details"))
        }

        // Sign up user
        try{
            let signUpstatus = await db.signUp(username, email, password)
            if(!signUpstatus){
                res.redirect('/signUp?message=' + encodeURIComponent("User exists. Please login."))
            }
            
            res.redirect('/?message=' + encodeURIComponent("Sign up successful"));
        }catch(e){
            console.log(e)
            res.redirect('/signUp?message=' + encodeURIComponent("An error ocurred. Please try again."))
        }
    }catch(e){
        console.log(`Error posting sign up page: ${e}`)
        return res.redirect('/signUp?message=' + encodeURIComponent("An error occured"))
    }
})

export default router;
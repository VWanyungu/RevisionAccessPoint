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
        if(!req.body){
            res.redirect('/')
        }else{
            let username = req.body.signUpName
            let password = req.body.signUpPassword
            let email = req.body.signUpEmail
            try{
                let signUpstatus = await db.signUp(username, email, password)
                if(!signUpstatus){
                    res.redirect('/?message=' + encodeURIComponent("User exists. Please login."))
                }else{
                    res.redirect('/?message=' + encodeURIComponent("User successfully added to the system"));
                }
                // res.redirect('/')
            }catch(e){
                console.log(e)
                res.redirect('/signUp?message=' + encodeURIComponent("An error ocurred. Please try again."))
            }
        }
    }catch(e){
        console.log(`Error posting sign up page: ${e}`)
    }
})

export default router;
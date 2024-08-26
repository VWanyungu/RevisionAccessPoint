import express from 'express';
import * as db from '../database.js'
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
        
            const loginStatus = await db.login(email,password)

            if(loginStatus){
                res.redirect('/home')
            }else {
                console.log(loginStatus)
                // The message query parameter is used to display a message to the user
                res.redirect('/?message=' + encodeURIComponent("User does not exist"));
            }
        }
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

export default router;
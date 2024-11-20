import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import cache from '../utils/cache.js';
config()
const router = express.Router();

router.get('/',cache(),(req,res)=>{
    const token = req.cookies.token
    let message = req.query.message
    if (!token) {
        return res.status(200).redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"))
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    try{    
        res.status(200).render('home.ejs',{message})
    }catch(e){
        console.log(`Error loading home page: ${e}`)
    }
})

router.post('/',(req,res)=>{
    try{
        let school = req.body.school
        let department = req.body.department
        let year = req.body.year
        let unit = req.body.unit
        if(!req.body || school == "" || department == "" || year == "" || unit == ""){
            return res.redirect('/home?message=' + encodeURIComponent("Please fill in all the details"))
        }
        res.redirect('/notes/'+school+'/'+department+'/'+year+'/'+unit+'?message=' + encodeURIComponent("Data fetched successfully"))
    }catch(e){
        console.log(`Error posting home page: ${e}`)
    }
})

export default router;
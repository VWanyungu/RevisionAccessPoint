import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',(req,res)=>{
    console.log('GET /home route hit')
    const token = req.cookies.token
    let message = req.query.message
    if (!token) {
        return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"))
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    try{    
        res.render('home.ejs',{message})
    }catch(e){
        console.log(`Error loading home page: ${e}`)
    }
})

router.post('/',(req,res)=>{
    console.log('POST /home route hit')
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
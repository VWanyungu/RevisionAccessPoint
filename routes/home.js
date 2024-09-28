import express from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/',(req,res)=>{
    console.log('GET /home route hit')

    const token = req.cookies.token
    if (!token) {
        return res.render('index.ejs')
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    console.log(req.user)

    try{    
        res.render('home.ejs', {user: req.user})
    }catch(e){
        console.log(`Error loading home page: ${e}`)
    }
})

router.post('/',(req,res)=>{
    console.log('POST /home route hit')
    try{
        console.log(req.body)
        let school = req.body.school
        let department = req.body.department
        let year = req.body.year
        let unit = req.body.unit
    
        res.redirect('/notes/'+school+'/'+department+'/'+year+'/'+unit)
    }catch(e){
        console.log(`Error posting home page: ${e}`)
    }
})

export default router;
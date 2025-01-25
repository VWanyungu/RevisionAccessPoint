import express from 'express';
import cache from '../utils/cache.js';
const router = express.Router();

router.get('/',cache(),(req,res)=>{
    let message = req.query.message

    res.status(200).render('home.ejs',{message})
})

router.post('/',(req,res)=>{
    try{
        // Get the request body
        let school = req.body.school
        let department = req.body.department
        let year = req.body.year
        let unit = req.body.unit

        // Validte the request body
        if(!req.body || school == "" || department == "" || year == "" || unit == ""){
            return res.redirect('/home?message=' + encodeURIComponent("Please fill in all the details"))
        }

        res.redirect('/notes/'+school+'/'+department+'/'+year+'/'+unit+'?message=' + encodeURIComponent("Data fetched successfully"))
    }catch(e){
        console.log(`Error posting home page: ${e}`)
    }
})

export default router;
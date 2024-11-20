import express from 'express';
import jwt from 'jsonwebtoken'
import axios from 'axios';
import cache from '../utils/cache.js';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file',cache(),(req, res) => {
    const token = req.cookies.token
    let message = req.query.message
    if (!token) {
        return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"))
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified
    try{
        const { school, department, year, unit, folder, file } = req.params;
        // The path is used to locate the pdf file
        // const path = `/${school}/${department}/${year}/${unit}/${folder}/${file}`

        // The notes path is used to navigate back to the notes page
        const notesPath = `/notes/${school}/${department}/${year}/${unit}`

        res.render('pdf.ejs', {
            notesPath,
            message,
            file
        });
    }catch(e){
        console.log(`Error loading pdf page: ${e}`)
        return res.redirect('/notes/'+school+'/'+department+'/'+year+'/'+unit+'?message=' + encodeURIComponent("Error loading the pdf. Please try again"))
    }
})

export default router;
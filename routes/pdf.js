import express from 'express';
import cache from '../utils/cache.js';
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file',cache(),(req, res) => {
    let message = req.query.message

    try{
        const { school, department, year, unit, folder, file } = req.params;

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
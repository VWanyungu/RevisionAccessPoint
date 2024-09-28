import express from 'express';
import jwt from 'jsonwebtoken'
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file', (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.render('index.ejs')
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified

    try{
        const school = req.params.school
        const department = req.params.department
        const year = req.params.year
        const unit = req.params.unit
        const folder = req.params.folder
        const file = req.params.file
        // The path is used to locate the pdf file
        const path = `/${school}/${department}/${year}/${unit}/${folder}/${file}`
        // The notes path is used to navigate back to the notes page
        const notesPath = `/notes/${school}/${department}/${year}/${unit}`

        res.render('pdf.ejs',{path,notesPath});
    }catch(e){
        console.log(`Error loading pdf page: ${e}`)
    }
})

export default router;
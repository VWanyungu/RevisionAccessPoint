import express from 'express';
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file', (req, res) => {
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
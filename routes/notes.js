import express from 'express'
import jwt from 'jsonwebtoken'
// __dirname is not available in ECS6 modules, creating an equivalent using impoirt.meta.url and url module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'
import { config } from 'dotenv';
config()
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); //Current directory

router.get('/:school/:department/:year/:unit', async (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.render('index.ejs')
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified

    const fs = (await import('fs')).promises;
    const fs2 = (await import("fs"))

    try{
        const school = req.params.school;
        const department = req.params.department;
        const year = req.params.year;
        const unit = req.params.unit;
        const notes = path.join(`./notes/${school}/${department}/${year}/${unit}/classNotes`);
        const exams = path.join(`./notes/${school}/${department}/${year}/${unit}/exams`);
        const cats = path.join(`./notes/${school}/${department}/${year}/${unit}/cats`);

        // Tutorials are stored in a text file, this functions reads the file, the split function returns a promise
        let tutorials
        function split() {
            return new Promise((resolve, reject) => {
                fs2.readFile(`./notes/${school}/${department}/${year}/${unit}/tutorials.txt`, 'utf8', function(err, data) {
                    if (err) {
                        return reject(err);
                    }
                    tutorials = data.split('\n');
                    resolve(tutorials.pop());
                });
            });
        }
       
        // The pool of promises is resolved when all promises in the pool are resolved
        Promise.all([
            fs.readdir(notes),
            fs.readdir(exams),
            fs.readdir(cats),
            split()
        ])
        .then(([files1, files2, files3]) => {
            // split()
            res.render('notes.ejs', {
                // Paths
                notesPath: notes,
                examsPath: exams,
                catsPath: cats,
                // Data
                school: school,
                department: department,
                year: year,
                unit: unit,
                // Actual files
                notes: files1,
                exams: files2,
                cats: files3,
                tutorials: tutorials
            });
        }).catch(err => {
            console.log('Unable to scan directory: ' + err);
            res.redirect('/home');
        });
    }catch(err){
        console.log(`Error getting notes: ${err}`);
        res.redirect('/home');
    } 
});

export default router;
const express = require('express');

const app = express();
app.set('viewengine','ejs')
app.use(express.static('public'))
app.use(express.static('notes'))
app.use(express.urlencoded({extended: true}))


// Login page
app.get('/',(req,res)=>{
    res.render('index.ejs')
})

// Sign up page
app.get('/signUp',(req,res)=>{
    res.render('signUp.ejs')
})

// Home page
app.get('/home',(req,res)=>{
    res.render('home.ejs')
})

app.post('/home',(req,res)=>{
    let school = req.body.school
    let department = req.body.department
    let year = req.body.year
    let unit = req.body.unit

    res.redirect('/notes/'+school+'/'+department+'/'+year+'/'+unit)
})

// Notes page
app.get('/notes/:school/:department/:year/:unit', (req, res) => {
    const fs = require('fs').promises
    const path = require('path')

    if (req.params.school && req.params.department && req.params.year && req.params.unit) {
        const school = req.params.school;
        const department = req.params.department;
        const year = req.params.year;
        const unit = req.params.unit;

        const directoryPath1 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/classNotes`);
        const directoryPath2 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/exams`);
        const directoryPath3 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/cats`);

        Promise.all([
            fs.readdir(directoryPath1),
            fs.readdir(directoryPath2),
            fs.readdir(directoryPath3)
        ]).then(([files1, files2, files3]) => {
            res.render('notes.ejs', {
                school: school,
                department: department,
                year: year,
                unit: unit,
                notes: files1,
                exams: files2,
                cats: files3
            });
        }).catch(err => {
            console.log('Unable to scan directory: ' + err);
            res.redirect('/home');
        });
    } else {
        res.redirect('/home');
    }
});

app.get('/pdf', (req, res) => {
    res.render('pdf.ejs');
})


app.listen(3030,()=>{
    console.log('Server is running on port 3030');
})
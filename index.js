import express from 'express'
import {promises as fs} from 'fs'
import path from 'path'

// __dirname is not available in ECS6 modules, creating an equivalent using impoirt.meta.url and url module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('viewengine','ejs')

// Static files
app.use(express.static('public'));
app.use(express.static('notes'));
app.use(express.static('icons'));

// Access to database and database functions
import * as db from './database.js'
import * as quiz from './quiz.js'

// To parse req.body
app.use(express.urlencoded({extended: true}))


// Login page
app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.post('/', (req,res)=>{
    let username = req.body.username
    let password = req.body.password

    if(db.login(username,password)){
        res.redirect('/home')
    }else{
        res.redirect('/')
    }

})

// Sign up page
app.get('/signUp',(req,res)=>{
    res.render('signUp.ejs')
})

app.post('/signUp',(req,res)=>{
    let username = req.body.username
    let password = req.body.password
    let year = req.body.year
    let sem = req.body.sem
    let school = req.body.school
    let department = req.body.department
    let course = req.body.course

    try{
        db.addUser(username,password,year,sem,school,department,course)
        console.log(`User ${username} successfuly added to the system`)
        res.redirect('/')
    }catch(e){
        res.send(e)
    }
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
    try{
        const school = req.params.school;
        const department = req.params.department;
        const year = req.params.year;
        const unit = req.params.unit;

        // const test = `notes/${school}/${department}/${year}/${unit}`

        const directoryPath1 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/classNotes`);
        const directoryPath2 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/exams`);
        const directoryPath3 = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/cats`);

        Promise.all([
            fs.readdir(directoryPath1),
            fs.readdir(directoryPath2),
            fs.readdir(directoryPath3)
        ]).then(([files1, files2, files3]) => {
            res.render('notes.ejs', {
                // test,
                notesPath: directoryPath1,
                examsPath: directoryPath2,
                catsPath: directoryPath3,
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
    }catch(err){
        console.log(err);
        res.redirect('/home');
    } 
});

// PDF page
app.get('/pdf/:school/:department/:year/:unit/:folder/:file', (req, res) => {
    const school = req.params.school
    const department = req.params.department
    const year = req.params.year
    const unit = req.params.unit
    const folder = req.params.folder
    const file = req.params.file
    const path = `/${school}/${department}/${year}/${unit}/${folder}/${file}`
    const notesPath = `/notes/${school}/${department}/${year}/${unit}`
    res.render('pdf.ejs',{path,notesPath});

})

// Quiz page
app.get('/quiz', (req,res)=>{
    const questions = quiz.getQuestions()
    let name = 1
    res.render('quiz.ejs',{questions,name})
})

app.post('/quiz',async (req,res)=> {
    // Converting the req.body object into an array based on values
    const answers = Object.values(req.body) 
    const questions = quiz.getQuestions()

    // Array of indices of the failed questions
    let failedQuestions = []

    // Comparing actual answers and received answers, to obtain the score
    function getScore(){
        let score = 0
        for(let i = 0; i < questions.length; i++){
            if(questions[i].answer === answers[i]){
                score++
            }else{
                failedQuestions.push(i)
            }
        }
        return score
    }

    let finalScore = await getScore()

    res.render('quizResults.ejs',{finalScore, failedQuestions, questions})
})


app.listen(3030,()=>{
    console.log('Server is running on port 3030');
})
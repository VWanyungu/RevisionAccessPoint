import express, { json } from 'express'
import {promises as fs} from 'fs'
import path from 'path'

import axios from "axios"
import FormData from "form-data"
import fs2 from "fs"

// __dirname is not available in ECS6 modules, creating an equivalent using impoirt.meta.url and url module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Access to database and database functions
import * as db from './database.js'
import * as quiz from './quiz.js' //Hard coded questions
import * as load from './load.js'
// import * as chatpdf from './chatpdf.js'

const app = express();
app.set('viewengine','ejs')

// Static files
app.use(express.static('public'));
app.use(express.static('notes'));
app.use(express.static('icons'));
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
app.get('/quiz/:school/:department/:year/:unit/:folder/:file', async (req,res)=>{
    const school = req.params.school
    const department = req.params.department
    const year = req.params.year
    const unit = req.params.unit
    const folder = req.params.folder
    const file = req.params.file
    const path = `/${school}/${department}/${year}/${unit}`
    const backPath = `/notes/${school}/${department}/${year}/${unit}`
    const filePath = `notes/${school}/${department}/${year}/${unit}/${folder}/${file}`

    let srcId
    let result
    let finalResult

    // chatPdf("notes/SCI/Computer_Science/Year_2.2/Data_structures_and_algorithms/classNotes/DATA STRUCTURE.pdf").then(question)

    async function chatPdf(path){
        const formData = new FormData();
        formData.append(
        "file",
        // fs.createReadStream("notes/SCI/Computer_Science/Year_2.2/Data_structures_and_algorithms/classNotes/DATA STRUCTURE.pdf")
        fs2.createReadStream(path)
        );

        const options = {
        headers: {
            "x-api-key": "sec_xwl0QnnbRpHokK77RB16MPV4gdgbG0jM",
            ...formData.getHeaders(),
        },
        };

        return axios
        .post("https://api.chatpdf.com/v1/sources/add-file", formData, options)
        .then((response) => {
            srcId = response.data.sourceId
            console.log("Source ID:", srcId);
        })
        .catch((error) => {
            console.log("Error pdf:", error.message);
            console.log("Response pdf:", error.response.data);
        });
    }

    async function question(){
        // Asking the question
        const config = {
            headers: {
                "x-api-key": "sec_xwl0QnnbRpHokK77RB16MPV4gdgbG0jM",
                "Content-Type": "application/json",
            },
        };
        
        const data = {
            sourceId: `${srcId}`,
            messages: [
                {
                "role": "user",
                "content": "Given the PDF file I provided, generate 20 multiple choice questions and their answers. Ensure that the questions are neither too hard nor too easy. Each question should have four choices, with the correct answer among them. Use information from the pdf file to generate the questions if possible.",
                },
            ],
        };
        
        return axios
            .post("https://api.chatpdf.com/v1/chats/message", data, config)
            .then((response) => {
                result = response.data.content
                console.log("Response to prompt given")
                toJson(result)
                // console.log("Result:", result);
            })
            .catch((error) => {
                console.error("Error question:", error.message);
                console.log("Response question:", error.response.data);
            });
    }

    function toJson(sampleData){
        try{
            if (sampleData === undefined) {
                throw new Error("No data found");
            }

            var questions = sampleData.split('\n\n').filter(function(item) {
                return item.trim().length > 0;
            });
            
            var mcqData = [];
            questions.forEach(function(question) {
                var lines = question.split('\n');
                var qData = {
                    question: lines[0].trim(),
                    options: [],
                    answer: lines[lines.length - 1].trim()
                };
                for (var i = 1; i < lines.length - 1; i++) {
                    qData.options.push(lines[i].trim());
                }
                mcqData.push(qData);
            });
        
            let display = JSON.stringify(mcqData)
            finalResult = JSON.parse(display)
            console.log("Sample Result:", finalResult[1])
        }catch(error){
            console.log(error.message)
        }
    
    }

    try{
        
        await chatPdf(filePath);
        await question();
    
        // Getting rid of non-question response from the AI
        finalResult.pop()
        finalResult.shift()
    
        let answers = []
        let questions = []
    
        // Getting answers and questions to make them availbale in the scoring post route 
        finalResult.forEach((q)=>{
            answers.push(q.answer)
            //removing special characters, in order for the questions to be passed as a parameter in the post route
            let temp = q.question
            temp = temp.replace(/[?,/]/g, '')
            questions.push(temp)
        })
    
        let scoreRouteAnswers = JSON.stringify(answers)
        let scoreRouteQuestions = JSON.stringify(questions)
    
        res.render('quiz.ejs',{finalResult, backPath, path, unit, scoreRouteAnswers, scoreRouteQuestions,})

    }catch(error){
        console.log(error)
        res.redirect(backPath)
    }
    
})

app.post('/quiz/:school/:department/:year/:unit/:answers/:questions',async (req,res)=> {
    // Add options feature soon
    // console.log(req.params.questions)
    // console.log(req.params.answers)
    try{
        const school = req.params.school
        const department = req.params.department
        const year = req.params.year
        const unit = req.params.unit
        const backPath = `/notes/${school}/${department}/${year}/${unit}`
        const questions = JSON.parse(decodeURIComponent(req.params.questions))
        const correctAnswers = JSON.parse(decodeURIComponent(req.params.answers)) 
        const answers = Object.values(req.body) 
        let failedQuestions = []

        async function getScore(){
            let score = 0
            for(let i = 0; i < answers.length; i++){
                if(correctAnswers[i].includes(answers[i])){
                    score++
                }else{
                    failedQuestions.push({
                        question: questions[i],
                        answer: correctAnswers[i]
                    })
                }
            }
            return score
        }

        let finalScore = await getScore()

        res.render('quizResults.ejs',{finalScore, failedQuestions, questions, backPath, unit})
    }catch(err){
        console.log("Posting error" + err)
    }

    
})


app.listen(3030,()=>{
    console.log('Server is running on port 3030');
})
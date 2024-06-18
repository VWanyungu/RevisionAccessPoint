import { config } from 'dotenv';
import express, { json } from 'express'
import path from 'path'
import swal from 'sweetalert';
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

config(); // Load environment variables
const app = express();
app.set('viewengine','ejs')
app.use(express.static('public')); //CSS, JS, Images
app.use(express.static('notes')); //PDF files
app.use(express.static('icons')); //PWA icons
app.use(express.static('.well-known')); 
app.use(express.urlencoded({extended: true})) // To parse req.body

// Login page
app.get('/',(req,res)=>{
    try{
        let message = req.query.message
        res.render('index.ejs',{message})
    }catch(e){
        console.log(`Error loading login page: ${e}`)
    }
})

app.post('/', async (req,res)=>{
    try{
        if(!req.body){
            res.redirect('/')
        }else {
            let email = req.body.email
            let password = req.body.password
        
            const loginStatus = await db.login(email,password)

            if(loginStatus){
                res.redirect('/home')
            }else {
                // The message query parameter is used to display a message to the user
                res.redirect('/?message=' + encodeURIComponent("User does not exist"));
            }
        }
    }catch(e){
        console.log(`Error posting login page: ${e}`)
    }
})

// Sign up page
app.get('/signUp',(req,res)=>{
    try{
        let message = req.query.message
        res.render('signUp.ejs',{message})
    }catch(e){
        console.log(`Error loading sign up page: ${e}`)
    }
})

app.post('/signUp',async (req,res)=>{
    try{
        if(!req.body){
            res.redirect('/signUp')
        }else{
            let username = req.body.signUpName
            let password = req.body.signUpPassword
            let email = req.body.signUpEmail
    
            console.log(req.body)
    
            try{
                await db.signUp(username, email, password)
                res.redirect('/?message=' + encodeURIComponent("User successfully added to the system"));
                // res.redirect('/')
            }catch(e){
                console.log(e)
                res.redirect('/signUp?message=' + encodeURIComponent("An error ocurred. Please try again."))
            }
        }
    }catch(e){
        console.log(`Error posting sign up page: ${e}`)
    }
})

// Home page
app.get('/home',(req,res)=>{
    try{    
        res.render('home.ejs')
    }catch(e){
        console.log(`Error loading home page: ${e}`)
    }
})

app.post('/home',(req,res)=>{
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

// Notes page
app.get('/notes/:school/:department/:year/:unit', async (req, res) => {
    const fs = (await import('fs')).promises;
    const fs2 = (await import("fs"))

    try{
        const school = req.params.school;
        const department = req.params.department;
        const year = req.params.year;
        const unit = req.params.unit;

        const notes = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/classNotes`);
        const exams = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/exams`);
        const cats = path.join(__dirname, `notes/${school}/${department}/${year}/${unit}/cats`);

        // Tutorials are stored in a text file, this functions reads the file, the split function returns a promise
        let tutorials
        function split() {
            return new Promise((resolve, reject) => {
                fs2.readFile(`notes/${school}/${department}/${year}/${unit}/tutorials.txt`, 'utf8', function(err, data) {
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

// PDF page
app.get('/pdf/:school/:department/:year/:unit/:folder/:file', (req, res) => {
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


// Quiz page
app.get('/quiz/:school/:department/:year/:unit/:folder/:file',async (req,res)=>{
    const school = req.params.school
    const department = req.params.department
    const year = req.params.year
    const unit = req.params.unit
    const folder = req.params.folder
    const file = req.params.file
    const path = `/${school}/${department}/${year}/${unit}`
    // Route to navigate back to the notes page
    const backPath = `/notes/${school}/${department}/${year}/${unit}`
    const filePath = `notes/${school}/${department}/${year}/${unit}/${folder}/${file}`

    let srcId
    let result
    let finalResult

    // Uploading the pdf file to the chatpdf API, creating chat id
    async function chatPdf(path){
        const formData = new FormData();
        formData.append(
        "file",fs2.createReadStream(path)
        );

        const options = {
            headers: {
                
                "x-api-key": process.env.CHAT_API_KEY,
                ...formData.getHeaders(),
            },
        }

        return axios
        .post("https://api.chatpdf.com/v1/sources/add-file", formData, options)
        .then((response) => {
            srcId = response.data.sourceId
            console.log("Source ID generated");
        })
        .catch((error) => {
            console.log("Error uploading pdf to ChatPdf:", error.message);
            console.log("Response pdf:", error.response.data);
        });
    }

    // Asking the question
    async function question(){
        const config = {
            headers: {
                "x-api-key": process.env.CHAT_API_KEY,
                "Content-Type": "application/json",
            },
        };
        
        const data = {
            sourceId: srcId,
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
        })
        .catch((error) => {
            console.error("Error asking question:", error.message);
            console.log("Response question:", error.response.data);
        });
    }

    // Formatting response to give an array of objects of questions, options and answers
    function toJson(sampleData){
        try{
            if (sampleData === undefined) {
                throw new Error("No data found");
            }

            // Splitting the data into questions
            // After every 2 \n escape sequences, a new question begins
            var questions = sampleData.split('\n\n').filter(function(item) {
                return item.trim().length > 0;
            });
            
            // ------ The structure of each question from above is:
            // --question \n
            // ----option1 \n
            // ----option2 \n
            // ----option3 \n
            // --answer \n

            // Getting Answers and options for each question
            var mcqData = [];
            questions.forEach(function(question) {
                // Splitting after every \n escape sequence
                var lines = question.split('\n'); 
                var qData = {
                    // First line is the question, last line is the answer
                    question: lines[0].trim(),
                    options: [],
                    answer: lines[lines.length - 1].trim()
                };
                // Options are between the question and the answer
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
        async function load(){
            await chatPdf(filePath);
            await question();
        }

        load()
        .then(()=>{
             // Getting rid of non-question response from the AI
            finalResult.pop()
            finalResult.shift()
        
            // Getting answers and questions to make them availbale in the scoring post route 
            let answers = []
            let questions = []
            finalResult.forEach((result)=>{
                answers.push(result.answer)
                //removing special characters, in order for the questions to be passed as a parameter in the post route
                let temp = result.question
                temp = temp.replace(/[?,/]/g, '')
                questions.push(temp)
            })
        
            // To be passed in the post request route as parameters
            let scoreRouteAnswers = JSON.stringify(answers)
            let scoreRouteQuestions = JSON.stringify(questions)
        
            res.render('quiz.ejs',{finalResult, backPath, path, unit, scoreRouteAnswers, scoreRouteQuestions,})
        })
    }catch(error){
        console.log(`Error getting chat id or getting questions: ${error}`)
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
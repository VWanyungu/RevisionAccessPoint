import express from 'express';
import FormData from "form-data"
import jwt from 'jsonwebtoken'
import fs2 from "fs"
import axios from "axios"
import { config } from 'dotenv';
config()
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file',async (req,res)=>{
    const token = req.cookies.token
    let message
    if (!token) {
        return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"))
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified

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
                "content": `Given the PDF file I provided, generate exactly 20 multiple choice questions and their answers. Each question should have four choices, with the correct answer clearly indicated. The questions should be of moderate difficulty, using information from the PDF file. Ensure there are no duplicate questions or answers, and that each answer provided is one of the four choices listed. 
                
                Please provide the questions in the following format:

                1. What is the purpose of the 'do...while' loop in C programming?
                A) It is used when a loop condition is tested at the beginning of each loop pass.
                B) It is used when a loop condition is tested at the end of each loop pass.
                C) It is used when a loop condition is never tested.
                D) It is used when a loop condition is tested randomly.
                Answer: B) It is used when a loop condition is tested at the end of each loop pass.

                2. In a 'for' loop, what does the initialization part do?
                A) Sets the initial value of the loop control variable
                B) Determines whether the loop will repeat
                C) Defines the amount by which the loop control variable will change
                D) None of the above
                Answer: A) Sets the initial value of the loop control variable

                Note: The questions should be in the same format as the examples above.
                `,
                },
            ],
        };
        
        return axios
        .post("https://api.chatpdf.com/v1/chats/message", data, config)
        .then((response) => {
            result = response.data.content
            console.log("Response to prompt given")
            // console.log(result)
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

            // console.log("Final Result:", finalResult)
        
            res.render('quiz.ejs',{finalResult, backPath, path, unit, message})
        })
    }catch(error){
        console.log(`Error getting chat id or getting questions: ${error}`)
        return res.redirect(`${backPath}?message=${encodeURIComponent("Error generating quiz")}`)
    }
    
})

router.post('/:school/:department/:year/:unit',async (req,res)=> {
    // Add options feature soon
    let message
    const {school, department, year, unit} = req.params 
    const backPath = `/notes/${school}/${department}/${year}/${unit}`
    try{
        const reqBody = Object.values(req.body) 
        const questions = reqBody[0]
        const correctAnswers = reqBody[1]
        const answers = reqBody.slice(2)

        // console.log({questions, correctAnswers, answers})
        let failedQuestions = []
        async function getScore(){
            let score = 0
            for(let i = 0; i < answers.length; i++){
                if(correctAnswers[i].includes(answers[i])){
                    score++
                }else{
                    // console.log(`Failed answer: ${answers[i]}, correct answer: ${correctAnswers[i]}`)
                    failedQuestions.push({
                        question: questions[i],
                        answer: correctAnswers[i]
                    })
                }
            }
            return score
        }
        let finalScore = await getScore()
        res.render('quizResults.ejs',{finalScore, failedQuestions,unit,questions, backPath, unit, message})
    }catch(err){
        console.log("Posting error" + err)
        return res.redirect(`${backPath}?message=${encodeURIComponent("Error calculating results")}`)
    }
})

export default router;
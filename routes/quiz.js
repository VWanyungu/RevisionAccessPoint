import express from 'express';
import * as chatpdf from '../utils/chatpdf.js'
import { config } from 'dotenv'

config()
const router = express.Router();

router.get('/:school/:department/:year/:unit/:folder/:file', async (req,res)=>{
    // Get the parameters from the URL
    const school = req.params.school
    const department = req.params.department
    const year = req.params.year
    const unit = req.params.unit
    const folder = req.params.folder
    const file = req.params.file

    let message
    const path = `/${school}/${department}/${year}/${unit}`
    const backPath = `/notes/${school}/${department}/${year}/${unit}` // Route to navigate back to the notes page

    try{
        async function load(){
            await chatpdf.chatPdf(file) // Upload the pdf file to chatpdf (or url to the file)
            await chatpdf.question() // Generate questions from the pdf file
        }

        load()
        .then(()=>{
             // Getting rid of non-question response from the AI
            let finalResult = chatpdf.finalResult
            finalResult.pop()
            finalResult.shift()
        
            res.render('quiz.ejs',{finalResult, backPath, path, unit, message})
        })
    }catch(error){
        console.log(`Error getting chat id or getting questions: ${error}`)
        return res.redirect(`${backPath}?message=${encodeURIComponent("Error generating quiz")}`)
    }
    
})

router.post('/:school/:department/:year/:unit',async (req,res)=> {
    // Get the parameters from the URL
    const {school, department, year, unit} = req.params
    
    let message
    const backPath = `/notes/${school}/${department}/${year}/${unit}` // Route to navigate back to the notes page

    try{
        // Convert the body object to an array and get the questions, correct answers and user answers
        const reqBody = Object.values(req.body)
        const questions = reqBody[0]
        const correctAnswers = reqBody[1]
        const answers = reqBody.slice(2)

        let failedQuestions = []
        let finalScore = 0

        // Calculate the score
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
        finalScore = await getScore()

        res.render('quizResults.ejs',{finalScore, failedQuestions,unit,questions, backPath, unit, message})

    }catch(err){
        console.log("Posting error" + err)
        return res.redirect(`${backPath}?message=${encodeURIComponent("Error calculating results")}`)
    }
})

export default router;
import axios from "axios"
import FormData from "form-data"
import fs from "fs"
import { config } from 'dotenv';
export {chatPdf, question, finalResult}
config()

let srcId // Source ID of the uploaded pdf file
let result
let finalResult

// Upload url/pdf file to chatPDF
async function chatPdf(path){
    const data = {
        url: path,
    };
    const options = {
        headers: {
            "x-api-key": process.env.CHAT_API_KEY,
        },
    }
    return axios
    .post("https://api.chatpdf.com/v1/sources/add-url", data, options) //use https://api.chatpdf.com/v1/sources/add-file for file upload
    .then((response) => {
        srcId = response.data.sourceId
        console.log("Source ID generated");
    })
    .catch((error) => {
        console.log("Error uploading pdf to ChatPdf:", error.message);
    });
}

// Making the prompt to generate questions
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
        toJson(result)
    })
    .catch((error) => {
        console.error("Error asking question:", error.message);
        console.log("Response question:", error.response.data);
    });
}

// Convert the response to JSON
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






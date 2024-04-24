import axios from "axios"
import FormData from "form-data"
import fs from "fs"

let srcId
let result
let finalResult

// chatPdf("notes/SCI/Computer_Science/Year_2.2/Data_structures_and_algorithms/classNotes/DATA STRUCTURE.pdf").then(question)


async function chatPdf(path){
    const formData = new FormData();
    formData.append(
    "file",
    // fs.createReadStream("notes/SCI/Computer_Science/Year_2.2/Data_structures_and_algorithms/classNotes/DATA STRUCTURE.pdf")
    fs.createReadStream(path)
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
            "content": "generate 20 sample multiple choice questions and their answers for me based on the topic of the pdf file I uploaded.",
            },
        ],
    };
    
    axios
        .post("https://api.chatpdf.com/v1/chats/message", data, config)
        .then((response) => {
            result = response.data.content
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
        console.log("Final Result:", finalResult)
    }catch(error){
        console.log(error.message)
    }
    
}






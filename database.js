import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config();

const supabaseUrl = 'https://ptktlornnngqvzbbisaq.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)









let users = [
    {
        name: "John",
        password: "1234",
        year: 2,
        sem: 2,
        school: "Computing and informatics",
        department: "Computer Science",
        course: "Computer Science"
    },
    {
        name: "John Doe",
        password: "1234",
        year: 2,
        sem: 2,
        school: "Computing and informatics",
        department: "Computer Science",
        course: "Computer Science"
    },
    {
        name: "admin",
        password: "admin",
        year: 2,
        sem: 2,
        school: "Computing and informatics",
        department: "Computer Science",
        course: "Computer Science"
    },

]

export {login, addUser}

function login(email,password){
    // let user = users.find(user => user.name == name && user.password == password)
    // if(user){
    //     return true
    // }
    // else {
    //     return false
    // }
    return true
}

function addUser(name,password,year,sem,school,department,course){
    users.push({
        name: name,
        password: password,
        year: year,
        sem: sem,
        school: school,
        department: department,
        course: course
    })
}



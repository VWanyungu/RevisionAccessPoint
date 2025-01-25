import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
import bcrypt from 'bcrypt'
export {login, signUp, checkUser}
config();

// Connect to database
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
if(supabase){
    console.log("Connected to database")
}else{
    console.log("Error in database.js")
}


// Insert users
async function signUp(name, email, password){
    try{
        // If user exists, return false
        if(await checkUser(email)){
            return false
        }

        // Hash password
        const saltRounds = 10
        let hash = await bcrypt.hash(password, saltRounds)
        if(!hash){
            console.error('\nError hashing signUp data')
            return false
        }

        // Insert user
        const { data, error } = await supabase
        .from('Users')
        .insert([
            { name: `${name}`, email: `${email}`, password: `${hash}`},
        ])
        if (error) {
            console.error('\nError inserting data during signUp:', error)
            return false
        }
        
        // Return true if successful
        return true
    }catch(e){
        console.log("\nError in signUp: " + e)
        return false
    }
}

// Login users
async function login (email, password){
    try{
        // Check if user exists
        const { data, error } = await supabase
        .from('Users')
        .select("*")
        .eq('email', email)
        if(error) {
            console.error('\nError fetching data during login:', error)
            return false
        }

        // User not found
        if(data && data.length == 0){
            console.log("\nUser not found")
            return false
        }

        // Check if password matches
        let passwordMatch = await bcrypt.compare(password, data[0].password)
        if(!passwordMatch){
            console.log("\nLogin password incorrect")
            return false
        }

        // Return user data
        return data[0]
    }catch(e){
        console.log("\nError in login: " + e)
        return false
    }
}

// Check if email exists
async function checkUser (email){
    try{
        // Check if email exists
        const { data, error } = await supabase
        .from('Users')
        .select()
        .eq('email', email)
        if(error) {
            console.error('\n Error checking email in database: ', error)
            return false
        }

        // Email does not exist
        if(data && data.length == 0){
            console.log("\nEmail does not exist")
            return false
        }

        // Email exists
        return true
    }catch(e){
        console.log("\nError checking email: " + e)
        return false
    }
}

// signUp("Doe", "john@gmail.com", "1234")
// login("john@gmail.com", "1234")
// login("doe2@gmail.com", "1234")


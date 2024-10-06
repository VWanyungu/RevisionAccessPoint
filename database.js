import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
import bcrypt from 'bcrypt'
export {login, signUp, checkUser}
config();
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
        if(await checkUser(email)){
            return false
        }

        const saltRounds = 10
        let hash = await bcrypt.hash(password, saltRounds)
        if(!hash){
            console.error('\nError hashing signUp data')
            return false
        }
        const { data, error } = await supabase
        .from('Users')
        .insert([
            { name: `${name}`, email: `${email}`, password: `${hash}`},
        ])
        if (error) {
            console.error('\nError inserting data during signUp:', error)
            return false
        }
        console.log('\nSignUp successful: ' + email)
        return true
    }catch(e){
        console.log("\nError in signUp: " + e)
        return false
    }
}

async function login (email, password){
    try{
        const { data, error } = await supabase
        .from('Users')
        .select("*")
        .eq('email', email)
        if(error) {
            console.error('\nError fetching data during login:', error)
            return false
        }
        if(data && data.length == 0){
            console.log("\nUser not found during login")
            return false
        }
        console.log(`\nLogin data fetched successfully: ` + data[0].email)

        let passwordMatch = await bcrypt.compare(password, data[0].password)
        if(!passwordMatch){
            console.log("\nLogin password incorrect")
            return false
        }
        console.log("\nLogin successful")
        return data[0]
    }catch(e){
        console.log("\nError in login: " + e)
        return false
    }
}

async function checkUser (email){
    try{
        const { data, error } = await supabase
        .from('Users')
        .select()
        .eq('email', email)

        if(error) {
            console.error('\n Error checking email in database: ', error)
            return false
        }else{
            if(data && data.length > 0){
                console.log(`\nEmail exists`)
                return true
            }else if(data && data.length == 0){
                console.log("\nEmail does not exist")
                return false
            }
        }
    }catch(e){
        console.log("\nError checking email: " + e)
        return false
    }
}

// signUp("Doe", "john@gmail.com", "1234")
// login("john@gmail.com", "1234")
// login("doe2@gmail.com", "1234")


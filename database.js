import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
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
        const { data, error } = await supabase
        .from('Users')
        .select()
        .eq('email', email)
        // .eq('password', password)

        if(error) {
            console.error('Error fetching data:', error)
            return false
        }else{
            if(data && data.length > 0){
                console.log(`User already exists: ` + data[0].email)
                return false
            }else if(data && data.length == 0){
                const { data, error } = await supabase
                .from('Users')
                .insert([
                    { name: `${name}`, email: `${email}`, password: `${password}`},
                ])
                if (error) {
                    console.error('Error inserting data:', error)
                } else {
                    console.log('Data inserted successfully: ' + email)
                    return true
                }
            }
        }  
    }catch(e){
        console.log("Error in signUp")
        console.log(e)
        return false
    }
}

// Login: checking whether the user exists in the database
async function login (email, password){
    try{
        const { data, error } = await supabase
        .from('Users')
        .select()
        .eq('email', email)
        .eq('password', password)

        if(error) {
            console.error('Error fetching data:', error)
            return false
        }else{
            if(data && data.length > 0){
                console.log(`Data fetched successfully: ` + data[0].email)
                return true
            }else if(data && data.length == 0){
                console.log("User not found")
                return false
            }
        }
    }catch(e){
        console.log("Error in login")
        console.log(e)
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
            console.error('Error checking data:', error)
            return false
        }else{
            if(data && data.length > 0){
                console.log(`User exists: ` + data[0].email)
                return true
            }else if(data && data.length == 0){
                console.log("User does not exist")
                return false
            }
        }
    }catch(e){
        console.log("Error in checking user")
        console.log(e)
        return false
    }
}

// signUp("Doe", "john@gmail.com", "1234")
// login("john@gmail", "1234")


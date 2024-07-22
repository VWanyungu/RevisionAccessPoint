import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export {login, signUp}

// Insert users
async function signUp(name, email, password){
    const { data, error } = await supabase
    .from('Users')
    .insert([
        { name: `${name}`, email: `${email}`, password: `${password}` },
    ])

    if (error) {
        console.error('Error inserting data:', error)
    } else {
        console.log('Data inserted successfully:', data)
        return true
    }
}

// Login: checking whether the user exists in the database
async function login (email, password){
    const { data, error } = await supabase
    .from('Users')
    .select()
    .eq('email', email)
    .eq('password', password)
    

    if (error) {
        console.error('Error fetching data:', error)
    } else {
        // console.log(`Data fetched successfully: ${data[0].email}`,)
        return true
    }
}

// signUp("Doe", "john@gmail.com", "1234")
// login("john@gmail", "1234")


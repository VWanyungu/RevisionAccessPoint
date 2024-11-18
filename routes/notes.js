import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper function to list files in a Supabase storage path
async function listFiles(bucketName, path) {
  try {
    console.log(`Listing files in bucket: ${bucketName} and path: ${path}...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path);

    if (error) throw error;
    // console.log(`Files in ${path}:`, data);
    // Filter out directories and return only file names
    return data
    //   .filter(item => !item.metadata) // Directories have metadata, files don't
      .map(item => item.name);
  } catch (error) {
    console.error(`Error listing files in ${path}:`, error);
    throw error;
  }
}

// Helper function to read tutorial file content
// async function readTutorials(bucketName, path) {
//     try {
//       // First check if file exists
//       const { data: fileExists } = await supabase.storage
//         .from(bucketName)
//         .list(path.split('/').slice(0, -1).join('/'));
  
//       const fileName = path.split('/').pop();
//       if (!fileExists?.some(file => file.name === fileName)) {
//         console.log(`No tutorials file found at ${path}`);
//         return [];
//       }
  
//       // Download the file
//       const { data, error } = await supabase.storage
//         .from(bucketName)
//         .download(path);
  
//       if (error) {
//         console.error('Error downloading file:', error);
//         throw error;
//       }
  
//       // Handle the blob data
//       if (!data) {
//         console.log('No data received from storage');
//         return [];
//       }
  
//       // Convert blob to text
//       const text = await data.text();
      
//       // Split by newlines and filter out empty lines
//       const tutorials = text
//         .split('\n')
//         .map(line => line.trim())
//         .filter(line => line.length > 0);
  
//       console.log(`Tutorials in ${path}:`, tutorials);
//       return tutorials;
//     } catch (error) {
//       console.error(`Error reading tutorials file:`, error);
//       throw error;
//     }
//   }

// Helper function to get signed URLs for all files in a directory
async function getSignedUrlsForFiles(bucketName, path, files) {
  const signedUrls = {};
  for (const file of files) {
    const filePath = `${path}/${file}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600);
    
    if (error) {
      console.error(`Error creating signed URL for ${filePath}:`, error);
      continue;
    }
    
    signedUrls[file] = data.signedUrl;
  }
  return signedUrls;
}

router.get('/:school/:department/:year/:unit', async (req, res) => {
  const token = req.cookies.token;
  let message = req.query.message;
  
  if (!token) {
    return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"));
  }
  
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  req.user = verified;

  try {
    const { school, department, year, unit } = req.params;
    const bucketName = 'notes';

    const fs2 = (await import("fs"))
    let tutorials
    function split() {
        return new Promise((resolve, reject) => {
            fs2.readFile(`./notes/${school}/${department}/${year}/${unit}/tutorials.txt`, 'utf8', function(err, data) {
                if (err) {
                    return reject(err);
                }
                tutorials = data.split('\n');
                resolve(tutorials.pop());
            });
        });
    }

    // Construct paths
    const notesPath = `${school}/${department}/${year}/${unit}/classNotes`;
    const examsPath = `${school}/${department}/${year}/${unit}/exams`;
    const catsPath = `${school}/${department}/${year}/${unit}/cats`;
    const tutorialsPath = `${school}/${department}/${year}/${unit}/tutorials.txt`;

    // Get all files and tutorials in parallel
    const [noteFiles, examFiles, catFiles] = await Promise.all([
      listFiles(bucketName, notesPath),
      listFiles(bucketName, examsPath),
      listFiles(bucketName, catsPath),
    //   readTutorials(bucketName, tutorialsPath)
    split()
    ]);

    // console.log(`Turotials: ${tutorialsTemp}`)

    // Get signed URLs for all files in parallel
    const [noteUrls, examUrls, catUrls] = await Promise.all([
      getSignedUrlsForFiles(bucketName, notesPath, noteFiles),
      getSignedUrlsForFiles(bucketName, examsPath, examFiles),
      getSignedUrlsForFiles(bucketName, catsPath, catFiles)
    ]);

    res.render('notes.ejs', {
      // File data with signed URLs
      notes: noteFiles,
      exams: examFiles,
      cats: catFiles,
      noteUrls,
      examUrls,
      catUrls,
      tutorials,
      // Path information
      school,
      department,
      year,
      unit,
      // Message
      message
    });

  } catch (err) {
    console.error(`Error getting notes:`, err);
    res.redirect('/home?message=' + encodeURIComponent("Error getting notes"));
  }
});

export default router;
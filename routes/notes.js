import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import cache from '../utils/cache.js';
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
    // console.log(`Listing files in bucket: ${bucketName} and path: ${path}...`);
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

// Helper function to get signed URLs for all files in a directory
async function getSignedUrlsForFiles(bucketName, path, files) {
  const signedUrls = {};
  for (const file of files) {
    const filePath = `${path}/${file}`;
    // console.log(`Creating signed URL for ${filePath}...`);
    // const { data, error } = await supabase.storage
    //   .from(bucketName)
    //   .createSignedUrl(filePath, 3600);
    
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    // console.log(data.publicUrl)
    
    // if (error) {
    //   console.error(`Error creating signed URL for ${filePath}:`, error);
    //   continue;
    // }
    
    signedUrls[file] = data.publicUrl
    // console.log(`Signed URL for ${filePath}:`, data.signedUrl);
  }
  return signedUrls;
}

router.get('/:school/:department/:year/:unit',cache(),async (req, res) => {
  const token = req.cookies.token;
  let message = req.query.message;
  
  if (!token) {
    return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"));
  }
  
  // const verified = jwt.verify(token, process.env.JWT_SECRET);
  // req.user = verified;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        if (err.name === 'TokenExpiredError') {
            return res.redirect('/?message=' + encodeURIComponent("Session expired. Please login again"));
        }
        return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"));
    }
    req.user = decoded;
  });

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

// console.log({
//     // File data with signed URLs
//     notes: noteFiles,
//     exams: examFiles,
//     cats: catFiles,
//     noteUrls,
//     examUrls,
//     catUrls,
//     tutorials,
//     // Path information
//     school,
//     department,
//     year,
//     unit,
//     // Message
//     message
//   })
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
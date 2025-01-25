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
    // Get a list of files from the bucket, in the path
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path);
    if (error) throw error;

    // Filter and return only file names
    return data.map(item => item.name);

  } catch (error) {
    console.error(`Error listing files in ${path}:`, error);
    throw error;
  }
}

// Helper function to get signed URLs for all files in a directory
async function getSignedUrlsForFiles(bucketName, path, files) {
  const signedUrls = {};
  for (const file of files) {
    const filePath = `${path}/${file}`;
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    signedUrls[file] = data.publicUrl
  }
  return signedUrls;
}

// Helper function to read tutorials from the tutorials.txt file
let tutorials
function split(school, department, year, unit) {
  return new Promise(async(resolve, reject) => {
      const fs2 = (await import("fs"))
      fs2.readFile(`./notes/${school}/${department}/${year}/${unit}/tutorials.txt`, 'utf8', function(err, data) {
          if (err) {
              return reject(err);
          }
          tutorials = data.split('\n');
          resolve(tutorials.pop());
      });
  });
}

router.get('/:school/:department/:year/:unit',cache(),async (req, res) => {
  let message = req.query.message;

  try {
    // Get path parameters
    const { school, department, year, unit } = req.params;

    // Define bucket name 
    const bucketName = 'notes';

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
      split(school, department, year, unit)
    ]);

    // Get signed URLs for all files in parallel (public access URLs)
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
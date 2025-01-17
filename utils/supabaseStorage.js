import { createClient } from '@supabase/supabase-js';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import PQueue from 'p-queue';
import { config } from 'dotenv';
config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

class SupabaseUpload {
  constructor(config = {}) {
    this.config = {
      concurrency: config.concurrency || 3,
      allowedExtensions: config.allowedExtensions || null, // e.g., ['.jpg', '.png']
      ignoredFolders: config.ignoredFolders || ['.git', 'node_modules'],
      maxRetries: config.maxRetries || 3,
      ...config
    };

    this.queue = new PQueue({ concurrency: this.config.concurrency });
    this.progressBar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: '{bar} {percentage}% | {value}/{total} | {filename}'
    });

    this.stats = {
      totalFiles: 0,
      uploadedFiles: 0,
      failedFiles: 0,
      skippedFiles: 0
    };
  }

  async scanDirectory(localPath) {
    let files = [];
    const items = await readdir(localPath);

    for (const item of items) {
      const fullPath = join(localPath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        if (!this.config.ignoredFolders.includes(item)) {
          const subFiles = await this.scanDirectory(fullPath);
          files = files.concat(subFiles);
        }
      } else {
        const ext = extname(item).toLowerCase();
        if (!this.config.allowedExtensions || 
            this.config.allowedExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  async uploadFile(localPath, bucketName, remotePath, progressBar) {
    let attempts = 0;
    while (attempts < this.config.maxRetries) {
      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(remotePath, localPath, {
            upsert: true,
            // cacheControl: '3600',
            contentType: 'application/pdf',
          });

        if (error) throw error;

        progressBar.increment();
        this.stats.uploadedFiles++;
        return true;
      } catch (error) {
        attempts++;
        if (attempts === this.config.maxRetries) {
          console.error(`Failed to upload ${localPath} after ${attempts} attempts:`, error);
          this.stats.failedFiles++;
          return false;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  }

    sanitizePath(path) {
        return path
        // Replace spaces with underscores
        .replace(/\s+/g, '_')
        // Remove special characters except underscores and dots
        .replace(/[^a-zA-Z0-9_.\/-]/g, '')
        // Replace multiple slashes with single slash
        .replace(/\/+/g, '/')
        // Remove leading/trailing slashes
        .replace(/^\/|\/$/g, '')
        // Convert backslashes to forward slashes
        .replace(/\\/g, '/');
    }

    getRemotePath(localPath, basePath) {
        // Find the index of 'notes' in the path
        const notesIndex = localPath.indexOf('notes');
        if (notesIndex === -1) {
            throw new Error('Notes directory not found in path');
        }

        // Get the path starting from 'notes'
        const relevantPath = localPath.slice(notesIndex + 6); // +6 to skip 'notes/'
        
        // Split path into directory and filename
        const pathParts = relevantPath.split(/[/\\]/);
        const fileName = pathParts.pop();
        
        // Sanitize directory path and filename separately
        const sanitizedDirs = pathParts.map(dir => this.sanitizePath(dir));
        const sanitizedFileName = this.sanitizePath(fileName);
        
        // Combine them back together
        return [...sanitizedDirs, sanitizedFileName].join('/');
    }

  async uploadFolder(localPath, bucketName) {
    try {
      console.log(colors.cyan('Scanning directory...'));
      const files = await this.scanDirectory(localPath);
      this.stats.totalFiles = files.length;

      if (files.length === 0) {
        console.log(colors.yellow('No files found to upload!'));
        return;
      }

      console.log(colors.green(`Found ${files.length} files to upload`));
      const mainProgress = this.progressBar.create(files.length, 0, { filename: 'Total Progress' });

      const uploadPromises = files.map(file => {
        const remotePath = this.getRemotePath(file, localPath);
        return this.queue.add(() => 
          this.uploadFile(file, bucketName, remotePath, mainProgress)
        );
      });

      await Promise.all(uploadPromises);
      this.progressBar.stop();

      // Print summary
      console.log(colors.green('\nUpload Summary:'));
      console.log(colors.white(`Total files: ${this.stats.totalFiles}`));
      console.log(colors.green(`Successfully uploaded: ${this.stats.uploadedFiles}`));
      console.log(colors.red(`Failed uploads: ${this.stats.failedFiles}`));
      console.log(colors.yellow(`Skipped files: ${this.stats.skippedFiles}`));

    } catch (error) {
      console.error(colors.red('Fatal error during upload:'), error);
      throw error;
    }
  }
}

//Usage example
async function main() {
  const uploadManager = new SupabaseUpload({
    concurrency: 3,
    allowedExtensions: ['.jpg', '.png', '.pdf', '.doc', '.docx', '.txt'], // null to allow all
    ignoredFolders: ['.git', 'node_modules', 'temp', 'pdfjs-4.0.379-dist'],
    maxRetries: 3
  });

  const localFolderPath = '../../../../Documents/notes'
  const bucketName = 'notes';

  console.log(colors.cyan('Starting bulk upload...'));
  await uploadManager.uploadFolder(localFolderPath, bucketName);
}

main().catch(console.error);

export default SupabaseUpload;
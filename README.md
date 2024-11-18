# Supabase file storage with SupabaseUpload class in utils

**Initialization:**

* SupabaseUpload class constructor takes an argument of a configuration object

        const uploadManager = new SupabaseUpload({

        concurrency: , 

        allowedExtensions: [],

        ignoredFolders: [],

        maxRetries: 

        });

    - concurrency: *integer* showing how many files will be uploaded at the same time

    - allowedExtensions: *array* of allowed extensions. Use null to allow all file extensions e.g *['.pdf', '.txt']*

    - ignoredFolders: *array* of ignored folders e.g *['.git', 'node_modules', 'temp']*

    - maxRetries: *integer* showing how many times the script will attempt to reupload a file

**Usage:**

* Specify the path to the local folder containing the files

* Specify the bucket name

* Use the uploadFolder() method in the SupabaseUpload class


        const localFolderPath = './path/toFolder'

        const bucketName = 'bktName'

        await uploadManager.uploadFolder(localFolderPath, bucketName);
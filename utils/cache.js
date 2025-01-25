import mcache from 'memory-cache';

// To cache responses
export let cache = () => {
    return (req,res, next) => {
        // This line generates a unique key for the cache based on the request URL. 
        // The key is prefixed with __express__ to avoid potential conflicts with other keys.
        let key = '__express__' + req.originalUrl || req.url;

        // Check if the response is already cached
        let cachedBody = mcache.get(key);
        if(cachedBody){
            res.send(cachedBody);
            return;
        }else{
            // If the response is not cached, we override the res.send function to cache 
            // the response before sending it.
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, 1 * 60 * 60 * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

export default cache;
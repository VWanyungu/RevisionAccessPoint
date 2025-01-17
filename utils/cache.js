import mcache from 'memory-cache';

export let cache = () => {
    return (req,res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if(cachedBody){
            res.send(cachedBody);
            return;
        }else{
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, 24 * 60 * 60 * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
}

export default cache;
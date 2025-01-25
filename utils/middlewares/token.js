import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config()

export {checkToken}

const checkToken = (req, res, next) => {
    let token = false
    req.cookies ?  token = req.cookies.token : null
    if (!token) {
        return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"))
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.redirect('/?message=' + encodeURIComponent("Session expired. Please login again"));
            }
            return res.redirect('/?message=' + encodeURIComponent("Unauthorized. Please login"));
        }
        req.user = decoded;
        next()
    });
}
import { TokenDecode } from "../utility/TokenUtility.js";

export const AuthMiddleware = async (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }
    else{
        let DecodedToken = await TokenDecode(token);
        if(!DecodedToken){
            return res.status(401).json({
                message: 'Authentication failed'
            });
        }
        else {
            let user_id = DecodedToken['id'];
            let user_email = DecodedToken['email'];
            req.headers.email = user_email;
            req.headers.user_id = user_id;
            next();
        }
    }
}
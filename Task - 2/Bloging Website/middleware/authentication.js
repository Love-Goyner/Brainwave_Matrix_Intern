const { verifyToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return next();
        }
        try {
            const userPayload = verifyToken(tokenCookieValue)
            req.user = userPayload;
        } catch (error) {
            
        }

        return next();
    }
}

module.exports = checkForAuthenticationCookie;
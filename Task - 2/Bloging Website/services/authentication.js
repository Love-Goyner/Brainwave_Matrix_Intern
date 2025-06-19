const JWT = require("jsonwebtoken");

const secret = "@superMan#123";

function generateTokenForUser(user) {
    const payload = {
        _id: user._id,
        fullName : user.fullName,
        email: user.email,
        role: user.role,
        profileImageURL: user.profileImageURL
    }
     const token = JWT.sign(payload, secret);
     return token;
}

function verifyToken(token) {
    return JWT.verify(token, secret);
}

module.exports = {
    generateTokenForUser,
    verifyToken
}
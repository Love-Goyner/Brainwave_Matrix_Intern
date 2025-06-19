const {Schema , model} = require('mongoose');
const {createHmac, randomBytes} = require("crypto");
const { generateTokenForUser } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.jpg"
    },
    role:{
        type: String,
        enum : ["USER", "ADMIN"],
        default: "USER"
    }
},{timestamps: true});

userSchema.pre('save' , function(next){
    if(!this.isModified('password')) return next();
    
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(this.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword
    next();
})

userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("User not Found")

    const salt = user.salt
    const hashedPassword = user.password;

    const userProvidedHashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    if(hashedPassword !== userProvidedHashedPassword) throw new Error("Password is incorrect")
    

    return generateTokenForUser(user)
})

const User = model('User', userSchema);
module.exports = User;
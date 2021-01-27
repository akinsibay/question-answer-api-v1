const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type : String,
        required:[true,"Please provide a name"]
    },
    email : {
        type : String,
        required: [true,"Please provide a email"],
        unique : true,
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email"
        ]
    },
    role : {
        type : String,
        enum : ["user","admin"],
        default : "user"
    },
    password : {
        type : String,
        minlength : 6,
        required : [true,"Please provide a password"],
        select : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    title : {
        type: String
    },
    about : {
        type:String
    },
    website : {
        type: String 
    },
    place : {
        type: String
    },
    profile_image : {
        type : String,
        default : "default.jpg"
    },
    blocked : {
        type : Boolean,
        default : false
    },
    resetPasswordToken : {
        type: String
    },
    resetPasswordExpire :{
        type: Date
    }
});

//UserSchema Methods
UserSchema.methods.getResetPasswordTokenFromUser = function(){
    const {RESET_PASSWORD_EXPIRE} = process.env;
    const randomHextString = crypto.randomBytes(15).toString("hex");
    const resetPasswordToken = crypto.createHash("SHA256").update(randomHextString).digest("hex");
    console.log(resetPasswordToken)
    
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE) //şu anki saate 1 saat ekle
    return resetPasswordToken
}
UserSchema.methods.generateJwtFromUser = function(){
    const {JWT_SECRET_KEY,JWT_EXPIRE} = process.env;
    const payload  = {
        id:this._id,
        name:this.name,
    }
    const token = jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn: JWT_EXPIRE
    })
    return token;
}

//Pre Hooks
UserSchema.pre("save",function(next){
    //Parola değişme
    if(!this.isModified("password")){
        next();
    }
    bcrypt.genSalt(10,(err,salt)=>{
        if(err) next(err);
        bcrypt.hash(this.password,salt,(err,hash)=>{
            if(err) next(err);
            this.password = hash;
            next();
        })
    })
})

module.exports = mongoose.model("User",UserSchema)
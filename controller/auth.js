const User = require("../models/User")
const CustomError = require("../helpers/error/CustomError")
const asyncErrorWrapper = require("express-async-handler")
const {sendJwtToClient} = require("../helpers/authorization/tokenHelpers")
const {validateUserInput,comparePassword} = require("../helpers/input/inputHelpers")
const sendEmail = require("../helpers/libraries/sendEmail")

const register = asyncErrorWrapper(async (req,res,next)=>{
    console.log(req.body)
    const {name,email,password,role} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        role
    })
    sendJwtToClient(user,res)  
})

const login = asyncErrorWrapper( async(req,res,next)=>{
    const {email,password} = req.body
    if(!validateUserInput(email,password)){ //inputlardan boş olan var mı
        return next(new CustomError("Please check your inputs"),400);
    }

    const user = await User.findOne({email}).select("+password"); //password değeri select yani "gösterilmesin" yapılmasına rağmen bu değeri de al
    
    if(!comparePassword(password,user.password)){ //hashlenmiş olarak saklanmış password ile kullanıcının gönderdiği passwordü karşılaştırma
        return next(new CustomError("Please check your password"),400);
    }
    
    sendJwtToClient(user,res)  
})

const logout = asyncErrorWrapper(async (req,res,next)=>{ //logout için token silinir.
    const {NODE_ENV} = process.env;
    return res.status(200).cookie({
        httpOnly:true,
        expires: new Date(Date.now()), //token ı hemen expire et
        secure: NODE_ENV === "development" ? false : true
    })
    .json({
        success:true,
        message:"Logout successfull"
    })
})

const getUser=(req,res,next)=>{
    res.json({
        success:true,
        data:{
            id:req.user.id,
            name:req.user.name
        }
    })
}

const imageUpload = asyncErrorWrapper(async (req,res,next)=>{
    
    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
        "profile_image":req.savedProfileImage
        },
        {
            new:true, //user a güncellenmiş veri gelsin. false yaparsak eski hali geliyor
            runValidators:true //validasyonların tekrardan çalışması
        })

    res.status(200)
    .json({
        success:true,
        message:'Image Upload Successful',
        data:user
    })
})

const forgotPassword = asyncErrorWrapper(async (req,res,next)=>{
    const resetEmail = req.body.email;
    const user = await User.findOne({email:resetEmail});
    if(!user){
        return next(new CustomError("There is no user with that email",400))
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();
    await user.save();

    const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`
    const emailTemplate = `
        <h3>Reset your password</h3>
        <p>This <a href="${resetPasswordUrl} target="_blank">link</a> will expire in 1 hour</p>
    `
    try{
        console.log('trydayımmm')
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject:"Reset your password",
            html: emailTemplate
        })
        return res.status().json({
            success:true,
            message:"Token sent to your email"
        })
    }
    catch(error){
        console.log('burda mısın lan')
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        console.log(user)
        await user.save();
        return next(new CustomError("Email could not be sent",500))
    }
})

const resetPassword = asyncErrorWrapper(async (req,res,next)=>{
    const {resetPasswordToken} = req.query;
    const {password} = req.body
    if(!resetPasswordToken){
        return next(new CustomError("Please provide a valid token",400))
    }
    let user = await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire : {$gt: Date.now()}
    })
    if(!user){
        return next(new CustomError("Invalid token or session expired",404))
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200)
    .json({
        success:true,
        message:"Reset password process successful"
    })
}) 

const editDetails = asyncErrorWrapper(async (req,res,next)=>{
    const editInformation = req.body;
    const user = await User.findByIdAndUpdate(req.user.id,editInformation,{
        new:true,
        runValidators:true
    })
    return res.status(200)
    .json({
        success:true,
        data:user
    })
}) 

module.exports = {
    register,
    getUser,
    login,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
}
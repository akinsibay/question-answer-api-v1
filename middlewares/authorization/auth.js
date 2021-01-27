const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const {isTokenIncluded,getAccessTokenFromHeader} = require("../../helpers/authorization/tokenHelpers")
const asyncErrorWrapper = require("express-async-handler")
const User = require("../../models/User")

const getAccessToRoute = (req,res,next)=>{
    const {JWT_SECRET_KEY} = process.env
    //Token
    if(!isTokenIncluded(req)){
        //401 Unauthorized
        //403 Forbidden
        console.log("1 numara")
        next(new CustomError("You are not authorized to access this route",401))
    }
    const accessToken = getAccessTokenFromHeader(req)
    jwt.verify(accessToken,JWT_SECRET_KEY,(err,decoded)=>{
        console.log("2 numara")
        if(err){
            return next(new CustomError("You are not authorized to access this route",401))
        }
        req.user = {
            id: decoded.id,
            name:decoded.name
        }
        next()
    })
}

const getAdminAccess = asyncErrorWrapper(async(req,res,next)=>{
    const {id} = req.user;
    const user = await User.findById(id);
    if(user.role !== "admin"){
        return next(new CustomError("Only admins can access this route"),403);
    }
    next();

})
module.exports = {
    getAccessToRoute,
    getAdminAccess
}
const express = require("express");
const {register,getUser,login,logout,imageUpload,forgotPassword,resetPassword,editDetails} = require("../controller/auth")
const {getAccessToRoute} = require("../middlewares/authorization/auth");
const profileImageUpload = require("../middlewares/libraries/profileImageUpload");

//api/auth
const router = express.Router();

router.post("/register",register);
router.get("/profile",getAccessToRoute,getUser);
router.post("/login",login);
router.get("/logout",getAccessToRoute,logout); //logout olmak için login olmak gerekir. bunu kontrol için middleware koyduk
router.post("/upload",getAccessToRoute,profileImageUpload.single("profile_image"),imageUpload)
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword",resetPassword);
router.put("/edit",getAccessToRoute,editDetails);

module.exports = router
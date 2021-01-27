const express = require("express")
const {getAccessToRoute,getAdminAccess} = require("../middlewares/authorization/auth")
const router = express.Router();
const {blockUser,deleteUser} = require("../controller/admin")
const {checkUserExist} = require("../middlewares/database/databaseErrorHelpers")
//Block User
//Delete User

router.use([getAccessToRoute,getAdminAccess]) //tüm route larda geçerli

router.get("/block/:id",checkUserExist,blockUser);
router.delete("/user/:id",checkUserExist,deleteUser);


module.exports = router;
const express = require("express");
const {getAllQuestions} = require("../controller/question")
//api/questions
const router = express.Router();

router.get("/",getAllQuestions)

module.exports = router
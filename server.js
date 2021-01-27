const express = require("express")
const dotenv = require("dotenv");
const app = express();
const routers = require("./routers/index")
const connectDatabase = require("./helpers/database/connectDatabase");
const customErrorHandler = require("./middlewares/errors/customErrorHandler")
const path = require("path") //expressin kendi içinde olan bir paket

//Express Body Middleware
app.use(express.json());

//Enviroment Variables
dotenv.config({
    path:"./config/env/config.env"
})

const PORT = process.env.PORT;

//MongoDb Connection
connectDatabase();


//Routers middleware
app.use("/api",routers)

//Error Handler
app.use(customErrorHandler) //next(error) parametresiyle başlatıldığı her seferinde buna girecek

//Static files
app.use(express.static(path.join(__dirname,"public"))) //static dosyalarımızın bulunduğu public klasörünü yol olarak gösterdik

app.listen(PORT,()=>{
    console.log(`App started on ${PORT} : ${process.env.NODE_ENV}`)
})


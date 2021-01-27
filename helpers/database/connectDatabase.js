const mongoose = require("mongoose")

const connectDatabase = ()=>{
    mongoose.connect(process.env.MONGO_URI,{
        useUnifiedTopology:true,
        useNewUrlParser:true,
        useFindAndModify:false,
        useCreateIndex:true
    })
    .then(()=>console.log("MongoDb connection successful"))
    .catch(err=>console.log(err))
}

module.exports = connectDatabase;
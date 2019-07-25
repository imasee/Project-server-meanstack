const mongoose = require("mongoose");
const config = require("config");
const dataBaseConnectionString = config.get("mongoConn");
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  };

const connectToDataBase = async () =>{
    try{

        mongoose.connect(dataBaseConnectionString,options);
        console.log("Success: Connected to mongoDB.");
    }
    catch(err){
        console.log(err);
        process.exit();
    }
}

module.exports = connectToDataBase;
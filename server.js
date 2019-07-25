const express = require("express");
const cors = require('cors');
const app = express();

const PORT_NUMBER = 8383;
const connectDb = require("./config/database");

app.use(cors());
app.use(express.json({extended: false}));
app.use('/api/instructors',require('./api/routes/instructor'));
app.use('/api/courses',require('./api/routes/course'));
app.use('/api/students',require('./api/routes/student'));
app.use('/api/login',require('./api/routes/login'));
app.get('/',(req,res)=>{
    res.send("<html>Welcome<html>");
});



app.listen(PORT_NUMBER,(err)=>{
    
    if(err)
        console.log(err);
    connectDb();
    console.log(`Success: Server Running on Port: ${PORT_NUMBER}.`);

});
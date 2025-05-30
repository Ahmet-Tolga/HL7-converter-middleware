const express=require("express");
const bodyParser=require("body-parser");

const v2Router = require('./routes/hl7v2.route');
const v3Router = require('./routes/hl7v3.route');

const app=express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}));

app.use("/v2",v2Router);

app.use("/v3",v3Router);

const port=5000;

app.listen(port,(err)=>{
    if(!err){
        console.log(`Server is running on port ${port}`);
    }
})

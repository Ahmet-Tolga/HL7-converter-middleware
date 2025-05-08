const fs = require('fs');
const { buildMessage } = require('../builders/hl7v2.builder');

module.exports.createHl7v2Message=async(req,res)=>{

    file_path=req.body.file_path;

    try{
        const message=await buildMessage(file_path);
        
        fs.writeFileSync('./output/hl7v2_output.hl7', message);

        res.status(202).send(message);
    }

    catch(err){
        res.status(404).send("There is an error");
    }

    
}
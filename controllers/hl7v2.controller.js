const fs = require('fs');
const { buildMessage } = require('../builders/hl7v3.builder');


module.exports.createHl7v3Message=(req,res)=>{

    file_path=req.body.file_path;

    try{
        const hl7Text = fs.readFileSync(file_path, 'utf8');

        const segments = hl7Text.split('\n').filter(line => line.trim() !== '');

        const xml=buildMessage(segments);
        
        fs.writeFileSync('./output/hl7v3_output.xml', xml);

        res.status(202).send(xml);
    }

    catch(err){
        res.status(404).send("There is an error");
    }

    
}
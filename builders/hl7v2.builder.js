const { extractMshInfo, extractEvnInfo } = require("../parsers/hl7v3-parser");
const fs = require('fs').promises;

module.exports.buildMessage = async function(file_path) {
    try {
        const data = await fs.readFile(file_path);
        
        const msh_segment = await extractMshInfo(data);
        const evn_segment = await extractEvnInfo(data);

        const hl7v2 = [msh_segment, evn_segment].join('\n');
        return hl7v2;
    } catch (err) {
        console.error("Error building HL7 message:", err);
    }
};

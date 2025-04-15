const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

fs.readFile('output.xml', (err, data) => {
  if (err) throw err;

  parser.parseString(data, (err, result) => {
    if (err) throw err;

    const msg = result['PRPA_IN101001UV02'];

    const messageId = msg.id['$'].root;
    const creationTime = msg.creationTime['$'].value;
    const interactionId = msg.interactionId['$'].extension;
    const processingCode = msg.processingCode['$'].code;
    const sender = msg.sender.device;
    const receiver = msg.receiver.device;
    const controlAct = msg.controlActProcess;
    

    const msh = `MSH|^~\\&|${sender.name}|HOSPITAL|${receiver.name}|${receiver.name}|${creationTime}||ADT^${controlAct.code['$'].code}|${messageId}|${processingCode}|2.5`;
    
    const pid=``;
    const prd = `PRD|RP|${doctorName}|||||${doctorId}`;

    const hl7v2 = [msh, evn, prd].join('\n');

    console.log(hl7v2);
  });
});

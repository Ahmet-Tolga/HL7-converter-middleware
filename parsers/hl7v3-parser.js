const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

module.exports.extractMshInfo = async (data) => {
    const result = await parser.parseStringPromise(data);

    const msg = result['PRPA_IN101001UV02'];

    const messageId = msg.id['$'].root;
    const creationTime = msg.creationTime['$'].value;
    const interactionId = msg.interactionId['$'].extension;
    const processingCode = msg.processingCode['$'].code;
    const sender = msg.sender.device;
    const receiver = msg.receiver.device;
    const controlAct = msg.controlActProcess;

    const msh = `MSH|^~\\&|${sender.name}|HOSPITAL|${receiver.name}|${receiver.name}|${creationTime}||ADT^${controlAct.code['$'].code}|${messageId}|${processingCode}|2.5`;

    return msh;
};

module.exports.extractEvnInfo = async (data) => {
    const result = await parser.parseStringPromise(data);

    const msg = result['PRPA_IN101001UV02'];
    const controlAct = msg.controlActProcess;

    const evn = `EVN|${controlAct.code['$'].code}|${controlAct.effectiveTime['$'].value}`;

    return evn;
};

const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

module.exports.extractMshInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];

  const messageId = root.id['$'].root || '';
  const creationTime = root.creationTime ? root.creationTime['$'].value : ''; 
  const processingCode = root.processingCode ? root.processingCode['$'].code : '';
  const sender = root.sender.device;
  const receiver = root.receiver.device;
  const controlAct = root.controlActProcess;

  const senderId = sender.id ? sender.id['$'].root : ''; 
  const senderName = sender.name || '';
  const receiverId = receiver.id ? receiver.id['$'].root : ''; 
  const receiverName = receiver.name || '';

  const msh = `MSH|^~\\&|${senderId}|${senderName}|${receiverId}|${receiverName}|${creationTime}||ADT^${controlAct.code['$'].code}|${messageId}|${processingCode}|2.3`;

  return msh;
};

module.exports.extractEvnInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];

  const controlActProcess = root.controlActProcess;

  const code = controlActProcess.code['$'].code || '';
  const effectiveTime = controlActProcess.effectiveTime['$'].value || '';
  
  const authorOrPerformer = controlActProcess.authorOrPerformer;
  const assignedPerson = authorOrPerformer.assignedPerson;
  const personId = assignedPerson.id['$'].extension || ''; 
  const personName = assignedPerson.name.family || '';

  const subject = controlActProcess.subject;

  const plannedEvent = subject ? subject.act['$'].code : ''; 

  const reasonCode = controlActProcess.reasonCode ? controlActProcess.reasonCode['$'].code : '';

  const evn = `EVN|${code}|${effectiveTime}|${plannedEvent}|${reasonCode}|${personId}^${personName}`;

  return evn;
};

module.exports.extractPatientInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];
  const patient = root.identifiedPerson;

  const patientId = patient.id['$'].extension;
  const familyName = patient.name.family;
  const givenName = patient.name.given;
  const birthDate = patient.birthTime['$'].value;
  const genderCode = patient.administrativeGenderCode['$'].code;

  const address = patient.addr;
  const street = address.streetAddressLine;
  const city = address.city;
  const postalCode = address.postalCode;
  const phone = patient.telecom['$'].value.replace('tel:', '');

  const pid = `PID|||${patientId}||${familyName}^${givenName}||${birthDate}|${genderCode}|||${street}^^${city}^^${postalCode}||${phone}`;

  return pid;
};







  
  
  
  






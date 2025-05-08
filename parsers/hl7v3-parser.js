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
  const security=root.securityText;

  const senderId = sender.id ? sender.id['$'].root : ''; 
  const senderName = sender.name || '';
  const receiverId = receiver.id ? receiver.id['$'].root : ''; 
  const receiverName = receiver.name || '';

  const msh = `MSH|^~\\&|${senderId}|${senderName}|${receiverId}|${receiverName}|${creationTime}|${security}|ADT^${controlAct.code['$'].code}|${messageId}|${processingCode}|2.3`;

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

  const plannedEvent = subject ? subject.act?.code['$'].code : ''; 

  const reasonCode = controlActProcess.reasonCode ? controlActProcess.reasonCode['$'].code : '';

  const evn = `EVN|${code}|${effectiveTime}|${plannedEvent}|${reasonCode}|${personId}^${personName}`;

  return evn;
};

module.exports.extractPatientInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];
  const patient = root.identifiedPerson;

  const rawPatientId = patient.id?.['$']?.extension || '';
  let patientId = '';
  let assigningAuthority = '';
  let idType = '';

  if (rawPatientId) {
    const parts = rawPatientId.trim().split(/\s+/);
    patientId = parts[0] || '';
    assigningAuthority = parts[1] || '';
    idType = parts[2] || '';
  }

  const name = patient.name || {};
  const familyName = name.family || '';
  const givenName = name.given || '';
  const middleName = name.middle || '';

  const birthDate = patient.birthTime?.['$']?.value || '';

  const gender = patient.administrativeGenderCode?.['$']?.code || '';

  const address = patient.addr || {};
  const street = address.streetAddressLine || '';
  const city = address.city || '';
  const state = address.state || '';
  const postalCode = address.postalCode || '';
  const country = address.country || 'TR';

  const telecoms = Array.isArray(patient.telecom) ? patient.telecom : [patient.telecom];

  const homePhone = telecoms.find(t => t['$'].use === 'PRN')?.['$']?.value?.replace('tel:', '') || '';
  const workPhone = telecoms.find(t => t['$'].use === 'WP')?.['$']?.value?.replace('tel:', '') || '';

  const maritalStatus = patient.maritalStatusCode?.['$']?.code || '';

  const motherMaidenName = patient.personalRelationship?.name || '';

  const motherId = patient.personalRelationship?.id?.['$']?.extension || '';

  const aliasName = patient.asOtherName?.name || '';

  const race = patient.raceCode?.['$']?.code || '';

  const accountNumber = patient.coveredPartyOf?.id?.['$']?.extension || '';

  const language = patient.languageCommunication?.languageCode?.['$']?.code || '';

  const ssn = patient.asOtherIDs?.id?.['$']?.extension || '';


  const pid = `PID|1||${patientId}^^^${assigningAuthority}^${idType}||${familyName}^${givenName}^|${motherMaidenName}|${birthDate}|${gender}|${aliasName}|${race}|${street}^^${city}^${state}^${postalCode}^${country}||${homePhone}|${workPhone}|${language}|${maritalStatus}|${patient.religiousAffiliationCode?.['$']?.code || ''}|${accountNumber}|${ssn}||${motherId}`;

  return pid;
};


module.exports.extractNextOfKinInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];
  const nextOfKinData = root.nextOfKin?.nextOfKinInfo || [];

  if (nextOfKinData.length === 0) {
    return '';
  }

  const nk1Segments = nextOfKinData.map((nk, index) => {
    const relation = nk.relation?.['$']?.code || '';
    const name = nk.name || {};
    const familyName = name.family || '';
    const givenName = name.given || '';

    const address = nk.address || {};
    const street = address.streetAddressLine || '';
    const city = address.city || '';
    const postalCode = address.postalCode || '';
    const country = postalCode.split('^')[1] || 'TR';

    const telecoms = Array.isArray(nk.telecom) ? nk.telecom : [nk.telecom];
    const phoneNumber = telecoms.find(t => t['$'].use === 'CP')?.['$']?.value?.replace('tel:', '') || '';

    return `NK1|${index + 1}|${familyName}^${givenName}|${relation}|${phoneNumber}|${street}^^${city}^${postalCode}^${country}`;
  });

  return nk1Segments.join('\r');
};
module.exports.extractPatientVisitInfo = async (data) => {
  const result = await parser.parseStringPromise(data);
  const root = result['PRPA_IN101001UV02'];
  const visit = root.patientVisit;

  if (!visit) return '';

  const patientClass = visit.patientClass?.['$']?.value || '';
  const location = visit.location?.['$']?.value || ''; 
  const patientType = visit.patientType?.['$']?.value || '';
  const visitNumber = visit.visitNumber?.['$']?.value || '';

  const attendingDoctor = visit.attendingDoctor?.assignedPerson?.name;
  const attendingDocId = attendingDoctor?.family || '';
  const attendingDocName = attendingDoctor?.given || '';
  const attending = `${attendingDocId}^${attendingDocName}`;

  const referringDoctor = visit.referringDoctor?.assignedPerson?.name;
  const referring = `${referringDoctor?.family || ''}^${referringDoctor?.given || ''}`;

  const consultingDoctor = visit.consultingDoctor?.assignedPerson?.name;
  const consulting = `${consultingDoctor?.family || ''}^${consultingDoctor?.given || ''}`;

  const hospitalService = visit.hospitalService?.['$']?.value || '';
  const admissionDateTime = visit.admissionDateTime?.['$']?.value || '';
  const admissionType=visit.admissionType?.['$']?.value || '';
  const dischargeDateTime = visit.dischargeDateTime?.['$']?.value || '';
  const admitSource = visit.admitSource?.['$']?.value || '';
  const ambulatoryStatus = visit.ambulatoryStatus?.['$']?.value || '';
  const vipIndicator = visit.vipIndicator?.['$']?.value || '';
  const preadmitNumber = visit.preadmitNumber?.['$']?.value || '';
  const priorPatientLocation = visit.priorPatientLocation?.['$']?.value || '';
  const financialClass = visit.financialClass?.['$']?.value || '';
  const chargePriceIndicator = visit.chargePriceIndicator?.['$']?.value || '';
  const courtesyCode = visit.courtesyCode?.['$']?.value || '';
  const creditRating = visit.creditRating?.['$']?.value || '';
  const patientVisitId = visit.id?.['extension'] || ''; 

  const pv1 = `PV1|1|${patientClass}|${location}|${admissionType}|${preadmitNumber}|${priorPatientLocation}|${attending}|${referring}|${consulting}|${hospitalService}|${admissionDateTime}|${admitSource}|${ambulatoryStatus}|${vipIndicator}|${patientType}|${visitNumber}|${patientVisitId}|${financialClass}|${chargePriceIndicator}|${courtesyCode}|${creditRating}|${dischargeDateTime}|${dischargeDateTime}`;

  return pv1;
};



module.exports.extractPatientVisitAdditionalInfo = async (data) => {
  const result = await parser.parseStringPromise(data);
  const msg = result['PRPA_IN101001UV02'];
  const visitInfo = msg.patientVisitAdditionalInfo;

  if (!visitInfo) return '';

  const get = (tag) => visitInfo?.[tag]?.['$']?.value || '';

  const pv2 = [
    'PV2',
    get('priorPendingLocation'),
    get('accommodationCode'),
    get('admitReason'),
    get('transferReason'),
    get('patientValuables'),
    get('patientValuablesLocation'),
    get('visitUserCode'),
    get('expectedAdmitDateTime'),
    get('expectedDischargeDateTime'),
    get('estimatedLengthOfStay'),
    get('actualLengthOfStay'),
    get('visitDescription'),
    get('referralSourceCode'),
    get('previousServiceDate'),
    get('employmentIllnessRelatedIndicator'),
    get('purgeStatusCode'),
    get('purgeStatusDate'),
    get('specialProgramCode'),
    get('retentionIndicator'),
    get('expectedNumberOfInsurancePlans'),
    get('visitPublicityCode'),
    get('visitProtectionIndicator'),
  ].join('|');

  return pv2;
};

module.exports.extractOrders = async (data) => {
  try {
    const result = await parser.parseStringPromise(data);
    const root = result['PRPA_IN101001UV02']?.ClinicalDocument;

    let orders = root?.Orders?.[0]?.Order || root?.Orders?.Order;

    if (!orders) {
      console.warn('No orders found.');
      return '';
    }

    if (!Array.isArray(orders)) {
      orders = [orders];
    }

    const obrSegments = orders.map((order, index) => {
      const idList = order.id || [];
      const placerOrderNumber = idList[0]?.['$']?.extension || '';
      const fillerOrderNumber = idList[1]?.['$']?.extension || '';

      const code = order.code?.['$']?.code || '';
      const displayName = order.code?.['$']?.displayName || '';

      const effectiveTimes = order.effectiveTime || [];
      const startTime = effectiveTimes[0]?.['$']?.value || '';
      const endTime = effectiveTimes[1]?.['$']?.value || '';

      const author = order.author?.assignedAuthor;
      const authorId = author?.id?.['$']?.extension || '';
      const authorName = author?.assignedPerson?.name?.given || '';

      const performer = order.performer?.assignedEntity;
      const performerId = performer?.id?.['$']?.extension || '';
      const performerOrg = performer?.representedOrganization?.name || '';

      return `OBR|${index + 1}|${placerOrderNumber}|${fillerOrderNumber}|${code}^${displayName}|||${startTime}|${endTime}|||F||||${authorId}^${authorName}|||||${performerId}^${performerOrg}`;
    });

    return obrSegments.join('\n');
  } catch (err) {
    console.error("Error parsing orders:", err);
    throw err;
  }
};

module.exports.extractAllergies = async (data) => {
  const result = await parser.parseStringPromise(data);
  const root = result['PRPA_IN101001UV02'];
  const allergyInfo = root?.AllergyInformation?.clinicalStatement;

  const clinicalStatements = Array.isArray(allergyInfo)
    ? allergyInfo
    : allergyInfo
    ? [allergyInfo]
    : [];

  let output = '';

  for (let i = 0; i < clinicalStatements.length; i++) {
    const cs = clinicalStatements[i];

    const setId = i + 1;
    const type = cs.code?.['$']?.displayName || '';
    const code = cs.value?.['$']?.code || '';
    const name = cs.value?.['$']?.displayName || '';
    const reaction = cs.text || '';
    const date = cs.effectiveTime?.low?.['$']?.value || '';

    output += `AL1|${setId}|${type}|${code}|${name}|${reaction}|${date}\n`;
  }

  return output.trim(); 
};


module.exports.extractDiagnosisInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];

  const section = root.section || root.ClinicalDocument?.component?.structuredBody?.component?.section;
  if (!section || !section.entry) return '';

  const entry = Array.isArray(section.entry) ? section.entry : [section.entry];
  const dg1Segments = [];

  entry.forEach((e, index) => {
    const observation = e.observation;
    if (!observation || !observation.value) return;

    const code = observation.value?.['$']?.code || '';
    const displayName = observation.value?.['$']?.displayName || '';
    const codeSystemName = observation.value?.['$']?.codeSystemName || 'ICD-10';

    const text = observation.text || '';
    const effectiveTime = observation.effectiveTime || {};
    const low = effectiveTime.low?.['$']?.value || '';
    const high = effectiveTime.high?.['$']?.value || '';

    let diagnosisType = '';
    const entryRel = observation.entryRelationship?.observation;
    if (entryRel?.code?.['$']?.code === 'diagnosisType') {
      diagnosisType = entryRel.value?._ || entryRel.value;
    }

    const dg1 = `DG1|${index + 1}|${code}|${displayName ? `${displayName}^${codeSystemName}` : ''}|${text}|${low}|${high}|${diagnosisType}`;
    dg1Segments.push(dg1);
  });

  return dg1Segments.join('\r');
};

module.exports.extractRoleInfo=async (data)=>{
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];

  const participants = root?.ClinicalDocument?.participant || root?.participant;

  if (!participants) return [];

  const participantArray = Array.isArray(participants) ? participants : [participants];

  const roles = [];

  participantArray.forEach((participant, index) => {
    const role = participant.participantRole;
    if (!role) return;

    const id = role.id?.['$']?.root || '';
    const code = role.code?.['$']?.code || '';
    const displayName = role.code?.['$']?.displayName || '';
    const codeSystem = 'HL70443';

    const name = role.playingEntity?.name || {};
    const prefix = name.prefix || '';
    const suffix = name.suffix || '';
    const given = Array.isArray(name.given) ? name.given : [name.given];
    const given1 = given[0] || '';
    const given2 = given[1] || '';
    const family = name.family || '';

    const time = participant.time || {};
    const low = time.low?.['$']?.value || '';
    const high = time.high?.['$']?.value || '';

    const rolLine = `ROL|${index + 1}|AD|${code}^${displayName}^${codeSystem}|${id}^${family}^${given1}^${given2}^^${prefix}^${suffix}|${low}|${high}`;
    roles.push(rolLine);
  });

  return roles.join('\r');
}


module.exports.extractProcedureInfo=async (data)=>{
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'];

  const procedures = root?.ProcedureEvents?.procedure || root?.procedure;

  if (!procedures) return [];

  const procedureArray = Array.isArray(procedures) ? procedures : [procedures];

  const pr1Segments = procedureArray.map((proc, index) => {
    const code = proc.code?.['$']?.code || '';
    const displayName = proc.code?.['$']?.displayName || '';
    const codeSystem = proc.code?.['$']?.codeSystem || '';
    const procedureCode = `${code}^${displayName}^${codeSystem}`;

    const low = proc.effectiveTime?.low?.['$']?.value || '';
    const high = proc.effectiveTime?.high?.['$']?.value || '';

    const text = proc.text || '';

    const performer = proc.performer?.assignedEntity;
    const name = performer?.assignedPerson?.name || {};
    const prefix = name.prefix || '';
    const given = Array.isArray(name.given) ? name.given[0] : name.given || '';
    const family = name.family || '';
    const performerName = `${family}^${given}^A^^${prefix}`;

    const methodCode = proc.methodCode?.['$']?.code || '';

    return `PR1|${index + 1}|${procedureCode}|${low}|${high}|${performerName}|${methodCode}|${text}`;
  });

  return pr1Segments.join('\r');
}

module.exports.extractInsuranceInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'] || result;

  const coveragePolicies = root?.coveragePolicies?.coveragePolicy;
  if (!coveragePolicies) return '';

  const policyArray = Array.isArray(coveragePolicies) ? coveragePolicies : [coveragePolicies];

  const in1Segments = policyArray.map((policy, index) => {
    const seq = index + 1;

    const policyId = policy.id?.['$']?.root || '';

    const insurer = policy.underwriter?.organization || {};
    const insurerId = insurer.id?.['$']?.root || '';
    const insurerName = insurer.name || '';
    const insurerPhone = insurer.telecom?.['$']?.value?.replace('tel:', '') || '';

    const planCode = policy.code?.['$']?.code || '';
    const planName = policy.code?.['$']?.displayName || '';

    const effLow = policy.effectiveTime?.low?.['$']?.value || '';
    const effHigh = policy.effectiveTime?.high?.['$']?.value || '';

    const patient = policy.coveredParty?.patientPerson || {};
    const name = patient.name || {};
    const given = Array.isArray(name.given) ? name.given[0] : name.given || '';
    const family = name.family || '';
    const prefix = name.prefix || '';
    const fullName = `${family}^${given}^A^^${prefix}`;

    const addr = patient.addr || {};
    const street = addr.streetAddressLine || '';
    const apt = addr.additionalLocator || '';
    const city = addr.city || '';
    const state = addr.state || '';
    const postal = addr.postalCode || '';
    const fullAddress = `${street}^${apt}^${city}^${state}^${postal}`;

    const responsible = policy.responsibleParty?.assignedEntity || {};
    const responsibleName = responsible.assignedPerson?.name || '';
    const responsibleCode = responsible.code?.['$']?.code || '';

    return `IN1|${seq}|${policyId}|${insurerId}^${insurerName}^Corp|${planCode}^${planName}|${effLow}|${effHigh}|${effLow}|Y|Primary Insured|123456789|${fullName}|${fullAddress}|${insurerPhone}|${insurerPhone}|${effLow}|${responsibleName}|${responsibleCode}`;
  });

  return in1Segments.join('\r');
};

module.exports.extractGuarantorInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'] || result;

  const guarantors = root?.guarantor;
  if (!guarantors) return '';

  const guarantorArray = Array.isArray(guarantors) ? guarantors : [guarantors];

  const gt1Segments = guarantorArray.map((guarantor, index) => {
    const seq = index + 1;

    const id = guarantor?.assignedEntity?.id?.['$'] || {};
    const idExtension = id.extension || '';
    const assigningAuthority = id.assigningAuthorityName || '';
    const idRoot = id.root || '';

    const relationshipCode = guarantor?.assignedEntity?.code?.['$']?.code || '';

    const name = guarantor?.assignedEntity?.assignedPerson?.name || {};
    const given = Array.isArray(name.given) ? name.given[0] : name.given || '';
    const family = name.family || '';
    const fullName = `${family}^${given}`;

    const otherId = guarantor?.assignedEntity?.asOtherIDs?.id?.['$']?.extension || '';
    const birthTime = guarantor?.assignedEntity?.assignedPerson?.birthTime?.['$']?.value || '';
    const telecom = guarantor?.assignedEntity?.telecom?.['$']?.value?.replace('tel:', '') || '';

    return `GT1|${seq}|${idExtension}^^^${assigningAuthority}^${idRoot}|${relationshipCode}|${fullName}|${otherId}|${birthTime}|${telecom}`;
  });

  return gt1Segments.join('\r');
};


module.exports.extractOrderControlInfo = async (data) => {
  const result = await parser.parseStringPromise(data);

  const root = result['PRPA_IN101001UV02'] || result;

  const acts = root?.OrderControlActs?.act;
  if (!acts) return '';

  const actArray = Array.isArray(acts) ? acts : [acts];

  const orcSegments = actArray.map((act) => {
    const orderControlCode = act.code?.['$']?.code || ''; 
    const orderNumber = act.id?.['$']?.root || ''; 
    const effectiveTime = act.effectiveTime?.['$']?.value || '';
    const quantityTiming = act.quantityTiming?.['$']?.value || ''; 

    const placerOrderNumber = act.parent?.placerOrderNumber || '';
    const placerShort = placerOrderNumber.substring(0, 7); 
    const placerTail = placerOrderNumber.substring(3);

    const orderStatus = act.statusCode?.['$']?.code?.toUpperCase() || ''; 

    const authorId = act.author?.assignedAuthor?.id?.['$']?.root || '';

    const timestamp = '202504101200';

    return `ORC|${orderControlCode}|${orderNumber}|${placerShort}|${placerTail}|${orderStatus}|${timestamp}|${quantityTiming}|${placerOrderNumber}|${effectiveTime}|${authorId}|1`;
  });

  return orcSegments.join('\r');
};

module.exports.extractObservations = async (data) => {
  try {
    const result = await parser.parseStringPromise(data);

    const root = result['PRPA_IN101001UV02'] || result;

    let observations = root.ClinicalDocument?.Observations.Observation;

    if (!observations) {
      console.warn('No observation found.');
      return '';
    }

    if (!Array.isArray(observations)) {
      observations = [observations];
    }

    const testDescriptions = {
      "12345": "Blood Pressure",
      "12346": "Hemoglobin",
      "12347": "White Blood Cells"
    };

    const obxSegments = observations.map((obs, index) => {
      const testCode = obs.testCode['$'].code;
      const description = testDescriptions[testCode] || "Unknown Test";
      const value = obs.value[0];
      const unit = obs.unit[0];
      const status = obs.status[0];
      const effectiveTime = obs.effectiveTime['$'].value;

      const valueType = value.includes('/') ? 'CE' : 'NM';

      return `OBX|${index + 1}|${valueType}|${testCode}^${description}^LABTEST|1|${value}|${unit}|${status}|||F|||||${effectiveTime}`;
    });

    return obxSegments.join('\n');
  } catch (err) {
    console.error("Error parsing observations:", err);
    throw err;
  }
};































  
  
  
  






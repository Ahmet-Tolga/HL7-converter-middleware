const { extractOrderControlInfo, extractObservationResults, extractPatientDemographics, extractMessageHeader, extractPatientInfo, extractOrders, extractEventInfo, extractGuarantorInfo, extractNextOfKinInfo, extractAllergyInfo, extractVisitInfo, extractRoleInfo, extractInsuranceInfo, extractProcedureInfo, extractDiagnosisInfo, extractVisitAdditionalInfo } = require("../parsers/hl7v2-parser.js");

const { create } = require('xmlbuilder2');

function buildHl7V3(messageHeader,patient, orders, event, guarantor, nextOfKin, allergies, orderControl, observationResults, demographics, visit,visitAddition,role,insurance,procedure,diagnosis) {
    const doc = create({ version: '1.0' });
  
    const root = doc.ele('PRPA_IN101001UV02', {
      xmlns: 'urn:hl7-org:v3',
      ITSVersion: '3.0'
    });
  
    root.ele('id', { root: messageHeader.messageControlId || 'UNKNOWN' });
    root.ele('creationTime', { value: messageHeader.dateTimeOfMessage || '' });
    root.ele('interactionId', {
      root: '2.16.840.1.113883.1.6',
      extension: 'PRPA_IN101001UV02'
    });

    root.ele('processingCode', { code: messageHeader.processingId || 'P' });
    root.ele('processingModeCode', { code: 'T' });
    root.ele('acceptAckCode', { code: 'AL' });

    if (messageHeader.security) {
      root.ele('securityText').txt(messageHeader.security);
    }
  
    const receiver = root.ele('receiver', { typeCode: 'RCV' });
    const receiverDevice = receiver.ele('device', { classCode: 'DEV', determinerCode: 'INSTANCE' });
    receiverDevice.ele('id', { root: messageHeader.receivingApplication || 'UNKNOWN' });
    receiverDevice.ele('name').txt(`${messageHeader.receivingFacility}`);
  
    const sender = root.ele('sender', { typeCode: 'SND' });
    const senderDevice = sender.ele('device', { classCode: 'DEV', determinerCode: 'INSTANCE' });
    senderDevice.ele('id', { root: messageHeader.sendingApplication || 'UNKNOWN' });
    senderDevice.ele('name').txt(`${messageHeader.sendingFacility}`);
    
    const controlAct = root.ele('controlActProcess')
    .att('classCode', 'CACT')
    .att('moodCode', 'EVN');

    controlAct.ele('code')
    .att('code', event.eventTypeCode)
    .att('codeSystem', '2.16.840.1.113883.1.18');

    controlAct.ele('effectiveTime')
    .att('value', event.recordedDateTime);

    if (event.plannedEvent) {
    const subject = controlAct.ele('subject')
      .att('typeCode', 'SUBJ');

    subject.ele('act')
      .att('classCode', 'ACT')
      .att('moodCode', 'APT')
      .ele('code', { code: event.plannedEvent, codeSystem: '2.16.840.1.113883.5.4' });
    }

    if (event.eventReasonCode) {
    controlAct.ele('reasonCode', {
      code: event.eventReasonCode,
      codeSystem: '2.16.840.1.113883.5.8'
    });
    }

    const author = controlAct.ele('authorOrPerformer')
    .att('typeCode', 'AUT');

    const assignedPerson = author.ele('assignedPerson');
    assignedPerson.ele('id', { extension: event.operator.code || 'UNKNOWN' });

    const name = assignedPerson.ele('name');

    name.ele('family').txt(event.operator.surname || '');
    name.ele('given').txt(event.operator.givenName || '');

    if (patient && patient["segmentName"] !== '') {
      const pidElement = root.ele('identifiedPerson')
        .att('classCode', 'PAT')
        .att('moodCode', 'EVN');
    
      pidElement.ele('id')
        .att('extension', patient.id)
        .att('root', '2.16.840.1.113883.1.3');
    
      const nameElement = pidElement.ele('name');
      const nameParts = (patient.name || '').split('^');
      nameElement.ele('family').txt(nameParts[0] || '');
      nameElement.ele('given').txt(nameParts[1] || '');
      nameElement.ele('middle').txt(nameParts[2] || '');
      nameElement.ele('prefix').txt(nameParts[3] || '');
      nameElement.ele('suffix').txt(nameParts[4] || '');
    
      const personalRelElement = pidElement.ele('personalRelationship')
        .att('classCode', 'PRS')
        .att('code', 'MTH');
    
      if (patient.motherMaidenName) {
        personalRelElement.ele('name').txt(patient.motherMaidenName);
      }
    
      if (patient.motherId) {
        personalRelElement.ele('id').att('extension', patient.motherId);
      }
    
      pidElement.ele('birthTime').att('value', patient.birthDate);
    
      pidElement.ele('administrativeGenderCode')
        .att('code', patient.gender === 'M' ? 'M' : 'F')
        .att('codeSystem', '2.16.840.1.113883.5.1');
    
      if (patient.patientAlias) {
        pidElement.ele('asOtherName')
          .att('classCode', 'ALIAS')
          .ele('name').txt(patient.patientAlias);
      }
    
      if (patient.race) {
        pidElement.ele('raceCode')
          .att('code', patient.race)
          .att('codeSystem', '2.16.840.1.113883.6.238');
      }
    
      if (patient.ethnicity) {
        pidElement.ele('ethnicGroupCode')
          .att('code', patient.ethnicity)
          .att('codeSystem', '2.16.840.1.113883.6.238');
      }
    
      if (patient.address) {
        const addressParts = patient.address.split('^');
        const addrElement = pidElement.ele('addr');
        addrElement.ele('streetAddressLine').txt(addressParts[0] || '');
        addrElement.ele('city').txt(addressParts[2] || '');
        addrElement.ele('state').txt(addressParts[3] || '');
        addrElement.ele('postalCode').txt(addressParts[4] || '');
        addrElement.ele('country').txt(addressParts[5]|| '');
      }
    
      if (patient.phoneNumber) {
        const phoneParts = patient.phoneNumber.split('~');
        pidElement.ele('telecom')
          .att('use', 'PRN')
          .att('value', `tel:${phoneParts[0]?.split('^')[0] || ''}`);
        if (phoneParts[1]) {
          pidElement.ele('telecom')
            .att('use', 'CP')
            .att('value', `tel:${phoneParts[1].split('^')[0]}`);
        }
      }
    
      if (patient.bussinessPhone) {
        pidElement.ele('telecom')
          .att('use', 'WP')
          .att('value', `tel:${patient.bussinessPhone.split('^')[0]}`);
      }
    
      if (patient.primaryLanguage) {
        pidElement.ele('languageCommunication')
          .ele('languageCode')
          .att('code', patient.primaryLanguage);
      }
    
      if (patient.maritalStatus) {
        pidElement.ele('maritalStatusCode')
          .att('code', patient.maritalStatus)
          .att('codeSystem', '2.16.840.1.113883.5.2');
      }
    
      if (patient.religion) {
        pidElement.ele('religiousAffiliationCode')
          .att('code', patient.religion)
          .att('codeSystem', '2.16.840.1.113883.5.1076');
      }
    
      if (patient.accountNumber) {
        pidElement.ele('coveredPartyOf')
          .ele('id')
          .att('extension', patient.accountNumber)
          .att('root', '2.16.840.1.113883.19.5');
      }
    
      if (patient.ssn) {
        pidElement.ele('asOtherIDs')
          .att('classCode', 'SSN')
          .ele('id')
          .att('extension', patient.ssn)
          .att('root', '2.16.840.1.113883.4.1');
      }
    
      if (patient.driverLicense) { 
        pidElement.ele('asOtherIDs')
          .att('classCode', 'DL')
          .ele('id')
          .att('extension', patient.driverLicense)
          .att('root', '2.16.840.1.113883.4.3');
      }
    }
    

if(nextOfKin && nextOfKin.length>0 && nextOfKin[0].segmentName!=''){
  const nk1Element = root.ele('nextOfKin');

  nextOfKin.forEach(nk1 => {
  const nk1Info = nk1Element.ele('nextOfKinInfo');
  
  nk1Info.ele('relation')
  .att('code', nk1.relation) 
  .att('codeSystem', '2.16.840.1.113883.5.1');

  const nameElement=nk1Info.ele("name")

  nameElement.ele('family').txt(nk1.name.split('^')[0] || '') 
  nameElement.ele('given').txt(nk1.name.split('^')[1] || ''); 

  const addressElement = nk1Info.ele('address');

  addressElement.ele('streetAddressLine').txt(nk1.address.split('^^')[0] || '');
  addressElement.ele('city').txt(nk1.address.split('^^')[1] || '');
  addressElement.ele('postalCode').txt(nk1.address.split('^^')[2] || '');
    

  const phoneNumbers = nk1.phoneNumber || '';
  const phoneParts = phoneNumbers.split('~');

    nk1Info.ele('telecom')
      .att('use', 'CP')  
      .att('value', `tel:${phoneParts[0].split('^')[0]}`); 

    if (phoneParts[1]) {
      nk1Info.ele('telecom')
        .att('use', 'HP') 
        .att('value', `tel:${phoneParts[1].split('^')[0]}`);  
    }});
}

if (visit && visit.segmentName !== '') {

  const pv1Element = root.ele('patientVisit');

  pv1Element.ele('id')
      .att('extension', visit.patientVisitNumber || '')
      .att('root', '2.16.840.1.113883.1.3'); 

  if (visit.assignedPatientLocation) {
      pv1Element.ele('location')
          .att('value', visit.assignedPatientLocation);
  }

  if (visit.visitNumber) {
      pv1Element.ele('visitNumber')
          .att('value', visit.visitNumber);
  }

  if (visit.patientClass) {
      pv1Element.ele('patientClass')
          .att('value', visit.patientClass);
  }

  if (visit.patientType) {
      pv1Element.ele('patientType')
          .att('value', visit.patientType);
  }

  if (visit.attendingDoctor) {
      const attendingDoctor = pv1Element.ele('attendingDoctor');
      const attendingPerson = attendingDoctor.ele('assignedPerson');
      const attendingName = attendingPerson.ele('name');
      const [attendingSurname, attendingGiven] = visit.attendingDoctor.split('^');
      attendingName.ele('family').txt(attendingSurname || '');
      attendingName.ele('given').txt(attendingGiven || '');
  }

  if (visit.referringDoctor) {
      const referringDoctor = pv1Element.ele('referringDoctor');
      const referringPerson = referringDoctor.ele('assignedPerson');
      const referringName = referringPerson.ele('name');
      const [referringSurname, referringGiven] = visit.referringDoctor.split('^');
      referringName.ele('family').txt(referringSurname || '');
      referringName.ele('given').txt(referringGiven || '');
  }

  if (visit.consultingDoctor) {
      const consultingDoctor = pv1Element.ele('consultingDoctor');
      const consultingPerson = consultingDoctor.ele('assignedPerson');
      const consultingName = consultingPerson.ele('name');
      const [consultingSurname, consultingGiven] = visit.consultingDoctor.split('^');
      consultingName.ele('family').txt(consultingSurname || '');
      consultingName.ele('given').txt(consultingGiven || '');
  }

  if (visit.hospitalService) {
      pv1Element.ele('hospitalService')
          .att('value', visit.hospitalService);
  }

    if(visit.admissionType){
      pv1Element.ele('admissionType')
          .att('value',visit.admissionType)
    }

  if (visit.admissionDateTime) {
      pv1Element.ele('admissionDateTime')
          .att('value', visit.admissionDateTime);  
  }

  if (visit.dischargeDateTime) {
      pv1Element.ele('dischargeDateTime')
          .att('value', visit.dischargeDateTime);  
  }

  if (visit.admitSource) {
      pv1Element.ele('admitSource')
          .att('value', visit.admitSource);
  }

  if (visit.priority) {
      pv1Element.ele('priority')
          .att('value', visit.priority);
  }

  if (visit.ambulatoryStatus) {
      pv1Element.ele('ambulatoryStatus')
          .att('value', visit.ambulatoryStatus);
  }

  if (visit.vipIndicator) {
      pv1Element.ele('vipIndicator')
          .att('value', visit.vipIndicator);
  }

  if (visit.preadmitNumber) {
      pv1Element.ele('preadmitNumber')
          .att('value', visit.preadmitNumber);
  }

  if (visit.priorPatientLocation) {
      pv1Element.ele('priorPatientLocation')
          .att('value', visit.priorPatientLocation);
  }

  if (visit.financialClass) {
      pv1Element.ele('financialClass')
          .att('value', visit.financialClass);
  }

  if (visit.chargePriceIndicator) {
      pv1Element.ele('chargePriceIndicator')
          .att('value', visit.chargePriceIndicator);
  }

  if (visit.courtesyCode) {
      pv1Element.ele('courtesyCode')
          .att('value', visit.courtesyCode);
  }

  if (visit.creditRating) {
      pv1Element.ele('creditRating')
          .att('value', visit.creditRating);
  }
}

    if(visitAddition && visitAddition["segmentName"]!=''){
      const pv2Element = root.ele('patientVisitAdditionalInfo');

    if (visitAddition.priorPendingLocation) {
      pv2Element.ele('priorPendingLocation').att('value', visitAddition.priorPendingLocation);
    }

    if (visitAddition.accommodationCode) {
      pv2Element.ele('accommodationCode').att('value', visitAddition.accommodationCode);
    }

    if (visitAddition.admitReason) {
      pv2Element.ele('admitReason').att('value', visitAddition.admitReason);
    }

    if (visitAddition.transferReason) {
      pv2Element.ele('transferReason').att('value', visitAddition.transferReason);
    }

    if (visitAddition.patientValuables) {
      pv2Element.ele('patientValuables').att('value', visitAddition.patientValuables);
    }

    if (visitAddition.patientValuablesLocation) {
      pv2Element.ele('patientValuablesLocation').att('value', visitAddition.patientValuablesLocation);
    }

    if (visitAddition.visitUserCode) {
      pv2Element.ele('visitUserCode').att('value', visitAddition.visitUserCode);
    }

    if (visitAddition.expectedAdmitDateTime) {
      pv2Element.ele('expectedAdmitDateTime').att('value', visitAddition.expectedAdmitDateTime);
    }

    if (visitAddition.expectedDischargeDateTime) {
      pv2Element.ele('expectedDischargeDateTime').att('value', visitAddition.expectedDischargeDateTime);
    }

    if (visitAddition.estimatedLengthOfStay) {
      pv2Element.ele('estimatedLengthOfStay').att('value', visitAddition.estimatedLengthOfStay);
    }

    if (visitAddition.actualLengthOfStay) {
      pv2Element.ele('actualLengthOfStay').att('value', visitAddition.actualLengthOfStay);
    }

    if (visitAddition.visitDescription) {
      pv2Element.ele('visitDescription').att('value', visitAddition.visitDescription);
    }

    if (visitAddition.referralSourceCode) {
      pv2Element.ele('referralSourceCode').att('value', visitAddition.referralSourceCode);
    }

    if (visitAddition.previousServiceDate) {
      pv2Element.ele('previousServiceDate').att('value', visitAddition.previousServiceDate);
    }

    if (visitAddition.employmentIllnessRelatedIndicator) {
      pv2Element.ele('employmentIllnessRelatedIndicator').att('value', visitAddition.employmentIllnessRelatedIndicator);
    }

    if (visitAddition.purgeStatusCode) {
      pv2Element.ele('purgeStatusCode').att('value', visitAddition.purgeStatusCode);
    }

    if (visitAddition.purgeStatusDate) {
      pv2Element.ele('purgeStatusDate').att('value', visitAddition.purgeStatusDate);
    }
    
    if (visitAddition.specialProgramCode) {
      pv2Element.ele('specialProgramCode').att('value', visitAddition.specialProgramCode);
    }

    if (visitAddition.retentionIndicator) {
      pv2Element.ele('retentionIndicator').att('value', visitAddition.retentionIndicator);
    }

    if (visitAddition.expectedNumberOfInsurancePlans) {
      pv2Element.ele('expectedNumberOfInsurancePlans').att('value', visitAddition.expectedNumberOfInsurancePlans);
    }
    
    if (visitAddition.visitPublicityCode) {
      pv2Element.ele('visitPublicityCode').att('value', visitAddition.visitPublicityCode);
    }

    if (visitAddition.visitProtectionIndicator) {
      pv2Element.ele('visitProtectionIndicator').att('value', visitAddition.visitProtectionIndicator);
    }
    }

    const clinicalDocument=root.ele("ClinicalDocument");

    if (orders && orders.length > 0 && orders[0].segmentName != '') {
      const ordersElement = clinicalDocument.ele('Orders');
    
      orders.forEach(order => {
        const orderElement = ordersElement.ele('Order');
    
        if (order.placerOrderNumber) {
          orderElement.ele('id')
            .att('root', '2.16.840.1.113883.4.1')
            .att('extension', order.placerOrderNumber);
        }
    
        if (order.fillerOrderNumber) {
          orderElement.ele('id')
            .att('root', '2.16.840.1.113883.4.2')
            .att('extension', order.fillerOrderNumber);
        }
    
        if (order.testName) {
          orderElement.ele('code')
            .att('code', order.testCode || '')
            .att('displayName', order.testName);
        }
    
        if (order.observationDateTime) {
          orderElement.ele('effectiveTime')
            .att('value', order.observationDateTime);
        }
    
        if (order.observationEndTime) {
          orderElement.ele('effectiveTime')
            .att('value', order.observationEndTime);
        }
    
        if (order.orderStatus) {
          orderElement.ele('statusCode')
            .att('code', order.orderStatus);
        }
 
        if (order.orderingProviderId || order.orderingProviderName) {
          const author = orderElement.ele('author').ele('assignedAuthor');
          author.ele('id')
            .att('root', '2.16.840.1.113883.4.6')
            .att('extension', order.orderingProviderId);
    
          author.ele('assignedPerson').ele('name')
            .ele('given').txt(order.orderingProviderName);
        }

        if (order.performingOrganizationId || order.performingOrganization) {
          const performer = orderElement.ele('performer').ele('assignedEntity');
          performer.ele('id')
            .att('root', '2.16.840.1.113883.4.7')
            .att('extension', order.performingOrganizationId);
    
          performer.ele('representedOrganization').ele('name').txt(order.performingOrganization);
        }
    
        orderElement.up();
      });
    }
    


    if(observationResults && observationResults.length>0 && observationResults.segmentName!=''){
      const obxElement = clinicalDocument.ele('Observations');

      observationResults.forEach(obx => {
        const observationElement = obxElement.ele('Observation');

        if (obx.testCode) {
          observationElement.ele('testCode')
            .att('code', obx.testCode)
            .att('codeSystem', '2.16.840.1.113883.6.1'); 
        }

        if (obx.value) {
          observationElement.ele('value')
            .txt(obx.value);
        }

        if (obx.unit) {
          observationElement.ele('unit')
            .txt(obx.unit);
        }
  
        if (obx.referenceRange) {
          observationElement.ele('status')
            .txt(obx.referenceRange);
        }
  
        if (obx.probability) {
          observationElement.ele('probability')
            .txt(obx.probability);
        }

        if (obx.dateTime) {
          observationElement.ele('effectiveTime')
            .att('value', obx.dateTime);
        }
  
        observationElement.up();
      });
  
    }
    
    
    if(orderControl && orderControl.length>0 && orderControl.segmentName!=''){
      const orcElement = root.ele('OrderControlActs');

    orderControl.forEach(orc => {
      const orderElement = orcElement.ele('act', {
        classCode: 'ACT',
        moodCode: 'RQO'
      });

      orderElement.ele('templateId')
        .att('root', '2.16.840.1.113883.10.20.1.32');

      if (orc.placerOrderNumber) {
        orderElement.ele('id')
          .att('root', orc.placerOrderNumber);
      }

      if (orc.orderControl) {
        orderElement.ele('code')
          .att('code', orc.orderControl)
          .att('codeSystem', '2.16.840.1.113883.5.4')
          .att('displayName', 'Order Control');
      }

      if (orc.orderStatus) {
        orderElement.ele('statusCode')
          .att('code', orc.orderStatus.toLowerCase());
      }

      if (orc.scheduledDateTime) {
        orderElement.ele('effectiveTime')
          .att('value', orc.scheduledDateTime);
      }

      if (orc.quantityTiming) {
        orderElement.ele('quantityTiming')
          .att('value', orc.quantityTiming); 
      }
    
      if (orc.parent && orc.parent.placerOrderNumber) {
        const parentElement = orderElement.ele('parent');
    
        if (orc.parent.placerOrderNumber) {
          parentElement.ele('placerOrderNumber')
            .txt(orc.parent.placerOrderNumber);
        }
    
        if (orc.parent.fillerOrderNumber) {
          parentElement.ele('fillerOrderNumber')
            .txt(orc.parent.fillerOrderNumber);
        }
      }

      if (orc.orderingProvider && orc.orderingProvider) {
        const author = orderElement.ele('author')
          .ele('assignedAuthor');

        author.ele('id')
          .att('root', orc.orderingProvider.id);

        if (orc.orderingProvider.name) {
          author.ele('assignedPerson')
            .ele('name')
            .txt(orc.orderingProvider.name);
        }
      }

      orderElement.up();
    });
    }

    if(allergies && allergies.length>0 && allergies.segmentName!=''){
      const allergyInformationElement = root.ele('AllergyInformation');

    allergies.forEach(al1 => {
      const clinicalStatement = allergyInformationElement.ele('clinicalStatement', { 
        classCode: 'OBS', 
        moodCode: 'EVN' 
      });

      clinicalStatement.ele('templateId', { root: '2.16.840.1.113883.10.20.1.28' });


      clinicalStatement.ele('code', {
        code: '419076004',
        codeSystem: '2.16.840.1.113883.6.96',
        displayName: al1.allergyType
      });

      clinicalStatement.ele('statusCode', { code: 'completed' });

      const effectiveTime = clinicalStatement.ele('effectiveTime');
      if (al1.dateTime) {
        effectiveTime.ele('low', { value: al1.dateTime });
      }

      clinicalStatement.ele('value', {
        'xsi:type': 'CD', 
        code: al1.allergyCode, 
        codeSystem: '2.16.840.1.113883.6.96',
        displayName: al1.substance
      });

      if (al1.reaction) {
        clinicalStatement.ele('text').txt(al1.reaction);
      }
    });
    }

    if(diagnosis && diagnosis.length>0 && diagnosis.segmentName!=''){
      const diagnosesSection = root.ele('section');
    diagnosesSection.ele('title').txt('Diagnoses');

    diagnosis.forEach(d => {
      const entry = diagnosesSection.ele('entry');
      const observation = entry.ele('observation', { classCode: 'OBS', moodCode: 'EVN' });

      observation.ele('templateId', { root: '2.16.840.1.113883.10.20.1.28' });

      observation.ele('code', {
        code: '282291009', 
        codeSystem: '2.16.840.1.113883.6.96',
        displayName: 'Diagnosis'
      });

      observation.ele('statusCode', { code: 'completed' });

      const effectiveTime = observation.ele('effectiveTime');
      if (d.diagnosisDateTime) effectiveTime.ele('low', { value: d.diagnosisDateTime });
      if (d.diagnosisEndDateTime) effectiveTime.ele('high', { value: d.diagnosisEndDateTime });

      observation.ele('value', {
        'xsi:type': 'CD',
        code: d.diagnosisCode,
        codeSystem: '2.16.840.1.113883.6.3',
        displayName: d.diagnosisName
      });

      if (d.diagnosisDescription) {
        observation.ele('text').txt(d.diagnosisDescription);
      }

      if (d.diagnosisType) {
        observation.ele('entryRelationship', { typeCode: 'SUBJ' })
          .ele('observation', { classCode: 'OBS', moodCode: 'EVN' })
          .ele('code', { code: 'diagnosisType' })
          .up()
          .ele('value', { 'xsi:type': 'ST' }).txt(d.diagnosisType);
      }
    });
    }

    if(demographics && demographics.length>0 && demographics.segmentName!=''){
      const patientRole = root.ele('recordTarget')
    .ele('patientRole');

    const patientRoleElement = patientRole.ele('patient');

    if (demographics.patientClass) {
      patientRoleElement.att('classCode', demographics.patientClass);
    }

    if (demographics.mother) {
      const parentElement = patient.ele('parent');
      parentElement.ele('name').txt(demographics.mother);
      parentElement.att('classCode', 'MTH'); 
    }

    if (demographics.emergencyContact) {
      const contactElement = patientRole.ele('contactParty');
      contactElement.ele('telecom').att('value', `tel:${demographics.emergencyContact}`);
      contactElement.att('classCode', 'ECON');
    }
    }

    if (guarantor && guarantor.length > 0 && guarantor[0].segmentName !== ''){
      const guarantorsElement = root.ele('guarantor');

    guarantor.forEach(gt => {
      const assignedEntity = guarantorsElement.ele('assignedEntity');

      assignedEntity.ele('id', {
        extension: gt.guarantorNumber.id,
        assigningAuthorityName: gt.guarantorNumber.assigningAuthority,
        root: gt.guarantorNumber.idTypeCode 
      });


      if (gt.relationship) {
        assignedEntity.ele('code', {
          code: gt.relationship,
          codeSystem: '2.16.840.1.113883.5.111',
          displayName: 'Guarantor Relationship'
        });
      }


      const person = assignedEntity.ele('assignedPerson');
      const name = person.ele('name');
      if (gt.name.given) name.ele('given').txt(gt.name.given);
      if (gt.name.middle) name.ele('given').txt(gt.name.middle);
      if (gt.name.family) name.ele('family').txt(gt.name.family);

      if (gt.phoneNumber) {
        assignedEntity.ele('telecom', { value: `tel:${gt.phoneNumber}` });
      }

      if (gt.dateOfBirth) {
        person.ele('birthTime', { value: gt.dateOfBirth });
      }

      if (gt.socialSecurityNumber) {
        assignedEntity.ele('asOtherIDs')
          .ele('id', { extension: gt.socialSecurityNumber, root: '2.16.840.1.113883.4.1' }); 
      }
      });
    }

      if(role && role.length>0 && role.segmentName!=''){
        const rolesElement = root.ele('participant');

      role.forEach(role => {
        const participantRole = rolesElement.ele('participantRole', { classCode: 'ASSIGNED' });
      
        participantRole.ele('id', { root: role.person.id });

        participantRole.ele('code', {
          code: role.roleCode,
          displayName: role.roleDisplayName,
          codeSystem: '2.16.840.1.113883.5.111'
        });
      
        const playingEntity = participantRole.ele('playingEntity', {
          classCode: 'PSN',
          determinerCode: 'INSTANCE'
        });
      
        const name = playingEntity.ele('name');
        if (role.person.prefix) name.ele('prefix').txt(role.person.prefix);
        if (role.person.given) name.ele('given').txt(role.person.given);
        if (role.person.middle) name.ele('given').txt(role.person.middle);
        if (role.person.family) name.ele('family').txt(role.person.family);
        if (role.person.suffix) name.ele('suffix').txt(role.person.suffix);

        if (role.startDate || role.endDate) {
          const timeElement = rolesElement.ele('time');
          if (role.startDate) timeElement.ele('low', { value: role.startDate });
          if (role.endDate) timeElement.ele('high', { value: role.endDate });
        }
      });
      }
    
      if(procedure && procedure.length>0 && procedure.segmentName!=''){
        const proceduresElement = root.ele('ProcedureEvents');

    procedure.forEach(pr1 => {
      const procedureElement = proceduresElement.ele('procedure', {
        classCode: 'PROC',
        moodCode: 'EVN'
      });

      procedureElement.ele('code', {
        code: pr1.procedureCode,
        displayName: pr1.procedureName,
        codeSystem: pr1.codeSystem || '2.16.840.1.113883.6.12'
      });

      procedureElement.ele('text').txt(pr1.description || '');

      const effectiveTime = procedureElement.ele('effectiveTime');
      effectiveTime.ele('low', { value: pr1.procedureStartDate });
      effectiveTime.ele('high', { value: pr1.procedureEndDate });

      procedureElement.ele('statusCode', { code: 'completed' });

      const performerElement = procedureElement.ele('performer');
      const assignedEntity = performerElement.ele('assignedEntity');

      assignedEntity.ele('id', { root: 'PERFORMER-ID' });

      const assignedPerson = assignedEntity.ele('assignedPerson');
      const name = assignedPerson.ele('name');

      if (pr1.surgeon?.prefix) name.ele('prefix').txt(pr1.surgeon.prefix);
      if (pr1.surgeon?.given) name.ele('given').txt(pr1.surgeon.given);
      if (pr1.surgeon?.family) name.ele('family').txt(pr1.surgeon.family);

      procedureElement.ele('methodCode', {
        code: pr1.procedureType,
        displayName: pr1.procedureType
      });
    });

    }

    if(insurance && insurance.length>0 && insurance.segmentName!=''){
      const coverageSection = root.ele('coveragePolicies');

    insurance.forEach(in1 => {
    const coverage = coverageSection.ele('coveragePolicy');

    coverage.ele('id', { root: in1.insurancePlanId });

    coverage.ele('code', {
      code: in1.insurancePlanCode,
      displayName: in1.insurancePlanName
    });

    const effectiveTime = coverage.ele('effectiveTime');
    effectiveTime.ele('low', { value: in1.insuranceStartDate });
    effectiveTime.ele('high', { value: in1.insuranceEndDate });

    const underwriter = coverage.ele('underwriter').ele('organization');
    underwriter.ele('id', { root: in1.insuranceCompanyId });
    underwriter.ele('name').txt(in1.insuranceCompanyName);
    underwriter.ele('telecom', { value: `tel:${in1.phoneNumber}` });

    const beneficiary = coverage.ele('coveredParty').ele('patientPerson');
    
    if (in1.insuredPersonName) {
      const nameParts = in1.insuredPersonName.split('^');
      const name = beneficiary.ele('name');
      name.ele('given').txt(nameParts[0] || '');
      name.ele('family').txt(nameParts[1] || '');
      if (nameParts[4]) name.ele('prefix').txt(nameParts[4]); 
    }

    if (in1.insuredPersonAddress) {
      const addrParts = in1.insuredPersonAddress.split('^');
      const addr = beneficiary.ele('addr');
      addr.ele('streetAddressLine').txt(addrParts[0] || '');
      addr.ele('additionalLocator').txt(addrParts[1] || '');
      addr.ele('city').txt(addrParts[2] || '');
      addr.ele('state').txt(addrParts[3] || '');
      addr.ele('postalCode').txt(addrParts[4] || '');
    }

    if (in1.doctorName) {
      const responsibleParty = coverage.ele('responsibleParty').ele('assignedEntity');
      const personName = responsibleParty.ele('assignedPerson').ele('name');
      personName.txt(in1.doctorName);
      responsibleParty.ele('code', { code: in1.doctorRole || 'PCP' });
    }
    });
    };

    return doc.end({ prettyPrint: true });
  };
  
module.exports.buildMessage=function(segments){
    const messageHeader=extractMessageHeader(segments);
    const eventInfo = extractEventInfo(segments);
    const patientInfo = extractPatientInfo(segments);
    const orders = extractOrders(segments);
    const guarantorInfo = extractGuarantorInfo(segments);
    const nextOfKinInfo = extractNextOfKinInfo(segments);
    const allergyInfo = extractAllergyInfo(segments);
    const orderControlInfo = extractOrderControlInfo(segments);
    const observationResults = extractObservationResults(segments);
    const patientDemographics = extractPatientDemographics(segments);
    const visitInfo = extractVisitInfo(segments);
    const visitAdditionalInfo=extractVisitAdditionalInfo(segments);
    const roleInfo=extractRoleInfo(segments);
    const insuranceInfo=extractInsuranceInfo(segments);
    const procedureInfo=extractProcedureInfo(segments);
    const diagnosisInfo=extractDiagnosisInfo(segments);

    hl7V3Message = buildHl7V3(
    messageHeader,
    patientInfo, 
    orders, 
    eventInfo, 
    guarantorInfo, 
    nextOfKinInfo, 
    allergyInfo, 
    orderControlInfo, 
    observationResults, 
    patientDemographics, 
    visitInfo,
    visitAdditionalInfo,
    roleInfo,
    insuranceInfo,
    procedureInfo,
    diagnosisInfo
    );

    return hl7V3Message;
}




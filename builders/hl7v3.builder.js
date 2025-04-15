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
  
    // Receiver
    const receiver = root.ele('receiver', { typeCode: 'RCV' });
    const receiverDevice = receiver.ele('device', { classCode: 'DEV', determinerCode: 'INSTANCE' });
    receiverDevice.ele('id', { root: messageHeader.receivingApplication || 'UNKNOWN' });
    receiverDevice.ele('name').txt(messageHeader.receivingApplication || '');
    receiverDevice.ele('name').txt(`${messageHeader.receivingApplication} System at ${messageHeader.receivingFacility}`);
  
    // Sender
    const sender = root.ele('sender', { typeCode: 'SND' });
    const senderDevice = sender.ele('device', { classCode: 'DEV', determinerCode: 'INSTANCE' });
    senderDevice.ele('id', { root: messageHeader.sendingApplication || 'UNKNOWN' });
    senderDevice.ele('name').txt(`${messageHeader.sendingApplication} System at ${messageHeader.sendingFacility}`);
    
    const controlAct = root.ele('controlActProcess')
    .att('classCode', 'CACT')
    .att('moodCode', 'EVN');

    // ➕ Event Type
    controlAct.ele('code')
    .att('code', event.eventTypeCode)
    .att('codeSystem', '2.16.840.1.113883.1.18');

    // ➕ Event Time
    controlAct.ele('effectiveTime')
    .att('value', event.recordedDateTime);

    // ➕ Planned Event (HL7 v3’te subject ya da relevant act olabilir – burada subject altında temsil edelim)
    if (event.plannedEvent) {
    const subject = controlAct.ele('subject')
      .att('typeCode', 'SUBJ');

    subject.ele('act')
      .att('classCode', 'ACT')
      .att('moodCode', 'APT') // Appointment/Planned Event
      .ele('code', { code: event.plannedEvent, codeSystem: '2.16.840.1.113883.5.4' });
    }

    // ➕ Event Reason Code (HL7 v3’te reasonCode olabilir)
    if (event.eventReasonCode) {
    controlAct.ele('reasonCode', {
      code: event.eventReasonCode,
      codeSystem: '2.16.840.1.113883.5.8'
    });
    }

    // ➕ Author/Performer
    const author = controlAct.ele('authorOrPerformer')
    .att('typeCode', 'AUT');

    const assignedPerson = author.ele('assignedPerson');
    assignedPerson.ele('id', { extension: event.operator.code || 'UNKNOWN' });

    const name = assignedPerson.ele('assignedPerson')
    .ele('name');

    name.ele('family').txt(event.operator.surname || '');
    name.ele('given').txt(event.operator.givenName || '');

    const pidElement = root.ele('patient')
  .att('classCode', 'PAT')
  .att('moodCode', 'EVN');

// ➕ ID
pidElement.ele('id')
  .att('extension', patient.id)
  .att('root', '2.16.840.1.113883.1.3');

// ➕ External ID
pidElement.ele('asOtherIDs')
  .att('classCode', 'SSN')
  .ele('id')
    .att('extension', patient.externalId)
    .att('root', '2.16.840.1.113883.4.1');  // External ID

// ➕ Name
const nameElement = pidElement.ele('name');
const nameParts = patient.name.split('^');
nameElement.ele('family').txt(nameParts[0] || '');
nameElement.ele('given').txt(nameParts[1] || '');
nameElement.ele('middle').txt(nameParts[2] || '');
nameElement.ele('prefix').txt(nameParts[3] || '');
nameElement.ele('suffix').txt(nameParts[4] || '');

// ➕ Mother Maiden Name
pidElement.ele('personalRelationship')
  .att('classCode', 'PRS')
  .att('code', 'MTH')  // Mother
  .ele('name').txt(patient.motherMaidenName || '');

// ➕ Birth Date
pidElement.ele('birthTime').att('value', patient.birthDate);

// ➕ Gender
pidElement.ele('administrativeGenderCode')
  .att('code', patient.gender === 'M' ? 'M' : 'F')
  .att('codeSystem', '2.16.840.1.113883.5.1');

// ➕ Alias (Alternate Name)
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

const addressParts = patient.address.split('^');
const addrElement = pidElement.ele('addr');
addrElement.ele('streetAddressLine').txt(addressParts[0] || '');
addrElement.ele('city').txt(addressParts[2] || '');
addrElement.ele('state').txt(addressParts[3] || '');
addrElement.ele('postalCode').txt(addressParts[4] || '');
addrElement.ele('country').txt(patient.countryCode || '');

const phoneParts = (patient.phoneNumber || '').split('~');
pidElement.ele('telecom')
  .att('use', 'PRN')
  .att('value', `tel:${phoneParts[0]?.split('^')[0] || ''}`);
if (phoneParts[1]) {
  pidElement.ele('telecom')
    .att('use', 'CP')
    .att('value', `tel:${phoneParts[1].split('^')[0]}`);
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

// ➕ Marital Status
if (patient.maritalStatus) {
  pidElement.ele('maritalStatusCode')
    .att('code', patient.maritalStatus)
    .att('codeSystem', '2.16.840.1.113883.5.2');
}

// ➕ Religion
if (patient.religion) {
  pidElement.ele('religiousAffiliationCode')
    .att('code', patient.religion)
    .att('codeSystem', '2.16.840.1.113883.5.1076');
}

// ➕ Account Number
if (patient.accountNumber) {
  pidElement.ele('coveredPartyOf')
    .ele('id')
      .att('extension', patient.accountNumber)
      .att('root', '2.16.840.1.113883.19.5');  // Örnek kök
}

if (patient.ssn) {
  pidElement.ele('asOtherIDs')
    .att('classCode', 'SSN')
    .ele('id')
      .att('extension', patient.ssn)
      .att('root', '2.16.840.1.113883.4.1');
}

// ➕ Driver License
if (patient.drieverLicense) {
  pidElement.ele('asOtherIDs')
    .att('classCode', 'DL')
    .ele('id')
      .att('extension', patient.drieverLicense)
      .att('root', '2.16.840.1.113883.4.3');
}

// ➕ Mother ID
if (patient.motherId) {
  pidElement.ele('personalRelationship')
    .att('classCode', 'PRS')
    .att('code', 'MTH')
    .ele('id')
      .att('extension', patient.motherId);
}

          const nk1Element = root.ele('nextOfKin');

          nextOfKin.forEach(nk1 => {
            const nk1Info = nk1Element.ele('nextOfKinInfo');
            
            // Relation (next of kin relation)
            nk1Info.ele('relation')
              .att('code', nk1.relation)  // V3'te relation genelde bir kod ile belirtilir
              .att('codeSystem', '2.16.840.1.113883.5.1');  // Örnek bir codeSystem

              const nameElement=nk1Info.ele("name")

            
              nameElement.ele('family').txt(nk1.name.split('^')[0] || '')  // Soyad
              nameElement.ele('given').txt(nk1.name.split('^')[1] || '');  // Ad
            
              const addressElement = nk1Info.ele('address');

              addressElement.ele('streetAddressLine').txt(nk1.address.split('^^')[0] || '');
              addressElement.ele('city').txt(nk1.address.split('^^')[1] || '');
              addressElement.ele('postalCode').txt(nk1.address.split('^^')[2] || '');
              
        
            // Phone Number (next of kin phone)
            const phoneNumbers = nk1.phoneNumber || '';
            const phoneParts = phoneNumbers.split('~');
        
            nk1Info.ele('telecom')
              .att('use', 'CP')  // CP: Cell Phone
              .att('value', `tel:${phoneParts[0].split('^')[0]}`);  // İlk numara
        
            if (phoneParts[1]) {
              nk1Info.ele('telecom')
                .att('use', 'HP')  // HP: Home Phone
                .att('value', `tel:${phoneParts[1].split('^')[0]}`);  // İkinci numara
            }});

    const pv1Element = root.ele('patientVisit');

    // Patient Visit Number
    pv1Element.ele('id')
      .att('extension', visit.patientVisitNumber || '')
      .att('root', '2.16.840.1.113883.1.3');  // Örnek root, ihtiyaca göre değiştirilebilir

    // Patient Location
    if (visit.patientLocation) {
      pv1Element.ele('location')
        .att('value', visit.patientLocation);
    }

    // Visit Number
    if (visit.visitNumber) {
      pv1Element.ele('visitNumber')
        .att('value', visit.visitNumber);
    }

    // Patient Class
    if (visit.patientClass) {
      pv1Element.ele('patientClass')
        .att('value', visit.patientClass);
    }

    // Patient Type
    if (visit.patientType) {
      pv1Element.ele('patientType')
        .att('value', visit.patientType);
    }

  // Attending Doctor
if (visit.attendingDoctor) {
  const attendingDoctor = pv1Element.ele('attendingDoctor');
  const attendingPerson = attendingDoctor.ele('assignedPerson');
  const attendingName = attendingPerson.ele('name');
  const [attendingSurname, attendingGiven] = visit.attendingDoctor.split('^');
  attendingName.ele('family').txt(attendingSurname || '');
  attendingName.ele('given').txt(attendingGiven || '');
}

// Admitting Doctor
if (visit.admittingDoctor) {
  const admittingDoctor = pv1Element.ele('admittingDoctor');
  const admittingPerson = admittingDoctor.ele('assignedPerson');
  const admittingName = admittingPerson.ele('name');
  const [admittingSurname, admittingGiven] = visit.admittingDoctor.split('^');
  admittingName.ele('family').txt(admittingSurname || '');
  admittingName.ele('given').txt(admittingGiven || '');
}

// Referring Doctor
if (visit.refferingDoctor) {
  const referringDoctor = pv1Element.ele('refferingDoctor');
  const referringPerson = referringDoctor.ele('assignedPerson');
  const referringName = referringPerson.ele('name');
  const [referringSurname, referringGiven] = visit.refferingDoctor.split('^');
  referringName.ele('family').txt(referringSurname || '');
  referringName.ele('given').txt(referringGiven || '');
}

// Consulting Doctor
if (visit.consultingDoctor) {
  const consultingDoctor = pv1Element.ele('consultingDoctor');
  const consultingPerson = consultingDoctor.ele('assignedPerson');
  const consultingName = consultingPerson.ele('name');
  const [consultingSurname, consultingGiven] = visit.consultingDoctor.split('^');
  consultingName.ele('family').txt(consultingSurname || '');
  consultingName.ele('given').txt(consultingGiven || '');
}


    // Hospital Service
    if (visit.hospitalService) {
      pv1Element.ele('hospitalService')
        .att('value', visit.hospitalService);
    }

    // Admission DateTime
    if (visit.admissionDateTime) {
      pv1Element.ele('admissionDateTime')
        .att('value', visit.admissionDateTime);  // Tarih/Zaman formatında
    }

    // Discharge DateTime
    if (visit.dischargeDateTime) {
      pv1Element.ele('dischargeDateTime')
        .att('value', visit.dischargeDateTime);  // Tarih/Zaman formatında
    }

    // Admit Source
    if (visit.admitSource) {
      pv1Element.ele('admitSource')
        .att('value', visit.admitSource);
    }

    // Priority
    if (visit.priority) {
      pv1Element.ele('priority')
        .att('value', visit.priority);
    }


    const pv2Element = root.ele('patientVisitAdditionalInfo');

    // Prior Pending Location
    if (visitAddition.priorPendingLocation) {
      pv2Element.ele('priorPendingLocation').att('value', visitAddition.priorPendingLocation);
    }
    
    // Accommodation Code
    if (visitAddition.accommodationCode) {
      pv2Element.ele('accommodationCode').att('value', visitAddition.accommodationCode);
    }
    
    // Admit Reason
    if (visitAddition.admitReason) {
      pv2Element.ele('admitReason').att('value', visitAddition.admitReason);
    }
    
    // Transfer Reason
    if (visitAddition.transferReason) {
      pv2Element.ele('transferReason').att('value', visitAddition.transferReason);
    }
    
    // Patient Valuables
    if (visitAddition.patientValuables) {
      pv2Element.ele('patientValuables').att('value', visitAddition.patientValuables);
    }
    
    // Patient Valuables Location
    if (visitAddition.patientValuablesLocation) {
      pv2Element.ele('patientValuablesLocation').att('value', visitAddition.patientValuablesLocation);
    }
    
    // Visit User Code
    if (visitAddition.visitUserCode) {
      pv2Element.ele('visitUserCode').att('value', visitAddition.visitUserCode);
    }
    
    // Expected Admit DateTime
    if (visitAddition.expectedAdmitDateTime) {
      pv2Element.ele('expectedAdmitDateTime').att('value', visitAddition.expectedAdmitDateTime);
    }
    
    // Expected Discharge DateTime
    if (visitAddition.expectedDischargeDateTime) {
      pv2Element.ele('expectedDischargeDateTime').att('value', visitAddition.expectedDischargeDateTime);
    }
    
    // Estimated Length Of Stay
    if (visitAddition.estimatedLengthOfStay) {
      pv2Element.ele('estimatedLengthOfStay').att('value', visitAddition.estimatedLengthOfStay);
    }
    
    // Actual Length Of Stay
    if (visitAddition.actualLengthOfStay) {
      pv2Element.ele('actualLengthOfStay').att('value', visitAddition.actualLengthOfStay);
    }
    
    // Visit Description
    if (visitAddition.visitDescription) {
      pv2Element.ele('visitDescription').att('value', visitAddition.visitDescription);
    }
    
    // Referral Source Code
    if (visitAddition.referralSourceCode) {
      pv2Element.ele('referralSourceCode').att('value', visitAddition.referralSourceCode);
    }
    
    // Previous Service Date
    if (visitAddition.previousServiceDate) {
      pv2Element.ele('previousServiceDate').att('value', visitAddition.previousServiceDate);
    }
    
    // Employment Illness Related Indicator
    if (visitAddition.employmentIllnessRelatedIndicator) {
      pv2Element.ele('employmentIllnessRelatedIndicator').att('value', visitAddition.employmentIllnessRelatedIndicator);
    }
    
    // Purge Status Code
    if (visitAddition.purgeStatusCode) {
      pv2Element.ele('purgeStatusCode').att('value', visitAddition.purgeStatusCode);
    }
    
    // Purge Status Date
    if (visitAddition.purgeStatusDate) {
      pv2Element.ele('purgeStatusDate').att('value', visitAddition.purgeStatusDate);
    }
    
    // Special Program Code
    if (visitAddition.specialProgramCode) {
      pv2Element.ele('specialProgramCode').att('value', visitAddition.specialProgramCode);
    }
    
    // Retention Indicator
    if (visitAddition.retentionIndicator) {
      pv2Element.ele('retentionIndicator').att('value', visitAddition.retentionIndicator);
    }
    
    // Expected Number Of Insurance Plans
    if (visitAddition.expectedNumberOfInsurancePlans) {
      pv2Element.ele('expectedNumberOfInsurancePlans').att('value', visitAddition.expectedNumberOfInsurancePlans);
    }
    
    // Visit Publicity Code
    if (visitAddition.visitPublicityCode) {
      pv2Element.ele('visitPublicityCode').att('value', visitAddition.visitPublicityCode);
    }
    
    // Visit Protection Indicator
    if (visitAddition.visitProtectionIndicator) {
      pv2Element.ele('visitProtectionIndicator').att('value', visitAddition.visitProtectionIndicator);
    }
    
          
    const ordersElement = root.ele('Orders');

    orders.forEach(order => {
      const orderElement = ordersElement.ele('Order');

      // Order ID
      orderElement.ele('orderNumber')
        .att('extension', order.orderId)
        .att('root', '2.16.840.1.113883.1.3');  // Örnek root, ihtiyaca göre değiştirilebilir

      // Test Name
      if (order.testName) {
        orderElement.ele('testName')
          .txt(order.testName);
      }

      // Observation DateTime
      if (order.observationDateTime) {
        orderElement.ele('observationDateTime')
          .att('value', order.observationDateTime);  // Tarih/Zaman formatında
      }

      // Ordering Provider
      if (order.orderingProvider) {
        orderElement.ele('orderingProvider')
          .ele('assignedPerson')
            .ele('name')
              .ele('family').txt(order.orderingProvider.split('^')[0] || '')  // Soyad
              .ele('given').txt(order.orderingProvider.split('^')[1] || '');  // Ad
      }

      orderElement.up();
    });


    const orcElement = root.ele('OrderControlInformation');

    orderControl.forEach(orc => {
      const orderElement = orcElement.ele('Order');

      // Order Control
      if (orc.orderControl) {
        orderElement.ele('orderControl')
          .txt(orc.orderControl); 
      }

      // Placer Order Number
      if (orc.placerOrderNumber) {
        orderElement.ele('placerOrderNumber')
          .txt(orc.placerOrderNumber);  // Siparişi yerleştiren numara
      }

      // Filler Order Number
      if (orc.fillerOrderNumber) {
        orderElement.ele('fillerOrderNumber')
          .txt(orc.fillerOrderNumber);  // Siparişi tamamlayan numara
      }

      // Order Status
      if (orc.orderStatus) {
        orderElement.ele('orderStatus')
          .txt(orc.orderStatus);  // Siparişin durumu (ör. ACTIVE, COMPLETED)
      }

      // Scheduled Date/Time
      if (orc.scheduledDateTime) {
        orderElement.ele('scheduledDateTime')
          .att('value', orc.scheduledDateTime);  // Tarih/Zaman formatında
      }

      // Ordering Provider
      if (orc.orderingProvider) {
        orderElement.ele('orderingProvider')
          .txt(orc.orderingProvider);  // Siparişi veren kişi veya kuruluş
      }

      orderElement.up();  // Order elementini tamamlıyoruz
    });
  
    const obxElement = root.ele('ObservationResults');

    observationResults.forEach(obx => {
      const observationElement = obxElement.ele('Observation');

      // Test Code (Gözlem Test Kodu)
      if (obx.testCode) {
        observationElement.ele('testCode')
          .att('code', obx.testCode)
          .att('codeSystem', '2.16.840.1.113883.6.1');  // Örnek bir code system, ihtiyaca göre değiştirilebilir
      }

      // Value (Test Değeri)
      if (obx.value) {
        observationElement.ele('value')
          .txt(obx.value);
      }

      // Unit (Ölçü Birimi)
      if (obx.unit) {
        observationElement.ele('unit')
          .txt(obx.unit);
      }

      // Status (Durum)
      if (obx.status) {
        observationElement.ele('status')
          .txt(obx.status);
      }

      // Probability (Olasılık)
      if (obx.probability) {
        observationElement.ele('probability')
          .txt(obx.probability);
      }

      // DateTime (Gözlem Zamanı)
      if (obx.dateTime) {
        observationElement.ele('dateTime')
          .att('value', obx.dateTime);  // Tarih/Zaman formatında
      }

      observationElement.up();  // Observation elementini tamamlıyoruz
    });

    const al1Element = root.ele('AllergyInformation');

    allergies.forEach(al1 => {
      const allergyElement = al1Element.ele('Allergy');

      // Allergy Type (Alerji Türü)
      if (al1.allergyType) {
        allergyElement.ele('allergyType')
          .txt(al1.allergyType);  // Alerji türü (ör. Drug, Food, Environmental)
      }

      // Allergy Code (Alerji Kodu)
      if (al1.allergyCode) {
        allergyElement.ele('allergyCode')
          .att('code', al1.allergyCode)
          .att('codeSystem', '2.16.840.1.113883.6.1');  // Code system, ihtiyaca göre değiştirilebilir
      }

      // Substance (Alerjiye Sebep Olan Madde)
      if (al1.substance) {
        allergyElement.ele('substance')
          .txt(al1.substance);
      }

      // Reaction (Alerji Reaksiyonu)
      if (al1.reaction) {
        allergyElement.ele('reaction')
          .txt(al1.reaction);
      }

      // DateTime (Alerji Bilgisi Zamanı)
      if (al1.dateTime) {
        allergyElement.ele('dateTime')
          .att('value', al1.dateTime);  // Tarih/Zaman formatında
      }

      allergyElement.up();  // Allergy elementini tamamlıyoruz
    });


    const diagnosisSection = root.ele('Diagnoses');

    diagnosis.forEach(d => {
      const diagnosisEntry = diagnosisSection.ele('Diagnosis');

      // Teşhis Kodu ve Adı
      if (d.diagnosisCode || d.diagnosisName) {
        const codeElement = diagnosisEntry.ele('code');
        if (d.diagnosisCode) codeElement.att('code', d.diagnosisCode);
        if (d.diagnosisName) codeElement.att('displayName', d.diagnosisName);
        codeElement.att('codeSystem', '2.16.840.1.113883.6.90'); // ICD-10 örneği
      }

      // Açıklama
      if (d.diagnosisDescription) {
        diagnosisEntry.ele('text').txt(d.diagnosisDescription);
      }

      // Başlangıç Zamanı
      if (d.diagnosisDateTime) {
        diagnosisEntry.ele('effectiveTime')
          .ele('low').att('value', d.diagnosisDateTime).up();
      }

      // Bitiş Zamanı
      if (d.diagnosisEndDateTime) {
        diagnosisEntry.ele('effectiveTime')
          .ele('high').att('value', d.diagnosisEndDateTime).up();
      }

      // Teşhis Türü (Admitting, Final vs.)
      if (d.diagnosisType) {
        diagnosisEntry.ele('diagnosisType').txt(d.diagnosisType);
      }

      diagnosisEntry.up(); // </Diagnosis>
    });

    const patientRole = root.ele('recordTarget')
    .ele('patientRole');

    const patientRoleElement = patientRole.ele('patient');

    // Hasta sınıfı (örn. outpatient, inpatient)
    if (demographics.patientClass) {
      patientRoleElement.att('classCode', demographics.patientClass); // alternatif: patientRole.att(...)
    }

    // Anne bilgisi
    if (demographics.mother) {
      const parentElement = patient.ele('parent');
      parentElement.ele('name').txt(demographics.mother);
      parentElement.att('classCode', 'MTH'); // Mother
    }

    // Acil durum iletişim kişisi
    if (demographics.emergencyContact) {
      const contactElement = patientRole.ele('contactParty');
      contactElement.ele('telecom').att('value', `tel:${demographics.emergencyContact}`);
      contactElement.att('classCode', 'ECON'); // Emergency Contact
    }

    const guarantorElement = root.ele('guarantor');

      guarantor.forEach(gt1 => {
        const responsibleParty = guarantorElement.ele('responsibleParty');

        // Guarantor ID (Numarası)
        if (gt1.guarantorNumber) {
          responsibleParty.ele('id').att('extension', gt1.guarantorNumber);
        }

        // Guarantor Adı
        if (gt1.guarantorName) {
          responsibleParty.ele('name').txt(gt1.guarantorName);
        }

        // Guarantor SSN
        if (gt1.guarantorSocialSecurityNumber) {
          responsibleParty
            .ele('asOtherIDs')
            .ele('id')
            .att('root', '2.16.840.1.113883.4.1') // SSN için standard OID
            .att('extension', gt1.guarantorSocialSecurityNumber)
            .up().up();
        }

        // Guarantor Doğum Tarihi
        if (gt1.guarantorDateOfBirth) {
          responsibleParty.ele('birthTime').att('value', gt1.guarantorDateOfBirth);
        }

        // Guarantor Telefon
        if (gt1.guarantorPhone) {
          responsibleParty.ele('telecom').att('value', `tel:${gt1.guarantorPhone}`);
        }
      });

      const rolesElement = root.ele('AssignedRoles');

    role.forEach(role => {
      const roleElement = rolesElement.ele('AssignedRole');

      roleElement.ele('code', { code: role.roleCode });

      const assignedPerson = roleElement.ele('assignedPerson');
      assignedPerson
        .ele('id', { extension: role.personId })
        .up()
        .ele('name').txt(role.personName).up();

      if (role.roleStartDate || role.roleEndDate) {
        const timeElement = roleElement.ele('effectiveTime');
        if (role.roleStartDate) {
          timeElement.ele('low', { value: role.roleStartDate });
        }
        if (role.roleEndDate) {
          timeElement.ele('high', { value: role.roleEndDate });
        }
      }
    });


    const proceduresElement = root.ele('ProcedureEvents');

    procedure.forEach(pr1 => {
      const procedureElement = proceduresElement.ele('ProcedureEvent');

      procedureElement.ele('code', { code: pr1.procedureCode });

      procedureElement.ele('text').txt(pr1.procedureDescription);

      // Prosedür zamanı
      procedureElement.ele('effectiveTime', { value: pr1.procedureDateTime });

      // Performing physician bilgisi
      const performerElement = procedureElement.ele('performer');
      performerElement.ele('assignedEntity')
        .ele('assignedPerson')
          .ele('name').txt(pr1.performingPhysician).up();
    });

    const insuranceElement = root.ele('Coverage');

    insurance.forEach(in1 => {
      const coverageElement = insuranceElement.ele('Coverage');

      coverageElement.ele('insurancePlanId').txt(in1.insurancePlanId);

      coverageElement.ele('insuranceCompany').txt(in1.insuranceCompany);

      coverageElement.ele('insurancePlanCode').txt(in1.insurancePlanCode);

      coverageElement.ele('groupNumber').txt(in1.groupNumber);

      // Sigorta başlangıç ve bitiş tarihi
      coverageElement.ele('insurancePeriod')
        .ele('startDate').txt(in1.insuranceStartDate).up()
        .ele('endDate').txt(in1.insuranceEndDate).up();
    });
  

    
    return doc.end({ prettyPrint: true });
  };
  
module.exports.buildMessage=function(segments){
    const messageHeader=extractMessageHeader(segments);
    const patientInfo = extractPatientInfo(segments);
    const orders = extractOrders(segments);
    const eventInfo = extractEventInfo(segments);
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




function getFirstSegmentByName(segmentName,segments) {
    const match = segments.find(seg => seg.startsWith(segmentName));
    return match ? match.split('|') : [];
}

function getSegmentByName(segmentName,segments){
  const match = segments.filter(seg => seg.startsWith(segmentName));
  return match;
}

module.exports.extractMessageHeader=function(segments) {
  const msh = getFirstSegmentByName('MSH',segments);

  return {
    sendingApplication: msh[2] || '',
    sendingFacility: msh[3] || '',  
    receivingApplication: msh[4] || '',
    receivingFacility: msh[5] || '', 
    dateTimeOfMessage: msh[6] || '',
    security:msh[7]||'',
    messageType: msh[8] || '',       
    messageControlId: msh[9] || '',
    processingId: msh[10] || '',
    versionId: msh[11] || '' 
  };
}

module.exports.extractEventInfo = function (segments) {
  const evn = getFirstSegmentByName('EVN', segments);
  const operatorField = evn[5] || '';
  const [operatorId, operatorSurname, operatorGivenName] = operatorField.split('^');

  return {
    eventTypeCode: evn[1] || '',
    recordedDateTime: evn[2] || '',
    plannedEvent:evn[3]||'',
    eventReasonCode:evn[4]||'',
    operator: {
      code: operatorId || '',
      surname: operatorSurname || '',
      givenName: operatorGivenName || ''
    }
  };
}

module.exports.extractPatientInfo = function (segments) {
  const pid = getFirstSegmentByName('PID', segments);

  return {
    id: pid[3] || '',

    externalId:pid[4] ||'',
    
    name: pid[5] || '',

    motherMaidenName: pid[6] || '',
    
    birthDate: pid[7] || '',
    
    gender: pid[8] || '',

    patientAlias:pid[9] || '',
    
    race: pid[10] || '',
    
    address: pid[11] || '',

    countryCode:pid[12] || '',
    
    phoneNumber: pid[13] || '',

    bussinessPhone: pid[14] || '',

    primaryLanguage:pid[15] || '',

    maritalStatus: pid[16] || '',

    religion:pid[17]||'',

    accountNumber:pid[18] || '',

    ssn: pid[19] || '',

    drieverLicense:pid[20]||'',

    motherId:pid[21]||'',
    
    ethnicity: pid[22] || '',
  
  };
}

module.exports.extractNextOfKinInfo=function (segments) {
  const nk1List = getSegmentByName('NK1',segments);

  return nk1List.map(nkStr=>{
    const nk1=nkStr.split("|");

    return {
      relation: nk1[3] || '',
      name: nk1[2] || '',
      phoneNumber: nk1[4] || '',
      address: nk1[5] || ''
    }
  });
}

module.exports.extractVisitInfo=function(segments) {
  const pv1 = getFirstSegmentByName('PV1',segments);

  return {
    patientVisitNumber: pv1[19] || '',
    patientLocation: pv1[3] || '',
    visitNumber:pv1[16]||'',
    patientClass:pv1[2] || '',
    patientType:pv1[15] || '',
    attendingDoctor: pv1[6] || '',
    admittingDoctor:pv1[20] ||'',
    refferingDoctor: pv1[7] || '',
    consultingDoctor: pv1[8] || '',
    hospitalService:pv1[9] || '',
    admissionDateTime: pv1[10] || '',
    dischargeDateTime: pv1[21] || '',
    admitSource:pv1[13] || '',
    priority:pv1[19] || ''
  };
  
};

module.exports.extractVisitAdditionalInfo = function(segments) {
  const pv2 = getFirstSegmentByName('PV2', segments);

  return {
    priorPendingLocation: pv2[1] || '',
    accommodationCode: pv2[2] || '',
    admitReason: pv2[3] || '',
    transferReason: pv2[4] || '',
    patientValuables: pv2[5] || '',
    patientValuablesLocation: pv2[6] || '',
    visitUserCode: pv2[7] || '',
    expectedAdmitDateTime: pv2[8] || '',
    expectedDischargeDateTime: pv2[9] || '',
    estimatedLengthOfStay: pv2[10] || '',
    actualLengthOfStay: pv2[11] || '',
    visitDescription: pv2[12] || '',
    referralSourceCode: pv2[13] || '',
    previousServiceDate: pv2[14] || '',
    employmentIllnessRelatedIndicator: pv2[15] || '',
    purgeStatusCode: pv2[16] || '',
    purgeStatusDate: pv2[17] || '',
    specialProgramCode: pv2[18] || '',
    retentionIndicator: pv2[19] || '',
    expectedNumberOfInsurancePlans: pv2[20] || '',
    visitPublicityCode: pv2[21] || '',
    visitProtectionIndicator: pv2[22] || ''
  };
};

  
  module.exports.extractOrders = function (segments) {
    const obrList = getSegmentByName('OBR', segments);
  
    return obrList.map(obrStr => {
      const obr = obrStr.split("|");
      
      return {
        placerOrderNumber: obr[2] || '',
        fillerOrderNumber:obr[3] ||'',
        testName: obr[4] || '',
        observationDateTime: obr[8] || '',
        orderingProvider: obr[16] || ''
      };
    });
  };


  module.exports.extractOrderControlInfo=function (segments) {
    const orcList = getSegmentByName('ORC',segments);
  
    return orcList.map(orcStr => {
      const orc=orcStr.split("|");

      console.log(orc)

      return {
        orderControl: orc[1] || '',
        placerOrderNumber: orc[2] || '',
        fillerOrderNumber: orc[3] || '',
        orderStatus: orc[5] || '',
        scheduledDateTime: orc[9] || '',
        orderingProvider: orc[10] || ''
      }
    });
  }
  
  

  module.exports.extractGuarantorInfo=function (segments) {
    const gt1List = getSegmentByName('GT1',segments);
  
    return gt1List.map(gtStr=>{
      const gt1=gtStr.split("|");

      return {
        guarantorNumber: gt1[2] || '',
        guarantorName: gt1[4] || '',
        guarantorSocialSecurityNumber: gt1[5] || '',
        guarantorDateOfBirth:gt1[6]||'',
        guarantorPhone: gt1[7] || ''
      };
    })
  }
  
  
  module.exports.extractAllergyInfo=function(segments) {
    const al1List = getSegmentByName('AL1',segments);
  
    return al1List.map(alStr => {
      const al1=alStr.split("|");


      return {
        allergyType: al1[2] || '',
        allergyCode:al1[3] || '',
        substance: al1[4] || '',
        reaction: al1[5] || '',
        dateTime: al1[6] || ''
      }
    });
  }
  
  
  module.exports.extractObservationResults=function (segments) {
    const obxList = getSegmentByName('OBX',segments);

  
    return obxList.map(obxStr =>{
      const obx=obxStr.split("|");

      return {
        testCode: obx[2] || '',
        value: obx[5] || '',
        unit: obx[6] || '',
        status: obx[7] || '',
        probability:obx[10]||'',
        dateTime: obx[15] || ''
      }
    } );
  }
  module.exports.extractPatientDemographics=function(segments) {
    const pd1 = getFirstSegmentByName('PD1',segments);
  
    return {
      patientClass: pd1[3] || '',
      emergencyContact: pd1[4] || '',
      relation: pd1[5] || '',
      phoneNumber:pd1[6] || ''
    };
  }

  module.exports.extractProcedureInfo = function(segments) {
    const pr1List = getSegmentByName('PR1', segments);
  
    return pr1List.map(pr1Str => {
      const pr1 = pr1Str.split("|");
  
      return {
        procedureCode: pr1[3] || '',
        procedureDescription: pr1[4] || '',
        procedureDateTime: pr1[5] || '',
        performingPhysician: pr1[6] || ''
      };
    });
  };

  module.exports.extractRoleInfo = function(segments) {
    const rolList = getSegmentByName('ROL', segments);
  
    return rolList.map(rolStr => {
      const rol = rolStr.split("|");
  
      return {
        roleCode: rol[1] || '',
        personId: rol[2] || '',
        personName: rol[3] || '',
        roleStartDate: rol[4] || '',
        roleEndDate: rol[5] || ''
      };
    });
  };

  module.exports.extractInsuranceInfo = function(segments) {
    const in1List = getSegmentByName('IN1', segments);
  
    return in1List.map(in1Str => {
      const in1 = in1Str.split("|");
  
      return {
        insurancePlanId: in1[2] || '',
        insuranceCompany: in1[3] || '',
        insurancePlanCode: in1[4] || '',
        groupNumber: in1[7] || '',
        insuranceStartDate: in1[10] || '',
        insuranceEndDate: in1[11] || ''
      };
    });
  };
    

  module.exports.extractDiagnosisInfo = function(segments) {
    const dg1List = getSegmentByName('DG1', segments);
    
    return dg1List.map(dg1Str => {
      const dg1 = dg1Str.split("|");
  
      return {
        diagnosisCode: dg1[2] || '',
        diagnosisName: dg1[3] || '',
        diagnosisDescription: dg1[4] || '',
        diagnosisDateTime: dg1[5] || '',
        diagnosisEndDateTime: dg1[6] || '',
        diagnosisType: dg1[7] || ''
      };
    });
  };
  


  
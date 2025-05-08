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
    segmentName: msh[0] || '',
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
    segmentName: evn[0] || '',
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
    segmentName: pid[0] || '',

    externalId:pid[2]||'',

    id: pid[3].replace(/\^/g, ' ') || '',

    altId:pid[4] ||'',
    
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
      segmentName: nk1[0] || '',
      relation: nk1[3] || '',
      name: nk1[2] || '',
      phoneNumber: nk1[4] || '',
      address: nk1[5] || ''
    }
  });
}

module.exports.extractVisitInfo = function(segments) {
  const pv1 = getFirstSegmentByName('PV1', segments);

  return {
    segmentName: pv1[0] || '',
    setId: pv1[1] || '',
    patientClass: pv1[2] || '',
    assignedPatientLocation: pv1[3] || '',
    admissionType: pv1[4] || '',
    preadmitNumber: pv1[5] || '',
    priorPatientLocation: pv1[6] || '',
    attendingDoctor: pv1[7] || '',
    referringDoctor: pv1[8] || '',
    consultingDoctor: pv1[9] || '',
    hospitalService: pv1[10] || '',
    admissionDateTime: pv1[11] || '',
    admitSource: pv1[12] || '',
    ambulatoryStatus: pv1[13] || '',
    vipIndicator: pv1[14] || '',
    patientType: pv1[15] || '',
    visitNumber: pv1[16] || '',
    patientVisitNumber: pv1[17] || '',
    financialClass: pv1[18] || '',
    chargePriceIndicator: pv1[19] || '',
    courtesyCode: pv1[20] || '',
    creditRating: pv1[21] || '',
    dischargeDateTime: pv1[22] || '',
  };
};


module.exports.extractVisitAdditionalInfo = function(segments) {
  const pv2 = getFirstSegmentByName('PV2', segments);

  return {
    segmentName: pv2[0] || '',
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

    const orderingProviderParts = obr[15]?.split('^') || [];
    const performingOrgParts = obr[20]?.split('^') || [];

    return {
      segmentName: obr[0] || '',
      placerOrderNumber: obr[2] || '',
      fillerOrderNumber: obr[3] || '',
      testCode: obr[4] ? obr[4].split('^')[0] || '' : '',
      testName: obr[4] ? obr[4].split('^')[1] || '' : '',
      observationDateTime: obr[7] || '',
      observationEndTime: obr[8] || '',
      priority: obr[10] || '',
      orderStatus: obr[25] || '', 
      orderingProviderId: orderingProviderParts[0] || '',
      orderingProviderName: orderingProviderParts[1] || '',
      performingOrganization: performingOrgParts[1] || '',
      performingOrganizationId: performingOrgParts[0] || '', 
    };
  });
};



  module.exports.extractOrderControlInfo=function (segments) {
    const orcList = getSegmentByName('ORC',segments);
  
    return orcList.map(orcStr => {
      const orc=orcStr.split("|");

      let orderingProviderId = '';
      let orderingProviderName = '';

      if (orc[10]) {
        const providerParts = orc[10].split("^");
        orderingProviderId = providerParts[0] || '';
        orderingProviderName = providerParts[1] || '';
      }

      let quantityTiming = orc[7] || ''; 

      let parentPlacer = '';
      let parentFiller = '';

      if (orc[7]) {
        const parentParts = orc[8].split("^");
        parentPlacer = parentParts[0] || '';
        parentFiller = parentParts[1] || '';
      }

      return {
        segmentName: orc[0] || '',
        orderControl: orc[1] || '',
        placerOrderNumber: orc[2] || '',
        fillerOrderNumber: orc[3] || '',
        orderStatus: orc[5] || '',
        scheduledDateTime: orc[9] || '',
        quantityTiming: quantityTiming, 
        parent: {                             
          placerOrderNumber: parentPlacer,
          fillerOrderNumber: parentFiller
        },
        orderingProvider: {
          id: orderingProviderId,
          name: orderingProviderName
        }
      }
    });
  }
  
  

  module.exports.extractGuarantorInfo=function (segments) {
    const gt1List = getSegmentByName('GT1',segments);
  
    return gt1List.map(gtStr => {
      const gt1 = gtStr.split("|");
  
      const idComponents = gt1[2]?.split("^") || [];
      const nameParts = gt1[4]?.split("^") || [];
  
      return {
        segmentName: gt1[0] || '',
        guarantorNumber: {
          id: idComponents[0] || '',
          assigningAuthority: idComponents[3] || '',
          idTypeCode: idComponents[4] || ''
        },
        relationship: gt1[3] || '',
  
        name: {
          family: nameParts[0] || '',
          given: nameParts[1] || '',
          middle: nameParts[2] || ''
        },
  
        socialSecurityNumber: gt1[5] || '',
        dateOfBirth: gt1[6] || '',
        phoneNumber: gt1[7] || ''
      };
    });
  }
  
  
  module.exports.extractAllergyInfo=function(segments) {
    const al1List = getSegmentByName('AL1',segments);
  
    return al1List.map(alStr => {
      const al1=alStr.split("|");


      return {
        segmentName: al1[0] || '',
        allergyType: al1[2] || '',
        allergyCode:al1[3] || '',
        substance: al1[4] || '',
        reaction: al1[5] || '',
        dateTime: al1[6] || ''
      }
    });
  }
  
  
  module.exports.extractObservationResults = function (segments) {
    const obxList = getSegmentByName('OBX', segments);
  
    return obxList.map(obxStr => {
      const obx = obxStr.split("|");
  
      const observationIdParts = (obx[3] || '').split("^");
      
      return {
        segmentName: obx[0] || '',
        setId: obx[1] || '', 
        valueType: obx[2] || '',
        testCode: observationIdParts[0] || '',
        testDisplayName: observationIdParts[1] || '',
        testCodeSystem: observationIdParts[2] || '',
        observationSubId: obx[4] || '',
        value: obx[5] || '',
        unit: obx[6] || '',
        referenceRange: obx[7] || '',
        abnormalFlags: obx[8] || '',
        observationResultStatus: obx[11] || '', 
        responsibleObserver: obx[16] || '',
        dateTime: obx[15] || '',
        method: obx[17] || '', 
        equipmentInstanceIdentifier: obx[18] || '', 
        performingOrganization: obx[23] || '', 
      };
    });
  };
  

  module.exports.extractPatientDemographics=function(segments) {
    const pd1 = getFirstSegmentByName('PD1',segments);
  
    return {
      segmentName: pd1[0] || '',
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
  
      const procedureCodeParts = pr1[2]?.split("^") || [];
      const surgeonParts = pr1[5]?.split("^") || [];
  
      return {
        segmentName: pr1[0] || '',
        procedureCode: procedureCodeParts[0] || '',
        procedureName: procedureCodeParts[1] || '',
        codeSystem: procedureCodeParts[2] || '',
  
        procedureStartDate: pr1[3] || '',
        procedureEndDate: pr1[4] || '',
  
        surgeon: {
          prefix: surgeonParts[4] || '',
          given: surgeonParts[1] || '',
          family: surgeonParts[0] || '',
        },
  
        procedureType: pr1[6] || '',
        description: pr1[7] || ''
      };
    });
  };
  

  module.exports.extractRoleInfo = function(segments) {
    const rolList = getSegmentByName('ROL', segments);
  
    return rolList.map(rolStr => {
      const fields = rolStr.split("|");
  
      const roleCodeParts = fields[3]?.split("^") || [];
      const personParts = fields[4]?.split("^") || [];
  
      return {
        segmentName: fields[0] || '',
        roleCode: roleCodeParts[0] || '',
        roleDisplayName: roleCodeParts[1] || '',
        roleCodeSystem: roleCodeParts[2] || '',
  
        startDate: fields[5] || '',
        endDate: fields[6] || '',
  
        person: {
          id: personParts[0] || '',
          family: personParts[1] || '',
          given: personParts[2] || '',
          middle: personParts[3] || '',
          prefix: personParts[5] || '',
          suffix: personParts[6] || ''
        }
      };
    });
  };

  module.exports.extractInsuranceInfo = function(segments) {
    const in1List = getSegmentByName('IN1', segments);
  
    return in1List.map(in1Str => {
      const in1 = in1Str.split("|");
  
      return {
        segmentName: in1[0] || '',
        insurancePlanId: in1[2] || '',
        insuranceCompanyId: in1[3]?.split('^')[0] || '',
        insuranceCompanyName: in1[3]?.split('^')[1] || '',
        insurancePlanCode: in1[4]?.split('^')[0] || '',
        insurancePlanName: in1[4]?.split('^')[1] || '',
        insuranceStartDate: in1[5] || '',
        insuranceEndDate: in1[6] || '',
        groupNumber: in1[7] || '',
        insuredPersonName: in1[11] || '',
        insuredPersonAddress: in1[12] || '',
        phoneNumber: in1[13] || '',
        doctorName: in1[16] || '',
        doctorRole: in1[17] || '',
      };
    });
  };
  
    

  module.exports.extractDiagnosisInfo = function(segments) {
    const dg1List = getSegmentByName('DG1', segments);
    
    return dg1List.map(dg1Str => {
      const dg1 = dg1Str.split("|");
  
      return {
        segmentName: dg1[0] || '',
        diagnosisCode: dg1[2] || '',
        diagnosisName: dg1[3].replace(/\^/g, ' ') || '',
        diagnosisDescription: dg1[4].replace(/\^/g, ' ') || '',
        diagnosisDateTime: dg1[5] || '',
        diagnosisEndDateTime: dg1[6] || '',
        diagnosisType: dg1[7] || ''
      };
    });
  };
  


  
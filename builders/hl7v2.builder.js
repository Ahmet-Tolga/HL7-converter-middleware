const { extractMshInfo, extractEvnInfo, extractPatientInfo, extractNextOfKinInfo,  extractPatientVisitInfo, extractPatientVisitAdditionalInfo, extractOrders, extractAllergies, extractDiagnosisInfo, extractRoleInfo, extractProcedureInfo, extractInsuranceInfo, extractGuarantorInfo, extractOrderControlInfo, extractObservations } = require('../parsers/hl7v3-parser');

const fs = require('fs').promises;

module.exports.buildMessage = async function(file_path) {
    try {
        const data = await fs.readFile(file_path);

        const msh_segment = await extractMshInfo(data);
        const evn_segment = await extractEvnInfo(data);
        const pid_segment = await extractPatientInfo(data);
        const next_k = await extractNextOfKinInfo(data);
        const patient_visit = await extractPatientVisitInfo(data);
        const patient_visit_additional = await extractPatientVisitAdditionalInfo(data);
        const orders = await extractOrders(data);
        const order_control = await extractOrderControlInfo(data);
        const observation = await extractObservations(data);
        const allergies = await extractAllergies(data);
        const diagnoses = await extractDiagnosisInfo(data);
        const guarantor = await extractGuarantorInfo(data);
        const insurance=await extractInsuranceInfo(data);
        const role = await extractRoleInfo(data);
        const procedure=await extractProcedureInfo(data);

        const hl7Segments = [
            msh_segment,
            evn_segment,
            pid_segment,
            next_k,
            patient_visit,
            patient_visit_additional,
            diagnoses,
            orders,
            observation,
            order_control,
            allergies,
            role,
            procedure,
            guarantor,
            insurance
        ];

        const filteredSegments = hl7Segments.filter(segment => typeof segment === 'string' && segment.trim() !== '');

        const hl7v2 = filteredSegments.join('\n');
        return hl7v2;
    } catch (err) {
        console.error("Error building HL7 message:", err);
    }
};


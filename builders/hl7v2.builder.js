const { extractMshInfo, extractEvnInfo, extractPatientInfo } = require('../parsers/hl7v3-parser');

const fs = require('fs').promises;

module.exports.buildMessage = async function(file_path) {
    try {
        const data = await fs.readFile(file_path);

        const msh_segment = await extractMshInfo(data);
        const evn_segment = await extractEvnInfo(data);
        const pid_segment = await extractPatientInfo(data);
        // const next_k = await extractNextOfKinInfo(data);
        // const patient_visit = await extractPatientVisitInfo(data);
        // const patient_visit_additional = await extractPatientVisitAdditionalInfo(data);
        // const orders = await extractOrders(data);
        // const order_control = await extractOrderControlInfo(data);
        // const observations = await extractObservations(data);
        // const allergies = await extractAllergies(data);
        // const diagnoses = await extractDiagnoses(data);
        // const gurantor = await extractGuarantor(data);
        // const role = await extractAssignedRoles(data);

        const hl7Segments = [
            msh_segment,
            evn_segment,
            pid_segment
        ];

        const filteredSegments = hl7Segments.filter(segment => segment && segment.trim() !== '');

        const hl7v2 = filteredSegments.join('\n');
        return hl7v2;
    } catch (err) {
        console.error("Error building HL7 message:", err);
    }
};


const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    medicines: [{
        name: String,
        dosage: String,
        duration: String
    }],
    instructions: { type: String },
    pdfUrl: { type: String, default: '' },
    aiExplanation: { type: String, default: '' } // Patient explanation
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);

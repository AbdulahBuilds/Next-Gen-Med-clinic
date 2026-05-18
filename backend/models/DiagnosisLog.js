const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: String, required: true },
    aiResponse: { type: String }, // The response from Gemini
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' }
}, { timestamps: true });

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contact: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin or Receptionist
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Link to their login account if they have one
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);

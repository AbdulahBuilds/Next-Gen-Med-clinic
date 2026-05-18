const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');

// Get prescriptions
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.query.patientId) query.patientId = req.query.patientId;
        if (req.user.role === 'Doctor') query.doctorId = req.user._id;
        if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ email: req.user.email });
            if (!patient) return res.json([]);
            query.patientId = patient._id;
        }
        
        const prescriptions = await Prescription.find(query)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create prescription (Doctor only)
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Only doctors can write prescriptions' });
        }
        const prescription = new Prescription({
            ...req.body,
            doctorId: req.user._id
        });
        const created = await prescription.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

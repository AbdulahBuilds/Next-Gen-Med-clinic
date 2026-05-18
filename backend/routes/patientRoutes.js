const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Get all patients (Receptionist, Admin, Doctor)
router.get('/', protect, authorize('Admin', 'Receptionist', 'Doctor'), async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new patient (Receptionist, Admin)
router.post('/', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const patient = new Patient({
            ...req.body,
            createdBy: req.user._id
        });
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get patient by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update patient by ID
router.put('/:id', protect, authorize('Admin', 'Receptionist'), async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

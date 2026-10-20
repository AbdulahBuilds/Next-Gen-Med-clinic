const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');

// Get all appointments
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            query.doctorId = req.user._id;
        } else if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ email: req.user.email });
            if (!patient) return res.json([]); // No patient profile yet
            query.patientId = patient._id;
        }
        
        const appointments = await Appointment.find(query)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Book appointment
router.post('/', protect, async (req, res) => {
    try {
        let appointmentData = { ...req.body };
        if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ email: req.user.email });
            if (!patient) return res.status(400).json({ message: "Patient profile not found" });
            appointmentData.patientId = patient._id;
        }
        const appointment = new Appointment(appointmentData);
        const created = await appointment.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update appointment status
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Doctor, Receptionist, Admin can update status
        // Patient can only cancel their own appointment
        if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ email: req.user.email });
            if (!patient || String(appointment.patientId) !== String(patient._id)) {
                return res.status(403).json({ message: 'Not authorized to modify this appointment' });
            }
            if (status !== 'cancelled') {
                return res.status(403).json({ message: 'Patients can only cancel appointments' });
            }
        }

        appointment.status = status;
        const updated = await appointment.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;

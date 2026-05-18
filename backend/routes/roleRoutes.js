const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET all roles (any logged-in user can fetch for registration forms)
router.get('/', protect, async (req, res) => {
    try {
        const roles = await Role.find({}).sort({ name: 1 });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create role (Admin only)
router.post('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const exists = await Role.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Role already exists' });
        const role = await Role.create({ name, description });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE role (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

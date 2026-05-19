const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const roleRoutes = require('./routes/roleRoutes');
const Role = require('./models/Role');

const app = express();
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/roles', roleRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('AI Clinic Management API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        // Seed default roles if none exist
        const count = await Role.countDocuments();
        if (count === 0) {
            await Role.insertMany([
                { name: 'Admin', description: 'System Administrator' },
                { name: 'Doctor', description: 'Medical Doctor' },
                { name: 'Receptionist', description: 'Front Desk Staff' },
                { name: 'Patient', description: 'Clinic Patient' },
            ]);
            console.log('Default roles seeded.');
        }
    })
    .catch(err => {
        console.error('CRITICAL: MongoDB connection error:', err);
    });
});

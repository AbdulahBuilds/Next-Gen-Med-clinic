const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        default: 'Patient'
    },
    consultationFee: {
        type: Number,
        default: null
    },
    subscriptionPlan: {
        type: String,
        enum: ['Free', 'Pro'],
        default: 'Free'
    },
    profilePicture: { type: String, default: '' },
    // Patient specific fields
    medicalHistory: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    dateOfBirth: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const DiagnosisLog = require('../models/DiagnosisLog');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');

// AI Feature 1 & 3: Smart Symptom Checker & Risk Flagging
router.post('/symptom-checker', protect, async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Only doctors can use this' });
        }

        const { symptoms, age, gender, history, patientId } = req.body;
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `
        You are a medical AI assistant helping a doctor. 
        Patient Info: Age ${age}, Gender ${gender}, History: ${history}.
        Symptoms: ${symptoms}.
        
        Provide: 
        1. Possible conditions
        2. Risk level (Low, Medium, High)
        3. Suggested tests
        
        Format your response as a simple clean text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const aiResponseText = response.text;
        
        let riskLevel = 'Unknown';
        if (aiResponseText.includes('High') || aiResponseText.includes('high risk') || aiResponseText.includes('high-risk')) riskLevel = 'High';
        else if (aiResponseText.includes('Medium')) riskLevel = 'Medium';
        else if (aiResponseText.includes('Low')) riskLevel = 'Low';

        if (patientId) {
            const log = new DiagnosisLog({
                patientId,
                doctorId: req.user._id,
                symptoms,
                aiResponse: aiResponseText,
                riskLevel
            });
            await log.save();
        }

        res.json({ aiResponse: aiResponseText, riskLevel });
    } catch (error) {
        console.error('AI Error type:', typeof error);
        console.error('AI Error message:', error.message);
        console.error('AI Error status:', error.status);
        console.error('AI Error code:', error.code);
        console.error('AI Error toString:', error.toString?.());
        
        const errStr = (error.message || '') + (error.toString?.() || '') + JSON.stringify(error);
        const isQuotaError = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota');
        if (isQuotaError) {
            return res.status(429).json({ message: 'AI quota exceeded for today. The free tier limit has been reached. Please try again tomorrow or use a new API key.' });
        }
        res.status(500).json({ message: 'AI processing failed. Please proceed manually.' });
    }
});

// AI Feature 2: Prescription Explanation
router.post('/explain-prescription', protect, async (req, res) => {
    try {
        const { instructions, medicines } = req.body;
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
        Explain this prescription to a patient in very simple terms.
        Medicines: ${JSON.stringify(medicines)}.
        Instructions: ${instructions}.
        
        Include:
        1. Simple explanation of what the medicines do.
        2. Lifestyle recommendations.
        3. Preventive advice.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ explanation: response.text });
    } catch (error) {
        const isQuotaError = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
        if (isQuotaError) {
            return res.status(429).json({ message: 'AI quota exceeded for today. Please try again tomorrow.' });
        }
        res.status(500).json({ message: 'AI explanation unavailable right now.' });
    }
});

// Get diagnosis history for a patient
router.get('/diagnosis', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            if (req.query.patientId) query.patientId = req.query.patientId;
            query.doctorId = req.user._id;
        } else if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ email: req.user.email });
            if (!patient) return res.json([]);
            query.patientId = patient._id;
        }
        
        const logs = await DiagnosisLog.find(query)
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

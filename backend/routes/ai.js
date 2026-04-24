const express = require('express');
const router = express.Router();

const SYMPTOM_RULES = [
  { keywords: ['fever', 'cough', 'throat'], condition: 'Viral Infection / Flu', specialization: 'General Physician' },
  { keywords: ['headache', 'vision', 'nausea'], condition: 'Migraine', specialization: 'Neurologist' },
  { keywords: ['stomach', 'pain', 'diarrhea'], condition: 'Gastroenteritis', specialization: 'Gastroenterologist' },
  { keywords: ['chest', 'pain', 'breath'], condition: 'Cardiovascular Issue', specialization: 'Cardiologist' },
  { keywords: ['skin', 'rash', 'itch'], condition: 'Allergy / Dermatitis', specialization: 'Dermatologist' }
];

router.post('/check', (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) return res.status(400).json({ error: 'Symptoms are required' });

  const lowercaseSymptoms = symptoms.toLowerCase();
  
  let bestMatch = null;
  let maxMatches = 0;

  for (const rule of SYMPTOM_RULES) {
    let matches = 0;
    for (const keyword of rule.keywords) {
      if (lowercaseSymptoms.includes(keyword)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = rule;
    }
  }

  if (bestMatch && maxMatches > 0) {
    res.json({
      condition: bestMatch.condition,
      recommendation: `Based on your symptoms, we recommend consulting a ${bestMatch.specialization}.`,
      specialization: bestMatch.specialization
    });
  } else {
    res.json({
      condition: 'Unknown Condition',
      recommendation: 'Please consult a General Physician for a proper checkup.',
      specialization: 'General Physician'
    });
  }
});

module.exports = router;

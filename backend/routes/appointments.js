const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, time, symptoms } = req.body;
    const appointment = await Appointment.create({
      patientId: req.user.user_id,
      doctorId,
      time,
      symptoms
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user.user_id }).populate('doctorId', 'name specialization').sort({ time: 1 });
    } else {
      appointments = await Appointment.find({ doctorId: req.user.user_id }).populate('patientId', 'name').sort({ time: 1 });
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can update status' });
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

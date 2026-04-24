const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
  time: { type: Date, required: true },
  symptoms: { type: String }, // Initial symptoms entered during booking
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

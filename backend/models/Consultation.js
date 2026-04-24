const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  notes: { type: String },
  prescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);

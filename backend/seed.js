require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Consultation = require('./models/Consultation');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Consultation.deleteMany({});

    console.log('Creating sample doctors...');
    const password = await bcrypt.hash('password123', 10);
    
    const docs = await User.insertMany([
      { name: 'Dr. Sarah Connor', email: 'sarah@ruralmed.com', password, role: 'doctor', specialization: 'General Physician' },
      { name: 'Dr. Gregory House', email: 'house@ruralmed.com', password, role: 'doctor', specialization: 'Neurologist' },
      { name: 'Dr. John Watson', email: 'watson@ruralmed.com', password, role: 'doctor', specialization: 'Cardiologist' },
      { name: 'Dr. Derek Shepherd', email: 'derek@ruralmed.com', password, role: 'doctor', specialization: 'Gastroenterologist' },
      { name: 'Dr. Meredith Grey', email: 'meredith@ruralmed.com', password, role: 'doctor', specialization: 'Dermatologist' }
    ]);

    console.log('Creating sample patient...');
    const patient = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password,
      role: 'patient'
    });

    console.log('Creating sample appointments...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const apt1 = await Appointment.create({
      patientId: patient._id,
      doctorId: docs[0]._id, // Sarah - General
      status: 'approved',
      time: tomorrow,
      symptoms: 'fever and a sore throat'
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const apt2 = await Appointment.create({
      patientId: patient._id,
      doctorId: docs[2]._id, // Watson - Cardio
      status: 'pending',
      time: nextWeek,
      symptoms: 'mild chest pain'
    });

    console.log('Seed completed successfully!');
    console.log('\n--- SAMPLE LOGIN CREDENTIALS ---');
    console.log('Patient: john@example.com / password123');
    console.log('Doctor: sarah@ruralmed.com / password123');
    console.log('--------------------------------\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();

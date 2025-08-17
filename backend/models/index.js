const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const DoctorAvailability = require('./DoctorAvailability');

// Define associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'availability' });
DoctorAvailability.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = {
  sequelize,
  User,
  Doctor,
  Appointment,
  DoctorAvailability
};
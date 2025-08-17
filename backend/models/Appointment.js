const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  doctorId: {
    type: DataTypes.UUID,
    references: {
      model: Doctor,
      key: 'id'
    },
    allowNull: false
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30 // minutes
  },
  consultationMode: {
    type: DataTypes.ENUM('online', 'in-person'),
    defaultValue: 'online'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'pending'
  },
  symptoms: {
    type: DataTypes.TEXT
  },
  prescriptions: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  cancellationReason: {
    type: DataTypes.STRING
  },
  lockedUntil: {
    type: DataTypes.DATE
  }
});


module.exports = Appointment;
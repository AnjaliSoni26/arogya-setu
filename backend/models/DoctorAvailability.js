const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Doctor = require('./Doctor');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.UUID,
    references: {
      model: Doctor,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0-6 (Sunday to Saturday)
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  consultationMode: {
    type: DataTypes.ENUM('online', 'in-person'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = DoctorAvailability;
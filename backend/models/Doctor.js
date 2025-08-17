const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  qualifications: {
    type: DataTypes.TEXT
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  consultationModes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['online']
  },
  bio: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});


module.exports = Doctor;
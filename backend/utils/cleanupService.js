const cron = require('node-cron');
const { Appointment } = require('../models');
const { Op } = require('sequelize');

// Run every minute to clean up expired locked slots
cron.schedule('* * * * *', async () => {
  try {
    const expiredAppointments = await Appointment.findAll({
      where: {
        status: 'pending',
        lockedUntil: { [Op.lt]: new Date() }
      }
    });

    if (expiredAppointments.length > 0) {
      await Appointment.destroy({
        where: {
          status: 'pending',
          lockedUntil: { [Op.lt]: new Date() }
        }
      });

      console.log(`Cleaned up ${expiredAppointments.length} expired appointment slots`);
    }
  } catch (error) {
    console.error('Error cleaning up expired slots:', error);
  }
});
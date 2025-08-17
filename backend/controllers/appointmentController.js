const { Appointment, Doctor, User } = require('../models');
const { Op } = require('sequelize');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, consultationMode, symptoms } = req.body;
    const patientId = req.user.id;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Get doctor details for fee
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Lock slot for 5 minutes
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + 5);

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      consultationMode,
      symptoms,
      fee: doctor.consultationFee,
      status: 'pending',
      lockedUntil
    });

    res.status(201).json({
      message: 'Appointment slot locked. Please confirm within 5 minutes.',
      appointment,
      lockExpiresAt: lockedUntil
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { otp } = req.body; // Mock OTP verification

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Appointment is not in pending state' });
    }

    // Check if lock has expired
    if (new Date() > appointment.lockedUntil) {
      await appointment.destroy();
      return res.status(400).json({ error: 'Appointment lock has expired' });
    }

    // Mock OTP verification (in real app, verify against sent OTP)
    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    appointment.status = 'confirmed';
    appointment.lockedUntil = null;
    await appointment.save();

    res.json({
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { patientId: req.user.id };
    
    if (status) {
      whereClause.status = status;
    }

    if (upcoming === 'true'||upcoming === true) {
      const today = new Date();
      whereClause.appointmentDate = { [Op.gte]: today };
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      appointments: appointments.rows,
      totalPages: Math.ceil(appointments.count / limit),
      currentPage: parseInt(page),
      totalAppointments: appointments.count
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if appointment is more than 24 hours away
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = new Date();
    const timeDifference = appointmentDateTime - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({ error: 'Cannot cancel appointment less than 24 hours before scheduled time' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTime } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if current appointment is more than 24 hours away
    const currentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = new Date();
    const timeDifference = currentDateTime - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({ error: 'Cannot reschedule appointment less than 24 hours before scheduled time' });
    }

    // Check if new slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { [Op.in]: ['pending', 'confirmed'] },
        id: { [Op.ne]: appointmentId }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'New slot is already booked' });
    }

    appointment.appointmentDate = newDate;
    appointment.appointmentTime = newTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  bookAppointment,
  confirmAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment
};
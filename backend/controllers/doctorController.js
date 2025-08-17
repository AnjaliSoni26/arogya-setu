const { Doctor, User, DoctorAvailability, Appointment } = require('../models');
const { Op } = require('sequelize');

const getDoctors = async (req, res) => {
  try {
    const { specialization, mode, page = 1, limit = 10, sortBy = 'rating' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { isActive: true };
    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }
    if (mode) {
      whereClause.consultationModes = { [Op.contains]: [mode] };
    }

    const order = [];
    if (sortBy === 'rating') {
      order.push(['rating', 'DESC']);
    } else if (sortBy === 'experience') {
      order.push(['experience', 'DESC']);
    } else if (sortBy === 'fee') {
      order.push(['consultationFee', 'ASC']);
    }

    const doctors = await Doctor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: DoctorAvailability,
          as: 'availability',
          where: { isActive: true },
          required: false
        }
      ],
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      doctors: doctors.rows,
      totalPages: Math.ceil(doctors.count / limit),
      currentPage: parseInt(page),
      totalDoctors: doctors.count
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: DoctorAvailability,
          as: 'availability',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date, mode } = req.query;

    if (!doctorId || !date || !mode) {
      return res.status(400).json({ error: 'Doctor ID, date, and mode are required' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get doctor's availability for the requested day
    const availability = await DoctorAvailability.findAll({
      where: {
        doctorId,
        dayOfWeek,
        consultationMode: mode,
        isActive: true
      }
    });

    if (availability.length === 0) {
      return res.json({ slots: [] });
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: date,
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    const bookedTimes = existingAppointments.map(apt => apt.appointmentTime);
    const lockedSlots = existingAppointments
      .filter(apt => apt.lockedUntil && new Date(apt.lockedUntil) > new Date())
      .map(apt => apt.appointmentTime);

    // Generate available slots
    const slots = [];
    availability.forEach(avail => {
      const startTime = new Date(`1970-01-01T${avail.startTime}`);
      const endTime = new Date(`1970-01-01T${avail.endTime}`);
      
      for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 30)) {
        const timeString = time.toTimeString().slice(0, 5);
        
        if (!bookedTimes.includes(timeString)) {
          slots.push({
            time: timeString,
            available: !lockedSlots.includes(timeString)
          });
        }
      }
    });

    res.json({ slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSpecializations = async (req, res) => {
  try {
    const specializations = await Doctor.findAll({
      attributes: ['specialization'],
      group: ['specialization'],
      where: { isActive: true }
    });

    const uniqueSpecializations = specializations.map(s => s.specialization);
    res.json({ specializations: uniqueSpecializations });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  getSpecializations
};
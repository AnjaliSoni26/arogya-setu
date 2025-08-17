const express = require('express');
const {
  bookAppointment,
  confirmAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');

const router = express.Router();

router.post('/', authenticateToken, validateAppointment, bookAppointment);
router.post('/:appointmentId/confirm', authenticateToken, confirmAppointment);
router.get('/', authenticateToken, getAppointments);
router.put('/:appointmentId/cancel', authenticateToken, cancelAppointment);
router.put('/:appointmentId/reschedule', authenticateToken, rescheduleAppointment);

module.exports = router;
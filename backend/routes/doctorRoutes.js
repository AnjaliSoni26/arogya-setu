const express = require('express');
const {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  getSpecializations
} = require('../controllers/doctorController');

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/slots', getAvailableSlots);
router.get('/:id', getDoctorById);

module.exports = router;
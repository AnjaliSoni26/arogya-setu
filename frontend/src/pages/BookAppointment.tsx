import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { doctorAPI, appointmentAPI } from '../services/api';
import { Doctor, TimeSlot } from '../types';
import { format, addDays, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

interface BookingForm {
  appointmentDate: string;
  appointmentTime: string;
  consultationMode: 'online' | 'in-person';
  symptoms: string;
}

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingForm>();

  const watchedMode = watch('consultationMode');
  const watchedDate = watch('appointmentDate');
  const watchedTime = watch('appointmentTime');

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  useEffect(() => {
    if (watchedDate && watchedMode && doctor) {
      fetchAvailableSlots();
    }
  }, [watchedDate, watchedMode, doctor]);

  const fetchDoctor = async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const response = await doctorAPI.getDoctorById(doctorId);
      setDoctor(response.doctor);
      
      // Set default mode if doctor supports only one
      if (response.doctor.consultationModes.length === 1) {
        setValue('consultationMode', response.doctor.consultationModes[0]);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!doctor || !watchedDate || !watchedMode) return;

    setSlotsLoading(true);
    try {
      const response = await doctorAPI.getAvailableSlots(doctor.id, watchedDate, watchedMode);
      setAvailableSlots(response.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    if (!doctor) return;

    try {
      const response = await appointmentAPI.bookAppointment({
        doctorId: doctor.id,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        consultationMode: data.consultationMode,
        symptoms: data.symptoms
      });

      setBookingData(response);
      setShowConfirmModal(true);
      toast.success('Slot locked! Please confirm with OTP within 5 minutes.');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to book appointment';
      toast.error(message);
    }
  };

  const confirmBooking = async () => {
    if (!bookingData) return;

    setIsConfirming(true);
    try {
      await appointmentAPI.confirmAppointment(bookingData.appointment.id, otp);
      toast.success('Appointment confirmed successfully!');
      setShowConfirmModal(false);
      navigate('/appointments');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to confirm appointment';
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      dates.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM dd, yyyy (EEE)')
      });
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor not found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="text-emerald-600 hover:text-emerald-700"
        >
          Back to doctors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/doctors')}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to doctors
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="text-center mb-4">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Dr. {doctor.user.firstName} {doctor.user.lastName}
              </h3>
              <p className="text-emerald-600 font-medium">{doctor.specialization}</p>
              <p className="text-gray-600">{doctor.experience} years experience</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Consultation Fee</span>
                <span className="text-lg font-semibold text-emerald-600">₹{doctor.consultationFee}</span>
              </div>
              
              <div className="mb-2">
                <span className="font-medium text-gray-900 block mb-1">Available Modes</span>
                <div className="flex space-x-2">
                  {doctor.consultationModes.includes('online') && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                      <Video className="h-3 w-3 mr-1" />
                      Online
                    </span>
                  )}
                  {doctor.consultationModes.includes('in-person') && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded">
                      <MapPin className="h-3 w-3 mr-1" />
                      In-person
                    </span>
                  )}
                </div>
              </div>

              {doctor.bio && (
                <div>
                  <span className="font-medium text-gray-900 block mb-1">About</span>
                  <p className="text-sm text-gray-600">{doctor.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Appointment Details</h2>

            {/* Consultation Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Mode *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.consultationModes.includes('online') && (
                  <label className="relative">
                    <input
                      {...register('consultationMode', { required: 'Please select consultation mode' })}
                      type="radio"
                      value="online"
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      watchedMode === 'online'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Online Consultation</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Video call consultation</p>
                    </div>
                  </label>
                )}
                
                {doctor.consultationModes.includes('in-person') && (
                  <label className="relative">
                    <input
                      {...register('consultationMode', { required: 'Please select consultation mode' })}
                      type="radio"
                      value="in-person"
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      watchedMode === 'in-person'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-green-500" />
                        <span className="font-medium">In-person Visit</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Visit doctor's clinic</p>
                    </div>
                  </label>
                )}
              </div>
              {errors.consultationMode && (
                <p className="text-red-600 text-sm mt-1">{errors.consultationMode.message}</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Select Date *
              </label>
              <select
                {...register('appointmentDate', { required: 'Please select a date' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Choose a date</option>
                {generateDateOptions().map(date => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
              {errors.appointmentDate && (
                <p className="text-red-600 text-sm mt-1">{errors.appointmentDate.message}</p>
              )}
            </div>

            {/* Time Slot Selection */}
            {watchedDate && watchedMode && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Select Time *
                </label>
                
                {slotsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-600 py-4">No available slots for the selected date and mode.</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map(slot => (
                      <label key={slot.time} className="relative">
                        <input
                          {...register('appointmentTime', { required: 'Please select a time' })}
                          type="radio"
                          value={slot.time}
                          disabled={!slot.available}
                          className="sr-only"
                        />
                        <div className={`p-2 text-center text-sm border rounded cursor-pointer transition-colors ${
                          !slot.available
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                            : watchedTime === slot.time
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}>
                          {slot.time}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                
                {errors.appointmentTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.appointmentTime.message}</p>
                )}
              </div>
            )}

            {/* Symptoms */}
            <div className="mb-6">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms (Optional)
              </label>
              <textarea
                {...register('symptoms')}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Please describe your symptoms or health concerns..."
              />
            </div>

            <button
              type="submit"
              disabled={!watchedDate || !watchedTime || !watchedMode}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Book Appointment
            </button>
          </form>
        </div>
      </div>

      {/* OTP Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Appointment"
        size="md"
      >
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Slot Reserved Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your appointment slot has been locked for 5 minutes. Please enter the OTP to confirm your booking.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP (Use: 123456 for demo)
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-lg tracking-widest"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmBooking}
              disabled={otp.length !== 6 || isConfirming}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConfirming ? <LoadingSpinner size="sm" className="text-white" /> : 'Confirm'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Note: This slot will be released automatically if not confirmed within 5 minutes.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BookAppointment;
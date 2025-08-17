import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import { Appointment } from '../types';
import AppointmentCard from '../components/appointments/AppointmentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    upcoming: false
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTime: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        upcoming: filters.upcoming || undefined
      };

      if (filters.status === '') delete params.status;

      const response = await appointmentAPI.getAppointments(params);
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!selectedAppointment || !cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await appointmentAPI.cancelAppointment(selectedAppointment, cancellationReason);
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to cancel appointment';
      toast.error(message);
    }
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.newDate || !rescheduleData.newTime) {
      toast.error('Please select new date and time');
      return;
    }

    try {
      await appointmentAPI.rescheduleAppointment(
        selectedAppointment,
        rescheduleData.newDate,
        rescheduleData.newTime
      );
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setRescheduleData({ newDate: '', newTime: '' });
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reschedule appointment';
      toast.error(message);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: appointments.length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      pending: appointments.filter(apt => apt.status === 'pending').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Manage your consultations and appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-700">Filter by:</span>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.upcoming}
              onChange={(e) => setFilters(prev => ({ ...prev, upcoming: e.target.checked }))}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">Upcoming only</span>
          </label>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600 mb-4">You haven't booked any appointments yet.</p>
          <a
            href="/doctors"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Book Your First Appointment
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelAppointment}
              onReschedule={handleRescheduleAppointment}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancellationReason('');
          setSelectedAppointment(null);
        }}
        title="Cancel Appointment"
        size="md"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Please provide a reason for cancelling your appointment. Note that you can only cancel appointments that are more than 24 hours away.
          </p>
          
          <div className="mb-4">
            <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation *
            </label>
            <textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Please tell us why you're cancelling..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancellationReason('');
                setSelectedAppointment(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Appointment
            </button>
            <button
              onClick={confirmCancellation}
              disabled={!cancellationReason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setRescheduleData({ newDate: '', newTime: '' });
          setSelectedAppointment(null);
        }}
        title="Reschedule Appointment"
        size="md"
      >
        <div>
          <p className="text-gray-600 mb-4">
            Select a new date and time for your appointment. Note that you can only reschedule appointments that are more than 24 hours away.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-2">
                New Date *
              </label>
              <input
                type="date"
                id="newDate"
                value={rescheduleData.newDate}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="newTime" className="block text-sm font-medium text-gray-700 mb-2">
                New Time *
              </label>
              <select
                id="newTime"
                value={rescheduleData.newTime}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, newTime: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select time</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="17:30">05:30 PM</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setShowRescheduleModal(false);
                setRescheduleData({ newDate: '', newTime: '' });
                setSelectedAppointment(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReschedule}
              disabled={!rescheduleData.newDate || !rescheduleData.newTime}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reschedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
import React from 'react';
import { Appointment } from '../../types';
import { Calendar, Clock, Video, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelOrReschedule = () => {
    if (appointment.status !== 'confirmed') return false;
    
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    return hoursDifference > 24;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">
                Dr. {appointment.doctor?.user.firstName} {appointment.doctor?.user.lastName}
              </h3>
              <p className="text-sm text-emerald-600 font-medium">
                {appointment.doctor?.specialization}
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {format(parseISO(appointment.appointmentDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {appointment.appointmentTime}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {appointment.consultationMode === 'online' ? (
                    <Video className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm text-gray-600 capitalize">
                    {appointment.consultationMode}
                  </span>
                </div>
              </div>
              
              {appointment.symptoms && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              ₹{appointment.fee}
            </span>
          </div>
        </div>
        
        {canCancelOrReschedule() && (onCancel || onReschedule) && (
          <div className="mt-4 flex justify-end space-x-2">
            {onReschedule && (
              <button
                onClick={() => onReschedule(appointment.id)}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
              >
                Reschedule
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(appointment.id)}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
import React from 'react';
import { Doctor } from '../../types';
import { Star, Clock, MapPin, Video, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                Dr. {doctor.user.firstName} {doctor.user.lastName}
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {`${Number(doctor.rating).toFixed(1) }`}
                </span>
                <span className="text-sm text-gray-500">
                  ({doctor.totalReviews} reviews)
                </span>
              </div>
            </div>
            
            <p className="text-sm text-emerald-600 font-medium mt-1">
              {doctor.specialization}
            </p>
            
            <p className="text-sm text-gray-600 mt-1">
              {doctor.experience} years experience
            </p>
            
            {doctor.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {doctor.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  ₹{doctor.consultationFee}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {doctor.consultationModes.includes('online') && (
                  <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-blue-600">Online</span>
                  </div>
                )}
                {doctor.consultationModes.includes('in-person') && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">In-person</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Link
            to={`/doctors/${doctor.id}/book`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
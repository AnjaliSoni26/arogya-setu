import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import { Doctor } from '../types';
import DoctorCard from '../components/doctors/DoctorCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, Filter, MapPin, Video,Stethoscope } from 'lucide-react';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    mode: '',
    sortBy: 'rating'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0
  });

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [filters, pagination.currentPage]);

  const fetchSpecializations = async () => {
    try {
      const response = await doctorAPI.getSpecializations();
      setSpecializations(response.specializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: {
        specialization?: string;
        mode?: string;
        sortBy: string;
        page: number;
        limit: number;
      } = {
        ...filters,
        page: pagination.currentPage,
        limit: 12
      };

      if (filters.specialization === '') delete params.specialization;
      if (filters.mode === '') delete params.mode;

      const response = await doctorAPI.getDoctors(params);
      setDoctors(response.doctors);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDoctors: response.totalDoctors
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    const specialization = doctor.specialization.toLowerCase();
    
    return fullName.includes(searchLower) || specialization.includes(searchLower);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Ayurvedic Doctors</h1>
        <p className="text-gray-600">Discover certified practitioners for your wellness journey</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <select
            value={filters.mode}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="in-person">In-person</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee">Lowest Fee</option>
          </select>
        </div>

        {/* Active Filters */}
        <div className="flex items-center space-x-2">
          {filters.mode && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.mode === 'online' ? (
                <>
                  <Video className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1" />
                  In-person
                </>
              )}
            </span>
          )}
          {filters.specialization && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <Filter className="h-3 w-3 mr-1" />
              {filters.specialization}
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredDoctors.length} of {pagination.totalDoctors} doctors
            </p>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredDoctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Doctors;
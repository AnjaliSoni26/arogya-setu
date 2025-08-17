import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Calendar, Stethoscope } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">Aarogya Setu</span>
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/doctors"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/doctors')
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-100'
                  }`}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Find Doctors
                </Link>

                <Link
                  to="/appointments"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/appointments')
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  My Appointments
                </Link>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
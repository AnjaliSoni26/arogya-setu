import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Shield, 
  Heart, 
  Users, 
  Star,
  ArrowRight
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Stethoscope,
      title: 'Expert Ayurvedic Doctors',
      description: 'Connect with certified Ayurvedic practitioners with years of experience'
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments at your convenience with our simple booking system'
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Choose from online or in-person consultations that fit your schedule'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health information is protected with industry-standard security'
    }
  ];

  const stats = [
    { label: 'Certified Doctors', value: '500+', icon: Users },
    { label: 'Happy Patients', value: '10,000+', icon: Heart },
    { label: 'Average Rating', value: '4.8', icon: Star }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Holistic Health with
              <span className="block text-emerald-200">Ayurvedic Wisdom</span>
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Connect with certified Ayurvedic doctors for personalized consultations. 
              Experience natural healing from the comfort of your home.
            </p>
            <div className="space-x-4">
              {user ? (
                <Link
                  to="/doctors"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-emerald-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Find Doctors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-emerald-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-emerald-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aarogya Setu?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to connect with qualified Ayurvedic practitioners 
              for personalized healthcare solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <feature.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Book your first consultation today and experience the power of Ayurvedic medicine.
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-emerald-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Join Now - It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
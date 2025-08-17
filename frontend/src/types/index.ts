export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  qualifications: string;
  consultationFee: number;
  consultationModes: string[];
  bio: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  consultationMode: 'online' | 'in-person';
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  consultationMode: 'online' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  symptoms?: string;
  prescriptions?: string;
  notes?: string;
  fee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  lockedUntil?: string;
  doctor?: Doctor;
  patient?: User;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}
# Aarogya Setu - Full-Stack Consultation Platform

A comprehensive platform for booking Ayurvedic doctor consultations with real-time slot management, secure authentication, and beautiful UI.

## 🚀 Features

### Core Functionality
- **Doctor Discovery**: Search and filter by specialization, consultation mode (online/in-person), and availability
- **Smart Booking System**: 5-minute slot locking with OTP confirmation to prevent double bookings
- **Appointment Management**: View, reschedule, and cancel appointments with 24-hour policy
- **Real-time Availability**: Dynamic slot generation based on doctor schedules
- **Secure Authentication**: JWT-based authentication with role-based access control

### Technical Highlights
- **Modular Architecture**: Clean separation between frontend, backend, and shared components
- **Database Design**: PostgreSQL with Sequelize ORM for data integrity
- **API Security**: Rate limiting, CORS, helmet security headers
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router Dom** for navigation
- **React Hook Form** for form management
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **PostgreSQL** with Sequelize ORM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Helmet** for security
- **Express Rate Limit** for API protection
- **Node-cron** for cleanup jobs

## 📦 Project Structure

```
ayurvedic-consultation-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Express backend API
│   ├── controllers/        # Route handlers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── shared/                # Shared types and utilities
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd ayurvedic-consultation-platform
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb ayurvedic_consultations

# Configure environment
cp backend/.env.example backend/.env
# Update database credentials in backend/.env
```

### 3. Seed Database
```bash
cd backend
node -e "require('./seedData').seedDatabase().then(() => process.exit())"
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 👤 Sample Credentials

### Patient Account
- Email: `john.doe@example.com`
- Password: `password123`

### Doctor Account
- Email: `priya.sharma@ayurveda.com`
- Password: `password123`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Doctors
- `GET /api/doctors` - List doctors with filters
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/slots` - Get available time slots
- `GET /api/doctors/specializations` - Get all specializations

### Appointments
- `POST /api/appointments` - Book appointment (locks slot)
- `POST /api/appointments/:id/confirm` - Confirm with OTP
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using Joi
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Sequelize ORM with parameterized queries

## 🎯 Key Flows

### 1. Doctor Discovery
- Users can search and filter doctors by specialization and consultation mode
- Real-time availability sorting shows doctors with earliest available slots
- Detailed doctor profiles with ratings, experience, and fees

### 2. Slot Booking Process
1. User selects doctor and consultation details
2. System locks the slot for 5 minutes
3. User receives mock OTP (123456 for demo)
4. Confirmation within 5 minutes or slot is released
5. Email notifications (simulated) sent to both parties

### 3. Appointment Management
- Dashboard view of all appointments with status filtering
- Reschedule/cancel functionality with 24-hour advance requirement
- Real-time updates on appointment status

## 🧪 Demo OTP

For testing the booking confirmation flow, use OTP: **123456**

## 📈 Scaling Considerations

### Architecture for 5,000 appointments/day across 1,000 doctors:

#### Database Optimizations
- **Read Replicas**: Separate read operations for better performance
- **Connection Pooling**: Optimize database connections
- **Indexing Strategy**: Proper indexes on frequently queried columns
- **Partitioning**: Partition appointments table by date ranges

#### API Scalability
- **Load Balancing**: Distribute traffic across multiple server instances
- **Caching Layer**: Redis for frequently accessed data (doctor profiles, availability)
- **Rate Limiting**: Per-user and global rate limits
- **API Versioning**: Maintain backward compatibility

#### Real-time Features
- **WebSocket Integration**: Real-time slot availability updates
- **Event-Driven Architecture**: Microservices with event streaming
- **Queue System**: Background job processing for notifications

#### Monitoring & Performance
- **Application Monitoring**: APM tools for performance tracking
- **Database Monitoring**: Query performance and optimization
- **Auto-scaling**: Horizontal scaling based on traffic patterns
- **CDN Integration**: Static asset delivery optimization

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
NODE_ENV=production npm start
```

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_NAME=ayurvedic_consultations
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-very-long-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ for holistic healthcare through technology.
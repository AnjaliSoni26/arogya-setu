# Scaling Aarogya Setu Platform

## Executive Summary

This document outlines the architectural decisions and scaling strategies to support **5,000 appointments per day** across **1,000 active doctors** while maintaining system reliability, performance, and user experience.

## Current Architecture Analysis

### Current Setup
- **Frontend**: React SPA with Vite
- **Backend**: Node.js/Express monolith
- **Database**: Single PostgreSQL instance
- **Authentication**: JWT tokens
- **Deployment**: Single server instance

### Current Capacity Limits
- ~50-100 concurrent users
- Single database instance
- No caching layer
- Synchronous processing
- Single point of failure

## Target Scale Requirements

### Traffic Projections
- **Daily Load**: 5,000 appointments
- **Peak Hours**: 8 AM - 12 PM, 2 PM - 8 PM (80% of traffic)
- **Peak Appointments/Hour**: ~400-500
- **Concurrent Users**: 500-1,000 during peak
- **API Requests**: ~50,000-100,000 per day
- **Database Operations**: ~200,000-300,000 per day

### Performance Requirements
- **Response Time**: < 200ms for API calls
- **Availability**: 99.9% uptime (8.76 hours downtime/year)
- **Slot Booking**: < 5 second confirmation
- **Search Results**: < 1 second load time
- **Mobile Performance**: < 3 second page load

## Scaling Strategy

### Phase 1: Immediate Optimizations (Month 1)

#### Database Scaling
```sql
-- Add strategic indexes
CREATE INDEX CONCURRENTLY idx_appointments_date_doctor ON appointments(appointment_date, doctor_id);
CREATE INDEX CONCURRENTLY idx_appointments_patient_status ON appointments(patient_id, status);
CREATE INDEX CONCURRENTLY idx_doctors_specialization ON doctors(specialization) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_availability_doctor_day ON doctor_availability(doctor_id, day_of_week);

-- Implement connection pooling
-- Max connections: 100, Pool size: 20
```

#### Application-Level Caching
```javascript
const Redis = require('redis');
const client = Redis.createClient();

// Cache doctor profiles (TTL: 1 hour)
const cacheDoctorProfile = async (doctorId, profile) => {
  await client.setex(`doctor:${doctorId}`, 3600, JSON.stringify(profile));
};

// Cache available slots (TTL: 5 minutes)
const cacheAvailableSlots = async (doctorId, date, slots) => {
  await client.setex(`slots:${doctorId}:${date}`, 300, JSON.stringify(slots));
};
```

#### API Optimizations
```javascript
// Implement response compression
app.use(compression());

// Enhanced rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', createRateLimit(15 * 60 * 1000, 1000, 'Too many requests'));
app.use('/api/auth/login', createRateLimit(15 * 60 * 1000, 10, 'Too many login attempts'));
```

### Phase 2: Horizontal Scaling (Month 2-3)

#### Load Balancer Architecture
```nginx
upstream api_backend {
    least_conn;
    server api1.ayurveda.com:5000;
    server api2.ayurveda.com:5000;
    server api3.ayurveda.com:5000;
    keepalive 32;
}

upstream frontend {
    server web1.ayurveda.com:3000;
    server web2.ayurveda.com:3000;
}

server {
    listen 443 ssl http2;
    server_name ayurveda.com;
    
    location /api/ {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
    }
    
    location / {
        proxy_pass http://frontend;
        gzip on;
        gzip_types text/css application/javascript application/json;
    }
}
```

#### Database Read Replicas
```javascript
// Master-Slave Configuration
const masterDB = new Sequelize(process.env.MASTER_DB_URL, {
  pool: { max: 20, min: 5, idle: 30000, acquire: 60000 }
});

const slaveDB = new Sequelize(process.env.SLAVE_DB_URL, {
  pool: { max: 30, min: 10, idle: 30000, acquire: 60000 }
});

// Read operations use replica
const getDoctors = async (filters) => {
  return await slaveDB.models.Doctor.findAll({
    where: filters,
    include: [{ model: slaveDB.models.User, as: 'user' }]
  });
};

// Write operations use master
const bookAppointment = async (appointmentData) => {
  return await masterDB.models.Appointment.create(appointmentData);
};
```

### Phase 3: Advanced Architecture (Month 4-6)

#### Microservices Migration
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │────│  Load Balancer   │────│      CDN        │
│   (Kong/AWS)    │    │    (Nginx)       │    │   (CloudFlare)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
    ┌────┴────┬─────────────┬─────────────────┬─────────────────┐
    │         │             │                 │                 │
┌───▼───┐ ┌──▼────┐ ┌──────▼──────┐ ┌───────▼───────┐ ┌──────▼──────┐
│ Auth  │ │Doctor │ │Appointment  │ │ Notification  │ │   Payment   │
│Service│ │Service│ │  Service    │ │   Service     │ │   Service   │
└───────┘ └───────┘ └─────────────┘ └───────────────┘ └─────────────┘
```

#### Event-Driven Architecture
```javascript
// Event Bus Implementation
const EventEmitter = require('events');
const eventBus = new EventEmitter();

// Appointment booking flow
class AppointmentService {
  async bookAppointment(appointmentData) {
    // 1. Create appointment
    const appointment = await this.createAppointment(appointmentData);
    
    // 2. Emit events for other services
    eventBus.emit('appointment.booked', {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      scheduledTime: appointment.appointmentDate
    });
    
    return appointment;
  }
}

// Event listeners
eventBus.on('appointment.booked', async (data) => {
  await notificationService.sendBookingConfirmation(data);
  await calendarService.blockTimeSlot(data.doctorId, data.scheduledTime);
  await analyticsService.trackBooking(data);
});
```

#### Advanced Caching Strategy
```javascript
// Multi-layer caching
class CacheManager {
  constructor() {
    this.redis = new Redis.Cluster([/* cluster nodes */]);
    this.localCache = new NodeCache({ stdTTL: 300 });
  }
  
  async get(key) {
    // L1: Memory cache
    let value = this.localCache.get(key);
    if (value) return value;
    
    // L2: Redis cache
    value = await this.redis.get(key);
    if (value) {
      this.localCache.set(key, value);
      return JSON.parse(value);
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    // Set in both layers
    this.localCache.set(key, value, ttl);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}

// Cache warming strategy
const warmCache = async () => {
  // Pre-load popular doctors
  const popularDoctors = await Doctor.findAll({
    where: { rating: { [Op.gte]: 4.5 } },
    limit: 100
  });
  
  for (const doctor of popularDoctors) {
    await cache.set(`doctor:${doctor.id}`, doctor, 7200);
  }
};
```

### Phase 4: Enterprise Scale (Month 6+)

#### Message Queue System
```javascript
// Bull Queue for background jobs
const Queue = require('bull');
const appointmentQueue = new Queue('appointment processing');
const notificationQueue = new Queue('notifications');

// Process appointment booking
appointmentQueue.process(async (job) => {
  const { appointmentData } = job.data;
  
  await processPayment(appointmentData.paymentInfo);
  await sendConfirmationEmail(appointmentData);
  await updateDoctorCalendar(appointmentData);
  await syncWithExternalSystems(appointmentData);
});

// Add job to queue instead of synchronous processing
app.post('/api/appointments', async (req, res) => {
  const appointment = await Appointment.create(req.body);
  
  // Add to background processing queue
  appointmentQueue.add('process', { appointmentData: appointment });
  
  res.json({ appointment, message: 'Booking in progress' });
});
```

#### Database Partitioning
```sql
-- Partition appointments by date
CREATE TABLE appointments_2024_q1 PARTITION OF appointments
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE appointments_2024_q2 PARTITION OF appointments
FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Shard by doctor_id for horizontal scaling
CREATE TABLE appointments_shard_1 (
  LIKE appointments INCLUDING ALL,
  CHECK (abs(hashtext(doctor_id::text)) % 4 = 0)
);

CREATE TABLE appointments_shard_2 (
  LIKE appointments INCLUDING ALL,
  CHECK (abs(hashtext(doctor_id::text)) % 4 = 1)
);
```

#### Real-time Features
```javascript
// WebSocket implementation for real-time updates
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-doctor-room', (doctorId) => {
    socket.join(`doctor-${doctorId}`);
  });
  
  socket.on('join-patient-room', (patientId) => {
    socket.join(`patient-${patientId}`);
  });
});

// Emit slot availability changes
const updateSlotAvailability = (doctorId, date, slots) => {
  io.to(`doctor-${doctorId}`).emit('slots-updated', { date, slots });
};

// Appointment status updates
const notifyAppointmentUpdate = (appointment) => {
  io.to(`patient-${appointment.patientId}`).emit('appointment-updated', appointment);
  io.to(`doctor-${appointment.doctorId}`).emit('appointment-updated', appointment);
};
```

## Infrastructure Architecture

### Cloud Infrastructure (AWS)
```yaml
# Terraform configuration
resource "aws_application_load_balancer" "main" {
  name               = "ayurveda-alb"
  load_balancer_type = "application"
  subnets           = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  
  enable_deletion_protection = true
}

resource "aws_ecs_cluster" "main" {
  name = "ayurveda-cluster"
  
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }
}

resource "aws_rds_cluster" "postgresql" {
  cluster_identifier      = "ayurveda-db-cluster"
  engine                 = "aurora-postgresql"
  engine_version         = "13.7"
  availability_zones     = ["us-west-2a", "us-west-2b", "us-west-2c"]
  database_name          = "ayurvedic_consultations"
  
  backup_retention_period = 30
  preferred_backup_window = "07:00-09:00"
  
  scaling_configuration {
    auto_pause               = false
    max_capacity             = 16
    min_capacity             = 2
    seconds_until_auto_pause = 300
  }
}
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  template:
    spec:
      containers:
      - name: api
        image: ayurveda/api:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 5000
    targetPort: 5000
  type: ClusterIP
```

## Monitoring & Observability

### Application Performance Monitoring
```javascript
// New Relic integration
const newrelic = require('newrelic');

// Custom metrics
const trackAppointmentBooking = (appointment) => {
  newrelic.recordCustomEvent('AppointmentBooked', {
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    consultationMode: appointment.consultationMode,
    fee: appointment.fee
  });
};

// Performance monitoring
const monitorAPIPerformance = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    newrelic.recordMetric('Custom/APIResponse', duration);
    
    if (duration > 1000) {
      console.warn(`Slow API response: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

### Health Checks & Alerts
```javascript
// Health check endpoints
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  try {
    // Database health
    await sequelize.authenticate();
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'error';
  }
  
  try {
    // Redis health
    await redis.ping();
    health.services.cache = 'ok';
  } catch (error) {
    health.services.cache = 'error';
  }
  
  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(register.metrics());
});
```

## Security Considerations

### Enhanced Security Measures
```javascript
// JWT with refresh tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId }, 
    process.env.REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// API key authentication for external services
const validateAPIKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  const validKey = await APIKey.findOne({ where: { keyHash: hashedKey } });
  
  if (!validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Request signing for sensitive operations
const validateSignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};
```

## Performance Benchmarks

### Target Metrics
- **API Response Time**: 95th percentile < 200ms
- **Database Query Time**: 95th percentile < 100ms
- **Cache Hit Ratio**: > 80%
- **Error Rate**: < 0.1%
- **Availability**: 99.9% uptime

### Load Testing Results (Projected)
```bash
# Artillery.io load test configuration
config:
  target: 'https://api.ayurveda.com'
  phases:
    - duration: 300
      arrivalRate: 50
      name: "Warm up"
    - duration: 900
      arrivalRate: 100
      name: "Peak load"
    - duration: 300
      arrivalRate: 150
      name: "Stress test"

scenarios:
  - name: "Book appointment flow"
    weight: 70
    flow:
      - post:
          url: "/api/doctors"
          json:
            specialization: "Panchakarma"
      - post:
          url: "/api/appointments"
          json:
            doctorId: "{{ doctorId }}"
            appointmentDate: "2024-12-20"
            appointmentTime: "10:00"

# Expected Results:
# - 99% of requests < 200ms
# - 0% error rate
# - Sustained 100 RPS
```

## Cost Analysis

### Infrastructure Costs (Monthly)
- **Compute**: 
  - API servers (5 instances): $500
  - Load balancer: $25
  - CDN: $50
- **Database**: 
  - Aurora PostgreSQL cluster: $800
  - Read replicas (2): $400
- **Cache**: Redis cluster: $200
- **Storage**: $100
- **Monitoring**: $150
- **Total**: ~$2,225/month

### Cost per appointment: ~$0.44

## Implementation Timeline

### Month 1: Foundation
- Database optimization and indexing
- Redis caching implementation
- Enhanced rate limiting
- Performance monitoring setup

### Month 2-3: Horizontal Scaling
- Load balancer configuration
- Multiple API server instances
- Database read replicas
- CDN implementation

### Month 4-6: Microservices
- Service decomposition
- Event-driven architecture
- Message queues
- Advanced caching

### Month 6+: Enterprise Features
- Multi-region deployment
- Advanced analytics
- AI-powered recommendations
- Mobile apps

## Risk Mitigation

### Technical Risks
1. **Database bottlenecks**: Implemented through read replicas and caching
2. **Single point of failure**: Eliminated through redundancy
3. **Data consistency**: Managed through eventual consistency patterns
4. **Security vulnerabilities**: Addressed through comprehensive security layers

### Business Risks
1. **Scaling costs**: Controlled through auto-scaling and resource optimization
2. **Vendor lock-in**: Mitigated through containerization and cloud-agnostic design
3. **Compliance**: HIPAA compliance through data encryption and audit logs

## Conclusion

This scaling plan provides a comprehensive roadmap to handle 5,000 daily appointments across 1,000 doctors while maintaining excellent performance and user experience. The phased approach allows for gradual scaling with minimal disruption and controlled costs.

The proposed architecture emphasizes:
- **Reliability**: Through redundancy and failover mechanisms
- **Performance**: Through optimized queries, caching, and CDN
- **Scalability**: Through horizontal scaling and microservices
- **Security**: Through comprehensive security layers
- **Maintainability**: Through clean architecture and monitoring

By following this plan, the Aarogya Setu platform will be well-positioned to handle significant growth while providing a seamless experience for both patients and healthcare providers.
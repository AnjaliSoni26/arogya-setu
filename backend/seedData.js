const bcrypt = require('bcryptjs');
const { User, Doctor, DoctorAvailability } = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create sample users (doctors)
    const doctorUsers = [
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@ayurveda.com',
        phone: '+919876543210',
        password: await bcrypt.hash('password123', 12),
        role: 'doctor'
      },
      {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@ayurveda.com',
        phone: '+919876543211',
        password: await bcrypt.hash('password123', 12),
        role: 'doctor'
      },
      {
        firstName: 'Meera',
        lastName: 'Patel',
        email: 'meera.patel@ayurveda.com',
        phone: '+919876543212',
        password: await bcrypt.hash('password123', 12),
        role: 'doctor'
      },
      {
        firstName: 'Suresh',
        lastName: 'Nair',
        email: 'suresh.nair@ayurveda.com',
        phone: '+919876543213',
        password: await bcrypt.hash('password123', 12),
        role: 'doctor'
      },
      {
        firstName: 'Lakshmi',
        lastName: 'Iyer',
        email: 'lakshmi.iyer@ayurveda.com',
        phone: '+919876543214',
        password: await bcrypt.hash('password123', 12),
        role: 'doctor'
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of doctorUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    console.log('Created users:', createdUsers.length);

    // Create doctor profiles
    const doctorProfiles = [
      {
        userId: createdUsers[0].id,
        specialization: 'Panchakarma Therapy',
        experience: 12,
        qualifications: 'BAMS, MD (Panchakarma), Certified Ayurvedic Practitioner',
        consultationFee: 800,
        consultationModes: ['online', 'in-person'],
        bio: 'Specialized in Panchakarma detoxification and rejuvenation therapies with over 12 years of experience.',
        rating: 4.8,
        totalReviews: 156,
        isActive: true
      },
      {
        userId: createdUsers[1].id,
        specialization: 'Digestive Disorders',
        experience: 15,
        qualifications: 'BAMS, MD (Ayurveda), PG Diploma in Nutrition',
        consultationFee: 900,
        consultationModes: ['online', 'in-person'],
        bio: 'Expert in treating digestive disorders and metabolic conditions using traditional Ayurvedic principles.',
        rating: 4.9,
        totalReviews: 203,
        isActive: true
      },
      {
        userId: createdUsers[2].id,
        specialization: 'Women\'s Health & Wellness',
        experience: 10,
        qualifications: 'BAMS, MD (Ayurveda), Specialized in Stree Roga',
        consultationFee: 750,
        consultationModes: ['online', 'in-person'],
        bio: 'Dedicated to women\'s health issues including hormonal imbalances, reproductive health, and wellness.',
        rating: 4.7,
        totalReviews: 128,
        isActive: true
      },
      {
        userId: createdUsers[3].id,
        specialization: 'Joint & Muscle Pain',
        experience: 18,
        qualifications: 'BAMS, MD (Ayurveda), Expert in Orthopedic Ayurveda',
        consultationFee: 1000,
        consultationModes: ['online', 'in-person'],
        bio: 'Specialist in treating arthritis, joint pain, and musculoskeletal disorders through Ayurvedic therapies.',
        rating: 4.9,
        totalReviews: 287,
        isActive: true
      },
      {
        userId: createdUsers[4].id,
        specialization: 'Skin & Hair Care',
        experience: 8,
        qualifications: 'BAMS, PG Diploma in Dermatology, Ayurvedic Cosmetology',
        consultationFee: 650,
        consultationModes: ['online'],
        bio: 'Focused on natural skin and hair care solutions using Ayurvedic herbs and treatments.',
        rating: 4.6,
        totalReviews: 94,
        isActive: true
      }
    ];

    const createdDoctors = [];
    for (const doctorData of doctorProfiles) {
      const doctor = await Doctor.create(doctorData);
      createdDoctors.push(doctor);
    }

    console.log('Created doctors:', createdDoctors.length);

    // Create availability schedules
    const availabilityData = [];
    
    createdDoctors.forEach(doctor => {
      // Monday to Friday availability
      for (let day = 1; day <= 5; day++) {
        // Morning slots
        availabilityData.push({
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '12:00',
          consultationMode: 'online',
          isActive: true
        });

        // Evening slots
        availabilityData.push({
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '14:00',
          endTime: '18:00',
          consultationMode: 'online',
          isActive: true
        });

        // In-person slots (if supported)
        if (doctor.consultationModes.includes('in-person')) {
          availabilityData.push({
            doctorId: doctor.id,
            dayOfWeek: day,
            startTime: '10:00',
            endTime: '13:00',
            consultationMode: 'in-person',
            isActive: true
          });
        }
      }

      // Saturday availability (limited)
      availabilityData.push({
        doctorId: doctor.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '13:00',
        consultationMode: 'online',
        isActive: true
      });
    });

    await DoctorAvailability.bulkCreate(availabilityData);
    console.log('Created availability schedules:', availabilityData.length);

    // Create a sample patient user
    const patientUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+919876543220',
      password: await bcrypt.hash('password123', 12),
      role: 'patient'
    });

    console.log('Created sample patient user');

    console.log('Database seeding completed successfully!');
    console.log('\nSample Credentials:');
    console.log('Patient: john.doe@example.com / password123');
    console.log('Doctor: priya.sharma@ayurveda.com / password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };
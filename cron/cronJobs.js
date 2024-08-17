const cron = require('node-cron');
const Appointment = require('../models/appointment'); // Assuming you have a Mongoose model for appointments
const Service = require('../models/service');

// This function will be scheduled to run periodically
const cleanUpAppointments = async () => {
  try {
    // Calculate the time 10 minutes ago
    const sixtyMinutesAgo = new Date(new Date().getTime() - (60 * 60 * 1000));

    // Find and remove specific records
    await Appointment.deleteMany({
        paidStatus: 'Unpaid',
        timestamp: { $lt: sixtyMinutesAgo }
    });

     // Find and remove specific records
     await Service.deleteMany({
        status: 'Unpaid',
        timestamp: { $lt: sixtyMinutesAgo }
      });

    console.log('Stale appointments cleaned up successfully.');
  } catch (error) {
    console.error('Error cleaning up stale appointments:', error);
  }
};

// Schedule the task to run every minute (adjust according to your needs)
cron.schedule('0 2 * * *', cleanUpAppointments);

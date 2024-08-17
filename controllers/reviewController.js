const Review = require('../models/review');
const Appointment = require('../models/appointment');

const addUpdateReviewByCustomer = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId, providerId, ratingToProvider, commentToProvider } = req.body;

        // Check if the appointment exists
        const appointment = await Appointment.findById(appointmentId);

        if (appointment) {
            // Update the existing review
            appointment.ratingToProvider = ratingToProvider;
            appointment.commentToProvider = commentToProvider;

            await appointment.save();
            res.status(200).json({ message: 'Review Added successfully' });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const addUpdateReviewByProvider = async (req, res) => {
    try {
        const providerId = req.userId;
        const { appointmentId, customerId, ratingToCustomer, commentToCustomer } = req.body;

        // Check if the appointment exists
        const appointment = await Appointment.findById(appointmentId);

        if (appointment) {

            // Update the existing review
            appointment.ratingToCustomer = ratingToCustomer;
            appointment.commentToCustomer = commentToCustomer;

            await appointment.save();
            res.status(200).json({ message: 'Review Added successfully' });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getReviews = async (req, res) => {
    try {
        const userId = req.userId; // Extract userId from the request

        // Fetch reviews based on the userId
        const reviews = await Review.find({ userId: userId });

        if (reviews.length === 0) {
            res.status(404).json({ message: 'No reviews found for the user' });
        } else {
            res.status(200).json(reviews);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    addUpdateReviewByCustomer,
    addUpdateReviewByProvider,
    getReviews
};

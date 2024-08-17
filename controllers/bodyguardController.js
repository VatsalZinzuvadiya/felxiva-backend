const Bodyguard = require('../models/bodyguard');

const getBodyguards = async (req, res) => {
    try {
        const results = await Bodyguard.find();
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getBodyguards
  }
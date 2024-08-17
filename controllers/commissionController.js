const commission = require('../models/commission');

const getCommissions = async (req, res) => {
    try {
        const results = await commission.find();
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getCommissions
  }
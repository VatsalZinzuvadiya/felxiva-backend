const user = require('../models/user');
const Appointment = require('../models/appointment');
const Service = require('../models/service');
const Fitness = require('../models/fitness');
const Referral = require('../models/referral');
const providerRequests = require('../models/providerRequests');
const User = require('../models/user');
const Location = require('../models/locations');
const moment = require('moment');


// @desc Get all users
// @Route GET /userstomail
// @Access Private
const getAllUsers = async (req, res) => {
    try {
        const users = await user.find().select('-password').lean().exec()
        if (!users) {
            return res.status(400).json({ message: 'No users found' })
        }
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// @desc Get all users
// @Route GET /userstomail
// @Access Private
const getAllClients = async (req, res) => {
    try {
        // Find all users with role 'user' and exclude password field
        const users = await user.find({ role: "user" }).select('-password').lean();

        if (!users.length) {
            return res.status(400).json({ message: 'No users found' });
        }

        // Map over the users to get the user IDs
        const userIds = users.map(user => user._id);

        // Aggregate appointments by user_id and count them
        const appointmentsCount = await Appointment.aggregate([
            { $match: { user_id: { $in: userIds } } }, // Filter to match only the user IDs we're interested in
            { $group: { _id: "$user_id", count: { $sum: 1 } } } // Group by user_id and count the appointments
        ]);

        // Convert appointmentsCount to a map for easy lookup
        const appointmentMap = {};
        appointmentsCount.forEach(appointment => {
            appointmentMap[appointment._id.toString()] = appointment.count;
        });

        // Add appointment counts to users
        const usersWithAppointments = users.map(user => ({
            ...user,
            appointmentsCount: appointmentMap[user._id.toString()] || 0
        }));

        res.json(usersWithAppointments);
    } catch (error) {
        console.error("Failed to retrieve clients and appointments:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// @desc Get all order
// @Route GET /allOrders
// @Access Private
const getAllOrders = async (req, res) => {
    try {
        const results = await Appointment.aggregate([
            {
                $lookup: {
                    from: "services",
                    localField: "service_id",
                    foreignField: "_id",
                    as: "serviceData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "customerData",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "provider_id",
                    foreignField: "_id",
                    as: "providerData",
                },
            },
            {
                $lookup: {
                    from: "fitnesses",
                    localField: "fitness_id",
                    foreignField: "_id",
                    as: "fitnessData",
                },
            },

            {
                $match: {
                    paidStatus: "Paid"
                }
            },
            {
                $sort: {
                    timestamp: -1  // Sorting in descending order based on createdAt field
                }
            }
        ]);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getChartData = async (req, res) => {
    try {
        const { startDate: startDateStr, endDate: endDateStr } = req.body;

        const startDate = startDateStr ? moment(startDateStr, 'YYYY-MM-DD', true) : moment().subtract(6, 'days').startOf('day');
        const endDate = endDateStr ? moment(endDateStr, 'YYYY-MM-DD', true) : moment().endOf('day');

        if (!startDate.isValid() || !endDate.isValid()) {
            return res.status(400).send('Invalid date format');
        }

        console.log(req.body);
        // Counts Services
        const dates = [];
        for (let date = startDate.clone(); date.isSameOrBefore(endDate, 'day'); date.add(1, 'days')) {
            dates.push(date.format('YYYY-MM-DD'));
        }


        const servicesByDateCursor = await Appointment.aggregate([
            {
                $match: {
                    status: "Finished",
                    timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            }
        ]);
        const countByDate = {};
        servicesByDateCursor.forEach(item => {
            countByDate[item._id] = item.count;
        });
        const counts = dates.map(date => countByDate[date] || 0);


        const services = await Appointment.countDocuments({
            status: "Finished",
            timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });

        const allOrders = await Appointment.countDocuments({
            timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });
        const newOrders = await Appointment.countDocuments({
            status: "Pending",
            timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });
        const allUsers = await User.countDocuments({
            role: "user",
            timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        });

        const countByServiceTypeCursor = await Service.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $group: {
                    _id: "$serviceType",
                    count: { $sum: 1 }
                }
            }
        ]);

        const countFitnessRecords = await Fitness.countDocuments({ timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } });
        const fitnessCounts = [{ _id: "Fitness", count: countFitnessRecords }];
        console.log(countFitnessRecords);

        const totalClientPaidCursor = await Service.aggregate([
            {
                $match: {
                    status: "Paid",
                    timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                }
            },
            {
                $project: {
                    _id: 1, // Keep the original _id field
                    formattedDate: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    totalCost: { $subtract: ["$cost", "$discount"] }
                }
            },
            {
                $group: {
                    _id: "$formattedDate", // Group by formatted date
                    total: { $sum: "$totalCost" }
                }
            }
        ]);


        // Construct object to map dates to total paid amounts
        const totalClientPaidByDate = {};
        totalClientPaidCursor.forEach(item => {
            totalClientPaidByDate[item._id] = item.total;
        });

        // Map dates to total paid amounts, handling cases where there's no data for a date
        const clientsPaid = dates.map(date => totalClientPaidByDate[date] || 0);




        // total cost including service, gst, transportation, other expenses that paid by client for the last 7 days
        const totalRevenueCursor = await Appointment.aggregate(
            [
                {
                    $match: {
                        timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        totalCost: { $sum: '$cost' }
                    }
                }
            ]
        );
        const totalRevenueByDate = {};
        await totalRevenueCursor.forEach(item => {
            totalRevenueByDate[item._id] = item.totalCost;
        });
        const revenueEarned = dates.map(date => totalRevenueByDate[date] || 0);



        // Referral Earning for the last 7 days
        const totalReferralsEarningCursor = await Referral.aggregate(
            [
                {
                    $match: {
                        status: "Approved",
                        timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        totalReferralEarned: { $sum: '$amount' } // Assuming the field name is 'amount'
                    }
                }
            ]
        );
        const totalReferralEarnedByDate = {};
        await totalReferralsEarningCursor.forEach(item => {
            totalReferralEarnedByDate[item._id] = item.totalReferralEarned;
        });
        const referralEarned = dates.map(date => totalReferralEarnedByDate[date] || 0);


        // Provider Earning for the last 7 days
        const totalProvidersEarningCursor = await providerRequests.aggregate(
            [
                {
                    $match: {
                        status: "Approved",
                        timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        totalEarned: { $sum: '$amount' } // Assuming the field name is 'amount'
                    }
                }
            ]
        );
        const totalProviderEarnedByDate = {};
        await totalProvidersEarningCursor.forEach(item => {
            totalProviderEarnedByDate[item._id] = item.totalEarned;
        });
        const providerEarned = dates.map(date => totalProviderEarnedByDate[date] || 0);

        // Profit calculation for the last 7 days
        const expensesPartA = revenueEarned.map((value, index) => value - clientsPaid[index]);
        const expensesPartB = providerEarned.map((value, index) => value + referralEarned[index]);
        const expenses = expensesPartA.map((value, index) => value + expensesPartB[index]);

        // const expenses = revenueEarned - clientsPaid + (referralEarned + providerEarned);
        const profit = revenueEarned.map((value, index) => value - expenses[index]);;

        const cities = await Location.distinct('city');
        
        // Initialize variables to store aggregated data
        let totalUsers = 0;
        let totalTransactions = 0;
        let totalRevenue = 0;
        let results = [];

        for (const city of cities) {
            // Query each model for the current city
            const userCount = await User.countDocuments({ city, timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } });
            const serviceCount = await Service.countDocuments({ city, status: "Paid", timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } });
            const fitnessCount = await Fitness.countDocuments({ city, timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } });

            // Calculate total cost of services in the city
            const totalServiceCostResult = await Service.aggregate([
                { $match: { city, status: "Paid", timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                { $group: { _id: null, totalCost: { $sum: "$totalAmount" } } }
            ]);

            const totalServiceCost = totalServiceCostResult.length > 0 ? totalServiceCostResult[0].totalCost : 0;

            // Calculate total cost of fitness in the city
            const totalFitnessCostResult = await Fitness.aggregate([
                { $match: { city,timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
                { $group: { _id: null, totalCost: { $sum: "$netAmount" } } }
            ]);

            const totalFitnessCost = totalFitnessCostResult.length > 0 ? totalFitnessCostResult[0].totalCost : 0;

            // Update aggregated data with city data
            totalUsers += userCount;
            totalTransactions += serviceCount + fitnessCount;
            totalRevenue += totalServiceCost + totalFitnessCost;

             // Push the results for the current city into the array
             results.push({
                city,
                users: userCount,
                transactions: serviceCount+fitnessCount,
                revenue: totalServiceCost + totalFitnessCost
            });
        }

        // Construct aggregated data object
        const aggregatedData = {
            city: "Total", // You can set the city name to "Total" or any other identifier
            users: totalUsers,
            transactions: totalTransactions,
            revenue: totalRevenue
        };


        res.status(200).json({ citiesData:results, aggregatedData, allOrders, services, newOrders, allUsers, serviceDemand: countByServiceTypeCursor.concat(fitnessCounts), data: { dates, counts, clientsPaid, revenueEarned, providerEarned, referralEarned, expenses, profit, expensesPartA, expensesPartB } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// @desc Get all order
// @Route GET /dashboard
// @Access Private
const getDashboardData = async (req, res) => {
    try {
        // single records
        const allOrders = await Appointment.countDocuments();
        const newOrders = await Appointment.countDocuments({ status: "Pending" });
        const services = await Appointment.countDocuments({ status: "Finished" });
        const allUsers = await User.countDocuments({ role: "user" });

        // only service amount that pays by client without additional charges
        const totalClientPaid = await Service.aggregate([
            {
                $match: {
                    status: "Paid"
                }
            },
            {
                $project: {
                    totalCost: {
                        $subtract: ["$cost", "$discount"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$totalCost" }
                }
            }
        ]);

        // total cost including service, gst, transportation, other expenses that paid by client
        const totalRevenueCursor = await Appointment.aggregate(
            [
                {
                    $group: {
                        _id: null,
                        totalCost: { $sum: '$cost' }
                    }
                }
            ]
        );
        let totalRevenue = 0;
        await totalRevenueCursor.forEach(doc => {
            totalRevenue = doc.totalCost;
        });

        // Referral Earning
        const totalReferralsEarningCursor = await Referral.aggregate(
            [
                {
                    $match: {
                        status: "Approved"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalReferralEarned: { $sum: '$amount' } // Assuming the field name is 'amount'
                    }
                }
            ]
        );
        let totalReferralsEarning = 0;
        await totalReferralsEarningCursor.forEach(doc => {
            totalReferralsEarning = doc.totalReferralEarned;
        });

        // Provider Earning
        const totalProvidersEarningCursor = await providerRequests.aggregate(
            [
                {
                    $match: {
                        status: "Approved"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalEarned: { $sum: '$amount' } // Assuming the field name is 'amount'
                    }
                }
            ]
        );
        let totalProvidersEarning = 0;
        await totalProvidersEarningCursor.forEach(doc => {
            totalProvidersEarning = doc.totalEarned;
        });

        // ServiceType Counts
        const countByServiceTypeCursor = await Service.aggregate([
            {
                $group: {
                    _id: "$serviceType",
                    count: { $sum: 1 }
                }
            }
        ]);
        countByServiceTypeCursor.forEach(doc => {
            console.log(`${doc._id}: ${doc.count}`);
        });

        // Fitness Counts
        const countFitnessRecords = await Fitness.countDocuments();
        const fitnessCounts = [{ _id: "Fitness", count: countFitnessRecords }];

        const getRecordByCities = await getRecordsByCities();

        // profit would be totalrevenue - expenses (totalrevenue-totalclientpaid+proivder and referral earning)
        res.status(200).json({...getRecordByCities,...{ allOrders, services, newOrders, allUsers, serviceDemand: countByServiceTypeCursor.concat(fitnessCounts), totalClientPaid: totalClientPaid[0].totalCost, totalReferralsEarning, totalProvidersEarning, totalRevenue: totalRevenue, expenses: totalRevenueCursor[0].totalCost - totalClientPaid[0].totalCost + (totalReferralsEarning + totalProvidersEarning) }});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// const getUniqueCities = async () => {
//     try {
//       const cities = await Location.distinct('city');
//       return cities;
//     } catch (error) {
//       console.error("Error fetching unique cities:", error);
//       throw error;
//     }
//   };

const getRecordsByCities = async (req, res) => {
    try {
        const cities = await Location.distinct('city');
        
        // Initialize variables to store aggregated data
        let totalUsers = 0;
        let totalTransactions = 0;
        let totalRevenue = 0;
        let results = [];

        for (const city of cities) {
            // Query each model for the current city
            const userCount = await User.countDocuments({ city });
            const serviceCount = await Service.countDocuments({ city, status: "Paid" });
            const fitnessCount = await Fitness.countDocuments({ city });

            // Calculate total cost of services in the city
            const totalServiceCostResult = await Service.aggregate([
                { $match: { city, status: "Paid" } },
                { $group: { _id: null, totalCost: { $sum: "$totalAmount" } } }
            ]);

            const totalServiceCost = totalServiceCostResult.length > 0 ? totalServiceCostResult[0].totalCost : 0;

            // Calculate total cost of fitness in the city
            const totalFitnessCostResult = await Fitness.aggregate([
                { $match: { city } },
                { $group: { _id: null, totalCost: { $sum: "$netAmount" } } }
            ]);

            const totalFitnessCost = totalFitnessCostResult.length > 0 ? totalFitnessCostResult[0].totalCost : 0;

            // Update aggregated data with city data
            totalUsers += userCount;
            totalTransactions += serviceCount + fitnessCount;
            totalRevenue += totalServiceCost + totalFitnessCost;

             // Push the results for the current city into the array
             results.push({
                city,
                users: userCount,
                transactions: serviceCount+fitnessCount,
                revenue: totalServiceCost + totalFitnessCost
            });
        }

        // Construct aggregated data object
        const aggregatedData = {
            city: "Total", // You can set the city name to "Total" or any other identifier
            users: totalUsers,
            transactions: totalTransactions,
            revenue: totalRevenue
        };

        // Push the aggregated data to the results array
        // results = [...cities.map(city => ({ city })), aggregatedData];

        return {citiesData:results,aggregatedData};
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {
    getAllOrders,
    getAllUsers,
    getAllClients,
    getDashboardData,
    getChartData
}
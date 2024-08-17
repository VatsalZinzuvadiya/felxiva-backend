require('dotenv').config()
require('express-async-errors')
const express = require('express')
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsConfigs = require('./config/corsConfigs')
const allowedOrigins = require('./config/allowedOrigins')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const credentials = require('./middleware/credentials')

const app = express()
const port = process.env.PORT || 3500
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
require('./cron/cronJobs');

connectDB()

app.use(logger)
app.use(credentials)
app.use(cors(corsConfigs))
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser())
app.use(session({
  secret:  process.env.ACCESS_TOKEN_SECRET, // Choose a strong and unique secret
  resave: false,
  saveUninitialized: false
}));

// app.set('trust proxy', true);


app.use('/', express.static(path.join(__dirname, '/views')))
app.use('/images', express.static('images'))
app.use('/', require('./routes/root'))

// Socketio must be declared before api routes
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  transports: ['polling'],
  cors: { origin: allowedOrigins },
})
require('./socketio.js')(io)

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);

app.use('/price', require('./routes/pricingRoutes'));
app.use('/', require('./routes/paymentRouter'));
app.use('/sos', require('./routes/sosRoutes'));
app.use('/otp', require('./routes/otpRoutes'));
app.use('/bodyguard', require('./routes/bodyguardRoutes'));
app.use('/review', require('./routes/reviewRoutes'));
app.use('/appointment', require('./routes/appointmentRoutes'));
app.use('/users', require('./routes/userRoutes'))
app.use('/provider', require('./routes/providerRoutes'))
app.use('/franchise', require('./routes/franchiseRoutes'))
app.use('/services', require('./routes/serviceRoutes'))
app.use('/fitness', require('./routes/fitnessRoutes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/notifications', require('./routes/notificationRoutes'))
app.use('/mail',require('./routes/mailRoutes'))
app.use('/settings',require('./routes/siteSettingsRoutes.js'))
app.use('/employee', require('./routes/employeeRoutes.js'));
app.use('/admin', require('./routes/adminRoutes.js'));
app.use('/referral', require('./routes/referralRoutes.js'));
app.use('/commission', require('./routes/commissionRoutes.js'));
app.use('/membership', require('./routes/membershipRoutes.js'));
app.use('/', require('./routes/oauthRouter'));

app.all('*', require('./routes/404'))


app.use(errorHandler)

mongoose.connection.once('open', () => {
  server.listen(port, () => {
    console.log('Successfully Connected to MongoDB')
    console.log(`Application running on port: ${port}`);
  })
})
mongoose.connection.on('error', (err) => {
  // TODO send notification to all admins by saving notification in with each admin id
  console.log(err)
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}\t`,
    'mongoDBErrLog.log'
  )
})

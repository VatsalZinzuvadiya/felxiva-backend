const express = require('express');
// const { GoogleAdsApi } = require('google-ads-api');
const nodemailer = require('nodemailer');
const User = require('../models/user')
const bcrypt = require("bcrypt")
const router = express.Router();
const smtp_pass= process.env.SMTP_PASSWORD;
const smtp_mail=process.env.SMTP_EMAIL;
const frontend_url=process.env.REACT_APP_BASE_URL;
const VerifyMailToken = require('../models/verifyMailToken')
const { v4: uuidv4 } = require('uuid');
const { route } = require('./root');
const server_base_url=process.env.SERVER_BASE_URL
const front_base_url=process.env.REACT_APP_BASE_URL;

// Now, use this transporter to send emails as you did with the Google SMTP setup.


// Configure Nodemailer with your SMTP server details
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: smtp_mail,
    pass: smtp_pass,
  },
  tls: {
    ciphers: 'TLSv1.2', // Use TLSv1.2 instead of SSLv3
  },
});




// Define your API endpoint to handle contact form submissions
router.post('/sendConfirmationEmail', async (req, res) => {
  try {
    const { email, serviceType, date, time, price, peoples } = req.body;

    // Define email content
    const mailOptions = {
      from: 'Flexiva Massage Center',
      to: `${email}`,
      subject: `${"Appointment Confirmation"}`,
      html: `
        <p>Email: ${email}</p>
        <p>Service Type: ${serviceType}</p>
        <p>Date & Time: ${date} |  ${time}</p>
        <p>Price: ${price}</p>
        <p>Persons: ${peoples}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'An error occurred while sending the email.' });
  }
});


// Define your API endpoint to handle contact form submissions
router.post('/forgetPassword', async (req, res) => {
  try {
    const {  email } = req.body;
    const url=`${frontend_url}/resetpage`;
    let response=await User.findOne({email:email});
    if(response){
      // Define email content
      const mailOptions = {
        from: 'Flexiva',
        to: `${email}`,
        subject: `Reset Password`,
        html: `
          <p>Email: ${email}</p>
          <p>Message: ${url}?id=${response._id}</p>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully!' });
    }else{
      res.status(500).json({ error: 'Enter Email' });
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending the email.' });
  }
});

router.post('/register', async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  // Generate a verification token using uuid
  const verificationToken = uuidv4();

  const result = await VerifyMailToken.create({
    owner:email,
    token: verificationToken,
  })


  const mailOptions = {
    from: 'Flexiva',
    to: email,
    subject: 'Email Verification',
    text: `Click this link to verify your email: ${front_base_url}/verify-email?token=${verificationToken}&email=${email}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({message: 'Failed to send verification email'});
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({message: 'Registration successful. Check your email for verification.'});
    }
  });
});

router.post('/sendResetMail', async (req, res) => {
  try{
    const { email } = req.body;

    // Generate a verification token using uuid
    const verificationToken = uuidv4();
  
    const result = await VerifyMailToken.create({
      owner:email,
      token: verificationToken,
    })

    const mailOptions = {
      from: 'Flexiva',
      to: email,
      subject: 'Password Reset',
      text: `Click this link to reest your password:${front_base_url}/reset-password/token?token=${verificationToken}&email=${email}`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({message: 'Failed to send Reset Password email'});
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({message: 'Check your email to Reset Password.'});
      }
    });
  }catch(err){
    res.status(500).json({message: 'Failed to send Reset Password email'});
  }
});

router.get('/verify', async (req, res) => {
  const { token, email } = req.query;
  const tokenEntry = await VerifyMailToken.findOne({ owner: email }).sort({ created: -1 });


  if (!tokenEntry) {
    return res.status(400).send('Invalid or expired verification token.');
  }


  const isTokenValid = await tokenEntry.compareToken(token);

  if (!isTokenValid) {
    return res.status(400).send('Invalid or expired verification token.');
  }

  // Find the user by email and update their status to verified (1)
  const user = await User.findOneAndUpdate(
    { email: email },
    { status: 1 }
  );

  if (!user) {
    return res.status(400).send('User not found.');
  }

  res.status(200).send('Email verified successfully!');
});


router.post('/reset', async (req, res) => {

  const { token, email, password } = req.body;
  const tokenEntry = await VerifyMailToken.findOne({ owner: email })
  .sort({ created: -1 })  // Sort in descending order based on the date field
  .exec();

  if (!tokenEntry) {
    return res.status(400).json({message:'Invalid or expired verification token.'});
  }


  const isTokenValid = await tokenEntry.compareToken(token);

  if (!isTokenValid) {
    return res.status(400).json({message:'Invalid or expired verification token.'});
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // Find the user by email and update their status to verified (1)
  const user = await User.findOneAndUpdate(
    { email: email },
    { password: hashedPassword }
  );

  if (!user) {
    return res.status(400).json({message: 'User not found.'});
  }

  res.status(200).json({message:'Password Reset successfully!'});
});

router.post('/', async (req, res) => {
  try{
    const { fullName, city, email, subject, detail } = req.body;
    const message=`Full Name= ${fullName} <br> City= ${city} <br> Email=${email} <br> Detail= ${detail}`;

    const mailOptions = {
      from: 'Flexiva',
      to: ['ammarqadri280@gmail.com', email],
      subject: subject,
      html:message
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({message: `Failed to send mail`});
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({message: `Failed to send mail`});
      }
    });
  }catch(err){
    res.status(500).json({message: 'Failed to send Reset Password email'});
  }
});




module.exports=router;
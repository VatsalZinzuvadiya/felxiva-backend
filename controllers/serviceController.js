const Service = require('../models/service');  // Rename the imported service model to Service
const Appointment = require("../models/appointment");
const Referral=require("../models/referral");
const User = require('../models/user');
var request = require('request');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


function generateInvoice(savedService) {
  return new Promise((resolve, reject) => {
    const invoiceDir = path.join(__dirname, '..', 'views', 'invoices');

    // Ensure the directory exists
    fs.mkdir(invoiceDir, { recursive: true }, (error) => {
      if (error) {
        console.error('Error creating directory:', error);
        reject(error);
        return;
      }

      const invoicePath = path.join(invoiceDir, `invoice.pdf`);
      const writeStream = fs.createWriteStream(invoicePath);
      const doc = new PDFDocument();

      doc.text('Invoice', { align: 'center' });
      doc.text(`Service ID: ${savedService._id}`, { align: 'right' });
      doc.text(`Date: ${savedService.date}`, { align: 'right' });
      doc.moveDown();

      // Add service details
      doc.text(`Service: ${savedService.service}`);
      doc.text(`Type: ${savedService.serviceType}`);
      doc.text(`Duration: ${savedService.duration} minutes`);
      doc.text(`People: ${savedService.peoples}`);
      doc.text(`Gender: ${savedService.gender}`);
      doc.moveDown();

      // Add user details
      doc.text(`Customer: ${savedService.fullName}`);
      doc.text(`Address: ${savedService.addressLine1}, ${savedService.addressLine2}, ${savedService.city}, ${savedService.state}, ${savedService.zipCode}, ${savedService.country}`);
      doc.moveDown();

      // Add pricing details
      doc.text(`Price: $${savedService.price}`);
      doc.moveDown();

      // Finalize the PDF
      doc.end();

      writeStream.on('finish', () => {
        console.log(`Invoice saved: ${invoicePath}`);
        resolve(invoicePath);
      });

      // Pipe the PDF content to the write stream
      doc.pipe(writeStream);

      // Handle errors
      writeStream.on('error', (err) => {
        console.error('Error writing PDF:', err);
        reject(err);
      });
    });
  });
}

const addService = async (req, res) => {
  try {
    const userId = req.userId;
    const oneUser = await User.findById(userId).select('-password').lean().exec()
    const userPhone = oneUser.phone;

    // Destructure the fields from the request body
    const {
      service,
      serviceType,
      duration,
      peoples,
      gender,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      phone,
      country,
      date,
      start_time,
      end_time,
      cost,
      transportation,
      otherExpense,
      GST,
      discount,
      netAmount,
      totalAmount,
      referralCode
    } = req.body;

    console.log(referralCode);
    // Add any additional validations you find necessary
    if (!service || !serviceType || !duration || !peoples || !gender || !fullName || !addressLine1 || !city || !state || !zipCode || !country || !date || !totalAmount) {
      // console.log(req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }


    // Create a new item instance using the destructured data
    const newService = new Service({  // Changed 'Item' to 'Service'
      userId,
      service,
      serviceType,
      duration:duration/60,
      peoples,
      gender,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      date,
      start_time,
      end_time,
      cost,
      phone,
      transportation,
      otherExpense,
      GST,
      discount,
      netAmount,
      totalAmount
    });

    const message = `
Hi *${fullName}*!

Thank you for choosing Flexiva! Here are the details of your upcoming appointment:

*Service:* ${service} - ${serviceType}
*Duration:* ${duration / 60} Minutes
*Number of People:* ${peoples}
*Therapist Preference:* ${gender.toUpperCase()}

*Date:* ${date}
*Time:* ${start_time} - ${end_time}

*Location:*
${addressLine1},${addressLine2}
${city}, ${state} ${zipCode}
${country}

*Price:* *${totalAmount} INR*

We can't wait to provide you with a great experience! If you have any questions or need to reschedule, please don't hesitate to contact us.

See you soon!

Best regards,
*Flexiva*
`;

    // Save the item to the MongoDB database
    const savedService = await newService.save();  // Changed 'newItem' to 'newService'
    // const invoicePath = await generateInvoice(savedService);

    if (savedService) {

      // var options = {
      //   'method': 'POST',
      //   'url': 'https://whatsapp.pronauman.com/api/create-message',
      //   'headers': {

      //   },
      //   formData: {
      //     'appkey': 'fa006771-3b0a-474e-a3e0-3ad61ba0e022',
      //     'authkey': 'YmJx6i0fgUgZmWgVhHoOh87ZpyeHQ9H8cQyvJVrLFhlWcS3Nyo',
      //     'to': userPhone,
      //     'message': message,
      //     'file': invoicePath
      //   }
      // };
      // request(options, function (error, response) {
      //   if (error) throw new Error(error);
      //   console.log(response.body);
      // });
//comment by ammar 
      // var options = {
      //   'method': 'POST',
      //   'url': 'https://whatsapp.pronauman.com/api/create-message',
      //   'headers': {
      //   },
      //   formData: {
      //     'appkey': 'fa006771-3b0a-474e-a3e0-3ad61ba0e022',
      //     'authkey': 'YmJx6i0fgUgZmWgVhHoOh87ZpyeHQ9H8cQyvJVrLFhlWcS3Nyo',
      //     'to': userPhone,
      //     'message': message
      //   }
      // };
      // request(options, function (error, response) {
      //   if (error) throw new Error(error);
      //   // console.log(response.body);
      // });

      if(referralCode){
        console.log(referralCode);
      }
      const referralData=await User.findOne({referralCode:referralCode}).lean().exec();

      const newAppointment = new Appointment({  // Changed 'Item' to 'Service'
        service_id: savedService._id,
        user_id: userId,
        service: service,
        cost: totalAmount,
        referral_id:referralData ? referralData._id : null
      });
      const savedAppointment = await newAppointment.save();
      res.status(201).json({ message: "Record Saved Successfully!", id:savedAppointment._id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const cancelService = async (req, res) => {
  const { serviceId } = req.params;

  try {
    // Find the service by ID
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Assuming you have a status field in your Service model
    service.status = 'Canceled';

    // Save the updated service
    await service.save();

    res.json({ message: 'Service canceled successfully', service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

module.exports = {
  addService,
  cancelService
};

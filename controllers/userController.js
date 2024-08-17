const user = require('../models/user')
const Referral = require('../models/referral');
const bcrypt = require('bcrypt')
// const bcrypt = require("bcryptjs")
const fs = require('fs')
const path = require('path')
const notification = require('../models/notification')
const validator = require('validator');

const jwt = require('jsonwebtoken');
const Jwt_Secret_Key = process.env.Jwt_Secret_Key;


// @desc Get all users
// @Route GET /users
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
// @desc Get one user by ID
// @Route POST /users/one
// @Access Private
const getOneUser = async (req, res) => {
  const id = req.userId;

  if (!id) {
    console.log('Verify your data and proceed again r35476');
    return res
      .status(400)
      .json({ message: 'Verify your data and proceed again r35476' })
  }

  const oneUser = await user.findById(id).select('-password').lean().exec()
  if (!oneUser) {
    console.log(`Can't find a user with this id: ${id}`);
    return res
      .status(400)
      .json({ message: `Can't find a user with this id: ${id}` })
  } else {
    console.log("okay");
    res.status(200).json(oneUser)
  }
}


// @desc Find user by Email
// @Route POST /users/one
// @Access Private
const findUser = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(400)
      .json({ message: 'Verify your data and proceed again r35476' })
  }
  const oneUser = await user.findOne({ email: email });
  if (oneUser) {
    if (oneUser.status == 1) {
      console.log(email);
      return res
        .status(400)
        .json({ message: `User Already Exist! Please Signin` })
    } else if (oneUser.status == 0) {
      console.log(email);
      return res
        .status(400)
        .json({ message: `User Already Exist, Please Verify Your Email!` })
    }
  }
  res.status(200).json("Successful");
}

// @desc Create new user
// @Route POST /users
// @Access Private
// const createNewUser = async (req, res) => {
//   const { fullName, password, email, role, dob, gender, addressLine1, addressLine2, phone, state, city, zipCode, medicalCondition, medicalConditionYesDetail, medication, medicationYesDetail, fitnessWeightLossGoalDesc, status, referralCode } = req.body;

//   //Confirm data
//   if (
//     !fullName ||
//     !password ||
//     password.length < 6 ||
//     !email ||
//     !role
//   ) {
//     return res
//       .status(400)
//       .json({ message: 'Verify your data and proceed again' })
//   }

//   //check for email validity
//   if (!validator.isEmail(email)) {
//     return res.status(400).json({ message: 'please enter a valid email address' })
//   }


//   // Check for duplicate
//   const duplicate = await user.findOne({ email }).lean().exec()
//   if (duplicate) {
//     return res.status(409).json({ message: 'user already exist' })
//   }

//   const hashedPassword = await bcrypt.hash(password, 10)
//   //create new user
//   const newUser = await user.create({
//     fullName,
//     password: hashedPassword,
//     email,
//     role,
//     dob,
//     gender,
//     addressLine1,
//     addressLine2,
//     phone,
//     state,
//     city,
//     zipCode,
//     medicalCondition,
//     medicalConditionYesDetail,
//     medication, medicationYesDetail,
//     fitnessWeightLossGoalDesc,
//     status
//   })
//   if (newUser) {
//     if (referralCode) {
//       console.log(referralCode);
//       const referral_data = user.findOne({ referralCode: referralCode, role:"user" });
//       if (referral_data !==null) {

//         const newReferral = await Referral.create({
//           user_id: newUser._id,
//           referral_id: referral_data._id
//         })
//         console.log(referral_data);
//       }
//     }
//     const getData = {
//       user: {
//         id: newUser._id
//       }
//     }
//     const auth_token = jwt.sign(getData, Jwt_Secret_Key);
//     res.status(200).json({ token: auth_token });
//   } else {
//     res.status(400).json({
//       message: 'user creation failed, please verify your data and try again',
//     })
//   }
// }

const createNewUser = async (req, res) => {
  const { fullName, password, email, role, status } = req.body;
  console.log(req.body);
  // Confirm data
  if (!fullName || !password || password.length < 6 || !email || !role) {
    return res.status(400).json({ message: 'Verify your data and proceed again' });
  }

  // Check for email validity
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    // Check for duplicate user
    const duplicate = await user.findOne({ email }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = await user.create({
      fullName,
      password: hashedPassword,
      email,
      role,
      status
    });

    // If user creation successful
    if (newUser) {
      // Generate JWT token for authentication
      const getData = { user: { id: newUser._id } };
      const auth_token = jwt.sign(getData, Jwt_Secret_Key);
      return res.status(200).json({ token: auth_token,message: 'User registered successfully' });
    } else {
      return res.status(400).json({ message: 'User creation failed, please verify your data and try again' });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const updateNewUser = async (req, res) => {
  const { fullName, password, email, role, dob, gender, addressLine1, addressLine2, phone, state, city, zipCode, medicalCondition, medicalConditionYesDetail, medication, medicationYesDetail, fitnessWeightLossGoalDesc, status } = req.body;

  // Confirm data
  if (!fullName || !password || password.length < 6 || !email || !role) {
    return res.status(400).json({ message: 'Verify your data and proceed again' });
  }

  // Check for email validity
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    // Check for duplicate user
    const duplicate = await user.findOne({ email }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = await user.create({
      fullName,
      password: hashedPassword,
      email,
      role,
      dob,
      gender,
      addressLine1,
      addressLine2,
      phone,
      state,
      city,
      zipCode,
      medicalCondition,
      medicalConditionYesDetail,
      medication,
      medicationYesDetail,
      fitnessWeightLossGoalDesc,
      status
    });

    // If user creation successful
    if (newUser) {
      // Generate JWT token for authentication
      const getData = { user: { id: newUser._id } };
      const auth_token = jwt.sign(getData, Jwt_Secret_Key);
      return res.status(200).json({ token: auth_token });
    } else {
      return res.status(400).json({ message: 'User creation failed, please verify your data and try again' });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// @desc Update a user
// @Route PATCH /users
// @Private access
const updateUser = async (req, res) => {
  const id = req.userId;
  const { fullName, email, dob, phone, addressLine1, currentPassword, newPassword } = req.body;

  try {
    // Fetch user from the database
    const userData = await user.findById(id);

    // If user is not found
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, userData.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is wrong" });
      }

      // Update the password with the new one
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userData.password = hashedPassword;
    }

    // Update user's other fields
    userData.fullName = fullName || userData.fullName;
    userData.email = email || userData.email;
    userData.dob = dob || userData.dob;
    userData.phone = phone || userData.phone;
    userData.addressLine1 = addressLine1 || userData.addressLine1;
    userData.avatar = req.file ? req.file.filename : userData.avatar;

    // Save the updated user object
    await userData.save();

    res.status(200).json({ message: "User updated successfully", userData });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// @desc delete a user
// @Route DELETE /users
// @Private access
const deleteUser = async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res
      .status(400)
      .json({ message: `Can't find a user with this id: ${id}` })
  }

  const deleteUser = await user.findById(id).exec()
  if (!deleteUser) {
    return res.status(400).json({ message: `Can't find a user with id: ${id}` })
  }
  const result = await deleteUser.deleteOne()
  if (!result) {
    return res
      .status(400)
      .json({ message: `Can't delete the user with id: ${id}` })
  }
  res.json({ message: `User with id: ${id} deleted with success` })
}

// @desc Update a user image
// @Route POST /users
// @Private access
const updateUserImage = async (req, res) => {
  const fileName = req.file.filename
  // Adding image to mongodb
  const { id } = req.body
  if (!id) {
    return res
      .status(400)
      .json({ message: `Can't find a user with this id: ${id}` })
  }
  const updateUser = await user.findById(id).exec()
  if (updateUser?.length) {
    return res
      .status(400)
      .json({ message: `Can't find a user with this id: ${id}` })
  }
  // Remove old photo
  if (updateUser.profileImage) {
    const oldPath = path.join(__dirname, '..', updateUser.profileImage)
    fs.access(oldPath, (err) => {
      if (err) {
        return
      }
      fs.rmSync(oldPath, {
        force: true,
      })
    })
  }
  // adding new photo to mongoDB
  updateUser.profileImage = '/images/' + fileName
  await updateUser.save()

  // add notification for updated profile image
  await notification.create({
    user: id,
    title: 'updated profile image',
    type: 1,
    text: `Profile image updated at ${new Date()}`,
    read: false,
  })
  res.json({ message: 'image uploaded wtih success' })
}

// @desc Logout
// @Route POST /auth/logout
// @Access Public
const logout = async (req, res) => {

  try {
    // Clear the token and role from the request object
    req.userId = null;
    req.role = null;

    // Clear the JWT token or session data on the server-side
    // Example: Clearing session data
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie();
      res.status(200).json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};



module.exports = {
  createNewUser,
  updateUser,
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUserImage,
  findUser,
  logout
}

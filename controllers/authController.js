const bcrypt = require('bcrypt');
// const bcrypt = require("bcryptjs")
const User = require('../models/user');
const notification = require('../models/notification');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.Jwt_Secret_Key;

// @desc Login
// @Route POST /auth
// @Access Public
// login Api //
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body.email, req.body.password);
    if (email && password) {
      const userData = await User.findOne({ email: email });
      if (userData ) {
        if (userData.status == 1) {
          // Compare the provided password with the stored hashed password
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (passwordMatch) {
            const token = jwt.sign(
              {
                id: userData._id,
                role:userData.role
              },
              JWT_SECRET,
              { expiresIn: '24h' }
            );
            console.log(userData.role);
            res.status(200).json({ message: "Login Successful", data: userData, token: token, role:userData.role });
          } else {
            res.status(400).json({ message: "Password Not Match." });
          }
        }else if(!userData.status || userData.status==0){
          res.status(400).json({ message: "Verification Pending!" });
        }
      } else {
        res.status(400).json({ message: "This Account Does Not Exist." });
      }
    } else {
      res.status(400).json({ message: "Please Input All Required Information" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while processing your request" });
  }
};
// @desc Refresh
// @Route get /auth/refresh
// @Access Public
const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: 'Unauthorized r65472' });
  }

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Session Expired Please Login Again!' });
      }
      const foundUser = await User.findOne({
        username: decoded.UserInfo.username,
      }).exec();
      if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized r68457' });
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            id: foundUser._id,
            roles: foundUser.roles,
            profileImage: foundUser.profileImage,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      //Send accessToken with username and roles
      res.json({ accessToken });
    }
  );
};



module.exports = { login, refresh};

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils");
var parser = require("ua-parser-js");

const registerUser = asyncHandler(async(req, res) => {
  const { name, email, password} = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400); // bad request
    throw new Error("Please fill in all the required fields.");
  }

  if (password.length < 6) {
    res.status(400); // bad request
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check if user exists
  const userExists = await User.findOne({email});
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered.");
  }

  // Get user-agent
  const ua = parser(req.headers['user-agent']);
  const userAgent = [ua.ua];

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    userAgent
  })

  // Generate Token
  const token = generateToken(user._id)

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 DAY
    sameSite: "none",
    secure: true,
  })

  if (user) {
    const {_id, name, email, phone, bio, photo, role, isVerified} = user;

    res.status(201).json({
      _id, name, email, phone, bio, photo, role, isVerified, token
    })
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser= asyncHandler(async(req, res) => {
  const { email, password} = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add your email and password.");
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found, please sign up.");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid email or password.");
  }

  // Trigger 2FA for unknown UserAgent

  
  const token = generateToken(user._id) // Generate Token
  if (user && passwordIsCorrect) {
    // Send the token to the frontend
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 DAY
      sameSite: "none",
      secure: true,
    })

    // Send the user data to the frontend
    const {_id, name, email, phone, bio, photo, role, isVerified} = user;
    res.status(200).json({
      _id, name, email, phone, bio, photo, role, isVerified, token
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong. Please try again!")
  }
});

module.exports = {
  registerUser,
  loginUser
}
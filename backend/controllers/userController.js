const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils");
const jwt = require("jsonwebtoken");
var parser = require("ua-parser-js");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/tokenModel");

// Sign Up
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

// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  // Delete token if already existed in db
  let token = await Token.findOne({ userId: user._id});
  if (token) {
    await token.deleteOne()
  }

  // Create Verification Token and Save
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

  console.log(verificationToken);
});

// Log In
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

// Log Out
const logoutUser = asyncHandler(async(req, res) => {
  res.cookie("token", "", { // make token "empty string"
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    sameSite: "none",
    secure: true,
  })

  return res.status(200).json({message: "Logout successful"});
})

//dGet User
const getUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const {_id, name, email, phone, bio, photo, role, isVerified} = user;
    res.status(200).json({
      _id, name, email, phone, bio, photo, role, isVerified
    });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
})

// Update User
const updateUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const {_id, name, email, phone, bio, photo, role, isVerified} = user;
    
    user.name = req.body.name || name;
    user.email = email;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;
    user.role = req.body.role || role;

    // Save the updated user information
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      photo: updatedUser.photo,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    })
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
})

// Delete User
const deleteUser = asyncHandler(async(req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found, please sign up.")
  }

  res.status(200).json({
    message: "User deleted successfully"
  });
})

// Get All Users
const getUsers = asyncHandler(async(req, res) => {
  const users = await User.find().sort("-createdAt").select("-password");

  if (!users) {
    res.status(500);
    throw new Error("Something went wrong. Please try again.");
  }

  res.status(200).json(users);
})

// Get Login Status
const loginStatus = asyncHandler(async(req, res) => {
  const token = req.cookies.token;

  // User hasn't logged in
  if (!token) {
    return res.json(false);
  }

  // Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
})

// Change User's Role
const upgradeUser = asyncHandler(async(req, res) => {
  const { role, id } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found. Please sign up!");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    message: `User role updated to ${role}`,
  })
})

// Send Automated emails
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    return res.status(400).json({ message: "Missing email parameter" });
  }

  // Get user
  const user = await User.findOne({ email: send_to });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Email Sent" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Email not sent, please try again" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  loginStatus,
  upgradeUser,
  sendAutomatedEmail,
  sendVerificationEmail
}
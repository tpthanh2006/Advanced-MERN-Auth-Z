const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, hashToken } = require("../utils");
const jwt = require("jsonwebtoken");
var parser = require("ua-parser-js");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const Cryptr = require("cryptr");

const cryptr = new Cryptr(process.env.CRYPTR_KEY);

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

  // Hash token and save
  const hashedToken = hashToken(verificationToken);
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiredAt: Date.now() + 60 * (60 * 1000) // expire after 60 mins
  }).save();

  // Contruct a verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  // Send verification email
  const subject = "Verify Your Account - AuthZ Pro";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "tranpthanh2006@gmail.com";
  const template = "verifyEmail";
  const name = user.name;
  const link = verificationUrl;

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
    res.status(200).json({ message: "Verification Email Sent" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Email not sent, please try again" });
  }
});

// Send Login Code
const sendLoginCode = asyncHandler(async(req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find Login Code in DB
});

// Verify User
const verifyUser = asyncHandler(async(req, res) => {
  const { verificationToken } = req.params;

  const hashedToken = hashToken(verificationToken);
  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: {$gt: Date.now()}
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find User
  const user = await User.findOne({
    _id: userToken.userId
  })

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }

  // Verify User now
  user.isVerified = true;
  await user.save();
  res.status(200).json({
    message: "Account Verified Successfully!"
  });
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
  const ua = parser(req.headers["user-agent"]);
  const thisUserAgent = ua.ua;
  console.log(thisUserAgent);
  const allowedAgent = user.userAgent.includes(thisUserAgent);

  if (!allowedAgent) {
    // Generate 6 digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    console.log(loginCode);

    // Encrypt login code
    const encryptedLoginCode = crypt.encrypt(loginCode.toString());

    let userToken = await Token.findOne({userId: user._id});
    if (userToken) {
      await userToken.deleteOne();
    }

    // Save token to db
    await new Token({
      userId: user._id,
      lToken: encryptedLoginCode,
      createAt: Date.now(),
      expiresAt: Date.now() + 60 * (60 * 100), // 60'
    }).save();
   }

   res.status(400);
   throw new Error("Check your email for login code");
  
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

// Forgot Password
const forgotPassword = asyncHandler(async(req, res) => {
  const { email } = req.body;
  const user = await User.findOne({email});

  if (!user) {
    res.status(404);
    throw new Error("No user with this email");
  }

  // Delete token if already existed in db
  let token = await Token.findOne({ userId: user._id});
  if (token) {
    await token.deleteOne();
  }

  // Create Reset Token and Save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash token and save
  const hashedToken = hashToken(resetToken);
  await new Token({
    userId: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expiredAt: Date.now() + 60 * (60 * 1000) // expire after 60 mins
  }).save();

  // Contruct RESET URL
  const resetUrl = `${process.env.FRONTEND_URL}/verify/${resetToken}`;

  // Send RESET email
  const subject = "Reset Your Password - AuthZ Pro";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "tranpthanh2006@gmail.com";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

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
    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Email not sent, please try again" });
  }
});

// Reset Password
const resetPassword = asyncHandler(async(req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(resetToken);
  const userToken = await Token.findOne({
    rToken: hashedToken,
    expiresAt: {$gt: Date.now()}
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find User
  const user = await User.findOne({
    _id: userToken.userId
  })

  // Now Reset Password
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successfully. Please Log In."
  });
})

const changePassword = asyncHandler(async(req, res) => {
    const { oldPassword, password } =req.body

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Bad request. Please enter old and new password");
  }

  // Check if old password is correct
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passswordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).json({
      message: "Password changed succesfully, please re-login.",
    })
  } else {
    res.status(400);
    throw new Error("Old password is incorrect.")
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
  sendVerificationEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode
}
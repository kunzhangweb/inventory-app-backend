const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/TokenModel");
const sendEmail = require("../utils/SendEmail");

const generateToken = (id) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
};

/**
 * register a user
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, photo, phone, biography } = req.body;

  /** validation process */
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please enter the required information.");
  }

  // check if the email has existed
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("The email has been taken.");
  }

  // create a new user
  const user = await User.create({
    username: username,
    email: email,
    password: password,
    photo: photo,
    phone: phone,
    biography: biography,
  });

  // generate a token
  const token = generateToken(user._id);

  // sending HttpOnly cookie
  res.cookie("token", token, {
    // save the cookie
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // one day valid
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, username, email, password, photo, phone, biography } = user;
    res.status(200).json({
      _id,
      username,
      email,
      password,
      photo,
      phone,
      biography,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Ivalid user data.");
  }

  // check the password length
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters.");
  }
});

/**
 * user login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // email and password validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter an email address and a password.");
  }

  // check if the user exists in the database
  const user = await User.findOne({
    email,
  });
  if (!user) {
    res.status(400);
    throw new Error("The user does not exist.");
  }

  // check if the password is properly entered
  const passwordCorrect = await bcrypt.compare(password, user.password);

  // generate a token
  const token = generateToken(user._id);

  // sending HttpOnly cookie
  if (passwordCorrect) {
    // Send HTTP-only cookie
    // res.cookie("token", token, {
    //   path: "/",
    //   httpOnly: true,
    //   expires: new Date(Date.now() + 1000 * 86400), // 1 day
    //   sameSite: "none",
    //   secure: true,
    // });
    res.cookie("token", token);
  }

  if (user && passwordCorrect) {
    const { _id, username, email, password, photo, phone, biography } = user;
    res.status(200).json({
      _id,
      username,
      email,
      password,
      photo,
      phone,
      biography,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email address or password.");
  }
});

/**
 * user logout
 */
const logout = asyncHandler(async (req, res) => {
  // remove the token
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // have the cookie expired immediately
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({
    message: "Logged out successfully.",
  });
});

/**
 * retrieve one user
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, username, email, password, photo, phone, biography } = user;
    res.status(200).json({
      _id,
      username,
      email,
      password,
      photo,
      phone,
      biography,
    });
  } else {
    res.status(400);
    throw new Error("User not found.");
  }
});

/**
 * when the user logged in
 * redirect to the main page
 */
const loggedIn = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json(false);
  }

  // verify the token
  const JWT_SECRET = process.env.JWT_SECRET;
  const verified = jwt.verify(token, JWT_SECRET);
  if (verified) {
    return res.json(true);
  } else {
    return res.json(false);
  }
});

/**
 * update one user's information
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, username, email, password, photo, phone, biography } = user;
    user.email = email; // email name can not be modified when signup
    user.username = req.body.username || username;
    user.username = req.body.password || password;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.biography = req.body.biography || biography;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      password: updatedUser.password,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      biography: updatedUser.biography,
    });
  } else {
    res.status(404);
    throw new Error("No such user existed to update data.");
  }
});

/**
 * update one user's password
 */
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;
  // validate the user
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  // validate the two passwords entered
  console.log(oldPassword);
  if (!oldPassword || !newPassword) {
    res.status(404);
    throw new Error("Please enter required password.");
  }
  // compare entered old password with the one in the database
  const passwordConfirmed = await bcrypt.compare(oldPassword, user.password);

  // save the new password
  if (user && passwordConfirmed) {
    user.password = newPassword;
    await user.save();
    res.status(200).send("The password has been changed successfully.");
  } else {
    res.status(404);
    throw new Error(
      "The old password entered does not match the password in the database."
    );
  }
});

/**
 * reset the forgotten password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("The email address does not exist.");
  }

  // refresh a token if it has already existed
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // generate a reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  // hash the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // save the hashed token to the database
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expireAt: Date.now() + 1000 * 60 * 60, // expire after 1 hour
  }).save();

  // generate a full rest url link
  const resetUrl = `${process.env.FRONTEND_URL}/resetPwd/${resetToken}`;

  // generate the reset email template
  const message = `<h2>Hello ${user.username},</h2>
  <p>Forgot your password?</p>
  <p>We received a request to reset the password for your account</p>
  <br />
  <p>To reset your password, please click the link below:</p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  <br />
  <h3>Caution: the link will be expired in one hour.</h3>
  <br />
  <br />
  <p>Best Regards,</p>
  <p>Everyday Beauty Lab</p>`;

  // send the email
  const subject = "Request password reset";
  const send_from = process.env.EMAIL_USER;
  const send_to = user.email;
  try {
    await sendEmail(subject, message, send_from, send_to);
    res
      .status(200)
      .json({ success: true, message: "The request mail has been sent." });
  } catch (error) {
    res.status(500);
    throw new Error("Email sending failed, please try again.");
  }
});

// reset password procedure
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // hash the resetToken firest
  // comapare it to the one stored in database
  // to check if they match
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // search the token previously stored
  const preToken = await Token.findOne({
    token: hashedToken,
    expireAt: { $gt: Date.now() },
  });

  if (!preToken) {
    res.status(404);
    throw new Error("Invalid or expired token.");
  }

  // search associated user
  const user = await User.findOne({
    _id: preToken.userId,
  });
  // update the user's password
  user.password = password;
  await user.save();

  res.status(200).json({
    message: "Password reset successfully. Please login again.",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loggedIn,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};

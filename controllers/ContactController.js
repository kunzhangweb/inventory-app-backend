const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const sendEmail = require("../utils/SendEmail");

const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const user = await User.findById(req.user.id);

  // validate the user
  if (!user) {
    res.status(400);
    throw new Error("User not found. Please login first.");
  }
  // validate the entered data
  if (!subject || !message) {
    res.status(400);
    throw new Error("Please fill out the subject field and leave a message.");
  }

  // contact form template
  const send_from = process.env.EMAIL_USER;
  const send_to = process.env.EMAIL_USER;
  const reply_to = user.email;
  try {
    await sendEmail(subject, message, send_from, send_to, reply_to);
    res
      .status(200)
      .json({ success: true, message: "The request mail has been sent." });
  } catch (error) {
    res.status(500);
    throw new Error("Email sending failed, please try again.");
  }
});

module.exports = contactUs;

const nodeEmail = require("nodemailer");

const sendEmail = async (subject, message, send_from, send_to, reply_to) => {
  const { EMAIL_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  const transporter = nodeEmail.createTransport({
    host: EMAIL_HOST,
    port: SMTP_PORT,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // email template parameters
  const options = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };

  // response of sending email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;

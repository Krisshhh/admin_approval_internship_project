const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendStatusEmail = (to, subject, message) => {
  const mailOptions = {
    from: `"Admin Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text: message
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendStatusEmail;
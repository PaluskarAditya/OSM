const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(to, subject, html) {
  return transporter.sendMail({
    from: `"NEXA - Evaluations" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendMail;

const Institute = require("../models/instituteModel");
const User = require("../models/userModel");
const sendMail = require('../lib/mail')
const bcrypt = require("bcryptjs");

function generateCredentialsEmail({ name, email, password }) {
  return `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f7; padding:20px;">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.1)">
      <div style="background:#4f46e5;padding:20px;text-align:center;color:#ffffff;">
        <h2 style="margin:0;">Welcome to Logic Credentials</h2>
      </div>
      <div style="padding:20px;color:#333333;line-height:1.6;">
        <p>Hi ${name || "there"},</p>
        <p>Your institute account has been successfully created. Below are your login credentials:</p>
        <div style="background:#f9fafb;padding:15px;border-radius:6px;margin:20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>We recommend changing your password after logging in.</p>
        <p style="margin-top:30px;">Best regards,<br/>The Logic Credentials Team</p>
      </div>
      <div style="background:#f4f4f7;padding:15px;text-align:center;font-size:12px;color:#888888;">
        © ${new Date().getFullYear()} Logic Credentials. All rights reserved.
      </div>
    </div>
  </div>`;
}

const create = async (req, res) => {
  try {
    const token = req.headers["x-institute-token"];
    if (!token) return res.status(403).json({ error: "Missing token" });

    const decoded = jwt.verify(token, secret);
    if (decoded.action !== "create_institute") {
      return res.status(403).json({ error: "Invalid token purpose" });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);

    const institute = new Institute({ ...req.body, password: hashed });
    const user = new User({ email: req.body.email, password: hashed });

    await institute.save();
    await user.save();

    const html = generateCredentialsEmail({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    await sendMail(req.body.email, "Your Logic Credentials Account", html);

    res.json({ message: "Institute and user created, email sent." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  create
}
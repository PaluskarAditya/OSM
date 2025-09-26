const Institute = require("../models/instituteModel");
const User = require("../models/userModel");
const sendMail = require("../lib/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

function generateCredentialsEmail({ name, email, password }) {
  return `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <div style="max-width:480px; margin:auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 32px 20px; text-align:center;">
        <div style="font-size:28px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">NEXA</div>
        <div style="height:2px; width:60px; background:linear-gradient(90deg, #667eea, #764ba2); margin:16px auto;"></div>
        <p style="color:#a0a0a0; font-size:14px; margin:8px 0 0; font-weight:500;">Account Credentials</p>
      </div>
      
      <div style="padding:40px 32px; color:#2d3748; line-height:1.6;">
        <p style="font-size:18px; font-weight:600; margin:0 0 8px;">Hi ${
          name || "there"
        },</p>
        <p style="color:#718096; margin:0 0 24px;">Your NEXA account has been created successfully.</p>
        
        <div style="background:#f8fafc; padding:24px; border-radius:12px; border-left:4px solid #667eea; margin:24px 0;">
          <p style="font-size:14px; color:#4a5568; margin:0 0 12px; font-weight:600;">YOUR LOGIN DETAILS</p>
          <div style="display:flex; align-items:center; margin:12px 0;">
            <div style="background:#e2e8f0; padding:8px; border-radius:6px; margin-right:12px;">
              <span style="color:#4a5568; font-size:14px;">📧</span>
            </div>
            <div>
              <p style="font-size:12px; color:#718096; margin:0; font-weight:500;">Email</p>
              <p style="font-size:15px; color:#2d3748; margin:0; font-weight:600;">${email}</p>
            </div>
          </div>
          <div style="display:flex; align-items:center; margin:12px 0;">
            <div style="background:#e2e8f0; padding:8px; border-radius:6px; margin-right:12px;">
              <span style="color:#4a5568; font-size:14px;">🔑</span>
            </div>
            <div>
              <p style="font-size:12px; color:#718096; margin:0; font-weight:500;">Password</p>
              <p style="font-size:15px; color:#2d3748; margin:0; font-weight:600; font-family: 'Courier New', monospace;">${password}</p>
            </div>
          </div>
        </div>
        
        <div style="background:#fff5f5; padding:16px; border-radius:8px; border:1px solid #fed7d7; margin:24px 0;">
          <p style="font-size:13px; color:#c53030; margin:0; text-align:center; font-weight:500;">
            ⚠️ For security, please change your password after first login
          </p>
        </div>
        
        <div style="text-align:center; margin-top:32px;">
          <a href="https://nexa.intelbuzz.in" style="background:linear-gradient(135deg, #000000, #333333); color:white; padding:12px 32px; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; display:inline-block;">
            Access Your Account
          </a>
        </div>
      </div>
      
      <div style="background:#f8fafc; padding:24px; text-align:center; border-top:1px solid #e2e8f0;">
        <p style="font-size:12px; color:#718096; margin:0 0 8px;">
          © ${new Date().getFullYear()} NEXA. All rights reserved.
        </p>
        <p style="font-size:11px; color:#a0aec0; margin:0;">
          Secure • Premium • Innovative
        </p>
      </div>
    </div>
  </div>`;
}

const create = async (req, res) => {
  try {
    const token = req.headers["x-institute-token"];
    console.log("Token:", token);
    if (!token) return res.status(403).json({ error: "Missing token" });

    const decoded = jwt.verify(token, process.env.MASTER_SECRET);
    if (decoded.action !== process.env.CREATE_ACTION) {
      return res.status(403).json({ error: "Invalid token purpose" });
    }
    console.log("Decoded:", decoded);

    const hashed = await bcrypt.hash(req.body.password, 10);

    const institute = new Institute({ ...req.body, password: hashed });

    await institute.save();

    const user = new User({
      IID: institute.IID,
      Email: req.body.email,
      password: hashed,
      Role: "Admin",
    });
    console.log("Institute:", institute, " User:", user);

    await user.save();

    const html = generateCredentialsEmail({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    await sendMail(req.body.email, "Your Logic Credentials Account", html);

    res.json({ message: "Institute and user created, email sent." });
  } catch (error) {
    console.error("Error in create institute:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const ins = await Institute.find();

    if (!ins) {
      return res.statis(500).json({ err: "No Insititutes found" });
    }

    res.status(200).json(ins);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  create,
  getAll,
};

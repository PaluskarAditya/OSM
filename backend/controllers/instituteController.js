const Institute = require("../models/instituteModel");
const User = require("../models/userModel");
const sendMail = require("../lib/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

function generateCredentialsEmail({ name, email, password }) {
  const currentYear = new Date().getFullYear();

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #ffffff; padding: 20px 0;">
      <div style="max-width: 600px; margin: auto; padding: 20px; text-align: left; border: 1px solid #eaeaea; border-radius: 4px;">
        
        <div style="text-align: center; padding-bottom: 20px;">
          <div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 15px solid #000000; display: inline-block;"></div>
        </div>
        
        <p style="font-size: 14px; color: #000000; margin-top: 20px;">
          Hi <strong style="font-weight: 600;">${name || "there"}</strong>,
        </p>
        <p style="font-size: 14px; color: #000000; margin: 8px 0 20px 0;">
          Your NEXA account has been created successfully. Below are your login credentials.
        </p>

        <div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 16px 0; margin-bottom: 24px;">
          
          <p style="font-size: 12px; color: #666666; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Login Details</p>
          
          <div style="margin-bottom: 12px;">
            <p style="font-size: 13px; color: #444444; margin: 0 0 4px 0;">Email:</p>
            <p style="font-size: 14px; color: #000000; margin: 0; font-weight: 600;">${email}</p>
          </div>
          
          <div>
            <p style="font-size: 13px; color: #444444; margin: 0 0 4px 0;">Password:</p>
            <p style="font-size: 14px; color: #000000; margin: 0; font-weight: 600; font-family: 'Courier New', monospace;">${password}</p>
          </div>
          
        </div>

        <div style="padding: 12px; background-color: #fff9e6; border: 1px solid #ffe0b2; border-radius: 4px; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #a0522d; margin: 0; text-align: center;">
            ⚠️ For security, please change your password after first login.
          </p>
        </div>
        
        <p style="font-size: 14px; margin: 0;">
          <a href="https://nexa.intelbuzz.in" style="color: #0070f3; text-decoration: none; font-weight: 500;">
            Access Your Account &rarr;
          </a>
        </p>

        <div style="border-top: 1px solid #eaeaea; margin-top: 30px;"></div>

        <div style="padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #666666; margin: 0 0 4px 0;">
            If you have questions, visit our support page.
          </p>
          <p style="font-size: 11px; color: #999999; margin: 0;">
            Copyright © ${currentYear} NEXA Inc. All rights reserved.<br>
            Secure • Premium • Innovative
          </p>
          <p style="font-size: 11px; margin-top: 10px;">
            <a href="#" style="color: #0070f3; text-decoration: none;">Manage your notification settings</a>
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

    await sendMail(req.body.email, "Nexa Login Credentials Account", html);

    res.json({ message: "Institute and user created, email sent." });
  } catch (error) {
    console.error("Error in create institute:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAll = async (req, res) => {
  try {
    const ins = await Institute.find({ IID: req.user.IID });
    console.log("Institute Request:");

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

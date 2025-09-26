// genToken.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.MASTER_SECRET;

if (!secret) {
  console.error("❌ MASTER_SECRET not found in .env file");
  process.exit(1);
}

// Generate token with "create_institute" action
function generateInstituteToken() {
  return jwt.sign(
    { action: process.env.CREATE_ACTION },
    secret,
    { expiresIn: "5m" }
  );
}

// Run directly when script is executed
const token = generateInstituteToken();
console.log(`✅ Generated Token: ${token}\n`);

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Decode & verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    // Fetch user from DB (fresh)
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    // console.log(user);
     
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // attach full user doc
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ error: "Unauthorized", details: error.message });
  }
};

module.exports = authMiddleware;

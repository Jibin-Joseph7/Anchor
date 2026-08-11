const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    // For now, allow the role during development.
    // Later we'll restrict role creation to admins.
    const allowedRoles = [
      "admin",
      "sales_manager",
      "sales_executive",
    ];

    const safeRole = allowedRoles.includes(role)
      ? role
      : "sales_executive";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been deactivated",
      });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    user: req.user.toSafeObject(),
  });
};
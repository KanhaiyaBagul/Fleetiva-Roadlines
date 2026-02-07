const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // First, try JWT verification
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Support token in query for PDF downloads via window.open
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (token) {
      try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified; // { userId, role }
        return next();
      } catch (jwtErr) {
        // JWT invalid, continue to Firebase
      }
    }

    // If JWT failed or not present, try Firebase
    const firebaseAuthHeader = req.headers.authorization;
    if (firebaseAuthHeader && firebaseAuthHeader.startsWith('Bearer ')) {
      const idToken = firebaseAuthHeader.split('Bearer ')[1];
      if (idToken) {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Find user in DB
        const user = await User.findOne({
          $or: [
            { firebaseUid: decodedToken.uid },
            { email: decodedToken.email }
          ]
        });
        if (user) {
          req.user = { userId: user._id, role: user.role };
          return next();
        }
      }
    }

    // If neither worked
    return res.status(401).json({ message: "Authentication failed" });
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized Role" });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

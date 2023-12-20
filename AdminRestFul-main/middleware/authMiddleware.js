const jwt = require('jsonwebtoken');
const { secret } = require('../config/keys');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  const token = req.headers.authorization || '';

  if (!token) {
    return res.status(401).json({ error: 'Authentication token must be provided' });
  }

  try {
    const decodedToken = jwt.verify(token.replace('Bearer ', ''), secret);
    const admin = await Admin.findOne({ username: decodedToken.username });

  
    if (!admin) {
      console.error('Admin not found for the provided token.');
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ error: 'Invalid/Expired token' });
  }
};

module.exports = auth;

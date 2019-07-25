const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('i-token');

  // Check if not token
  if (!token) {
    return res.json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    
    const decoded = jwt.decode(token);
    req.user = decoded.instructor;
    next();
  } catch (err) {
    res.json({ msg: 'Token is not valid' });
  }
};

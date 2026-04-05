const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      throw new Error();
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Access denied. Admin only.' });
  }
};

module.exports = { auth, adminAuth };

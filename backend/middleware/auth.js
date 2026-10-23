const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwtSecret = 'f2f196462f5247b49f94033b16bde25403a4d4efbcc684f65667f180d1619aae932888d4998a183e5f9d1c9c4a4203427a1cb6863f94cdb8642487ce0e02b214';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };

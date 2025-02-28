
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || 
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null);
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please login' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const { rows } = await db.query(
      'SELECT id, email, first_name, last_name, role, verification_status FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    
    // Attach user to request object
    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again' });
    }
    return res.status(401).json({ message: 'Not authenticated. Please login' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated. Please login' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    next();
  };
};

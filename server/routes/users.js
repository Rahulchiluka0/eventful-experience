
import express from 'express';
import db from '../db/index.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, verification_status, 
              phone, profile_image, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, profileImage } = req.body;
    
    const result = await db.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, phone = $3, 
           profile_image = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, role, verification_status, 
                 phone, profile_image, created_at`,
      [firstName, lastName, phone, profileImage, req.user.id]
    );
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current user with password
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = userResult.rows[0];
    
    // Check if current password matches
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// Admin routes

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, verificationStatus, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, email, first_name, last_name, role, verification_status, 
             phone, created_at
      FROM users
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramPosition = 1;
    
    if (role) {
      query += ` AND role = $${paramPosition}`;
      queryParams.push(role);
      paramPosition++;
    }
    
    if (verificationStatus) {
      query += ` AND verification_status = $${paramPosition}`;
      queryParams.push(verificationStatus);
      paramPosition++;
    }
    
    if (search) {
      query += ` AND (
        email ILIKE $${paramPosition} OR
        first_name ILIKE $${paramPosition} OR
        last_name ILIKE $${paramPosition} OR
        phone ILIKE $${paramPosition}
      )`;
      queryParams.push(`%${search}%`);
      paramPosition++;
    }
    
    query += `
      ORDER BY created_at DESC
      LIMIT $${paramPosition} OFFSET $${paramPosition + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const result = await db.query(query, queryParams);
    
    // Count total for pagination
    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
    const countParams = [];
    let countPosition = 1;
    
    if (role) {
      countQuery += ` AND role = $${countPosition}`;
      countParams.push(role);
      countPosition++;
    }
    
    if (verificationStatus) {
      countQuery += ` AND verification_status = $${countPosition}`;
      countParams.push(verificationStatus);
      countPosition++;
    }
    
    if (search) {
      countQuery += ` AND (
        email ILIKE $${countPosition} OR
        first_name ILIKE $${countPosition} OR
        last_name ILIKE $${countPosition} OR
        phone ILIKE $${countPosition}
      )`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].count);
    
    res.json({
      users: result.rows,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify user (admin only)
router.put('/verify/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be verified or rejected' });
    }
    
    const result = await db.query(
      `UPDATE users
       SET verification_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, first_name, last_name, role, verification_status`,
      [status, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Create notification for user
    const message = status === 'verified'
      ? `Your account has been verified. You can now access all features.`
      : `Your account verification was rejected. Please contact support for more information.`;
    
    await db.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)`,
      [userId, `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`, message]
    );
    
    res.json({
      message: `User ${status} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
});

// Get pending verification users (admin only)
router.get('/pending-verification', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT id, email, first_name, last_name, role, created_at
      FROM users
      WHERE verification_status = 'pending' AND role != 'user'
      ORDER BY created_at ASC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [parseInt(limit), offset]);
    
    // Count total pending
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users
       WHERE verification_status = 'pending' AND role != 'user'`
    );
    
    const totalPending = parseInt(countResult.rows[0].count);
    
    res.json({
      users: result.rows,
      pagination: {
        total: totalPending,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalPending / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

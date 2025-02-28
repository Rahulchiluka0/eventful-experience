
import express from 'express';
import db from '../db/index.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

// Admin dashboard stats
router.get('/admin', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    // Total users by role
    const userStats = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    // Pending verifications
    const pendingUsers = await db.query(`
      SELECT COUNT(*) FROM users
      WHERE verification_status = 'pending' AND role != 'user'
    `);
    
    const pendingEvents = await db.query(`
      SELECT COUNT(*) FROM events
      WHERE verification_status = 'pending'
    `);
    
    // Revenue stats
    const revenueStats = await db.query(`
      SELECT 
        SUM(p.amount) as total_revenue,
        COUNT(p.id) as total_transactions,
        AVG(p.amount) as average_transaction
      FROM payments p
      WHERE p.status = 'completed'
    `);
    
    // Events stats
    const eventStats = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE start_date > NOW()) as upcoming_events,
        COUNT(*) FILTER (WHERE end_date < NOW()) as past_events
      FROM events
      WHERE verification_status = 'verified'
    `);
    
    // Recent transactions
    const recentTransactions = await db.query(`
      SELECT p.id, p.amount, p.payment_date, p.status,
             u.first_name || ' ' || u.last_name as user_name,
             CASE
               WHEN b.event_id IS NOT NULL THEN e.title
               WHEN b.stall_id IS NOT NULL THEN s.name
             END as item_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN events e ON b.event_id = e.id
      LEFT JOIN stalls s ON b.stall_id = s.id
      ORDER BY p.payment_date DESC
      LIMIT 10
    `);
    
    res.json({
      userStats: userStats.rows,
      pendingVerifications: {
        users: parseInt(pendingUsers.rows[0].count),
        events: parseInt(pendingEvents.rows[0].count)
      },
      revenueStats: revenueStats.rows[0],
      eventStats: eventStats.rows[0],
      recentTransactions: recentTransactions.rows
    });
  } catch (error) {
    next(error);
  }
});

// Organizer dashboard stats
router.get('/organizer', authenticate, authorize('organizer'), async (req, res, next) => {
  try {
    // Event stats
    const eventStats = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_events,
        COUNT(*) FILTER (WHERE verification_status = 'verified') as approved_events,
        COUNT(*) FILTER (WHERE start_date > NOW()) as upcoming_events,
        COUNT(*) FILTER (WHERE end_date < NOW()) as past_events
      FROM events
      WHERE organizer_id = $1
    `, [req.user.id]);
    
    // Booking stats
    const bookingStats = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1
    `, [req.user.id]);
    
    // Revenue stats
    const revenueStats = await db.query(`
      SELECT 
        SUM(p.amount) as total_revenue,
        COUNT(p.id) as total_transactions
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1 AND p.status = 'completed'
    `, [req.user.id]);
    
    // Recent bookings
    const recentBookings = await db.query(`
      SELECT b.id, b.booking_date, b.status, b.total_price,
             u.first_name || ' ' || u.last_name as user_name,
             e.title as event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [req.user.id]);
    
    // Monthly revenue
    const monthlyRevenue = await db.query(`
      SELECT 
        TO_CHAR(p.payment_date, 'YYYY-MM') as month,
        SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN events e ON b.event_id = e.id
      WHERE e.organizer_id = $1 AND p.status = 'completed'
      AND p.payment_date >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `, [req.user.id]);
    
    res.json({
      eventStats: eventStats.rows[0],
      bookingStats: bookingStats.rows[0],
      revenueStats: revenueStats.rows[0],
      recentBookings: recentBookings.rows,
      monthlyRevenue: monthlyRevenue.rows
    });
  } catch (error) {
    next(error);
  }
});

// Stall organizer dashboard stats
router.get('/stall-organizer', authenticate, authorize('stall_organizer'), async (req, res, next) => {
  try {
    // Event stats
    const eventStats = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending_events,
        COUNT(*) FILTER (WHERE verification_status = 'verified') as approved_events,
        COUNT(*) FILTER (WHERE start_date > NOW()) as upcoming_events,
        COUNT(*) FILTER (WHERE end_date < NOW()) as past_events
      FROM stall_events
      WHERE organizer_id = $1
    `, [req.user.id]);
    
    // Stall stats
    const stallStats = await db.query(`
      SELECT 
        COUNT(*) as total_stalls,
        COUNT(*) FILTER (WHERE s.is_available = true) as available_stalls,
        COUNT(*) FILTER (WHERE s.is_available = false) as booked_stalls,
        COUNT(*) FILTER (WHERE s.manager_id IS NOT NULL) as managed_stalls
      FROM stalls s
      JOIN stall_events se ON s.stall_event_id = se.id
      WHERE se.organizer_id = $1
    `, [req.user.id]);
    
    // Manager stats
    const managerStats = await db.query(`
      SELECT COUNT(DISTINCT s.manager_id) as total_managers
      FROM stalls s
      JOIN stall_events se ON s.stall_event_id = se.id
      WHERE se.organizer_id = $1 AND s.manager_id IS NOT NULL
    `, [req.user.id]);
    
    // Revenue stats
    const revenueStats = await db.query(`
      SELECT 
        SUM(p.amount) as total_revenue,
        COUNT(p.id) as total_transactions
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN stalls s ON b.stall_id = s.id
      JOIN stall_events se ON s.stall_event_id = se.id
      WHERE se.organizer_id = $1 AND p.status = 'completed'
    `, [req.user.id]);
    
    // Recent bookings
    const recentBookings = await db.query(`
      SELECT b.id, b.booking_date, b.status, b.total_price,
             u.first_name || ' ' || u.last_name as user_name,
             s.name as stall_name,
             se.title as event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN stalls s ON b.stall_id = s.id
      JOIN stall_events se ON s.stall_event_id = se.id
      WHERE se.organizer_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [req.user.id]);
    
    res.json({
      eventStats: eventStats.rows[0],
      stallStats: stallStats.rows[0],
      managerStats: managerStats.rows[0],
      revenueStats: revenueStats.rows[0],
      recentBookings: recentBookings.rows
    });
  } catch (error) {
    next(error);
  }
});

// Stall manager dashboard stats
router.get('/stall-manager', authenticate, authorize('stall_manager'), async (req, res, next) => {
  try {
    // Stall stats
    const stallStats = await db.query(`
      SELECT 
        COUNT(*) as total_stalls,
        COUNT(*) FILTER (WHERE is_available = true) as available_stalls,
        COUNT(*) FILTER (WHERE is_available = false) as booked_stalls
      FROM stalls
      WHERE manager_id = $1
    `, [req.user.id]);
    
    // Booking stats
    const bookingStats = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_bookings
      FROM bookings b
      JOIN stalls s ON b.stall_id = s.id
      WHERE s.manager_id = $1
    `, [req.user.id]);
    
    // Revenue stats
    const revenueStats = await db.query(`
      SELECT 
        SUM(p.amount) as total_revenue,
        COUNT(p.id) as total_transactions
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN stalls s ON b.stall_id = s.id
      WHERE s.manager_id = $1 AND p.status = 'completed'
    `, [req.user.id]);
    
    // Recent bookings
    const recentBookings = await db.query(`
      SELECT b.id, b.booking_date, b.status, b.total_price,
             u.first_name || ' ' || u.last_name as user_name,
             s.name as stall_name,
             se.title as event_title
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN stalls s ON b.stall_id = s.id
      JOIN stall_events se ON s.stall_event_id = se.id
      WHERE s.manager_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [req.user.id]);
    
    res.json({
      stallStats: stallStats.rows[0],
      bookingStats: bookingStats.rows[0],
      revenueStats: revenueStats.rows[0],
      recentBookings: recentBookings.rows
    });
  } catch (error) {
    next(error);
  }
});

// User dashboard stats
router.get('/user', authenticate, async (req, res, next) => {
  try {
    // Booking stats
    const bookingStats = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings
      FROM bookings
      WHERE user_id = $1
    `, [req.user.id]);
    
    // Upcoming events
    const upcomingEvents = await db.query(`
      SELECT b.id as booking_id, e.id as event_id, e.title, e.start_date, e.location, e.banner_image
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = $1
      AND b.status = 'confirmed'
      AND e.start_date > NOW()
      ORDER BY e.start_date
      LIMIT 5
    `, [req.user.id]);
    
    // Recent bookings
    const recentBookings = await db.query(`
      SELECT b.id, b.booking_date, b.status, b.total_price,
             CASE
               WHEN b.event_id IS NOT NULL THEN e.title
               WHEN b.stall_id IS NOT NULL THEN s.name
             END as item_name,
             p.status as payment_status
      FROM bookings b
      LEFT JOIN events e ON b.event_id = e.id
      LEFT JOIN stalls s ON b.stall_id = s.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [req.user.id]);
    
    // Unread notifications
    const unreadNotifications = await db.query(`
      SELECT COUNT(*) FROM notifications
      WHERE user_id = $1 AND is_read = false
    `, [req.user.id]);
    
    res.json({
      bookingStats: bookingStats.rows[0],
      upcomingEvents: upcomingEvents.rows,
      recentBookings: recentBookings.rows,
      unreadNotifications: parseInt(unreadNotifications.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

export default router;

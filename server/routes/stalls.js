
import express from 'express';
import db from '../db/index.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

// Get all stall events (public)
router.get('/events', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', startDate, endDate, location } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT se.*, u.first_name || ' ' || u.last_name as organizer_name,
             COUNT(s.id) as stall_count,
             COUNT(s.id) FILTER (WHERE s.is_available = true) as available_stall_count
      FROM stall_events se
      JOIN users u ON se.organizer_id = u.id
      LEFT JOIN stalls s ON se.id = s.stall_event_id
      WHERE se.is_published = true AND se.verification_status = 'verified'
    `;
    
    const queryParams = [];
    let paramPosition = 1;
    
    if (search) {
      query += ` AND (se.title ILIKE $${paramPosition} OR se.description ILIKE $${paramPosition})`;
      queryParams.push(`%${search}%`);
      paramPosition++;
    }
    
    if (startDate) {
      query += ` AND se.start_date >= $${paramPosition}`;
      queryParams.push(startDate);
      paramPosition++;
    }
    
    if (endDate) {
      query += ` AND se.end_date <= $${paramPosition}`;
      queryParams.push(endDate);
      paramPosition++;
    }
    
    if (location) {
      query += ` AND (se.city ILIKE $${paramPosition} OR se.country ILIKE $${paramPosition})`;
      queryParams.push(`%${location}%`);
      paramPosition++;
    }
    
    query += `
      GROUP BY se.id, u.first_name, u.last_name
      ORDER BY se.start_date ASC
      LIMIT $${paramPosition} OFFSET $${paramPosition + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const result = await db.query(query, queryParams);
    
    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) FROM stall_events
      WHERE is_published = true AND verification_status = 'verified'
    `;
    
    let countParams = [];
    let countPosition = 1;
    
    if (search) {
      countQuery += ` AND (title ILIKE $${countPosition} OR description ILIKE $${countPosition})`;
      countParams.push(`%${search}%`);
      countPosition++;
    }
    
    if (startDate) {
      countQuery += ` AND start_date >= $${countPosition}`;
      countParams.push(startDate);
      countPosition++;
    }
    
    if (endDate) {
      countQuery += ` AND end_date <= $${countPosition}`;
      countParams.push(endDate);
      countPosition++;
    }
    
    if (location) {
      countQuery += ` AND (city ILIKE $${countPosition} OR country ILIKE $${countPosition})`;
      countParams.push(`%${location}%`);
      countPosition++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalEvents = parseInt(countResult.rows[0].count);
    
    res.json({
      stallEvents: result.rows,
      pagination: {
        total: totalEvents,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalEvents / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get stall event by ID
router.get('/events/:id', async (req, res, next) => {
  try {
    const eventId = req.params.id;
    
    // Get event details
    const eventResult = await db.query(
      `SELECT se.*, u.first_name || ' ' || u.last_name as organizer_name
       FROM stall_events se
       JOIN users u ON se.organizer_id = u.id
       WHERE se.id = $1 AND (se.is_published = true OR $2 = true)`,
      [eventId, req.user ? true : false]
    );
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Stall event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Get stalls
    const stallsResult = await db.query(
      `SELECT s.*, 
              u.first_name || ' ' || u.last_name as manager_name
       FROM stalls s
       LEFT JOIN users u ON s.manager_id = u.id
       WHERE s.stall_event_id = $1
       ORDER BY s.name`,
      [eventId]
    );
    
    const eventWithStalls = {
      ...event,
      stalls: stallsResult.rows
    };
    
    res.json({ stallEvent: eventWithStalls });
  } catch (error) {
    next(error);
  }
});

// Create new stall event (stall organizer only)
router.post('/events', authenticate, authorize('stall_organizer', 'admin'), async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      address,
      city,
      state,
      country,
      zipCode,
      bannerImage,
      stalls = []
    } = req.body;
    
    // Insert event
    const eventResult = await client.query(
      `INSERT INTO stall_events (
        title, description, start_date, end_date,
        location, address, city, state, country, zip_code,
        banner_image, organizer_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title, description, startDate, endDate,
        location, address, city, state, country, zipCode,
        bannerImage, req.user.id
      ]
    );
    
    const event = eventResult.rows[0];
    
    // Insert stalls if any
    if (stalls.length > 0) {
      for (const stall of stalls) {
        await client.query(
          `INSERT INTO stalls (
            stall_event_id, name, description, price, size, location_in_venue
          )
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            event.id,
            stall.name,
            stall.description,
            stall.price,
            stall.size,
            stall.locationInVenue
          ]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Stall event created successfully',
      stallEvent: event
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Update stall event (stall organizer only)
router.put('/events/:id', authenticate, authorize('stall_organizer', 'admin'), async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const eventId = req.params.id;
    
    // Check if event exists and belongs to this organizer
    const eventCheck = await client.query(
      'SELECT * FROM stall_events WHERE id = $1 AND (organizer_id = $2 OR $3 = true)',
      [eventId, req.user.id, req.user.role === 'admin']
    );
    
    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Stall event not found or you are not authorized to edit it' });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      address,
      city,
      state,
      country,
      zipCode,
      bannerImage,
      isPublished
    } = req.body;
    
    // Update event
    const updateResult = await client.query(
      `UPDATE stall_events
       SET title = $1, description = $2, start_date = $3, end_date = $4,
           location = $5, address = $6, city = $7, state = $8,
           country = $9, zip_code = $10, banner_image = $11,
           is_published = $12, updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        title, description, startDate, endDate,
        location, address, city, state,
        country, zipCode, bannerImage,
        isPublished, eventId
      ]
    );
    
    const updatedEvent = updateResult.rows[0];
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Stall event updated successfully',
      stallEvent: updatedEvent
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Add stall to a stall event
router.post('/events/:id/stalls', authenticate, authorize('stall_organizer', 'admin'), async (req, res, next) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists and belongs to this organizer
    const eventCheck = await db.query(
      'SELECT * FROM stall_events WHERE id = $1 AND (organizer_id = $2 OR $3 = true)',
      [eventId, req.user.id, req.user.role === 'admin']
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Stall event not found or you are not authorized to edit it' });
    }
    
    const { name, description, price, size, locationInVenue, managerId } = req.body;
    
    // If manager ID provided, check if user exists and is a stall manager
    if (managerId) {
      const managerCheck = await db.query(
        'SELECT * FROM users WHERE id = $1 AND role = $2',
        [managerId, 'stall_manager']
      );
      
      if (managerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid stall manager ID' });
      }
    }
    
    // Insert stall
    const result = await db.query(
      `INSERT INTO stalls (
        stall_event_id, name, description, price, size, location_in_venue, manager_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [eventId, name, description, price, size, locationInVenue, managerId]
    );
    
    const newStall = result.rows[0];
    
    res.status(201).json({
      message: 'Stall added successfully',
      stall: newStall
    });
  } catch (error) {
    next(error);
  }
});

// Get stalls by manager
router.get('/manager/mystalls', authenticate, authorize('stall_manager'), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*, se.title as event_title, se.start_date, se.end_date, se.location,
              COUNT(b.id) as booking_count
       FROM stalls s
       JOIN stall_events se ON s.stall_event_id = se.id
       LEFT JOIN bookings b ON s.id = b.stall_id
       WHERE s.manager_id = $1
       GROUP BY s.id, se.id
       ORDER BY se.start_date DESC`,
      [req.user.id]
    );
    
    res.json({ stalls: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get stalls by stall organizer
router.get('/organizer/mystalls', authenticate, authorize('stall_organizer'), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*, se.title as event_title, 
              u.first_name || ' ' || u.last_name as manager_name,
              COUNT(b.id) as booking_count
       FROM stalls s
       JOIN stall_events se ON s.stall_event_id = se.id
       LEFT JOIN users u ON s.manager_id = u.id
       LEFT JOIN bookings b ON s.id = b.stall_id
       WHERE se.organizer_id = $1
       GROUP BY s.id, se.id, u.first_name, u.last_name
       ORDER BY se.start_date DESC`,
      [req.user.id]
    );
    
    res.json({ stalls: result.rows });
  } catch (error) {
    next(error);
  }
});

// Assign manager to stall
router.put('/stalls/:id/assign', authenticate, authorize('stall_organizer', 'admin'), async (req, res, next) => {
  try {
    const stallId = req.params.id;
    const { managerId } = req.body;
    
    // Check if stall exists and belongs to an event by this organizer
    const stallCheck = await db.query(
      `SELECT s.* FROM stalls s
       JOIN stall_events se ON s.stall_event_id = se.id
       WHERE s.id = $1 AND (se.organizer_id = $2 OR $3 = true)`,
      [stallId, req.user.id, req.user.role === 'admin']
    );
    
    if (stallCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Stall not found or you are not authorized to edit it' });
    }
    
    // Check if manager exists and is a stall manager
    const managerCheck = await db.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2',
      [managerId, 'stall_manager']
    );
    
    if (managerCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid stall manager ID' });
    }
    
    // Update stall
    const result = await db.query(
      `UPDATE stalls
       SET manager_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [managerId, stallId]
    );
    
    res.json({
      message: 'Manager assigned successfully',
      stall: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;

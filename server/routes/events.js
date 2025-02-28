
import express from 'express';
import db from '../db/index.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

const router = express.Router();

// Get all published events (public)
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type, 
      startDate, 
      endDate, 
      location 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.*, u.first_name || ' ' || u.last_name as organizer_name,
      COUNT(ei.id) as image_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_images ei ON e.id = ei.event_id
      WHERE e.is_published = true AND e.verification_status = 'verified'
    `;
    
    const queryParams = [];
    let paramPosition = 1;
    
    if (search) {
      query += ` AND (e.title ILIKE $${paramPosition} OR e.description ILIKE $${paramPosition})`;
      queryParams.push(`%${search}%`);
      paramPosition++;
    }
    
    if (type) {
      query += ` AND e.event_type = $${paramPosition}`;
      queryParams.push(type);
      paramPosition++;
    }
    
    if (startDate) {
      query += ` AND e.start_date >= $${paramPosition}`;
      queryParams.push(startDate);
      paramPosition++;
    }
    
    if (endDate) {
      query += ` AND e.end_date <= $${paramPosition}`;
      queryParams.push(endDate);
      paramPosition++;
    }
    
    if (location) {
      query += ` AND (e.city ILIKE $${paramPosition} OR e.country ILIKE $${paramPosition})`;
      queryParams.push(`%${location}%`);
      paramPosition++;
    }
    
    query += `
      GROUP BY e.id, u.first_name, u.last_name
      ORDER BY e.start_date ASC
      LIMIT $${paramPosition} OFFSET $${paramPosition + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) FROM events e
      WHERE e.is_published = true AND e.verification_status = 'verified'
    `;
    
    let countParams = [];
    let countPosition = 1;
    
    if (search) {
      countQuery += ` AND (e.title ILIKE $${countPosition} OR e.description ILIKE $${countPosition})`;
      countParams.push(`%${search}%`);
      countPosition++;
    }
    
    if (type) {
      countQuery += ` AND e.event_type = $${countPosition}`;
      countParams.push(type);
      countPosition++;
    }
    
    if (startDate) {
      countQuery += ` AND e.start_date >= $${countPosition}`;
      countParams.push(startDate);
      countPosition++;
    }
    
    if (endDate) {
      countQuery += ` AND e.end_date <= $${countPosition}`;
      countParams.push(endDate);
      countPosition++;
    }
    
    if (location) {
      countQuery += ` AND (e.city ILIKE $${countPosition} OR e.country ILIKE $${countPosition})`;
      countParams.push(`%${location}%`);
      countPosition++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalEvents = parseInt(countResult.rows[0].count);
    
    res.json({
      events: result.rows,
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

// Get single event by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const eventId = req.params.id;
    
    // Get event details
    const eventResult = await db.query(
      `SELECT e.*, u.first_name || ' ' || u.last_name as organizer_name
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1 AND (e.is_published = true OR $2 = true)`,
      [eventId, req.user ? true : false]
    );
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // Get event images
    const imagesResult = await db.query(
      'SELECT id, image_url FROM event_images WHERE event_id = $1',
      [eventId]
    );
    
    const eventWithImages = {
      ...event,
      images: imagesResult.rows
    };
    
    res.json({ event: eventWithImages });
  } catch (error) {
    next(error);
  }
});

// Create new event (organizer only)
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      address,
      city,
      state,
      country,
      zipCode,
      bannerImage,
      maxCapacity,
      price,
      images = []
    } = req.body;
    
    // Insert event
    const eventResult = await client.query(
      `INSERT INTO events (
        title, description, event_type, start_date, end_date,
        location, address, city, state, country, zip_code,
        banner_image, organizer_id, max_capacity, price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        title, description, eventType, startDate, endDate,
        location, address, city, state, country, zipCode,
        bannerImage, req.user.id, maxCapacity, price
      ]
    );
    
    const event = eventResult.rows[0];
    
    // Insert images if any
    if (images.length > 0) {
      const imageValues = images.map(image => {
        return `('${event.id}', '${image}')`;
      }).join(', ');
      
      await client.query(`
        INSERT INTO event_images (event_id, image_url)
        VALUES ${imageValues}
      `);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Update event (organizer only)
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res, next) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const eventId = req.params.id;
    
    // Check if event exists and belongs to this organizer
    const eventCheck = await client.query(
      'SELECT * FROM events WHERE id = $1 AND (organizer_id = $2 OR $3 = true)',
      [eventId, req.user.id, req.user.role === 'admin']
    );
    
    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found or you are not authorized to edit it' });
    }
    
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      address,
      city,
      state,
      country,
      zipCode,
      bannerImage,
      maxCapacity,
      price,
      isPublished,
      images = []
    } = req.body;
    
    // Update event
    const updateResult = await client.query(
      `UPDATE events
       SET title = $1, description = $2, event_type = $3,
           start_date = $4, end_date = $5, location = $6,
           address = $7, city = $8, state = $9,
           country = $10, zip_code = $11, banner_image = $12,
           max_capacity = $13, price = $14, is_published = $15,
           updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [
        title, description, eventType,
        startDate, endDate, location,
        address, city, state,
        country, zipCode, bannerImage,
        maxCapacity, price, isPublished,
        eventId
      ]
    );
    
    const updatedEvent = updateResult.rows[0];
    
    // Handle images update if provided
    if (images.length > 0) {
      // Delete current images
      await client.query('DELETE FROM event_images WHERE event_id = $1', [eventId]);
      
      // Insert new images
      const imageValues = images.map(image => {
        return `('${eventId}', '${image}')`;
      }).join(', ');
      
      await client.query(`
        INSERT INTO event_images (event_id, image_url)
        VALUES ${imageValues}
      `);
    }
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Delete event (organizer only)
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists and belongs to this organizer
    const eventCheck = await db.query(
      'SELECT * FROM events WHERE id = $1 AND (organizer_id = $2 OR $3 = true)',
      [eventId, req.user.id, req.user.role === 'admin']
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or you are not authorized to delete it' });
    }
    
    // Check if there are any bookings
    const bookingsCheck = await db.query(
      'SELECT COUNT(*) FROM bookings WHERE event_id = $1',
      [eventId]
    );
    
    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with active bookings. Cancel all bookings first.' 
      });
    }
    
    // Delete event (cascade will delete images)
    await db.query('DELETE FROM events WHERE id = $1', [eventId]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get events by organizer
router.get('/organizer/myevents', authenticate, authorize('organizer'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.*, COUNT(b.id) as booking_count, SUM(b.total_price) as total_revenue
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.organizer_id = $1
    `;
    
    const queryParams = [req.user.id];
    let paramPosition = 2;
    
    if (status) {
      query += ` AND e.verification_status = $${paramPosition}`;
      queryParams.push(status);
      paramPosition++;
    }
    
    query += `
      GROUP BY e.id
      ORDER BY e.start_date DESC
      LIMIT $${paramPosition} OFFSET $${paramPosition + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const result = await db.query(query, queryParams);
    
    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) FROM events
      WHERE organizer_id = $1
    `;
    
    let countParams = [req.user.id];
    let countPosition = 2;
    
    if (status) {
      countQuery += ` AND verification_status = $${countPosition}`;
      countParams.push(status);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalEvents = parseInt(countResult.rows[0].count);
    
    res.json({
      events: result.rows,
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

// Admin routes for event verification
router.put('/verify/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { status, feedbackMessage } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be verified or rejected' });
    }
    
    // Update event status
    const result = await db.query(
      `UPDATE events
       SET verification_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, eventId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = result.rows[0];
    
    // Create notification for organizer
    const message = status === 'verified'
      ? `Your event "${event.title}" has been approved.`
      : `Your event "${event.title}" was not approved. ${feedbackMessage || ''}`;
    
    await db.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)`,
      [event.organizer_id, `Event ${status.charAt(0).toUpperCase() + status.slice(1)}`, message]
    );
    
    res.json({
      message: `Event ${status} successfully`,
      event
    });
  } catch (error) {
    next(error);
  }
});

// Get events pending verification (admin only)
router.get('/admin/pending', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT e.*, u.first_name || ' ' || u.last_name as organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.verification_status = 'pending'
      ORDER BY e.created_at ASC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [parseInt(limit), offset]);
    
    // Count total pending
    const countResult = await db.query(
      'SELECT COUNT(*) FROM events WHERE verification_status = $1',
      ['pending']
    );
    
    const totalPending = parseInt(countResult.rows[0].count);
    
    res.json({
      events: result.rows,
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

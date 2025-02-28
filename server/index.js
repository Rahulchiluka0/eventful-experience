
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';

// Routes imports
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import bookingsRoutes from './routes/bookings.js';
import usersRoutes from './routes/users.js';
import stallsRoutes from './routes/stalls.js';
import paymentsRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/authenticate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/stalls', authenticate, stallsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

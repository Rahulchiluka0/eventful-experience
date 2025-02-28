
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Use DATABASE_URL from Replit Secrets if available
let connectionString = process.env.DATABASE_URL;

// Test database connection and notify if it's not available
try {
  console.log('Connecting to database...');
  if (!connectionString) {
    console.warn('DATABASE_URL not found in environment variables.');
    console.warn('Please create a PostgreSQL database in Replit by:');
    console.warn('1. Opening a new tab');
    console.warn('2. Typing "Database" in the search bar');
    console.warn('3. Choosing "Create a database"');
    console.warn('4. The DATABASE_URL will be automatically added to your Secrets');
  }
} catch (error) {
  console.error('Error checking database configuration:', error);
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  console.error('Database connection failed:', err.stack);
});

// Test connection
(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

export default {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);
    
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  }
};

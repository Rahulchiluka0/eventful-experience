import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

// Use the pooler URL for better connection management
let connectionString = process.env.DATABASE_URL;
if (connectionString && isProduction) {
  connectionString = connectionString.replace('.us-east-2', '-pooler.us-east-2');
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Fallback to environment variables if no connection string
  host: !connectionString ? (process.env.PGHOST || 'localhost') : undefined,
  user: !connectionString ? (process.env.PGUSER || 'postgres') : undefined,
  database: !connectionString ? (process.env.PGDATABASE || 'event_management') : undefined,
  password: !connectionString ? (process.env.PGPASSWORD || 'postgres') : undefined,
  port: !connectionString ? (process.env.PGPORT || 5432) : undefined,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Add the users schema path
const userSchemaPath = path.join(__dirname, 'schema-users.sql');
const userSchema = fs.readFileSync(userSchemaPath, 'utf8');

async function initializeDatabase() {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creating user schema and enums...');
    // Execute user schema first (contains enums and users table)
    await client.query(userSchema);
    
    console.log('Creating remaining schema...');
    // Execute main schema
    await client.query(schema);
    
    // Check if admin user exists, create if not
    const adminExists = await client.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      ['admin@example.com']
    );
    
    if (!adminExists.rows[0].exists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO users (email, password, first_name, last_name, role, verification_status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin', 'verified']
      );
      console.log('Admin user created');
    }
    
    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run initialization if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initializeDatabase;

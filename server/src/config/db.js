import pg from 'pg';
import dotenv from 'dotenv';
import { mockDb } from '../database/mockDb.js';

dotenv.config();

let pool = null;
let isMock = false;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    pool = new pg.Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test the database connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️  PostgreSQL DATABASE_URL provided but connection failed. Falling back to IN-MEMORY MOCK database.');
        console.warn('Error details:', err.message);
        isMock = true;
      } else {
        console.log('✅ Connected to PostgreSQL Neon Database successfully at', res.rows[0].now);
      }
    });
  } catch (err) {
    console.warn('⚠️  Failed to initialize pg.Pool. Falling back to IN-MEMORY MOCK database.');
    isMock = true;
  }
} else {
  console.log('ℹ️  No DATABASE_URL configured in server/.env. Falling back to IN-MEMORY MOCK database.');
  isMock = true;
}

export const query = async (text, params) => {
  if (isMock || !pool) {
    // In mock mode, we intercept at repositories to query mockDb directly.
    // If a raw SQL query goes here, we throw an error to alert repository layer.
    throw new Error('Database is running in Mock Mode.');
  }
  return pool.query(text, params);
};

export { pool, isMock };
export const getMockDb = () => mockDb;

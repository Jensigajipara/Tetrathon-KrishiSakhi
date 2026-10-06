import pg from 'pg';
import fs from 'fs';

// Read server env
const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');
let dbUrl = '';
lines.forEach(l => {
  if (l.trim().startsWith('DATABASE_URL=')) {
    dbUrl = l.split('DATABASE_URL=')[1].trim();
  }
});

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const resTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in Database:');
    console.log(resTables.rows.map(r => r.table_name));

    const resUsers = await pool.query('SELECT id, full_name, email, role FROM users');
    console.log('Users in Database:');
    console.log(JSON.stringify(resUsers.rows, null, 2));

    const res = await pool.query('SELECT * FROM farms');
    console.log('Farms in Database:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await pool.end();
  }
}

run();

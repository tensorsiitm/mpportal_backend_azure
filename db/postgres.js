import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export default db;
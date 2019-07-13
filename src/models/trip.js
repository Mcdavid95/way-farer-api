
import { Pool } from 'pg';
import { logger } from '../helpers/utils';

const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
  logger().info('connected to the db');
});

/**
 * Create Tables
 * @returns {*} void
 */
export const createTripTable = async () => {
  const client = await pool.connect();
  try {
    const enumText = `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
        CREATE TYPE status AS ENUM ('active', 'cancelled');
      END IF;
    END$$;`;
    await client.query(enumText);
    const queryText = `
      CREATE TABLE IF NOT EXISTS
        Trips(
          id SERIAL PRIMARY KEY,
          bus_id INTEGER NOT NULL,
          origin VARCHAR NOT NULL,
          destination VARCHAR NOT NULL,
          trip_date TIMESTAMP,
          status status DEFAULT 'active',
          fare FLOAT NOT NULL,
          seats JSONB [] NOT NULL,
          created_date TIMESTAMP,
          modified_date TIMESTAMP
        )`;
    const response = await client.query(queryText);
    logger().info(response);
  } catch (error) {
    logger().error(error);
  } finally {
    client.release();
  }
};

/**
 * Drop Tables
 * @returns {*} void
 */
export const dropTripTable = async () => {
  const client = await pool.connect();
  const queryText = 'DROP TABLE IF EXISTS Trips';
  try {
    const response = await client.query(queryText);
    logger().info(response);
  } catch (error) {
    logger().error(error);
  } finally {
    client.release();
  }
};

pool.on('remove', () => {
  logger().info('client removed');
  process.exit(0);
});

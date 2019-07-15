
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
export const createBookingTable = async () => {
  const client = await pool.connect();
  const queryText = `
    CREATE TABLE IF NOT EXISTS
      Bookings(
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        trip_id INTEGER NOT NULL,
        seat_number INTEGER NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
        FOREIGN KEY (trip_id) REFERENCES Trips (id) ON DELETE CASCADE
      )`;
  try {
    logger().info('Creating Bookings table');
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
export const dropBookingTable = async () => {
  const client = await pool.connect();
  const queryText = 'DROP TABLE IF EXISTS Bookings';
  try {
    logger().info('Dropping Bookings table');
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


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
export const createUserTable = async () => {
  const client = await pool.connect();
  const queryText = `
    CREATE TABLE IF NOT EXISTS
      Users(
        id SERIAL PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        first_name VARCHAR(128) NOT NULL,
        password VARCHAR NOT NULL,
        last_name VARCHAR(128) NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;
  try {
    logger().info('Creating Users table');
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
export const dropUserTable = async () => {
  const client = await pool.connect();
  const queryText = 'DROP TABLE IF EXISTS Users';
  try {
    logger().info('Dropping Users table');
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

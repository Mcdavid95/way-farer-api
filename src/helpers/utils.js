/* eslint-disable camelcase */
import bunyan from 'bunyan';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../controllers/db';

dotenv.config();

export const logger = () => {
  const log = bunyan.createLogger({ name: 'myapp' });
  return log;
};

/**
   *
   * @param {*} response response object from server
   * @param {*} status error message
   * @param {*} data meta-data
   * @returns {*} error response
   */
// eslint-disable-next-line max-len
export const handleServerResponse = (response, status, data) => response.status(status).send({
  status: 'success',
  data
});

/**
   *
   * @param {*} response response object from server
   * @param {*} status error status
   * @param {*} message error message
   * @returns {*} error response
   */
// eslint-disable-next-line max-len
export const handleServerResponseError = (response, status, message) => {
  logger().error(message);
  return response.status(status).send({
    status: 'error',
    error: message
  });
};

export const handleServerError = (res, error) => {
  logger().error(error);
  return res.status(500).send({
    status: 'error',
    error: 'Internal Server Error'
  });
};

/**
 * @function hashPassword
 * @param {string} password password to be hashed
 * @description hashes a password with bcrypt
 * @returns {string} password hash form
 */
export const hashPassword = async (password) => {
  const saltRounds = process.env.SALT;
  const hash = await bcrypt.hash(password, parseInt(saltRounds, 10));
  return hash;
};

/**
 * @function isPassword
 * @param {string} password in ordinary form
 * @param {string} hash password hash form
 * @description checks if a password corresponds with saved hash in db
 * @returns {boolean} true if correct of false if incorrect
 */
export const isPassword = (password, hash) => bcrypt.compareSync(password, hash);

/**
 * createToken
 * @param {Number} id user id gotten from DATABASE_URL
 * @param {Number} isAdmin value of if user is an admin
 * @description creates new jwt token for authentication
 * @returns {String} newly created jwt
 */
export const createToken = (id, isAdmin) => {
  const token = jwt.sign(
    {
      id, isAdmin
    },
    process.env.SECRET, { expiresIn: '7d' }
  );
  return token;
};

/**
 * @method hasToken
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Object} response object
 */
export const hasToken = async (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization || req.body.Authorization;
  try {
    if (token) {
      const noBearer = token.replace(/Bearer\s/gi, '');
      const decoded = await jwt.verify(noBearer, process.env.SECRET);
      const text = 'SELECT * FROM Users WHERE id = $1';
      const { rows } = await db.query(text, [decoded.id]);
      if (!rows[0]) {
        return handleServerResponseError(res, 403, 'Token you provided is invalid');
      }
      req.decoded = decoded;
      return next();
    }
    return handleServerResponseError(res, 403, 'You have to be logged in');
  } catch (error) {
    return handleServerResponseError(res, 403, error);
  }
};

/**
 * @function checkSeatNumber
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {void} moves to next middleware
 */
export const checkSeatNumber = async (req, res, next) => {
  const { trip_id, seat_number } = req.body;
  const tripQuery = `SELECT id, seats [${seat_number}]
  FROM Trips
  WHERE id = $1`;
  const value = [
    trip_id
  ];
  try {
    if (seat_number) {
      const { rows } = await db.query(tripQuery, value);
      console.log(rows[0]);
      if (rows[0].seats.is_open === false) {
        return handleServerResponseError(res, 409, `seat_number ${seat_number} already taken, please select another`);
      }
      return next();
    }
    return next();
  } catch (error) {
    return handleServerError(res, error);
  }
};

/**
 * @method isAdmin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {Object} response object
 */
export const isAdmin = async (req, res, next) => {
  const token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization;
  try {
    const noBearer = token.replace(/Bearer\s/gi, '');
    const decoded = await jwt.verify(noBearer, process.env.SECRET);
    if (req.body.is_admin) {
      return next();
    }
    if (!decoded.isAdmin) {
      return handleServerResponseError(res, 403, 'You are not authorized to access this endpoint');
    }
    return next();
  } catch (error) {
    return handleServerResponseError(res, 403, error);
  }
};

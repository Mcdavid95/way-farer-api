/* eslint-disable camelcase */
import moment from 'moment';
import db from './db';
import {
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
} from '../helpers/utils';

/**
 * @function reserveSeat
 * @param {number} tripId id of Trip
 * @param {number} seatNumber, seat number to update
 * @returns {object} object containing Trip details
 */
const reserveSeat = async (tripId, seatNumber) => {
  const tripQuery = `UPDATE Trips
  SET seats [ $3 ] = $2 WHERE id = $1 returning *`;
  const value = [
    tripId, { is_open: false, seat_number: seatNumber }, seatNumber
  ];
  try {
    await db.query(tripQuery, value);
    return seatNumber;
  } catch (error) {
    return error;
  }
};

/**
 * @function checkSeatNumber
 * @param {number} tripId id of Trip
 * @param {number} seatNumber, seat number to update
 * @returns {object} object containing Trip details
 */
const checkSeatNumber = async (tripId, seatNumber) => {
  if (seatNumber) {
    const reservedSeatNumber = await reserveSeat(tripId, seatNumber);
    return reservedSeatNumber;
  }
  const getTrip = 'SELECT seats FROM Trips WHERE id = $1';
  const value = [
    tripId
  ];
  try {
    const { rows } = await db.query(getTrip, value);
    const selectedSeat = rows[0].seats.find(seat => seat.is_open === true);
    const reservedSeatNumber = await reserveSeat(tripId, selectedSeat.seat_number);
    return reservedSeatNumber;
  } catch (error) {
    return error;
  }
};

const constructData = trip => ({
  trip_id: trip.id,
  bus_id: trip.bus_id,
  origin: trip.origin,
  destination: trip.destination,
  trip_date: trip.trip_date,
  fare: trip.fare,
  seats: trip.seats
});

const Booking = {
  /**
   * @method create
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async create(req, res) {
    const {
      user_id, trip_id, seat_number
    } = req.body;
    try {
      const createQuery = `INSERT INTO
      Bookings(user_id, trip_id, seat_number, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
      const seat = await checkSeatNumber(trip_id, seat_number);
      const values = [
        user_id || req.decoded.id, trip_id, seat,
        moment(new Date()), moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      const bookingQuery = `SELECT user_id, trip_id, bus_id, seat_number, trip_date, first_name, last_name, email
      FROM Bookings booking, Users, Trips trip WHERE booking.id = $1 AND Users.id = booking.user_id AND trip.id = booking.trip_id`;
      const booking = await db.query(bookingQuery, [rows[0].id]);
      const result = booking.rows[0];
      result.id = rows[0].id;
      return handleServerResponse(res, 201, result);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  /**
   * @method getBookings
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async getBookings(req, res) {
    try {
      const { is_admin, user_id } = req.body;
      const id = req.decoded.id || user_id;
      const isAdmin = req.decoded.is_admin || is_admin;
      const userQuery = 'SELECT * FROM Users WHERE id = $1';
      const findAllQuery = `SELECT user_id, trip_id, bus_id, seat_number, trip_date, first_name, last_name, email
      FROM Bookings booking, Users, Trips trip WHERE Users.id = booking.user_id AND trip.id = booking.trip_id`;
      const findUserQuery = `SELECT user_id, trip_id, bus_id, seat_number, trip_date, first_name, last_name, email
      FROM Bookings booking, Users, Trips trip WHERE booking.user_id = $1 AND Users.id = booking.user_id AND trip.id = booking.trip_id`;
      const user = await db.query(userQuery, [id]);
      if (user.rows[0].is_admin || isAdmin) {
        const { rows } = await db.query(findAllQuery);
        return handleServerResponse(res, 200, rows);
      }
      const { rows } = await db.query(findUserQuery, [user.rows[0].id || id]);
      return handleServerResponse(res, 200, rows);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  /**
   * @method getOneBooking
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async getOneBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const findAllQuery = 'SELECT * FROM Bookings WHERE id = $1';
      const { rows } = await db.query(findAllQuery, [bookingId]);
      return handleServerResponse(res, 200, constructData(rows[0]));
    } catch (error) {
      handleServerError(res, error);
    }
  },

  /**
   * Delete A Booking
   * @param {object} req
   * @param {object} res
   * @returns {void} return statuc code 204
   */
  async deleteBooking(req, res) {
    const { bookingId } = req.params;
    const bookingQuery = 'SELECT * FROM Bookings WHERE id = $1';
    const { rows } = await db.query(bookingQuery, [bookingId]);
    if (!rows || rows.length < 1) {
      return handleServerResponseError(res, 404, `Booking with id ${bookingQuery} does not exist`);
    }
    const deleteQuery = 'DELETE FROM Bookings WHERE id = $1';
    try {
      await db.query(deleteQuery, [bookingId]);
      return handleServerResponse(res, 200, { message: 'Booking deleted successfully' });
    } catch (error) {
      return handleServerError(res, error);
    }
  }
};

export default Booking;

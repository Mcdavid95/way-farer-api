/* eslint-disable camelcase */
import moment from 'moment';
import db from './db';
import {
  handleServerError,
  handleServerResponse
} from '../helpers/utils';

/**
 * @function getBus
 * @param {number} id id of bus
 * @returns {object} object containing bus details
 */
const getBus = async (id) => {
  const userQuery = 'SELECT * FROM Buses WHERE id = $1';
  try {
    const { rows } = await db.query(userQuery, [id]);
    return rows[0];
  } catch (error) {
    return error;
  }
};

/**
 * @function createSeats
 * @param {number} busCapacity capacity of bus
 * @returns {array} array of objects containing seat number and seat status
 */
const createSeats = (busCapacity) => {
  const seats = new Array(busCapacity).fill(0).map((seat, index) => (JSON.stringify({
    is_open: true,
    seat_number: index + 1
  })));
  return seats;
};

const constructData = trip => ({
  trip_id: trip.id,
  bus_id: trip.bus_id,
  origin: trip.origin,
  destination: trip.destination,
  trip_date: trip.trip_date,
  fare: trip.fare
});

const Trip = {
  async create(req, res) {
    const {
      bus_id, origin, destination, trip_date, fare
    } = req.body;
    try {
      const createQuery = `INSERT INTO
      Trips(bus_id, origin, destination, trip_date, fare, seats, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
      const bus = await getBus(bus_id);
      const values = [
        bus_id, origin.trim().toLowerCase(),
        destination.trim().toLowerCase(), moment(trip_date),
        fare, `${createSeats(bus.id)}`,
        moment(new Date()), moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      return handleServerResponse(res, 201, constructData(rows[0]));
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

export default Trip;

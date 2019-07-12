import moment from 'moment';
import db from './db';
import {
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
} from '../helpers/utils';

const Bus = {
  async create(req, res) {
    const {
      // eslint-disable-next-line camelcase
      model, numberPlate, manufacturer, year, capacity
    } = req.body;
    try {
      const createQuery = `INSERT INTO
      Buses(model, number_plate, manufacturer, year, capacity, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
      const values = [
        model.trim().toLowerCase(), numberPlate.trim().toLowerCase(),
        manufacturer.trim().toLowerCase(), year,
        capacity, moment(new Date()), moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      return handleServerResponse(res, 201, { bus: rows[0] });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return handleServerResponseError(res, 409, `Bus with number plate:- ${numberPlate.trim().toLowerCase()} already exists`);
      }
      handleServerError(res, error);
    }
  },
};

export default Bus;

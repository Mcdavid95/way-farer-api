import moment from 'moment';
import db from './db';
import {
  createToken,
  hashPassword,
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
  isPassword
} from '../helpers/utils';

const Auth = {
  async create(req, res) {
    const {
      // eslint-disable-next-line camelcase
      email, first_name, last_name, password, userType
    } = req.body;
    try {
      const hash = await hashPassword(password);
      const createQuery = `INSERT INTO
      Users(email, first_name, last_name, password, is_admin, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
      const values = [
        email.trim().toLowerCase(), first_name.trim().toLowerCase(),
        last_name.trim().toLowerCase(), hash,
        userType === 'admin', moment(new Date()), moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      const token = createToken(rows[0].id, rows[0].is_admin);
      return handleServerResponse(res, 201, {
        user_id: rows[0].id,
        is_admin: rows[0].is_admin,
        token
      });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return handleServerResponseError(res, 409, `User with Email:- ${email.trim().toLowerCase()} already exists`);
      }
      handleServerError(res, error);
    }
  },

  /**
   * Login
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
  async login(req, res) {
    const userQuery = 'SELECT * FROM Users WHERE email = $1';
    const { email, password } = req.body;
    try {
      const { rows } = await db.query(userQuery, [email]);
      if (!rows[0]) {
        return handleServerResponseError(res, 404, 'Account with Email not found');
      }
      if (!isPassword(password, rows[0].password)) {
        return handleServerResponseError(res, 403, 'Password incorrect');
      }
      const token = createToken(rows[0].id, rows[0].is_admin);
      return handleServerResponse(res, 200, {
        user_id: rows[0].id, is_admin: rows[0].is_admin, token
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },
};

export default Auth;

import Joi from '@hapi/joi';
import { handleServerResponseError } from './utils';

/**
 * @function
  * @param {*} req
  * @param {*} res
  * @param {*} next
 * @description validates signup input
 * @returns {Response | RequestHandler} error or request handler
 */
const signupInput = (req, res, next) => {
  const {
    // eslint-disable-next-line camelcase
    first_name, last_name, email, password
  } = req.body;
  const schema = Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).required()
  });
  const result = Joi.validate({
    first_name, last_name, email, password
  }, schema);
  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
  return next();
};

/**
 * @function
  * @param {*} req
  * @param {*} res
  * @param {*} next
 * @description validates signin input
 * @returns {Response | RequestHandler} error or request handler
 */
const signinInput = (req, res, next) => {
  const {
    email, password
  } = req.body;
  const schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).required()
  });
  const result = Joi.validate({
    email, password
  }, schema);
  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
  return next();
};

/**
 * @function
  * @param {*} req
  * @param {*} res
  * @param {*} next
 * @description validates create bus input
 * @returns {Response | RequestHandler} error or request handler
 */
const createBusInput = (req, res, next) => {
  const {
    // eslint-disable-next-line camelcase
    model, manufacturer, year, numberPlate, capacity
  } = req.body;
  const schema = Joi.object().keys({
    model: Joi.string().required(),
    manufacturer: Joi.string().required(),
    year: Joi.string().trim().required(),
    numberPlate: Joi.string().required(),
    capacity: Joi.number().required()
  });
  const result = Joi.validate({
    model, manufacturer, year, numberPlate, capacity
  }, schema);
  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
  return next();
};

/**
 * @function
  * @param {*} req
  * @param {*} res
  * @param {*} next
 * @description validates create trip input
 * @returns {Response | RequestHandler} error or request handler
 */
const createTripInput = (req, res, next) => {
  const {
    // eslint-disable-next-line camelcase
    bus_id, origin, destination, trip_date, fare
  } = req.body;
  const schema = Joi.object().keys({
    bus_id: Joi.number().required(),
    origin: Joi.string().required(),
    destination: Joi.string().trim().required(),
    trip_date: Joi.string().required(),
    fare: Joi.number().required()
  });
  const result = Joi.validate({
    bus_id, origin, destination, trip_date, fare
  }, schema);
  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
  return next();
};

export default {
  validateSignup: signupInput,
  validateSignin: signinInput,
  validateCreateBus: createBusInput,
  validateCreateTrip: createTripInput
};

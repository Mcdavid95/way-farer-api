import express from 'express';
import Trip from '../controllers/Trip';
import ValidateInput from '../helpers/validateInput';
import { isAdmin, hasToken } from '../helpers/utils';

const {
  create,
  getTrips,
  getOneTrip,
  cancelTrip
} = Trip;
const { validateCreateTrip } = ValidateInput;

const router = express.Router();

router.post('/', hasToken, isAdmin, validateCreateTrip, create);
router.get('/', hasToken, getTrips);
router.get('/:trip_id', hasToken, getOneTrip);
router.patch('/:trip_id', hasToken, isAdmin, cancelTrip);

export default router;

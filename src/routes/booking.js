import express from 'express';
import Booking from '../controllers/Booking';
import ValidateInput from '../helpers/validateInput';
import { hasToken, checkSeatNumber } from '../helpers/utils';

const {
  create,
  getBookings,
  getOneBooking,
  deleteBooking
} = Booking;
const { validateCreateBooking } = ValidateInput;

const router = express.Router();

router.post('/', hasToken, validateCreateBooking, checkSeatNumber, create);
router.get('/', hasToken, getBookings);
router.get('/:bookingId', hasToken, getOneBooking);
router.delete('/:bookingId', hasToken, deleteBooking);

export default router;

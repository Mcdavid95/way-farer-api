import express from 'express';
import Trip from '../controllers/Trip';
import ValidateInput from '../helpers/validateInput';
import { isAdmin, hasToken } from '../helpers/utils';

const { create } = Trip;
const { validateCreateTrip } = ValidateInput;

const router = express.Router();

router.post('/', hasToken, isAdmin, validateCreateTrip, create);

export default router;

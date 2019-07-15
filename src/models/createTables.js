import { createUserTable } from './user';
import { createBusTable } from './bus';
import { createTripTable } from './trip';
import { createBookingTable } from './booking';

const createTables = async () => {
  await createUserTable();
  await createBusTable();
  await createTripTable();
  await createBookingTable();
};

export default createTables;

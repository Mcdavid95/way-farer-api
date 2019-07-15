import { dropUserTable } from './user';
import { dropBusTable } from './bus';
import { dropTripTable } from './trip';
import { dropBookingTable } from './booking';

const dropTables = async () => {
  await dropBookingTable();
  await dropTripTable();
  await dropBusTable();
  await dropUserTable();
};

export default dropTables;

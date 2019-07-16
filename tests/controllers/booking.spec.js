import chai from 'chai';
import api from '../test.config';
import {
  normalUser, adminUser
} from '../__mocks__/auth.mocks';
import { trip } from '../__mocks__/trip.mocks';
import { secondBus } from '../__mocks__/bus.mocks';
import { booking, withSeatNumber } from '../__mocks__/booking.mocks';

const { expect } = chai;
let adminToken,
  userToken;

describe('Booking controller', () => {
  it('should login an admin', async () => {
    const server = await api.post('/api/v1/auth/signin')
      .type('form')
      .set('Content-Type', 'application/json')
      .send(adminUser);
    adminToken = server.body.data.token;
    expect(server.statusCode).to.equal(200);
  });

  it('should create a new bus', async () => {
    const server = await api.post('/api/v1/buses')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken)
      .send(secondBus);
    expect(server.statusCode).to.equal(201);
  });

  it('should create a new trip', async () => {
    const server = await api.post('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken)
      .send(trip);
    expect(server.statusCode).to.equal(201);
  });

  it('should signin a user', async () => {
    const server = await api.post('/api/v1/auth/signin')
      .type('form')
      .set('Content-Type', 'application/json')
      .send(normalUser);
    userToken = server.body.data.token;
    expect(server.statusCode).to.equal(200);
  });

  it('should book a trip', async () => {
    const server = await api.post('/api/v1/bookings')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken)
      .send(booking);
    expect(server.statusCode).to.equal(201);
  });

  it('should book a trip with seat number selected', async () => {
    const server = await api.post('/api/v1/bookings')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken)
      .send(withSeatNumber);
    expect(server.statusCode).to.equal(201);
  });

  it('should not create a new booking if trip_id is not present', async () => {
    const server = await api.post('/api/v1/bookings')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken)
      .send({});
    expect(server.statusCode).to.equal(401);
  });

  it('should get all bookings for user', async () => {
    const server = await api.get('/api/v1/bookings')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should get all bookings for admin', async () => {
    const server = await api.get('/api/v1/bookings')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should get one booking', async () => {
    const server = await api.get('/api/v1/bookings/1')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should delete a booking', async () => {
    const server = await api.delete('/api/v1/bookings/1')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should return error is bookingid is invalid', async () => {
    const server = await api.delete('/api/v1/bookings/1')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken);
    expect(server.statusCode).to.equal(404);
  });
});

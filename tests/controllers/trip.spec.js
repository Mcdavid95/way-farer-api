import chai from 'chai';
import api from '../test.config';
import {
  normalUser, adminUser
} from '../__mocks__/auth.mocks';
import { trip, noBusId, secondTrip } from '../__mocks__/trip.mocks';

const { expect } = chai;
let adminToken,
  userToken;

describe('Trip controller', () => {
  it('should login an admin', async () => {
    const server = await api.post('/api/v1/auth/signin')
      .type('form')
      .set('Content-Type', 'application/json')
      .send(adminUser);
    adminToken = server.body.data.token;
    expect(server.statusCode).to.equal(200);
  });

  it('should create a new trip', async () => {
    const server = await api.post('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken)
      .send(secondTrip);
    expect(server.statusCode).to.equal(201);
  });

  it('should not create a new trip if token is not present', async () => {
    const server = await api.post('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .send(trip);
    expect(server.statusCode).to.equal(403);
  });

  it('should signin a user', async () => {
    const server = await api.post('/api/v1/auth/signin')
      .type('form')
      .set('Content-Type', 'application/json')
      .send(normalUser);
    userToken = server.body.data.token;
    expect(server.statusCode).to.equal(200);
  });

  it('should not create a new trip if user is not an admin', async () => {
    const server = await api.post('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken)
      .send(trip);
    expect(server.statusCode).to.equal(403);
  });

  it('should not create a new trip if bus_id is not present', async () => {
    const server = await api.post('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken)
      .send(noBusId);
    expect(server.statusCode).to.equal(401);
  });

  it('should get all trips', async () => {
    const server = await api.get('/api/v1/trips')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should get one trip', async () => {
    const server = await api.get('/api/v1/trips/1')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', userToken);
    expect(server.statusCode).to.equal(200);
  });

  it('should cancel a trip', async () => {
    const server = await api.patch('/api/v1/trips/2')
      .type('form')
      .set('Content-Type', 'application/json')
      .set('x-access-token', adminToken);
    expect(server.statusCode).to.equal(200);
  });
});

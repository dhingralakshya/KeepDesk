const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth APIs', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
    phone: 1234567890
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/register').send(userData);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should not register the same user again', async () => {
    const res = await request(app).post('/register').send(userData);
    expect(res.statusCode).toBe(409);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/login').send({
      email: userData.email,
      password: userData.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

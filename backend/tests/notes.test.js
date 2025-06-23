const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create user and login
  await request(app).post('/register').send({
    name: 'Note Tester',
    email: 'note@example.com',
    password: 'pass123',
    phone: 1234567890
  });

  const res = await request(app).post('/login').send({
    email: 'note@example.com',
    password: 'pass123'
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Note APIs', () => {
  let noteId;

  it('should create a new note', async () => {
    const res = await request(app)
      .post('/')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Note',
        content: 'This is a test note'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    noteId = res.body._id;
  });

  it('should fetch user notes', async () => {
    const res = await request(app)
      .get('/')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update the note', async () => {
    const res = await request(app)
      .patch(`/update/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should delete the note', async () => {
    const res = await request(app)
      .post('/delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: noteId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});

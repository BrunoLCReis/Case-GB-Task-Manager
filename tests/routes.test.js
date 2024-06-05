const fastify = require('fastify')();
const db = require('../db');
const routes = require('../routes');

beforeAll(() => {
  fastify.register(routes);
});

afterAll(() => {
  fastify.close();
});

test('GET /api/tasks', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/tasks'
  });

  expect(response.statusCode).toBe(200);
  expect(Array.isArray(JSON.parse(response.payload))).toBe(true);
});

test('POST /api/tasks', async () => {
  const response = await fastify.inject({
    method: 'POST',
    url: '/api/tasks',
    payload: {
      title: 'Test Task',
      description: 'This is a test task'
    }
  });

  expect(response.statusCode).toBe(200);
  const task = JSON.parse(response.payload);
  expect(task).toHaveProperty('id');
  expect(task.title).toBe('Test Task');
  expect(task.description).toBe('This is a test task');
  expect(task.completed).toBe(0);
});

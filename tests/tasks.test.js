const fastify = require('fastify')({ logger: false });
const { initDb } = require('./db-test.js');

// init db
let db;

// verificando os endpoints antes de executar os testes
beforeAll(async () => {
  db = await initDb();

  fastify.post('/api/tasks', async (request, reply) => {
    const { title, description } = request.body;

    try {
      const result = await db.run('INSERT INTO tasks (title, description, completed, inProgress) VALUES (?, ?, ?, ?)', [title, description, false, false]);
      reply.send({ id: result.lastID, title, description, completed: false, inProgress: false });
    } catch (err) {
      reply.status(500).send(err);
    }
  });

  fastify.put('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, description, completed, inProgress } = request.body;

    try {
      await db.run('UPDATE tasks SET title = ?, description = ?, completed = ?, inProgress = ? WHERE id = ?',
        [title, description, completed, inProgress, id]);

      reply.send({ id, title, description, completed, inProgress });
    } catch (err) {
      reply.status(500).send(err);
    }
  });

  fastify.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await db.run('DELETE FROM tasks WHERE id = ?', id);
      reply.send({ success: true });
    } catch (err) {
      reply.status(500).send(err);
    }
  });

  fastify.get('/api/tasks', async (request, reply) => {
    try {
      const tasks = await db.all('SELECT * FROM tasks');
      reply.send(tasks);
    } catch (err) {
      reply.status(500).send(err);
    }
  });

  await fastify.listen(3001);
});

afterAll(async () => {
  await fastify.close();
  await db.close();
});

describe('GET /api/tasks', () => {
    it('should return a list of tasks', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/tasks'
      });
  
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(JSON.parse(response.payload))).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should add a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Description of the new task'
      };
  
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: newTask
      });
  
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual(expect.objectContaining(newTask));
  
      const taskInDb = await db.get('SELECT * FROM tasks WHERE title = ?', newTask.title);
      expect(taskInDb).toBeTruthy();
      expect(taskInDb.title).toBe(newTask.title);
      expect(taskInDb.description).toBe(newTask.description);
    });
  });


describe('PUT /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { title: 'Test Task', description: 'Test Description' }
    });

    taskId = JSON.parse(response.payload).id;
  });

  it('should update an existing task', async () => {
    const updatedTask = {
      title: 'Updated Task',
      description: 'Updated Description',
      completed: true,
      inProgress: true
    };
  
    const response = await fastify.inject({
      method: 'PUT',
      url: `/api/tasks/${taskId}`,
      payload: updatedTask
    });
  
    // Convertendo taskId para string
    const taskIdString = taskId.toString();
  
    // Convertendo 1 para "1" em updatedTask.completed e updatedTask.inProgress
    const updatedTaskStringified = { ...updatedTask, completed: updatedTask.completed.toString(), inProgress: updatedTask.inProgress.toString() };
  
    // Convertendo os atributos completed e inProgress para string no objeto esperado
    const expectedTaskStringified = {
      ...updatedTaskStringified,
      completed: updatedTaskStringified.completed.toString(),
      inProgress: updatedTaskStringified.inProgress.toString()
    };
  
    // Convertendo o payload da resposta para objeto JavaScript
    const responsePayload = JSON.parse(response.payload);
  
    // Convertendo os atributos completed e inProgress para string no payload da resposta
    const responsePayloadStringified = {
      ...responsePayload,
      completed: responsePayload.completed.toString(),
      inProgress: responsePayload.inProgress.toString()
    };
  
    expect(response.statusCode).toBe(200);
    expect(responsePayloadStringified).toEqual({ id: taskIdString, ...expectedTaskStringified });
  
    const taskInDb = await db.get('SELECT * FROM tasks WHERE id = ?', taskId);
    expect(taskInDb.title).toBe(updatedTask.title);
    expect(taskInDb.description).toBe(updatedTask.description);
    expect(taskInDb.completed).toBe(1);
    expect(taskInDb.inProgress).toBe(1);
  });

});

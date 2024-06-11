const db = require('./db');

async function routes(fastify) {
  fastify.get('/api/tasks', async (request, reply) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        reply.send(err);
      } else {
        reply.send(rows);
      }
    });
  });

  fastify.post('/api/tasks', async (request, reply) => {
    const { title, description } = request.body;
    db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], function(err) {
      if (err) {
        reply.send(err);
      } else {
        reply.send({ id: this.lastID, title, description, completed: 0 });
      }
    });
  });

  fastify.put('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, description, completed } = request.body;
    db.run('UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?', [title, description, completed, id], function(err) {
      if (err) {
        reply.send(err);
      } else {
        reply.send({ id, title, description, completed });
      }
    });
  });

  fastify.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        reply.send(err);
      } else {
        reply.send({ success: true });
      }
    });
  });
}

module.exports = routes;

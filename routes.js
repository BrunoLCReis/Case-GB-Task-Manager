const db = require('./db');

// rota que retorna as tarefas criadas dinamicamente na tela
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


  // rota que insere as tarefas no banco
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

  //  trafego das tarefas dentre os estados/colunas
  fastify.put('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const { title, description, completed, inProgress } = request.body;
    
    try {
      await db.run('UPDATE tasks SET title = ?, description = ?, completed = ?, inProgress = ? WHERE id = ?', [title, description, completed, inProgress, id]);
      reply.send({ id, title, description, completed, inProgress });
    } catch (err) {
      reply.status(500).send(err);
    }
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

const fastify = require('fastify')({ logger: true });
const db = require('./db');
const routes = require('./routes');

// Configurar CORS - habilitado para a comunicação web
fastify.register(require('fastify-cors'), {
  origin: true
});

// Registrar rotas http
fastify.register(routes);

// Inicia servidor node
const start = async () => {
  try {
    await fastify.listen(3000);
    console.log(`Server is running on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
  const db = await open({
    filename: ':memory:', // inicia o banco em memoria
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      completed BOOLEAN,
      inProgress BOOLEAN
    )
  `);

  return db;
}

module.exports = { initDb };

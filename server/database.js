const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'health_wallet.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'owner'
    )`);

    // Reports Table
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT,
      report_type TEXT,
      date TEXT,
      vitals TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Vitals Table (Tracking over time)
    db.run(`CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      value REAL,
      date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Shares Table
    db.run(`CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      shared_with_user_id INTEGER,
      role TEXT DEFAULT 'viewer',
      FOREIGN KEY(report_id) REFERENCES reports(id),
      FOREIGN KEY(shared_with_user_id) REFERENCES users(id)
    )`);
  });
}

module.exports = db;

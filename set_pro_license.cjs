const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pustakasmart.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite at:', dbPath);
});

db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('licenseType', '"pro"')`, (err) => {
  if (err) console.error(err);
  else console.log('✅ Successfully updated licenseType in SQLite to "pro"!');
  db.close();
});

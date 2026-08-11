import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { seedData } from "../src/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, "expo.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const defaultState = JSON.stringify(seedData);

const rowCount = db.prepare("SELECT COUNT(*) AS count FROM app_state").get().count;
if (!rowCount) {
  db.prepare("INSERT INTO app_state (id, payload) VALUES (1, ?)").run(defaultState);
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/state", (_, res) => {
  const row = db.prepare("SELECT payload FROM app_state WHERE id = 1").get();
  res.json(JSON.parse(row.payload));
});

app.put("/api/state", (req, res) => {
  const payload = req.body ?? {};
  db.prepare("UPDATE app_state SET payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1").run(JSON.stringify(payload));
  res.json({ ok: true });
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(3001, () => {
  console.log("Shared API running on http://localhost:3001");
});

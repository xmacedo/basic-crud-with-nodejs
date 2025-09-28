import express from "express";
import db from "../db.js";
import axios from "axios";

const router = express.Router();

async function sendWebhook(event, payload) {
  try {
    await axios.post("http://localhost:5001/webhook", { event, payload });
  } catch (err) {
    console.error("Failed to send to webhook:", err.message);
  }
}

// Create User
router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and Email are required." });

  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const newUser = { id: this.lastID, name, email };
    sendWebhook("USER_CREATED", newUser);
    res.status(201).json(newUser);
  });
});

// List Users
router.get("/", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get User by ID
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User NOT FOUND" });
    res.json(row);
  });
});

// Update User
router.put("/:id", (req, res) => {
  const { name, email } = req.body;
  db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "User NOT FOUND" });

    const updated = { id: req.params.id, name, email };
    sendWebhook("USER_UPDATED", updated);
    res.json(updated);
  });
});

// Delete User
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "User NOT FOUND" });

    sendWebhook("USER_DELETED", { id: req.params.id });
    res.status(204).end();
  });
});

export default router;


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

// Create article
router.post("/", (req, res) => {
  const { title, content, user_id } = req.body;
  if (!title || !content || !user_id) return res.status(400).json({ error: "Require data are missing." });

  db.run("INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)", [title, content, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const newArticle = { id: this.lastID, title, content, user_id };
    sendWebhook("ARTICLE_CREATED", newArticle);
    res.status(201).json(newArticle);
  });
});

// List all articles, by users
router.get("/", (req, res) => {
  db.all(
    `SELECT a.id, a.title, a.content, a.created_at, u.name as author
     FROM articles a
     JOIN users u ON a.user_id = u.id
     ORDER BY a.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get article by ID
router.get("/:id", (req, res) => {
  db.get(
    `SELECT a.id, a.title, a.content, a.created_at, u.name as author
     FROM articles a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Article Not Found." });
      res.json(row);
    }
  );
});

// Update article
router.put("/:id", (req, res) => {
  const { title, content, user_id } = req.body;
  db.run(
    "UPDATE articles SET title = ?, content = ?, user_id = ? WHERE id = ?",
    [title, content, user_id, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Article Not Found." });

      const updated = { id: req.params.id, title, content, user_id };
      sendWebhook("ARTICLE_UPDATED", updated);
      res.json(updated);
    }
  );
});

// Delete article
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM articles WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Article Not Found." });

    sendWebhook("ARTICLE_DELETED", { id: req.params.id });
    res.status(204).end();
  });
});

export default router;

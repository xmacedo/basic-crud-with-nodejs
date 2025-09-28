import express from "express";
import bodyParser from "body-parser";
import usersRouter from "./routes/users.js";
import articlesRouter from "./routes/articles.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Rotas principais
app.use("/api/users", usersRouter);
app.use("/api/articles", articlesRouter);

// Endpoint mock do webhook
app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

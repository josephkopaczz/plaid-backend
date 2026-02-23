require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ===== CORS (разрешаем всё для теста) ===== */
app.use(cors());
app.use(express.json());

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('Server is running');
});

/* ===== TEST ENDPOINT ===== */
app.post('/create_link_token', (req, res) => {
  console.log("Request received at /create_link_token");
  res.json({
    status: "ok",
    message: "Server works correctly",
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const app = express();

/* ===== CORS (разрешаем всё для теста) ===== */
app.use(cors());

app.use(express.json());

/* ===== PLAID CONFIG ===== */
const configuration = new Configuration({
  basePath: PlaidEnvironments.production, // если нужно тестировать — поменяй на sandbox
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

/* ===== CREATE LINK TOKEN ===== */
app.post('/create_link_token', async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: 'user-' + Date.now(),
      },
      client_name: 'KBDBS Lending',
      products: ['transactions', 'identity'], // balance не указываем
      country_codes: ['US'],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });

  } catch (err) {
    console.error('CREATE LINK TOKEN ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/* ===== EXCHANGE TOKEN ===== */
app.post('/exchange_token', async (req, res) => {
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: req.body.public_token,
    });

    const access_token = response.data.access_token;

    res.json({ access_token });

  } catch (err) {
    console.error('EXCHANGE TOKEN ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/* ===== GET TRANSACTIONS ===== */
app.post('/get_transactions', async (req, res) => {
  try {
    const { access_token } = req.body;

    const transactionsResponse = await client.transactionsGet({
      access_token,
      start_date: '2024-01-01',
      end_date: new Date().toISOString().split('T')[0],
    });

    res.json(transactionsResponse.data);

  } catch (err) {
    console.error('TRANSACTIONS ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('Plaid backend running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

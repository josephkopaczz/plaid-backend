require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

app.get('/', (req, res) => {
  res.send('Income backend running');
});

/* ===== CREATE INCOME LINK TOKEN (CORRECT FLOW) ===== */
app.post('/create_income_link_token', async (req, res) => {
  try {

    // 1️⃣ Create user_token
    const userResponse = await client.userCreate({
      client_user_id: 'user-' + Date.now(),
    });

    const user_token = userResponse.data.user_token;

    // 2️⃣ Create link_token with user_token
    const linkResponse = await client.linkTokenCreate({
      user_token: user_token,
      client_name: 'KBDBS Lending',
      products: ['income_verification'],
      country_codes: ['US'],
      language: 'en',
      income_verification: {
        income_source_types: ['document'],
      },
    });

    res.json({
      link_token: linkResponse.data.link_token,
      user_token: user_token
    });

  } catch (err) {
    console.error('INCOME ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

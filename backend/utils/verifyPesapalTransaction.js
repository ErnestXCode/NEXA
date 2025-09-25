const axios = require("axios");
require("dotenv").config();

const apiKey =
  process.env.PESAPAL_ENV === "sandbox"
    ? process.env.PESAPAL_SANDBOX_KEY
    : process.env.PESAPAL_CONSUMER_KEY;

const apiSecret =
  process.env.PESAPAL_ENV === "sandbox"
    ? process.env.PESAPAL_SANDBOX_SECRET
    : process.env.PESAPAL_CONSUMER_SECRET;

const baseUrl =
  process.env.PESAPAL_ENV === "sandbox"
    ? "https://cybqa.pesapal.com/pesapalv3"
    : "https://pay.pesapal.com/v3";

// ------------------
// Get access token
// ------------------
async function getAccessToken() {
  const res = await axios.post(`${baseUrl}/api/Auth/RequestToken`, {
    consumer_key: apiKey,
    consumer_secret: apiSecret,
  });
  return res.data.token;
}

// ------------------
// Verify transaction status
// ------------------
async function verifyTransaction(orderTrackingId) {
  const token = await getAccessToken();

  const res = await axios.get(
    `${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data; // contains payment_status, merchant_reference, amount, etc.
}

module.exports = { verifyTransaction };

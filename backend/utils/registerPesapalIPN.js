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
  console.log(apiKey, '------------', apiSecret)
  const res = await axios.post(`${baseUrl}/api/Auth/RequestToken`, {
    consumer_key: apiKey,
    consumer_secret: apiSecret,
  });
  console.log(res.data)
  return res.data.token;
}

// ------------------
// Register IPN
// ------------------
async function registerIPN() {
  try {
    const token = await getAccessToken();
    console.log("✅ Got token:", token);

   const res = await axios.post(
  `${baseUrl}/api/URLSetup/RegisterIPN`,
  {
    url: process.env.PESAPAL_IPN_URL,
    ipn_notification_type: "POST", // ✅ must be string "POST" or "GET"
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);


    console.log("✅ Registered IPN:", res.data);
  } catch (err) {
    console.error("❌ Register IPN error:", err.response?.data || err.message);
  }
}

registerIPN();

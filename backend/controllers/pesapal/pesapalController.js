const axios = require("axios");

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
// Create payment
// ------------------
exports.createPayment = async (req, res) => {
  console.log("hit create", req.body, apiKey, apiSecret, process.env.PESAPAL_ENV);

  const { schoolId, plan, amount } = req.body;
  const ipnUrl = process.env.PESAPAL_IPN_URL;

  try {
    // 1. Get token
    const token = await getAccessToken();

    // 2. Create checkout invoice (SubmitOrderRequest)
    const response = await axios.post(
      `${baseUrl}/api/Transactions/SubmitOrderRequest`,
      {
        id: schoolId, // merchant reference
        currency: "KES",
        amount,
        description: `${plan} plan`,
        callback_url: ipnUrl,
        notification_id: process.env.PESAPAL_IPN_ID, // from registered IPN
        billing_address: {
          email_address: "test@example.com",
          phone_number: "254700000000",
          country_code: "KE",
          first_name: "School",
          last_name: "Admin",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Pesapal full response:", response.status, response.data);

    const redirectUrl = response.data.redirect_url;
    if (!redirectUrl) {
      return res
        .status(500)
        .json({ error: "No redirect URL returned", raw: response.data });
    }

    res.json({ paymentUrl: redirectUrl });
  } catch (err) {
    console.error(
      "Pesapal create payment error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Pesapal payment creation failed" });
  }
};

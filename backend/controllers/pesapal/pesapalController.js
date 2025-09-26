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
  const { plan, amount } = req.body;
  const schoolId = req.user.school; // always from token/session, not request body

  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${baseUrl}/api/Transactions/SubmitOrderRequest`,
      {
        id: schoolId, // merchant reference will be school _id
        currency: "KES",
        amount,
        description: `${plan} plan`,
        callback_url: process.env.PESAPAL_IPN_URL,
        notification_id: process.env.PESAPAL_IPN_ID,
        billing_address: {
          email_address: req.user.email || "school@example.com",
          phone_number: req.user.phone || "254700000000",
          country_code: "KE",
          first_name: req.user.name || "School",
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

    res.json({ paymentUrl: response.data.redirect_url });
  } catch (err) {
    console.error("Pesapal create payment error:", err.response?.data || err.message);
    res.status(500).json({ error: "Pesapal payment creation failed" });
  }
};

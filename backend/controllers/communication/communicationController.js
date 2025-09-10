const User = require("../../models/User");
const Message = require("../../models/Message");
const PushSubscription = require("../../models/pushSubscription");
const sgMail = require("@sendgrid/mail");
const webpush = require("web-push");

// ⚠️ Set SendGrid API key and VAPID keys in your .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
webpush.setVapidDetails(
  "mailto:noreply@schoolapp.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// POST /communication
const sendMessage = async (req, res) => {
  try {
    const { subject, body, type } = req.body;
    const sender = req.user;

    if (!body) return res.status(400).json({ msg: "Message body required" });

    // Save message to DB
    const newMessage = await Message.create({
      sender: sender.userId,
      subject,
      body,
      type,
      school: sender.school,
    });

    // Send email if type=email
    if (type === "email") {
      try {
        await sgMail.send({
          to: process.env.TEST_EMAIL || "school@example.com",
          from: process.env.FROM_EMAIL || "noreply@schoolapp.com",
          subject: subject || "School Communication",
          text: body,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    // Send web push if type=chat
    if (type === "chat") {
      const subscriptions = await PushSubscription.find({ school: sender.school }).populate("user");
      const payload = JSON.stringify({
        title: `New message from ${sender.name}`,
        body,
        url: "/dashboard/communication",
      });

      subscriptions.forEach((sub) => {
        try {
          webpush.sendNotification(sub.subscription, payload).catch((err) => {
            console.error("Push failed:", err);
          });
        } catch (err) {
          console.error("Push send exception:", err);
        }
      });
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send message" });
  }
};

// GET /communication?type=chat
const getMessages = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type
      ? { type, school: req.user.school }
      : req.user.role === "superadmin"
      ? {}
      : { school: req.user.school };
    const messages = await Message.find(filter)
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch messages" });
  }
};

module.exports = { sendMessage, getMessages };

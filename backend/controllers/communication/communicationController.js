const User = require("../../models/User");
const Message = require("../../models/Message");
const PushSubscription = require("../../models/pushSubscription");
const sgMail = require("@sendgrid/mail");
const webpush = require("web-push");

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
    const io = req.app.get("io");

    if (!body) return res.status(400).json({ msg: "Message body required" });

    // Save message
    const newMessage = await Message.create({
      sender: sender.userId,
      subject,
      body,
      type,
      school: sender.school,
    });

    const senderDoc = await User.findById(sender.userId);

    // Email notifications
    if (type === "email") {
      sgMail
        .send({
          to: process.env.TEST_EMAIL || "school@example.com",
          from: process.env.FROM_EMAIL || "noreply@schoolapp.com",
          subject: subject || "School Communication",
          text: body,
        })
        .catch((err) => console.error("Email send failed:", err));
    }

    // Chat / push notifications
    if (type === "chat") {
      const subscriptions = await PushSubscription.find({ school: sender.school }).populate("user");

      const payload = {
        title: `New message from [${senderDoc.role}] ${senderDoc.name}`,
        body,
        url: "/dashboard/communication",
        senderName: senderDoc.name,
        senderRole: senderDoc.role,
        senderId: senderDoc._id,
      };

      // 🔹 Always send push notification
      subscriptions.forEach((sub) => {
        webpush
          .sendNotification(sub.subscription, JSON.stringify(payload))
          .catch((err) => console.error("Push failed:", err));
      });

      // 🔹 Always emit socket to the whole school
      io.to(sender.school.toString()).emit("newMessage", payload);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send message" });
  }
};


// GET /communication?type=chat&since=timestamp
const getMessages = async (req, res) => {
  try {
    const { type, since, limit = 50 } = req.query;

    const filter = { school: req.user.school };
    if (type) filter.type = type;
    if (since) filter.createdAt = { $gt: new Date(since) };

    const messages = await Message.find(filter)
      .populate("sender", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch messages" });
  }
};

module.exports = { sendMessage, getMessages };

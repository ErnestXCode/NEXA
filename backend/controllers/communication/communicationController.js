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
    const io = req.app.get("io"); // get Socket.IO instance

    if (!body) return res.status(400).json({ msg: "Message body required" });

    // Save message to DB
    const newMessage = await Message.create({
      sender: sender.userId,
      subject,
      body,
      type,
      school: sender.school,
    });

    const senderDoc = await User.findById(sender.userId);

    // Email logic
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

    // Web push & websocket logic
    if (type === "chat") {
      const subscriptions = await PushSubscription.find({
        school: sender.school,
      }).populate("user");

      const recipients = subscriptions.filter(
        (sub) => sub.user._id.toString() !== sender.userId.toString()
      );

      const payload = {
        title: `New message from [${senderDoc.role}] ${senderDoc.name}`,
        body,
        url: "/dashboard/communication",
        senderName: senderDoc.name,
        senderRole: senderDoc.role,
        senderId: senderDoc._id,
      };

      // Web push
      recipients.forEach((sub) => {
        try {
          webpush.sendNotification(sub.subscription, JSON.stringify(payload)).catch(console.error);
        } catch (err) {
          console.error("Push send exception:", err);
        }
      });

      // Websocket
      io.to(sender.school).emit("newMessage", payload);
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

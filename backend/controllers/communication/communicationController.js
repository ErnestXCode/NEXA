const User = require("../../models/User");
const Message = require("../../models/Message");
const sgMail = require("@sendgrid/mail");

// ⚠️ set this in your .env: SENDGRID_API_KEY=xxxxx
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST /communication
const sendMessage = async (req, res) => {
  try {
    const { subject, body, type } = req.body;
    const sender = req.user;
    if (!body) {
      return res.status(400).json({ msg: "Message body required" });
    }

    // Save in DB (always, even emails, so there's a record)
    const newMessage = await Message.create({
      sender: sender.userId,
      subject,
      body,
      type,
      school: sender.school,
    });

    // If it's an email, trigger SendGrid
    if (type === "email") {
      try {
        await sgMail.send({
          to: process.env.TEST_EMAIL || "school@example.com", // you can pick recipient logic later
          from: process.env.FROM_EMAIL || "noreply@schoolapp.com",
          subject: subject || "School Communication",
          text: body,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
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

const Activity = require("../../models/Activity");
const Message = require("../../models/Message");
const User = require("../../models/User");

// Send message
const sendMessage = async (req, res) => {
  try {
    const { subject, body, recipients, type } = req.body;
    const sender = req.user;

    const senderDoc = await User.findOne({ email: sender.email });

    if (!subject || !body || !recipients || recipients.length === 0) {
      return res.status(400).json({ msg: "Subject, body, and recipients are required" });
    }

    const newMessage = new Message({
      subject,
      body,
      sender: senderDoc.name,
      school: sender.school,
      recipients,
      type,
      status: "pending",
    });

    const saved = await newMessage.save();

    const newLog = new Activity({
      type: "text",
      description: `New broadcast by ${senderDoc.name} at ${saved.date} regarding ${saved.subject}`,
      createdBy: senderDoc._id,
      school: sender.school,
    });

    await newLog.save();

    // TODO: implement async delivery via SMS/Email/WhatsApp and update status

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error sending message", error: err.message });
  }
};

// Get all messages (school-scoped)
const getMessages = async (req, res) => {
  try {
    const requester = req.user;
    const query = requester.role === "superadmin" ? {} : { school: requester.school };

    const messages = await Message.find(query).sort({ date: -1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching messages", error: err.message });
  }
};

// Resend failed message
const resendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) return res.status(404).json({ msg: "Message not found" });

    // TODO: trigger delivery logic again, for now just mark as sent
    message.status = "sent";
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error resending message", error: err.message });
  }
};

module.exports = { sendMessage, getMessages, resendMessage };

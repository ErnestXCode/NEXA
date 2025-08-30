const Message = require("../../models/Message");
const User = require("../../models/User");

// Send message
const sendMessage = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const sender = req.user; // logged-in user

    const senderDoc = await User.findOne({ email: sender.email });

    if (!subject || !body)
      return res.status(400).json({ msg: "Subject and body are required" });

    const newMessage = new Message({
      subject,
      body,
      sender: senderDoc.name,
      school: sender.school,
    });

    const saved = await newMessage.save();

    const newLog = new Activity({
      type: "text",
      description: `New broadcast by ${senderDoc.name} at ${saved.date} regarding ${saved.subject}`,
      createdBy: requesterDoc._id,
      school: requester.school,
    });

    await newLog.save();
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
    const query =
      requester.role === "superadmin" ? {} : { school: requester.school };

    const messages = await Message.find(query)
      .sort({ date: -1 })
      .populate("sender", "name email");

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Error fetching messages", error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};

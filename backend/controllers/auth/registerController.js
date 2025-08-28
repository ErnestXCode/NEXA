const School = require("../../models/School");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  const content = req.body;
  const { name, email, password } = content;

  // Check if this is a protected admin route
  const requesterEmail = req.user.email; 
  console.log(requesterEmail)
  const requester = await User.findOne({ email: requesterEmail }); // could add school in accesstoken to avoid interrupting db too much
  let role, schoolName;

  if (!requester) {
    // Public first admin registration
    role = "admin";
    schoolName = content.school;
    if (!schoolName) return res.status(400).json({ msg: "School required" });
  } else {
    // Admin creating teacher/bursar
    role = content.role;
    if (!["teacher", "bursar"].includes(role))
      return res.status(400).json({ msg: "Invalid role" });
    schoolName = requester.school; // admin's school
  }

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "All inputs are mandatory" });
  }

  const foundUser = await User.findOne({ email });
  if (foundUser) return res.status(401).json({ msg: "User Already Exists" });

  // Find or create school
  let schoolDoc = await School.findOne({ name: schoolName });
  if (!schoolDoc) {
    if (role === "admin") {
      schoolDoc = await new School({ name: schoolName });
      await schoolDoc.save();
    } else {
      return res.status(400).json({ msg: "School does not exist" });
    }
  }

  const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const accessToken = jwt.sign({ email, role }, process.env.ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const newUser = new User({
    ...content,
    role,
    school: schoolDoc._id,
    refreshTokens: [
      {
        token: refreshToken,
        createdAt: new Date(),
        deviceInfo: req.headers["user-agent"] || "unknown device",
      },
    ],
  });
  console.log(newUser);
  await newUser.save();

  res
    .cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV !== "dev",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      accessToken: accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        school: newUser.school,
      },
    });
};

module.exports = handleRegister;

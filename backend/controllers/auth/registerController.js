const School = require("../../models/School");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  const content = req.body;
  const { name, email, password } = content;

  const requester = req.user;
  let role, schoolDoc;

  if (!requester) {
    // 🟢 Public first admin registration
    role = "admin";
    const schoolName = content.school;
    if (!schoolName) return res.status(400).json({ msg: "School required" });

    schoolDoc = await School.findOne({ name: schoolName });
    if (!schoolDoc) {
      schoolDoc = new School({ name: schoolName });
      await schoolDoc.save();
    }
  } else {
    // 🟡 Admin creating teacher/bursar
    role = content.role;
    if (!["teacher", "bursar"].includes(role))
      return res.status(400).json({ msg: "Invalid role" });

    schoolDoc = await School.findById(requester.school);
    if (!schoolDoc)
      return res.status(400).json({ msg: "School does not exist" });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "All inputs are mandatory" });
  }

  const foundUser = await User.findOne({ email });
  if (foundUser) return res.status(401).json({ msg: "User Already Exists" });

  // Always create the user
  const newUser = new User({
    ...content,
    role,
    school: schoolDoc._id,
  });
  await newUser.save();

  if (role !== "admin") {
    // 🟡 Admin creates staff → no tokens returned
    return res.status(201).json({
      msg: "Personnel created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  }

  // 🟢 First Admin Register → issue tokens
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const accessToken = jwt.sign(
    { email, role, school: schoolDoc._id },
    process.env.ACCESS_SECRET,
    { expiresIn: "5s" }
  );

  newUser.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    deviceInfo: req.headers["user-agent"] || "unknown device",
  });
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
      accessToken,
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

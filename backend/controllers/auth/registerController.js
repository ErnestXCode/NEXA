const Activity = require("../../models/Activity");
const School = require("../../models/School");
const Student = require("../../models/Student");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  console.log("hit register");
  const content = req.body;
  const { name, email, password, role, children, phoneNumber } = content;

  const requester = req.user;
  let assignedRole = role;
  let schoolDoc = null;
  let requesterDoc = null;

  // Public first admin registration
  if (!requester) {
    assignedRole = "admin";
    const schoolName = content.school;
    if (!schoolName) return res.status(400).json({ msg: "School required" });

    schoolDoc = await School.findOne({ name: schoolName });
    if (!schoolDoc) {
      schoolDoc = new School({
        name: schoolName,
        gradingSystem: School.defaultGradingSystem(),
        classLevels: School.defaultCBCLevels(), // can be updated later via settings
        modules: {
          exams: true,
          attendance: true,
          feeTracking: true,
          communication: true,
        },
      });
      await schoolDoc.save();
    }
  } else {
    // Admin creating staff/parent
    requesterDoc = req.user;

    if (!["teacher", "bursar", "parent"].includes(role))
      return res.status(400).json({ msg: "Invalid role" });

    schoolDoc = await School.findById(requester.school);
    if (!schoolDoc) return res.status(400).json({ msg: "School not found" });
  }

  if ((!name || !email || !password, !phoneNumber)) {
    return res.status(400).json({ msg: "All inputs are mandatory" });
  }

  const foundUser = await User.findOne({ email });
  if (foundUser) return res.status(401).json({ msg: "User Already Exists" });

  const newUser = new User({
    name,
    email,
    password,
    role: assignedRole,
    school: schoolDoc?._id,
    phoneNumber,
  });
  console.log(phoneNumber);
  // Teacher-specific
  if (assignedRole === "teacher") {
    newUser.subjects = content.subjects || [];
    newUser.isClassTeacher = content.isClassTeacher || false;
    newUser.classLevel = content.isClassTeacher
      ? content.classLevel || null
      : null;
  }

  // Parent-specific
  if (assignedRole === "parent") {
    if (!children || !Array.isArray(children) || children.length === 0) {
      return res
        .status(400)
        .json({ msg: "Parent must have at least one child" });
    }

    newUser.children = children; // array of student _ids

    // Update each student to set this parent as guardian
    await Promise.all(
      children.map(async (studentId) => {
        const student = await Student.findById(
          studentId
        );
        // console.log(student)
        if (student) {
          student.guardian = newUser._id;
          const s = await student.save();
          console.log(s)
        }
      })
    );
  }

  await newUser.save();

  // Log activity for staff creation
  if (assignedRole !== "admin") {
    const newLog = new Activity({
      type: "personel",
      description: `New personnel ${newUser.name} registered`,
      createdBy: requesterDoc?.userId,
      school: requesterDoc?.school,
    });
    await newLog.save();

    return res.status(201).json({
      msg: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        subjects: newUser.subjects || [],
        isClassTeacher: newUser.isClassTeacher || false,
        classLevel: newUser.classLevel || null,
        children: newUser.children || [],
      },
    });
  }

  // First admin registration → generate tokens
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const accessToken = jwt.sign(
    { email, role: assignedRole, school: schoolDoc._id, userId: newUser._id },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  newUser.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    deviceInfo: req.headers["user-agent"] || "unknown device",
  });

  await newUser.save();

      const populatedUser = await User.findById(newUser._id).populate("school");
  

  res
    .cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: process.env.SAMESITE_CONFIG,
      secure: process.env.NODE_ENV !== "dev",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      accessToken,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        school: {
          id: populatedUser.school._id,
          name: populatedUser.school.name,
          paidPesapal: populatedUser.school.paidPesapal,
          isPilotSchool: populatedUser.school.isPilotSchool,
          isFreeTrial: populatedUser.school.isFreeTrial,
        },
        isClassTeacher: populatedUser.isClassTeacher,
      },
    });
};

module.exports = handleRegister;

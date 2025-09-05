module.exports = function checkClassTeacherOrAdmin(req, res, next) {
  const { user } = req;
  const { classLevel } = req.body;

  if (!user) return res.status(401).json({ msg: "Unauthorized" });

  if (["admin", "superadmin"].includes(user.role)) return next();

  if (user.role === "teacher" && user.isClassTeacher && user.classLevel === classLevel) {
    return next();
  }

  return res.status(403).json({ msg: "Forbidden: not class teacher or admin" });
};

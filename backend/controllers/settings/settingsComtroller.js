const SchoolSettings = require("../../models/schoolSettings");

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await SchoolSettings.findOne({ schoolId: req.user.schoolId });
    if (!settings) return res.status(404).json({ msg: "Settings not found" });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update settings (create if not exists)
exports.updateSettings = async (req, res) => {
  try {
    const { classLevels, streams, gradingSystem } = req.body;
    let settings = await SchoolSettings.findOne({ schoolId: req.user.schoolId });

    if (!settings) {
      settings = new SchoolSettings({
        schoolId: req.user.schoolId,
        classLevels,
        streams,
        gradingSystem,
      });
    } else {
      settings.classLevels = classLevels;
      settings.streams = streams;
      settings.gradingSystem = gradingSystem;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

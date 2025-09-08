const mongoose = require("mongoose");
const User = require("../../../models/User");
const Student = require("../../../models/Student");

// Get parent by ID
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await User.findById(id).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    console.log(parent)

    if (!parent || parent.role !== "parent")
      return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json(parent);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parent", error: err.message });
  }
};

// Update parent
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Parent not found" });
    res
      .status(200)
      .json({ msg: "Parent updated successfully", parent: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating parent", error: err.message });
  }
};

// Delete parent
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: "Parent not found" });
    res.status(200).json({ msg: "Parent deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting parent", error: err.message });
  }
};

// Get all parents (filtered by school if not superadmin)
const getAllParents = async (req, res) => {
  try {
    const requester = req.user;

    let query = { role: "parent" };

    console.log(requester.role)

    if(requester.role !== 'admin' &&  requester.role !=='superadmin'){
      return res.status(403).json({msg: 'Unauthorized'})
    }

    if (requester.role === "admin") {
      query.school = requester.school; // school-specific parents
    }

    // superadmin sees all parents
    const parents = await User.find(query).populate({
      path: "children",
      select: "firstName lastName classLevel admissionNumber",
    });
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching parents", error: err.message });
  }
};

const getParentDashboard = async (req, res) => {
  try {

    // Get parent's children
    const parent = await User.findOne({email : req.user.email}).populate({
      path: "children",
      select: "firstName lastName classLevel stream admissionNumber",
    });

    if (!parent || parent.role !== "parent") {
      return res.status(404).json({ msg: "Parent not found" });
    }

    // Fetch detailed data for each child
    const childrenData = await Promise.all(
      parent.children.map(async (child) => {
        const student = await Student.findById(child._id)
          .select("-__v -createdAt -updatedAt")
          .lean();

        // Compute total fees paid and outstanding per term
        const feesSummary = student.payments.reduce(
          (acc, p) => {
            if (p.category === "payment") acc.paid += p.amount;
            else if (p.category === "adjustment") acc.adjustments += p.amount;
            acc.total += p.amount;
            return acc;
          },
          { paid: 0, adjustments: 0, total: 0 }
        );

        return {
          ...student,
          feesSummary,
        };
      })
    );

    res.status(200).json({ parent: parent._id, children: childrenData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching dashboard", error: err.message });
  }
};


module.exports = {
  getParentById,
  getParentDashboard,
  updateParent,
  deleteParent,
  getAllParents,
};

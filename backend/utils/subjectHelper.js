// backend/utils/subjectHelper.js

// 🔹 Canonical CBC class order — defines the hierarchy once and for all
const CBC_CLASS_ORDER = [
  "PP1",
  "PP2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];


// 🔹 Smarter range checker that uses CBC order if school data is unordered
function isClassInRange(className, fromClass, toClass, allClasses = []) {
  const schoolOrder = Array.isArray(allClasses) && allClasses.length > 0
    ? allClasses.map(c => c.name)
    : [];

  // Prefer school's order only if it matches CBC structure
  const order = CBC_CLASS_ORDER.every(c => schoolOrder.includes(c))
    ? schoolOrder
    : CBC_CLASS_ORDER;

  const classIdx = order.indexOf(className);
  const fromIdx = order.indexOf(fromClass);
  const toIdx = order.indexOf(toClass);

  if (classIdx === -1 || fromIdx === -1 || toIdx === -1) return false;

  const min = Math.min(fromIdx, toIdx);
  const max = Math.max(fromIdx, toIdx);

  return classIdx >= min && classIdx <= max;
}

// 🔹 No change here — this now benefits from the smarter range check above
function getAllowedSubjectsForClass(school, classLevel) {
  const rules = (school.subjectsByClass || []).filter((r) =>
    isClassInRange(classLevel, r.fromClass, r.toClass, school.classLevels)
  );

  let subjects;
  if (rules.length > 0) {
    subjects = [...new Set(rules.flatMap((r) => r.subjects))];
  } else {
    subjects = [...new Set(school.subjects || [])];
  }

  // 🔹 Enforce global subjects only
  subjects = subjects.filter((s) => school.subjects.includes(s));

  return subjects;
}

module.exports = { getAllowedSubjectsForClass };

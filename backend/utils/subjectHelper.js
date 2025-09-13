// backend/utils/subjectHelper.js
function isClassInRange(className, fromClass, toClass, allClasses = []) {
  const idx = allClasses.findIndex((c) => c.name === className);
  const fromIdx = allClasses.findIndex((c) => c.name === fromClass);
  const toIdx = allClasses.findIndex((c) => c.name === toClass);
  if (idx === -1 || fromIdx === -1 || toIdx === -1) return false;
  const min = Math.min(fromIdx, toIdx);
  const max = Math.max(fromIdx, toIdx);
  return idx >= min && idx <= max;
}

function getAllowedSubjectsForClass(school, classLevel) {
  // find rules covering this class
  const rules = (school.subjectsByClass || []).filter((r) =>
    isClassInRange(classLevel, r.fromClass, r.toClass, school.classLevels)
  );

  if (rules.length > 0) {
    return [...new Set(rules.flatMap((r) => r.subjects))];
  }

  // fallback to global
  return [...new Set(school.subjects || [])];
}

module.exports = { getAllowedSubjectsForClass };

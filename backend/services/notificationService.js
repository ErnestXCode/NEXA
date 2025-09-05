exports.notifyParent = (guardian, student, date) => {
  const message = `Your child ${student.firstName} ${student.lastName} was absent on ${date.toDateString()}`;
  console.log(`Sending notification to ${guardian.phoneNumber}: ${message}`);
  // TODO: Integrate with SMS/Email API
};

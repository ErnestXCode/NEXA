const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const jsPDF = require("jspdf");
require("jspdf-autotable");
const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const generateFeePDFBuffer = (student, term, payments, expectedAmount) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`${student.firstName} ${student.lastName} - ${term} Fee Statement`, 14, 20);
  doc.setFontSize(12);

  const paid = payments
    .filter(p => p.type === "payment")
    .reduce((sum, f) => sum + f.amount, 0);

  const adjustments = payments
    .filter(p => p.type === "adjustment")
    .reduce((sum, f) => sum + f.amount, 0);

  const balance = expectedAmount - paid + adjustments;

  doc.text(`Class: ${student.classLevel}`, 14, 30);
  doc.text(`Expected Fee: KSh ${expectedAmount}`, 14, 37);
  doc.text(`Paid: KSh ${paid}`, 14, 44);
  doc.text(`Adjustments: KSh ${adjustments}`, 14, 51);
  doc.text(`Balance: KSh ${balance}`, 14, 58);

  const tableData = payments.map(p => [
    new Date(p.createdAt).toLocaleDateString(),
    p.amount,
    p.type,
    p.method, // include method
    p.note || "-"
  ]);

  doc.autoTable({
    startY: 70,
    head: [["Date", "Amount", "Type", "Method", "Note"]],
    body: tableData
  });

  return doc.output("arraybuffer");
};

const sendFeeStatement = async (req, res) => {
  try {
    const { studentId, term, sendEmail = true, sendSMS = false } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const expectedAmount = student.feeExpectations.find(f => f.term === term)?.amount || 0;
    const payments = await Fee.find({ student: studentId, term });

    const pdfBuffer = generateFeePDFBuffer(student, term, payments, expectedAmount);

    // Email
    if (sendEmail && student.guardianEmail) {
      const msg = {
        to: student.guardianEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `${term} Fee Statement - ${student.firstName} ${student.lastName}`,
        text: `Dear ${student.guardianName}, please find attached the fee statement for ${term}.`,
        attachments: [
          {
            content: Buffer.from(pdfBuffer).toString("base64"),
            filename: `${student.firstName}_${student.lastName}_${term}_Fees.pdf`,
            type: "application/pdf",
            disposition: "attachment"
          }
        ]
      };
      await sgMail.send(msg);
    }

    // SMS
    if (sendSMS && student.guardianPhone) {
      await client.messages.create({
        body: `Dear ${student.guardianName}, fee statement for ${term} has been sent to your email.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: student.guardianPhone
      });
    }

    res.status(200).json({ msg: "Statement sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error sending fee statement", error: err.message });
  }
};

module.exports = { sendFeeStatement };

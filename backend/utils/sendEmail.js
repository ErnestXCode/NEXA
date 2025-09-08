const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // store in .env

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL, // verified sender
    subject,
    html,
  };
  await sgMail.send(msg);
};

module.exports = sendEmail;

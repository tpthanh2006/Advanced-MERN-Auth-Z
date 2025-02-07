const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (subject, send_to, reply_to, html) => {
  try {
    const msg = {
      to: send_to,
      from: process.env.EMAIL_USER,
      subject: subject,
      html: html,
      replyTo: reply_to
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("SendGrid Error:", error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
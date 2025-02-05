const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (subject, send_to, sent_from, reply_to, template, name, link) => {
  try {
    const msg = {
      to: send_to,
      from: sent_from,
      subject: subject,
      html: template,
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
const nodemailer = require("nodemailer");

const sendEmail = async (subject, send_to, sent_from, reply_to, template, name, link) => {
  try {
    // Create Email Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test connection
    await transporter.verify();

    // Options for sending email
    const mailOptions = {
      from: sent_from,
      to: send_to,
      replyTo: reply_to,
      subject: subject,
      html: template,
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);
    return info;
  } catch (error) {
    console.error("Email Error:", error);
    throw new Error("Email sending failed: " + error.message);
  }
};

module.exports = sendEmail;
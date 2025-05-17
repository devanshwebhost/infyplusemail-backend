require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/sendEmail', async (req, res) => {
    console.log("Request Body:", req.body); // Debugging log
  const { name, company, email, phone, message, subject } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  try {
    // Email to InfyPlus
    const mailToCompany = {
      from: `"${name}" <${email}>`,
      to: 'indocsmedia@gmail.com',
      subject: `New Client: ${name} - ${subject}`,
      text: `
Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone}
Message: ${message}
Subject: ${subject}
      `,
    };

    // Auto-reply email to the applicant
    const mailToApplicant = {
      from: '"Indocs Media" <indocsmedia@gmail.com>',
      to: email,
      subject: 'Thank you for droping a Mail to Us!',
      html: `
       <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; width: 600px; margin: auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://indocsmedia.onrender.com/assets/images/logo-1.jfif" alt="Indocs Media" style="width: 150px; border-radius: 8px;" />
  </div>

  <h2 style="color: #0c52a2;">Hello ${name},</h2>
  <p style="font-size: 16px; line-height: 1.6;">Thank you for reaching out to us! We have received your request regarding <strong>${subject}</strong>. Our team will get back to you as soon as possible.</p>

  <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
    <h3 style="color: #0c52a2; margin-bottom: 10px;">Your Mail Details:</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  </div>

  <p style="font-size: 14px; line-height: 1.6;">If your request is urgent, feel free to contact us at <a href="mailto:indocsmedia@gmail.com" style="color: #0c52a2; text-decoration: none;">indocsmedia@gmail.com</a>.</p>

  <div style="text-align: center; margin-top: 30px;">
    <a href="mailto:indocsmedia@gmail.com" style="background-color: #0c52a2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Us</a>
  </div>

  <div style="text-align: center; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
    <p style="font-size: 12px; color: #777;">Best Regards,<br/><strong>Indocs Media Team</strong></p>
  </div>
</div>

      `,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(mailToCompany),
      transporter.sendMail(mailToApplicant),
    ]);

    res.json({ message: 'Application and confirmation email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("Error starting server:", err);
}

// });

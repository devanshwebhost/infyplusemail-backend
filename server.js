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
        <div style="font-family: Arial, sans-serif; color: #333;">
          <img src="https://indocsmedia.onrender.com/assets/images/logo-1.jfif" alt="indocs media" style="width:150px; margin-bottom:20px;" />
          <h2>Hello ${name},</h2>
          <p>Thank you for reaching out to us! We have received your request: ${subject}, and we'll do our best to process it as soon as possible.</p>
          <p>If something is urgent then please contact us on - <a href="mailto:indocsmedia@gmail.com">indocsmedia@gmail.com</a></p>

          <h3>Your Email Details:</h3>
          <p>
            <strong>Email:</strong> ${email} <br/>
            <strong>Phone:</strong> ${phone} <br/>
            <strong>Message:</strong> ${message}
          </p>
          <p></p>

          <br/>
          <p>Best Regards,<br/><strong>Indocs Media Team</strong></p>
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

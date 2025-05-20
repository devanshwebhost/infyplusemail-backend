require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const PORT = process.env.PORT || 5000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/sendApplication', async (req, res) => {
  const { name, position, email, phone, message, attachment } = req.body;

  if (!name || !email || !position || !message) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Validate attachment size (e.g., 5MB after base64 decoding)
  if (attachment && attachment.content && Buffer.from(attachment.content, 'base64').length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Attachment size exceeds 5MB limit' });
  }

  console.log("Received Attachment:", attachment);

  try {
    const mailToCompany = {
      from: `"${name}" <${email}>`,
      to: 'infyplusconsulting@gmail.com',
      subject: `New Job Application: ${name} - ${position}`,
      text: `
Name: ${name}
Position: ${position}
Email: ${email}
Phone: ${phone}
Message: ${message}
      `,
      attachments: [],
    };

    if (attachment && attachment.filename && attachment.content) {
      mailToCompany.attachments.push({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        encoding: 'base64',
      });
    }

    const mailToApplicant = {
      from: 'InfyPlus Consulting <infyplusconsulting@gmail.com>',
      to: email,
      subject: 'Application Received - InfyPlus Consulting',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
            <img src="https://infyplus.com/assets/images/logo.png" alt="InfyPlus Consulting" style="width:150px; padding:10px; background-color:#000;" />
          </div>
          <h2>Hello ${name},</h2>
          <p>Thank you for reaching out to us regarding the <strong>${position}</strong> position. We have successfully received your application and our team will review it within the next 24-48 hours.</p>
          <p>If your qualifications align with our requirements, we will contact you for further steps. Meanwhile, if you have any urgent inquiries, feel free to reach us at <a href="mailto:infyplusconsulting@gmail.com">infyplusconsulting@gmail.com</a>.</p>
          <p>Thank you for considering InfyPlus Consulting as your next career move!</p>
          <p style="text-align: center;">Best Regards,<br/>InfyPlus Consulting Team</p>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(mailToCompany),
      transporter.sendMail(mailToApplicant)
    ]);

    res.json({ message: 'Application and confirmation email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Failed to send emails: ${error.message}` });
  }
});
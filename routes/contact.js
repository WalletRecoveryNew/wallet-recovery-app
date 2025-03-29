const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Contact Message model
const ContactMessage = require('../models/ContactMessage');

// Contact Page
router.get('/', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us',
    description: 'Get in touch with our wallet recovery specialists for assistance with your cryptocurrency wallet.'
  });
});

// Contact Form Submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      req.flash('error_msg', 'Please fill in all required fields');
      return res.redirect('/contact');
    }
    
    // Create new contact message
    const newContactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message
    });
    
    await newContactMessage.save();
    
    // Set up nodemailer (configuration should be moved to a separate file in production)
    // Note: In production, you'd use environment variables for these values
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Send email notification (to admin)
    const adminMailOptions = {
      from: `"Wallet Recovery Service" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Change this to your admin email
      subject: `New Contact Form Submission: ${subject}`,
      text: `You have received a new contact form submission from ${name} (${email}):\n\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    // Send confirmation email (to user)
    const userMailOptions = {
      from: `"Wallet Recovery Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Wallet Recovery Service',
      text: `Dear ${name},\n\nThank you for contacting Wallet Recovery Service. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nWallet Recovery Service Team`,
      html: `
        <h2>Thank you for contacting Wallet Recovery Service</h2>
        <p>Dear ${name},</p>
        <p>Thank you for contacting Wallet Recovery Service. We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>Wallet Recovery Service Team</p>
      `
    };
    
    // Send emails if not in development mode, otherwise just log
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(userMailOptions);
    } else {
      console.log('Admin email would be sent:', adminMailOptions);
      console.log('User email would be sent:', userMailOptions);
    }
    
    req.flash('success_msg', 'Your message has been sent. We will get back to you soon.');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/contact');
  }
});

module.exports = router; 
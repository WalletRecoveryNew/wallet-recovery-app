const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureVerified } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Wallet Recovery Service | Home',
    description: 'Professional cryptocurrency wallet recovery services to help you regain access to your digital assets.'
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Our Wallet Recovery Service',
    description: 'Learn about our mission, team, and expertise in cryptocurrency wallet recovery.'
  });
});

// Services page
router.get('/services', (req, res) => {
  res.render('pages/services', {
    title: 'Our Wallet Recovery Services',
    description: 'Detailed explanation of our wallet recovery process, methodologies, and success rates.'
  });
});

// FAQ page
router.get('/faq', (req, res) => {
  res.render('pages/faq', {
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about wallet recovery, security, and our process.'
  });
});

// Dashboard - protected route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard',
    description: 'View your wallet recovery status and manage your account.',
    user: req.user
  });
});

// Wallet Recovery Process - protected and verified route
router.get('/recovery-process', ensureVerified, (req, res) => {
  res.render('pages/recovery-process', {
    title: 'Recovery Process',
    description: 'Step-by-step guide to recovering your cryptocurrency wallet.',
    user: req.user
  });
});

// Terms of Service
router.get('/terms', (req, res) => {
  res.render('pages/terms', {
    title: 'Terms of Service',
    description: 'Terms and conditions for using our wallet recovery service.'
  });
});

// Privacy Policy
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'Privacy Policy',
    description: 'How we protect and handle your personal information.'
  });
});

module.exports = router; 
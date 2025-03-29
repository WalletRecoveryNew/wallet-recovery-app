const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const { ensureAuthenticated, forwardAuthenticated, ensureVerified } = require('../middleware/auth');

// User model
const User = require('../models/User');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('pages/users/login', {
    title: 'Login to Your Account',
    description: 'Access your wallet recovery dashboard and manage your recovery process.'
  });
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('pages/users/register', {
    title: 'Create an Account',
    description: 'Register for our wallet recovery service to get started with the recovery process.'
  });
});

// Register Handle
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 8) {
    errors.push({ msg: 'Password should be at least 8 characters' });
  }

  if (errors.length > 0) {
    res.render('pages/users/register', {
      title: 'Create an Account',
      description: 'Register for our wallet recovery service to get started with the recovery process.',
      errors,
      name,
      email
    });
  } else {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email });
      
      if (existingUser) {
        errors.push({ msg: 'Email is already registered' });
        return res.render('pages/users/register', {
          title: 'Create an Account',
          description: 'Register for our wallet recovery service to get started with the recovery process.',
          errors,
          name,
          email
        });
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(20).toString('hex');
      
      // Create new user
      const newUser = new User({
        name,
        email,
        password,
        verificationToken,
        verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      
      // Save user
      await newUser.save();
      
      // TODO: Send verification email
      
      req.flash('success_msg', 'You are now registered. Please check your email to verify your account.');
      res.redirect('/users/login');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'An error occurred. Please try again.');
      res.redirect('/users/register');
    }
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

// Verification page
router.get('/verification', ensureAuthenticated, (req, res) => {
  if (req.user.verified) {
    return res.redirect('/dashboard');
  }
  
  res.render('pages/users/verification', {
    title: 'Verify Your Email',
    description: 'Verify your email address to access all features of our wallet recovery service.',
    user: req.user
  });
});

// Verify email with token
router.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Verification token is invalid or has expired');
      return res.redirect('/users/verification');
    }
    
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    
    await user.save();
    
    req.flash('success_msg', 'Your email has been verified. You can now access all features.');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/verification');
  }
});

// Resend verification email
router.post('/resend-verification', ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.verified) {
      return res.redirect('/dashboard');
    }
    
    // Generate new token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    req.user.verificationToken = verificationToken;
    req.user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await req.user.save();
    
    // TODO: Send verification email
    
    req.flash('success_msg', 'Verification email has been resent. Please check your inbox.');
    res.redirect('/users/verification');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/verification');
  }
});

// Forgot Password page
router.get('/forgot-password', forwardAuthenticated, (req, res) => {
  res.render('pages/users/forgot-password', {
    title: 'Reset Your Password',
    description: 'Reset your password to regain access to your wallet recovery account.'
  });
});

// Forgot Password Handle
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error_msg', 'No account with that email address exists');
      return res.redirect('/users/forgot-password');
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // TODO: Send password reset email
    
    req.flash('success_msg', 'An email has been sent with instructions to reset your password');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/forgot-password');
  }
});

// Reset Password page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/users/forgot-password');
    }
    
    res.render('pages/users/reset-password', {
      title: 'Reset Your Password',
      description: 'Create a new password for your wallet recovery account.',
      token: req.params.token
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/forgot-password');
  }
});

// Reset Password Handle
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, password2 } = req.body;
    let errors = [];
    
    // Check passwords match
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    // Check password length
    if (password.length < 8) {
      errors.push({ msg: 'Password should be at least 8 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('pages/users/reset-password', {
        title: 'Reset Your Password',
        description: 'Create a new password for your wallet recovery account.',
        token: req.params.token,
        errors
      });
    }
    
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/users/forgot-password');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    req.flash('success_msg', 'Your password has been updated. You can now log in with your new password');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/forgot-password');
  }
});

// Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('pages/users/profile', {
    title: 'Your Profile',
    description: 'Manage your account settings and profile information.',
    user: req.user
  });
});

// Update Profile
router.post('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    req.user.name = name;
    req.user.phone = phone;
    
    await req.user.save();
    
    req.flash('success_msg', 'Your profile has been updated');
    res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/profile');
  }
});

// Change Password
router.post('/change-password', ensureAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword, newPassword2 } = req.body;
    let errors = [];
    
    // Check passwords match
    if (newPassword !== newPassword2) {
      errors.push({ msg: 'New passwords do not match' });
    }
    
    // Check password length
    if (newPassword.length < 8) {
      errors.push({ msg: 'Password should be at least 8 characters' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    
    if (!isMatch) {
      errors.push({ msg: 'Current password is incorrect' });
    }
    
    if (errors.length > 0) {
      return res.render('pages/users/profile', {
        title: 'Your Profile',
        description: 'Manage your account settings and profile information.',
        user: req.user,
        errors
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    
    await req.user.save();
    
    req.flash('success_msg', 'Your password has been updated');
    res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/users/profile');
  }
});

module.exports = router; 
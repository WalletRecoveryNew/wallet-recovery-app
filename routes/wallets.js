const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated, ensureVerified } = require('../middleware/auth');

// Wallet model
const Wallet = require('../models/Wallet');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    // Allow only certain file types
    const filetypes = /jpeg|jpg|png|pdf|txt|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }
  }
});

// List all wallet recovery requests for the authenticated user
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.render('pages/wallets/index', {
      title: 'Your Wallet Recovery Requests',
      description: 'View and manage your wallet recovery requests.',
      wallets
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/dashboard');
  }
});

// New wallet recovery request form
router.get('/new', ensureVerified, (req, res) => {
  res.render('pages/wallets/new', {
    title: 'New Wallet Recovery Request',
    description: 'Submit a new wallet recovery request to recover your cryptocurrency wallet.'
  });
});

// Create new wallet recovery request
router.post('/new', ensureVerified, upload.array('documents', 5), async (req, res) => {
  try {
    console.log('Form submitted:', req.body);
    const { walletType, walletAddress, problemDescription, additionalInfo } = req.body;
    
    // Validate input
    if (!walletType || !walletAddress || !problemDescription) {
      req.flash('error_msg', 'Please fill in all required fields');
      return res.redirect('/wallets/new');
    }
    
    // Prepare documents array if files were uploaded
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(file => ({
        filename: file.originalname,
        path: file.path
      }));
    }
    
    // Debugging
    console.log('User:', req.user);
    
    // Create new wallet recovery request
    const newWallet = new Wallet({
      userId: req.user._id, // Use _id explicitly
      walletType,
      walletAddress,
      problemDescription,
      additionalInfo,
      status: 'pending', // Set explicit status
      documents
    });
    
    console.log('New wallet object:', newWallet);
    
    const savedWallet = await newWallet.save();
    console.log('Wallet saved:', savedWallet);
    
    req.flash('success_msg', 'Your wallet recovery request has been submitted successfully');
    res.redirect('/wallets');
  } catch (err) {
    console.error('Error creating wallet:', err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/wallets/new');
  }
});

// View wallet recovery request details
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!wallet) {
      req.flash('error_msg', 'Wallet recovery request not found');
      return res.redirect('/wallets');
    }
    
    res.render('pages/wallets/show', {
      title: 'Wallet Recovery Request Details',
      description: 'View details of your wallet recovery request.',
      wallet
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect('/wallets');
  }
});

// Add additional documents to an existing wallet recovery request
router.post('/:id/documents', ensureAuthenticated, upload.array('documents', 5), async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!wallet) {
      req.flash('error_msg', 'Wallet recovery request not found');
      return res.redirect('/wallets');
    }
    
    // Prepare documents array if files were uploaded
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        uploadedAt: Date.now()
      }));
      
      wallet.documents.push(...newDocuments);
      await wallet.save();
      
      req.flash('success_msg', 'Documents uploaded successfully');
    } else {
      req.flash('error_msg', 'No documents were uploaded');
    }
    
    res.redirect(`/wallets/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect(`/wallets/${req.params.id}`);
  }
});

// Add a note to a wallet recovery request
router.post('/:id/notes', ensureAuthenticated, async (req, res) => {
  try {
    const { noteText } = req.body;
    
    if (!noteText) {
      req.flash('error_msg', 'Note cannot be empty');
      return res.redirect(`/wallets/${req.params.id}`);
    }
    
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!wallet) {
      req.flash('error_msg', 'Wallet recovery request not found');
      return res.redirect('/wallets');
    }
    
    wallet.notes.push({
      text: noteText,
      addedBy: req.user.id
    });
    
    await wallet.save();
    
    req.flash('success_msg', 'Note added successfully');
    res.redirect(`/wallets/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred. Please try again.');
    res.redirect(`/wallets/${req.params.id}`);
  }
});

module.exports = router; 
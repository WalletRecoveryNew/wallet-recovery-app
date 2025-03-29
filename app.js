require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

// Initialize Express
const app = express();

// Passport config
require('./config/passport')(passport);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet-recovery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
})
.then(() => {
  console.log('MongoDB Connected Successfully');
})
.catch(err => {
  console.log('MongoDB Connection Error: ', err.message);
  console.log('MongoDB Connection Stack: ', err.stack);
  console.log('Continuing without database connection for development purposes...');
});

// Set mongoose connection error handler
mongoose.connection.on('error', err => {
  console.log('MongoDB connection error occurred after initial connection: ', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// EJS Middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/wallet-recovery'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/wallets', require('./routes/wallets'));
app.use('/blog', require('./routes/blog'));
app.use('/contact', require('./routes/contact'));

// Error Handling
app.use((req, res, next) => {
  res.status(404).render('pages/404', {
    title: '404 - Page Not Found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', {
    title: '500 - Server Error'
  });
});

// Start server
console.log('Starting server initialization...');

const PORT = process.env.PORT || 3000;
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server started successfully. Visit http://localhost:${PORT} in your browser.`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}

// Add an unhandled rejection handler to catch any promises that fail
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add an uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 
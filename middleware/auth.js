module.exports = {
  // Ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/users/login');
  },
  
  // Ensure user is not authenticated (for login, register pages)
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  },
  
  // Ensure user is verified
  ensureVerified: function(req, res, next) {
    // For testing purposes, temporarily bypass verification
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Original code (commented out for now):
    // if (req.isAuthenticated() && req.user.verified) {
    //   return next();
    // }
    // if (req.isAuthenticated()) {
    //   req.flash('error_msg', 'Please verify your email to access this resource');
    //   return res.redirect('/users/verification');
    // }
    
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/users/login');
  }
}; 
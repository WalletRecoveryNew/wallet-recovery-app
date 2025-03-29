// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add active class to current navigation item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Check if the current path matches the nav link or if it's a sub-path
    if (currentPath === linkPath || 
        (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Add fade-in animation to elements with the .fade-in class
  const fadeElements = document.querySelectorAll('.fade-in');
  
  // Create an intersection observer for fade-in elements
  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    fadeElements.forEach(element => {
      element.style.opacity = 0;
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      fadeObserver.observe(element);
    });
  }
  
  // Password strength meter for registration/password reset
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('password2');
  const passwordStrengthMeter = document.getElementById('password-strength-meter');
  const passwordStrengthText = document.getElementById('password-strength-text');
  
  if (passwordInput && passwordStrengthMeter) {
    passwordInput.addEventListener('input', updatePasswordStrength);
    
    function updatePasswordStrength() {
      const password = passwordInput.value;
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 1;
      if (password.length >= 12) strength += 1;
      
      // Complexity checks
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
      
      // Update strength meter
      passwordStrengthMeter.value = strength;
      
      // Update text description
      const strengthTexts = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong', 'Excellent'];
      passwordStrengthText.textContent = strengthTexts[strength];
      
      // Update color classes
      passwordStrengthText.className = '';
      if (strength <= 1) {
        passwordStrengthText.classList.add('text-danger');
      } else if (strength <= 3) {
        passwordStrengthText.classList.add('text-warning');
      } else {
        passwordStrengthText.classList.add('text-success');
      }
    }
  }
  
  // Password confirmation check
  if (passwordInput && passwordConfirmInput) {
    passwordConfirmInput.addEventListener('input', validatePasswordMatch);
    
    function validatePasswordMatch() {
      if (passwordInput.value === passwordConfirmInput.value) {
        passwordConfirmInput.setCustomValidity('');
      } else {
        passwordConfirmInput.setCustomValidity('Passwords do not match');
      }
    }
  }
  
  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
}); 
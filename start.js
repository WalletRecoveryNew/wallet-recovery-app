console.log('Starting application...');

// Set a timeout to terminate if the app doesn't start within 10 seconds
const terminationTimeout = setTimeout(() => {
  console.log('Application startup timed out after 10 seconds');
  process.exit(1);
}, 10000);

try {
  // Load the main app
  require('./app.js');
  
  // If we get here, clear the termination timeout
  clearTimeout(terminationTimeout);
  console.log('Application loaded successfully');
} catch (error) {
  console.error('Error loading application:', error);
  clearTimeout(terminationTimeout);
  process.exit(1);
} 
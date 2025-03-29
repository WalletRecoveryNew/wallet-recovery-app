# Wallet Recovery Service

A professional website for cryptocurrency wallet recovery services. This application helps users regain access to their lost or inaccessible cryptocurrency wallets through a secure, step-by-step process.

## Features

- **Secure User Authentication**: Register, login, and account verification
- **Dashboard**: Track wallet recovery requests and their progress
- **Wallet Recovery Request Form**: Submit detailed information about your wallet issues
- **Secure Communication**: Private messaging system between users and recovery specialists
- **Document Upload**: Securely upload files related to your wallet
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- Node.js with Express
- MongoDB for database
- EJS for templating
- Bootstrap 5 for responsive design
- Passport.js for authentication
- MongoDB Atlas for cloud database

## Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   JWT_SECRET=your_jwt_secret
   ```
4. Run the development server: `npm run dev`
5. Visit `http://localhost:3000` in your browser

## Deployment

This application is configured to deploy easily to Render:

1. Push the code to a GitHub repository
2. Connect the repository to Render
3. Create a new Web Service with the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the environment variables from the `.env` file
5. Deploy the application

## License

This project is licensed under the ISC License. 
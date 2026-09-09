# Scam Detector

A web-based scam and phishing URL detection system designed to help users identify potentially unsafe websites.

## Live Website

https://poojapooja1172000-code.github.io/Scam-Detector/

## Features

- User registration and login
- Forgot password with OTP verification
- Scam and phishing URL scanning
- Risk score and scan result
- HTTPS/security status checking
- Scan history
- View detailed scan information
- Delete scan history
- MongoDB database storage
- Responsive web interface

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemailer

### Deployment
- GitHub Pages — Frontend
- Vercel — Backend
- MongoDB Atlas — Database

## Project Architecture

User Browser  
↓  
GitHub Pages Frontend  
↓  
Vercel Backend API  
↓  
MongoDB Atlas

## Project Structure

```text
Scam-Detector/
├── api/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
├── database/
├── package.json
├── package-lock.json
├── vercel.json
└── .gitignore
# 🛠️ FixIt Anywhere - Premium Home Services Platform

**FixIt Anywhere** is a sophisticated, full-stack home services marketplace designed to connect homeowners with verified professionals (plumbers, electricians, cleaners, etc.). It features a high-end, responsive UI and a robust management backend.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

---

## ✨ Key Features

### 🏠 Customer Experience
- **Premium UI/UX**: Clean, modern interface with smooth GSAP and Framer Motion-style animations.
- **Smart Booking**: One-click service selection with real-time worker availability checks.
- **Feedback Loop**: Automated email notifications and a dedicated rating system for every job.

### 👷 Professional Dashboard
- **Performance Analytics**: Real-time tracking of total jobs, average ratings, and performance scores.
- **Job Management**: Professionals can view job details (Location, Contact) and mark tasks as "Finished" to trigger customer reviews.
- **Data Export**: Personal Excel logs for any date range (`.xlsx` format).

### 🛡️ Admin Power Panel
- **Comprehensive Overview**: Monitor all bookings and verify professional registrations.
- **Resend Alerts**: Built-in status tracking for emails with manual "resend" capabilities.
- **Global Reporting**: Advanced Excel export logic with date range filtering for business auditing.

---

## 🚀 Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Layouts), JavaScript (ES6+).
- **Backend**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/).
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore) (Live status updates).
- **Notifications**: [Nodemailer](https://nodemailer.com/) (SMTP integration).
- **Data Processing**: [SheetJS (xlsx)](https://sheetjs.com/) for spreadsheet generation.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js installed on your machine.
- A Firebase project with Firestore enabled.
- SMTP credentials (e.g., Gmail App Password).

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/fixit-anywhere.git
cd fixit-anywhere
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configuration
Create a `.env` file in the root directory and add your credentials:
```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_ENABLED=true
```

### 5. Run Locally
```bash
node server.js
```
The application will be live at `http://localhost:5001`.

---

## 📂 Project Structure

```text
├── config/             # Firebase & Database configuration
├── routes/             # Express API routes (Admin, Booking, Workers)
├── services/           # Backend logic (Email, Analytics)
├── assets/             # Images and design assets
├── index.html          # Main Customer Landing Page
├── admin.html          # Administrator Control Panel
├── worker_dashboard.html # Professional Dashboard
├── feedback.html       # Customer Feedback System
├── styles.css          # Global Design System
└── server.js           # Core Express Server
```

---

## 🤝 Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License
This project is licensed under the **ISC License**.

---

Developed with ❤️ by **ABIJITH**.

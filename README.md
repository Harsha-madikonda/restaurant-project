# 🍽️ ForkLine — Restaurant Management System

---

## 🚀 Overview

**ForkLine** is a production-ready restaurant management system developed entirely through **AI prompt engineering** using Claude AI.

It demonstrates how complex, real-world applications can be built by describing requirements in natural language — without manual coding.

🚧 This project is currently not deployed. Run locally to explore features.

---

## 📊 Project Stats

| Metric          | Value     |
| --------------- | --------- |
| Files Generated | 44        |
| Lines of Code   | 3,500+    |
| Prompts Used    | 7         |
| AI Tool         | Claude AI |

---

## ✨ Key Features

### 🔐 Authentication

* Secure login & registration
* Password hashing using bcryptjs
* Session-based authentication (MongoDB store)
* Protected routes & HTTP-only cookies

### 👑 Admin Panel

* Full menu management (Add / Edit / Delete)
* Image upload for food items
* Order tracking & status updates
* User management (roles & deletion)
* Analytics dashboard with charts

### 🧑‍💻 Customer Features

* Browse menu with filters
* Interactive cart system
* Place & track orders
* Order history
* Personal dashboard with spending insights

### 🎨 UI Highlights

* Responsive modern layout
* Sidebar + top navigation
* Role-based UI rendering
* Real-time cart updates
* Flash alerts & smooth interactions

---

## 🛠️ Tech Stack

### Frontend

* EJS (templating)
* CSS3 (custom responsive design)
* Chart.js (analytics)
* Font Awesome
* Google Fonts

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* express-session + connect-mongo
* bcryptjs
* Multer (file uploads)

---

## 📂 Project Structure

```
restaurant-project/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── views/
├── public/
├── app.js
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB
* Git

### Installation

```bash
git clone https://github.com/Harsha-madikonda/restaurant-project.git
cd restaurant-project
npm install
```

### Environment Setup

Create `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/restaurant_db
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

### Run the App

```bash
npm run dev
```

Open:
👉 http://localhost:3000

---

## 💡 AI Development Approach

This project was created entirely through structured prompts such as:

* Generate full-stack restaurant system
* Add authentication and role-based access
* Build dashboard with analytics
* Implement cart and order system
* Add deployment instructions

This showcases the power of **prompt-driven software development**.

---

## 🌱 Future Improvements

* Payment integration (Stripe/Razorpay)
* Email notifications
* Reviews & ratings
* Advanced analytics
* PWA/mobile support
* Multi-language support

---

## 🐛 Troubleshooting

| Issue                  | Fix                   |
| ---------------------- | --------------------- |
| MongoDB not connecting | Start MongoDB service |
| Port already in use    | Change PORT in `.env` |
| Images not uploading   | Check file size/type  |
| Sessions not working   | Verify SESSION_SECRET |

---

## 👨‍💻 Author

**M. Harshavardhan Rao**

---

## 📜 License

MIT License — free to use and modify.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!

---

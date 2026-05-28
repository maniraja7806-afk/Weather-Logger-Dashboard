# Node.js Backend API Project

This is a comprehensive Node.js backend application containing an E-commerce API (including authentication, products, categories, and shopping cart functionality) alongside a background Weather Logging Service. It uses Express.js and MongoDB.

## Features

- **User Authentication**: Secure JWT-based registration and login system.
- **Product & Category Management**: APIs to view, add, and manage e-commerce products and categories.
- **Shopping Cart**: APIs to manage user shopping carts.
- **Weather Logging System**: Automated cron jobs pulling and logging weather data in the background.

## Technology Stack

- **Node.js**: JavaScript Runtime
- **Express.js**: Web Framework
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT** (JSON Web Tokens): Authentication
- **Bcrypt.js**: Password hashing
- **Node-Cron**: Background job scheduler

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) installed (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) instance (Local or Atlas)
- Git (for cloning the repository)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables Config:**
   Create a `.env` file in the root directory and add the necessary environment variables. Example:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/your_database_name
   JWT_SECRET=your_super_secret_jwt_key
   # Weather API Key if applicable for external weather services
   WEATHER_API_KEY=your_weather_api_key
   ```

---

## Running the Application

There are dual entry points in this system depending on the service you want to run. 

**Option 1: Run the Weather API / Default NPM Script**
The `package.json` is currently pointing its start scripts to the weather app (`src/app.js`).
```bash
# Start the server (runs src/app.js)
npm start

# Or using the dev script
npm run dev
```

**Option 2: Run the E-commerce API**
To run the primary E-commerce API entry point:
```bash
node server.js
```

---

## API Endpoints Overview

### E-commerce Endpoints (Port 5000 by default):
- **Auth/Users**: `/api/users`
- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Cart**: `/api/cart`

### Weather API Endpoints (via `src/app.js`):
- **Weather Services**: `/api/weather`

---

## License

This project is licensed under the [ISC License](LICENSE).

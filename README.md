# SmartTask Manager
A Modern Smart Task Manager (Premium UI) full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features
- **User Authentication:** Secure JWT-based registration and login system.
- **Task Management:** Create, Read, Update, and Delete (CRUD) tasks.
- **Kanban Board:** Drag and drop tasks across different statuses (Pending, In Progress, Completed).
- **Analytics Dashboard:** Visual charts (using Recharts) to track task distribution by priority and status.
- **Smart Prioritization:** Mock AI priority suggestion for new tasks.
- **Responsive UI:** Premium UI design built with Tailwind CSS.

## Prerequisites
Before running the project, make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on default port `27017`)

## Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/maniraja7806-afk/Smart-Task.git
   cd Smart-Task
   ```

2. **Start the Backend Server:**
   Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   > The backend runs on `http://localhost:5001`.

3. **Start the Frontend Development Server:**
   Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   > The frontend runs on `http://localhost:5173`.

4. **Open in Browser:**
   Go to `http://localhost:5173` to view the application.

## Deployment Notes
Since this is a Full-Stack application (MERN), it **cannot** be hosted solely on purely static providers like GitHub Pages because it requires a Node.js backend and a MongoDB database. 

To deploy it live on the internet, you can use:
* **Frontend:** Vercel or Netlify
* **Backend:** Render or Heroku
* **Database:** MongoDB Atlas (Cloud database)

# Student Result Management System

A full-stack web application to manage student records with names, marks, and automatic grade calculation.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose

## Features

- ✅ Add new students with name and marks
- ✅ Automatic grade calculation (A: ≥90, B: ≥75, C: <75)
- ✅ View all students in a table
- ✅ Edit/Update student records
- ✅ Delete students
- ✅ Input validation (empty fields, invalid marks)
- ✅ Error handling and toast notifications
- ✅ Loading indicators
- ✅ Responsive UI

## Project Structure

```
Student Result Management/
├── backend/
│   ├── models/
│   │   └── Student.js      # Mongoose schema
│   ├── routes/
│   │   └── studentRoutes.js # API endpoints
│   ├── server.js           # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env` and update if needed:

```bash
copy .env.example .env
```

For **local MongoDB**, ensure MongoDB is running and use:
```
MONGODB_URI=mongodb://localhost:27017/student_results
```

For **MongoDB Atlas**, replace with your connection string.

### 3. Start the Server

```bash
npm start
```

### 4. Open the App

Open **http://localhost:5000** in your browser. The frontend is served from the same server (avoids CORS / "Failed to fetch").

> **Note:** Make sure MongoDB is running. If not installed locally, use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and set `MONGODB_URI` in `.env`.

## API Endpoints

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| POST   | /api/add        | Add a new student              |
| GET    | /api/students   | Get all students               |
| PUT    | /api/students/:id | Update a student             |
| DELETE | /api/students/:id | Delete a student             |

## Grade Logic

- **Marks ≥ 90** → Grade A
- **Marks ≥ 75** → Grade B
- **Else** → Grade C

## License

ISC

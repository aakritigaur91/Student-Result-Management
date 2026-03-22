/**
 * Student Result Management - Backend Server
 * Express.js server with MongoDB connection
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection string - Update this with your MongoDB URI
// For local MongoDB: mongodb://localhost:27017/student_results
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_results';

// ============ MIDDLEWARE ============
// Parse JSON request bodies
app.use(express.json());

// Enable CORS for frontend (allows requests from different origins)
app.use(cors());

// ============ ROUTES ============
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running!', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api', studentRoutes);

// Serve frontend (so you can open http://localhost:5000 and avoid CORS)
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ START SERVER FIRST (so API is reachable even if DB is slow) ============
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

// ============ DATABASE CONNECTION ============
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('\nTip: Make sure MongoDB is running locally or set MONGODB_URI in .env for Atlas');
  });

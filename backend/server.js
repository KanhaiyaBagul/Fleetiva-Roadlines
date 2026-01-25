require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// OPTIONAL services (won’t crash app)
require('./config/clients');

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

/* ===================== HEALTH CHECK ===================== */
// ⚠️ MUST respond fast for Render
app.get('/', (req, res) => {
  res.status(200).send('Fleetiva backend is running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* ===================== ROUTES ===================== */
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/logistics'));

/* ===================== ERROR HANDLING ===================== */
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

/* ===================== DATABASE ===================== */
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err =>
      console.error('⚠️ MongoDB connection failed (app still running):', err.message)
    );
} else {
  console.warn('⚠️ MONGO_URI not set. Running without database.');
}

/* ===================== SERVER ===================== */
// 🚨 THIS IS CRITICAL FOR RENDER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

/* ===================== SAFETY ===================== */
// DO NOT exit process on Render
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection (ignored):', err.message);
});

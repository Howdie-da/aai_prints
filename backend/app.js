require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const apiRouter = require('./router');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/apiError.util');

const app = express();

// Request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS configuration (allow credentials for httpOnly cookies)
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''));

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        (process.env.NODE_ENV !== 'production' && normalizedOrigin.includes('localhost')) ||
        (normalizedOrigin.endsWith('.vercel.app'))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for reading httpOnly auth token
app.use(cookieParser());

// Root ping endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Aai Prints Backend API is active', version: 'v1' });
});

// Mount API v1 router
app.use('/api/v1', apiRouter);

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.method} ${req.originalUrl} on this server`));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;

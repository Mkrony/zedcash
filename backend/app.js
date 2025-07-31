import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import {
  DATABASE,
  MAX_JSON_SIZE,
  PORT,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE
} from "./app/config/config.js";

// Initialize express
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://coinloot.vercel.app',
  'https://coinloot-kamruzzaman-ronys-projects.vercel.app',
  'https://coinloot-git-main-kamruzzaman-ronys-projects.vercel.app',
  'https://coinloot-c9j37id65-kamruzzamans-ronys-projects.vercel.app',
  'https://coinloot-lakym4gx9-kamruzzaman-ronys-projects.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow REST tools or server-to-server requests

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Preflight OPTIONS requests
app.options('*', cors());

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "*"],
    },
  },
}));

app.use(cookieParser());
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.set('cache', WEB_CACHE);

// Rate limiting
const limiter = rateLimit({
  windowMs: REQUEST_TIME,
  max: REQUEST_NUMBER,
});
app.use(limiter);

// Import your routes
import router from "./routes/api.js";
app.use('/api', router);

// MongoDB Connection
mongoose.connect(DATABASE, { autoIndex: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Error handling middleware for CORS errors and others
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS')) {
    console.error("CORS error:", err.message);
    return res.status(403).json({ error: err.message });
  }
  // Other errors
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

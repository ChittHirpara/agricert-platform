require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { initSocket } = require('./services/socket');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const ocrRoutes = require('./routes/ocr');
const certificationRoutes = require('./routes/certifications');
const inspectionRoutes = require('./routes/inspections');
const blockchainRoutes = require('./routes/blockchain');
const auctionRoutes = require('./routes/auction');
const verifyRoutes = require('./routes/verify');
const chatbotRoutes = require('./routes/chatbot');
const timelineRoutes = require('./routes/timeline');
const verifyIntegrityRoutes = require('./routes/verifyIntegrity');
const systemRoutes = require('./routes/system');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initSocket(server);

// Ensure "uploads" folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ========== SECURITY MIDDLEWARE ==========
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean); // Remove undefined if FRONTEND_URL is not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { msg: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// ========== LOGGING ==========
app.use(morgan('dev'));

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demo-assets', express.static(path.join(__dirname, 'demo-assets')));

// ========== DATABASE ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/verify-integrity', verifyIntegrityRoutes);
app.use('/api/system', systemRoutes);

// ========== CENTRALIZED ERROR HANDLER ==========
app.use(errorHandler);

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
const inspectionRoutes = require('./routes/inspections');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs'); // File system to create folders
const http = require('http'); // Required for Socket.io
const { initSocket } = require('./services/socket'); // Import socket service

// Import Routes
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
// --- NEW ROUTES ---
const ocrRoutes = require('./routes/ocr');
const blockchainRoutes = require('./routes/blockchain');
const verifyRoutes = require('./routes/verify');
const chatbotRoutes = require('./routes/chatbot');
const auctionRoutes = require('./routes/auction');

const app = express();
const server = http.createServer(app); // Wrap express app into HTTP server
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

// Ensure "uploads" folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Make the "uploads" folder public so frontend can see images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes); // <-- NEW LINE
app.use('/api/inspections', inspectionRoutes);

// --- MOUNT NEW ROUTES ---
app.use('/api/ocr', ocrRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auction', auctionRoutes);

// Use server.listen instead of app.listen for Socket.io support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
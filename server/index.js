const inspectionRoutes = require('./routes/inspections');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs'); // File system to create folders

// Import Routes
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure "uploads" folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use('/api/inspections', inspectionRoutes);
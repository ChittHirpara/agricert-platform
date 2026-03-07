require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('./models/Batch');
const Inspection = require('./models/Inspection');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("⚠️  Cleaning Database...");

    // 1. Delete All Batches (The "4 orders" you see)
    await Batch.deleteMany({});
    
    // 2. Delete All Inspections (Reset QA history)
    await Inspection.deleteMany({});

    console.log("✅ Database Cleared! All batches and orders are gone.");
    console.log("   Users (Exporter/QA/Importer) are SAVED.");
    
    mongoose.connection.close();
  })
  .catch(err => console.error(err));
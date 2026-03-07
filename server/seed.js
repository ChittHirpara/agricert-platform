require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Ensure this path matches where User.js is

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to DB for Seeding"))
  .catch(err => console.log(err));

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Hash the password '123456'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const users = [
      {
        username: 'exporter1',
        password: hashedPassword,
        role: 'exporter',
        walletAddress: 'did:ethr:0x123'
      },
      // ... previous code
    {
      username: 'qa_agency1',
      password: hashedPassword,
      role: 'qa',
      walletAddress: 'did:ethr:0x456'
    },
    // 👇 ADD THIS NEW USER 👇
    {
      username: 'importer1',
      password: hashedPassword,
      role: 'importer',
      walletAddress: 'did:ethr:0x999'
    },
    // ... admin user
    ];
    

    await User.insertMany(users);
    console.log("🌱 Database Seeded! Users Created.");
  } catch (error) {
    console.error("Seeding Error:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
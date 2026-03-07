require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DEMO_USERS = [
    {
        username: "DemoFarmer",
        email: "farmer@demo.com",
        password: "demo123",
        role: "exporter" // Mapped to Farmer in our domain
    },
    {
        username: "DemoCertifier",
        email: "certifier@demo.com",
        password: "demo123",
        role: "qa" // Mapped to Certifier in our domain
    },
    {
        username: "DemoDistributor",
        email: "distributor@demo.com",
        password: "demo123",
        role: "importer" // Mapped to Distributor in our domain
    },
    {
        username: "DemoConsumer",
        email: "consumer@demo.com",
        password: "demo123",
        role: "importer" // Consumer doesn't have a rigid backend role initially, but importer works to access public routes
    }
];

async function seedDatabase() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        for (const userData of DEMO_USERS) {
            console.log(`Processing demo user: ${userData.email}...`);

            let user = await User.findOne({ email: userData.email });
            if (user) {
                console.log(`   User ${userData.email} already exists. Updating password to ensure sync...`);
            } else {
                console.log(`   User ${userData.email} does not exist. Creating...`);
                user = new User({
                    username: userData.username,
                    email: userData.email,
                    role: userData.role,
                    walletAddress: `did:ethr:0x${Math.random().toString(16).slice(2)}`
                });
            }

            // Ensure password is correct and hashed
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(userData.password, salt);

            await user.save();
            console.log(`✅ Synced ${userData.email}`);
        }

        console.log("🎉 Demo accounts seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();

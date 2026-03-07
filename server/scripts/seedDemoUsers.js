require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const demoUsers = [
    { name: 'Demo Farmer', email: 'farmer@demo.com', password: 'password123', role: 'farmer' },
    { name: 'Demo Certifier', email: 'certifier@demo.com', password: 'password123', role: 'certifier' },
    { name: 'Demo Distributor', email: 'distributor@demo.com', password: 'password123', role: 'distributor' },
    { name: 'Demo Consumer', email: 'consumer@demo.com', password: 'password123', role: 'consumer' }
];

const seedDemoUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        for (const demoUser of demoUsers) {
            const existingUser = await User.findOne({ email: demoUser.email });
            if (existingUser) {
                console.log(`User ${demoUser.email} already exists, skipping.`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(demoUser.password, salt);

            const user = new User({
                name: demoUser.name,
                email: demoUser.email,
                password: hashedPassword,
                role: demoUser.role
            });

            await user.save();
            console.log(`✅ Created user: ${demoUser.email} (${demoUser.role})`);
        }

        console.log('\n🎉 Demo user seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
};

seedDemoUsers();

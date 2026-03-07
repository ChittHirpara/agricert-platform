require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const resetDemoUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Drop old indexes that reference removed fields (username)
        try {
            await User.collection.dropIndex('username_1');
            console.log('Dropped old username index');
        } catch (e) {
            console.log('No username index to drop (already removed)');
        }

        // Delete ALL old demo users  
        const deleted = await User.deleteMany({
            email: { $in: ['farmer@demo.com', 'certifier@demo.com', 'distributor@demo.com', 'consumer@demo.com'] }
        });
        console.log('Deleted ' + deleted.deletedCount + ' old demo users');

        // Re-create with correct schema
        const demoUsers = [
            { name: 'Demo Farmer', email: 'farmer@demo.com', password: 'password123', role: 'farmer' },
            { name: 'Demo Certifier', email: 'certifier@demo.com', password: 'password123', role: 'certifier' },
            { name: 'Demo Distributor', email: 'distributor@demo.com', password: 'password123', role: 'distributor' },
            { name: 'Demo Consumer', email: 'consumer@demo.com', password: 'password123', role: 'consumer' }
        ];

        for (const u of demoUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);
            await User.create({ name: u.name, email: u.email, password: hashedPassword, role: u.role });
            console.log('Created: ' + u.email + ' (' + u.role + ')');
        }

        console.log('\nDone! Login with farmer@demo.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

resetDemoUsers();

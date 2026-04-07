require('dotenv').config();
const mongoose = require('mongoose');

// 1. Connect to your database
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to Database...');

    // 2. The email you want to promote
    const email = 'b23cs117@kitsw.ac.in';

    // 3. Update the user
    const user = await mongoose.model('User', new mongoose.Schema({
        email: String,
        role: String
    })).findOneAndUpdate(
        { email: email.toLowerCase() },
        { role: 'admin' },
        { new: true }
    );

    if (user) {
        console.log(`SUCCESS: ${user.email} is now an ADMIN!`);
    } else {
        console.log('ERROR: User not found. Check the email address.');
    }

    process.exit();
}).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

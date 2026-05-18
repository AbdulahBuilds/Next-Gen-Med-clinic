const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/clinic').then(async () => {
    const users = await User.find({});
    console.log("Users:", users.map(u => ({ email: u.email, role: u.role })));
    process.exit();
});

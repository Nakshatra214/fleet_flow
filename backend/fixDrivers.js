require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Update all Drivers and Dispatchers to active regardless of current status
    const r = await User.updateMany(
        { role: { $in: ['Driver', 'Dispatcher'] } },
        { $set: { status: 'active' } }
    );
    console.log('Updated', r.modifiedCount, 'Driver/Dispatcher accounts to active');

    // Verify
    const d = await User.findOne({ email: 'driver@fleetflow.com' });
    const dp = await User.findOne({ email: 'dispatcher@fleetflow.com' });
    console.log('driver@fleetflow.com ->', d ? d.status : 'not found');
    console.log('dispatcher@fleetflow.com ->', dp ? dp.status : 'not found');
    mongoose.disconnect();
});

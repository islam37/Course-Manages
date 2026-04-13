const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://islamuddin3725_db_user:courseflow123%40@cluster0.rsrn5qe.mongodb.net/courseflowdb?retryWrites=true&w=majority', {
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error('❌ User not found:', email);
      await mongoose.disconnect();
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ User ${email} is now an admin`);
    console.log('User:', {
      name: user.name,
      email: user.email,
      role: user.role
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

makeAdmin('islamuddin3725@gmail.com');

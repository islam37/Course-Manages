#!/usr/bin/env node

/**
 * MongoDB Connection Test
 * 
 * This file helps diagnose MongoDB connection issues
 * Run with: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dns = require('dns');

// Fix DNS resolution for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongodbUri = process.env.MONGODB_URI;

console.log('\n🔍 MongoDB Connection Diagnostics\n');
console.log('═══════════════════════════════════════\n');

// Check if URI is set
if (!mongodbUri) {
  console.error('❌ ERROR: MONGODB_URI not set in .env file');
  process.exit(1);
}

// Display masked URI
const uriParts = mongodbUri.split('@');
const maskedUri = uriParts[0].replace(/:[^:]+@/, ':****@') + '@' + (uriParts[1] || '');
console.log('📍 Connection String:');
console.log(`   ${maskedUri}\n`);

// Test 1: Mongoose Connection
console.log('📌 Test 1: Mongoose Connection');
console.log('───────────────────────────────');

mongoose.connect(mongodbUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ Mongoose connected successfully!\n');
    testMongoDBDriver();
  })
  .catch((err) => {
    console.error('❌ Mongoose connection failed:');
    console.error(`   Error: ${err.message}\n`);
    testMongoDBDriver();
  });

// Test 2: Native MongoDB Driver
function testMongoDBDriver() {
  console.log('📌 Test 2: Native MongoDB Driver');
  console.log('───────────────────────────────');

  const client = new MongoClient(mongodbUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  client.connect()
    .then(async () => {
      console.log('✅ MongoDB Driver connected successfully!\n');
      
      // Try to ping the database
      const admin = client.db('admin');
      const response = await admin.command({ ping: 1 });
      console.log('✅ Database ping successful!\n');
      
      await client.close();
      showRecommendations();
    })
    .catch((err) => {
      console.error('❌ MongoDB Driver connection failed:');
      console.error(`   Error: ${err.message}\n`);
      showRecommendations();
    });
}

function showRecommendations() {
  console.log('═══════════════════════════════════════\n');
  console.log('📋 Troubleshooting Checklist:\n');
  console.log('1. 🔐 **MongoDB Atlas IP Whitelist**');
  console.log('   - Go to: https://cloud.mongodb.com');
  console.log('   - Project → Network Access');
  console.log('   - Add your current IP address');
  console.log('   - Or use 0.0.0.0/0 for development only\n');
  
  console.log('2. 🌐 **Internet Connection**');
  console.log('   - Verify internet connection is working');
  console.log('   - Check if DNS resolution is working\n');
  
  console.log('3. 🔑 **Credentials**');
  console.log('   - Verify username and password are correct');
  console.log('   - Ensure no special characters are missing\n');
  
  console.log('4. 🛡️ **Firewall & VPN**');
  console.log('   - Check if corporate firewall blocks MongoDB');
  console.log('   - Disable VPN temporarily for testing\n');
  
  console.log('5. 🔄 **Cluster Status**');
  console.log('   - Verify cluster is not paused in MongoDB Atlas');
  console.log('   - Check if cluster is in the correct region\n');
  
  process.exit(0);
}

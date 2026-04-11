const mongoose = require('mongoose');

const uri = 'mongodb+srv://Karim:8lUzgyXPUAvKxRiD@eduplatform-eu.7fgh6yz.mongodb.net/edu-platform?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  });

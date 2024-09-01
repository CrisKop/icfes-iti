const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  rank: String
});

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email });
};

const User = mongoose.model('users', userSchema);

module.exports = User;
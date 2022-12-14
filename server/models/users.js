var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: String // new/active/deactive
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;

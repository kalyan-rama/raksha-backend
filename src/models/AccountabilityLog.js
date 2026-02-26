const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  emergencyId: String,
  action: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AccountabilityLog", logSchema);
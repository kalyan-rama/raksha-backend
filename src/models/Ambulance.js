const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
  unitId: String,
  location: {
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    default: "IDLE",
  },
});

module.exports = mongoose.model("Ambulance", ambulanceSchema);
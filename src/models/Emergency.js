const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    location: {
      lat: Number,
      lng: Number,
    },
    district: String,
    status: {
      type: String,
      default: "CREATED",
    },
    ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
    },
    dispatchedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);
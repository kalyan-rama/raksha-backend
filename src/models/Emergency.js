import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    location: {
      lat: Number,
      lng: Number,
    },
    district: {
      type: String,
      default: "Unknown",
    },
    status: {
      type: String,
      default: "CREATED",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    dispatchedAt: Date,
    arrivedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Emergency", emergencySchema);
const axios = require("axios");
const Emergency = require("../models/Emergency");
const Ambulance = require("../models/Ambulance");
const Log = require("../models/AccountabilityLog");
const { calculateRiskZones } = require("../services/predictionService");

/* ================================
   ASSIGN NEAREST AMBULANCE
================================ */
async function assignNearestAmbulance(location) {
  const ambulances = await Ambulance.find({ status: "IDLE" });

  let nearest = null;
  let minDistance = Infinity;

  ambulances.forEach((a) => {
    const dist = Math.hypot(
      a.location.lat - location.lat,
      a.location.lng - location.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearest = a;
    }
  });

  if (nearest) {
    nearest.status = "BUSY";
    await nearest.save();
  }

  return nearest;
}

/* ================================
   TRIGGER EMERGENCY
================================ */
exports.triggerEmergency = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { location } = req.body;

    let district = "Unknown";

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: location.lat,
            lon: location.lng,
            format: "json",
          },
          headers: { "User-Agent": "raksha-app" },
        }
      );

      district =
        response.data.address.state_district ||
        response.data.address.city ||
        "Unknown";
    } catch (error) {
      console.log("Geocode error:", error.message);
    }

    const ambulance = await assignNearestAmbulance(location);

    const emergency = await Emergency.create({
      location,
      district,
      ambulance: ambulance ? ambulance._id : null,
    });

    await Log.create({
      emergencyId: emergency._id,
      action: "CREATED",
    });

    io.emit("newEmergency", emergency);

    /* 47-Second Orchestration Simulation */

    setTimeout(() => {
      io.emit("ambulanceAlert", emergency);
    }, 8000);

    setTimeout(() => {
      io.emit("hospitalAlert", emergency);
    }, 12000);

    setTimeout(() => {
      io.emit("bloodBankAlert", {
        emergencyId: emergency._id,
        bloodGroup: "O+",
      });
    }, 18000);

    setTimeout(() => {
      io.emit("familyNotification", {
        message: "Accident detected. Ambulance dispatched.",
        location,
      });
    }, 25000);

    /* Escalation Check */
    setTimeout(async () => {
      const check = await Emergency.findById(emergency._id);
      if (check && check.status === "CREATED") {
        io.emit("governmentAlert", {
          message: "Ambulance not dispatched within SLA.",
        });
      }
    }, 120000);

    const risk = await calculateRiskZones();
    io.emit("riskUpdate", risk);

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Emergency failed" });
  }
};

/* ================================
   UPDATE EMERGENCY
================================ */
exports.updateEmergency = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id, status } = req.body;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ error: "Not found" });
    }

    emergency.status = status;

    if (status === "DISPATCHED")
      emergency.dispatchedAt = Date.now();

    if (status === "ARRIVED")
      emergency.arrivedAt = Date.now();

    if (status === "COMPLETED")
      emergency.completedAt = Date.now();

    await emergency.save();

    await Log.create({
      emergencyId: id,
      action: status,
    });

    io.emit("updateEmergency", emergency);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

/* ================================
   GET ALL
================================ */
exports.getAllEmergencies = async (req, res) => {
  const data = await Emergency.find()
    .populate("ambulance")
    .sort({ createdAt: -1 });

  res.json(data);
};
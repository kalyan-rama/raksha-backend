const express = require("express");
const router = express.Router();

const {
  triggerEmergency,
  updateEmergency,
  getAllEmergencies,
} = require("../controllers/emergencyController");

const {
  calculateRiskZones,
} = require("../services/predictionService");

/* ===============================
   🚨 CREATE EMERGENCY
================================= */
router.post("/", triggerEmergency);

/* ===============================
   🔄 UPDATE EMERGENCY STATUS
================================= */
router.post("/update", updateEmergency);

/* ===============================
   📊 GET ALL EMERGENCIES
================================= */
router.get("/", getAllEmergencies);

/* ===============================
   🤖 AI RISK PREDICTION
================================= */
router.get("/prediction", async (req, res) => {
  try {
    const data = await calculateRiskZones();
    res.json(data);
  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({
      message: "Prediction failed",
    });
  }
});

module.exports = router;
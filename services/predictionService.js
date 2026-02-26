const Emergency = require("../models/Emergency");

exports.calculateRiskZones = async () => {
  const lastHour = Date.now() - 60 * 60 * 1000;

  const recent = await Emergency.find({
    createdAt: { $gte: lastHour },
  });

  const districtCount = {};

  recent.forEach(e => {
    districtCount[e.district] =
      (districtCount[e.district] || 0) + 1;
  });

  const riskZones = Object.entries(districtCount)
    .map(([district, count]) => ({
      district,
      riskScore: count * 10,
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  return riskZones;
};
const mongoose = require("mongoose");
require("dotenv").config();

const Emergency = require("./src/models/Emergency");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Connected");

    await Emergency.deleteMany({});

    const districts = [
      "Hyderabad",
      "Warangal",
      "Guntur",
      "Vijayawada",
      "Khammam",
      "Karimnagar",
    ];

    const locations = [
      [17.385, 78.4867],
      [17.9689, 79.5941],
      [16.3067, 80.4365],
      [16.5062, 80.648],
      [17.2473, 80.1514],
      [18.1124, 79.0193],
    ];

    const statuses = [
      "CREATED",
      "DISPATCHED",
      "ARRIVED",
      "COMPLETED",
    ];

    const data = [];

    for (let i = 0; i < 25; i++) {
      const randomIndex = Math.floor(Math.random() * districts.length);

      const createdTime =
        Date.now() - Math.floor(Math.random() * 7200000);

      const status =
        statuses[Math.floor(Math.random() * statuses.length)];

      data.push({
        location: {
          lat: locations[randomIndex][0] + Math.random() * 0.05,
          lng: locations[randomIndex][1] + Math.random() * 0.05,
        },
        district: districts[randomIndex],
        status,
        createdAt: createdTime,
        arrivedAt:
          status === "COMPLETED" || status === "ARRIVED"
            ? createdTime + Math.floor(Math.random() * 1800000)
            : null,
      });
    }

    await Emergency.insertMany(data);

    console.log("🔥 25 Sample Emergencies Inserted!");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
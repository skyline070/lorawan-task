const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Uplink = require("../models/Uplink");

async function importCSV() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI_LORAWAN}/${process.env.DB_NAME_LORAWAN}`);


    const records = [];

    fs.createReadStream(
      path.join(__dirname, "../data/lorawan_uplink_devices.csv")
    )
      .pipe(csv())
      .on("data", (row) => {
        records.push({
          device_id: row.device_id,
          gateway_id: row.gateway_id,
          rssi: Number(row.rssi),
          snr: Number(row.snr),
          temperature: Number(row.temperature),
          humidity: Number(row.humidity),
          latitude: Number(row.latitude),
          longitude: Number(row.longitude)
        });
      })
      .on("end", async () => {
        await Uplink.insertMany(records);
        console.log("✅ CSV imported successfully");
        process.exit();
      });

  } catch (error) {
    console.error("❌ Import error:", error);
  }
}

importCSV();

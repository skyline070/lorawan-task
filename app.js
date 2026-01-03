// app.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Uplink = require("./models/Uplink");
const Order = require("./models/Order");

// ================================
// TASK 1 - LORAWAN ANALYTICS
// ================================
const runLoRaAnalytics = async () => {
  try {
    // Connect to LoRaWAN DB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME
    });
    console.log("✅ MongoDB connected for Task 1 (LoRaWAN)");

    // 1️⃣ Top 10 devices with highest uplinks
    const topDevices = await Uplink.aggregate([
      { $group: { _id: "$device_id", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    console.log("\n📊 Top 10 Devices:");
    console.log(topDevices);

    // 2️⃣ Average RSSI & SNR (sorted by lowest RSSI)
    const avgSignal = await Uplink.aggregate([
      { $group: { _id: "$device_id", avgRSSI: { $avg: "$rssi" }, avgSNR: { $avg: "$snr" } } },
      { $sort: { avgRSSI: 1 } }
    ]);
    console.log("\n📡 Avg RSSI & SNR:");
    console.log(avgSignal);

    // 3️⃣ Average temperature & humidity per gateway
    const avgEnv = await Uplink.aggregate([
      { $group: { _id: "$gateway_id", avgTemperature: { $avg: "$temperature" }, avgHumidity: { $avg: "$humidity" } } }
    ]);
    console.log("\n🌡️ Avg Temp & Humidity:");
    console.log(avgEnv);

    // 4️⃣ Duplicate devices
    const duplicates = await Uplink.aggregate([
      { $group: { _id: "$device_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log("\n🔁 Duplicate Devices:");
    console.log(duplicates);

    // 5️⃣ Export devices with temperature > 35°C
    const highTemp = await Uplink.aggregate([
      { $match: { temperature: { $gt: 35 } } },
      { $project: { _id: 0, device_id: 1, latitude: 1, longitude: 1, temperature: 1 } }
    ]);
    fs.writeFileSync("./output/high_temperature_devices.json", JSON.stringify(highTemp, null, 2));
    console.log("🔥 High temperature data exported");

    console.log("\n✅ Task 1 Completed\n");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Task 1 Error:", err);
    await mongoose.disconnect();
  }
};

// ================================
// TASK 2 - E-COMMERCE ANALYTICS
// ================================
function parseDate(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

const importOrdersAndRunAnalytics = async () => {
  try {
    // Connect to E-commerce DB
    await mongoose.connect(
      `${process.env.MONGO_URI_ECOMMERCE}/${process.env.DB_NAME_ECOMMERCE}`
    );
    console.log("✅ MongoDB connected for Task 2 (E-commerce)");

    const results = [];

    // 1️⃣ Import CSV into MongoDB
    fs.createReadStream(path.join(__dirname, "data/orders.csv"))
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          order_id: row["Order ID"],
          product_id: row["Product ID"] || "Unknown",
          category: row["Category"] || "Unknown",
          sub_category: row["Sub-Category"] || "Unknown",
          sales: Number(row["Sales"]) || 0,
          order_date: parseDate(row["Order Date"]),
        });
      })
      .on("end", async () => {
        try {
          const cleanData = results.filter((r) => r.order_date !== null);

          if (cleanData.length === 0) {
            console.log("⚠️ No valid orders to insert.");
          } else {
            await Order.insertMany(cleanData);
            console.log(`✅ Orders imported successfully (${cleanData.length} records)`);
          }

          // 2️⃣ Top 5 Products by Sales
          const topProducts = await Order.aggregate([
            { $group: { _id: "$product_id", totalSales: { $sum: "$sales" } } },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
          ]);
          console.log("\n🏆 Top 5 Products:");
          console.log(topProducts);

          // 3️⃣ Monthly Revenue
          const monthlyRevenue = await Order.aggregate([
            { $group: { _id: { year: { $year: "$order_date" }, month: { $month: "$order_date" } }, revenue: { $sum: "$sales" } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ]);
          console.log("\n📅 Monthly Revenue:");
          console.log(monthlyRevenue);

          // 4️⃣ Average Sales per Category/Sub-Category
          const avgCategory = await Order.aggregate([
            { $group: { _id: { category: "$category", sub_category: "$sub_category" }, avgSales: { $avg: "$sales" } } },
            { $sort: { "_id.category": 1 } },
          ]);
          console.log("\n📊 Average Sales per Category:");
          console.log(avgCategory);

          // 5️⃣ Yearly Revenue & Growth %
          const yearlyRevenue = await Order.aggregate([
            { $group: { _id: { year: { $year: "$order_date" } }, total: { $sum: "$sales" } } },
            { $sort: { "_id.year": 1 } },
          ]);

          const growth = yearlyRevenue.map((y, i) => {
            const prev = yearlyRevenue[i - 1] ? yearlyRevenue[i - 1].total : y.total;
            const growthPercent = i === 0 ? 0 : ((y.total - prev) / prev) * 100;
            return { year: y._id.year, total: y.total, growthPercent: growthPercent.toFixed(2) };
          });
          console.log("\n📈 Yearly Growth:");
          console.log(growth);

          await mongoose.disconnect();
          console.log("\n✅ Task 2 Completed\n");
        } catch (err) {
          console.error("❌ Task 2 Error:", err);
          await mongoose.disconnect();
        }
      });
  } catch (err) {
    console.error("❌ Task 2 DB connection failed:", err);
    await mongoose.disconnect();
  }
};

// ================================
// RUN BOTH TASKS SEQUENTIALLY
// ================================
// (async () => {
//   await runLoRaAnalytics();             // Task 1
//   await importOrdersAndRunAnalytics();  // Task 2
// })();

// ================================
// RUN TASKS BASED ON CHOICE
// ================================
const task = process.argv[2]; // pass "task1" or "task2"

(async () => {
  if (task === "task1") {
    await runLoRaAnalytics(); // only Task 1
  } else if (task === "task2") {
    await importOrdersAndRunAnalytics(); // only Task 2
  } else {
    console.log("❌ Please specify task: node app.js task1 OR node app.js task2");
  }
})();

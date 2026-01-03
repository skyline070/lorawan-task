const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("../models/Order");

// Safe date parser for DD/MM/YYYY or MM/DD/YYYY formats
function parseDate(value) {
  if (!value) return null;
  const parts = value.split("/"); // Excel often exports as MM/DD/YYYY
  if (parts.length !== 3) return null;
  const [month, day, year] = parts; // adjust if your dates are DD/MM/YYYY
  const isoString = `${year}-${month}-${day}`;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGO_URI_ECOMMERCE}/${process.env.DB_NAME_ECOMMERCE}`);
    console.log("✅ MongoDB connected");

    const results = [];

    // Read CSV
    fs.createReadStream(path.join(__dirname, "../data/orders.csv"))
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          order_id: row["Order ID"],
          product_id: row["Product ID"],
          product: row["Product Name"] || "Unknown",
          category: row["Category"] || "Unknown",
          sub_category: row["Sub-Category"] || "Unknown",
          quantity: Number(row["Sales"]) ? 1 : 0, // assuming quantity is not in CSV, use 1
          price: Number(row["Sales"]) || 0,
          sales: Number(row["Sales"]) || 0,
          order_date: parseDate(row["Order Date"]),
        });
      })
      .on("end", async () => {
        try {
          const cleanData = results.filter(r => r.order_date !== null);

          if (cleanData.length === 0) {
            console.log("⚠️ No valid orders to insert.");
          } else {
            await Order.insertMany(cleanData);
            console.log(`✅ Orders imported successfully (${cleanData.length} records)`);
          }

          await mongoose.connection.close();
          process.exit(0);
        } catch (err) {
          console.error("❌ Import failed:", err);
          process.exit(1);
        }
      });

  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

// scripts/checkData.js
const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("../models/Order");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const count = await Order.countDocuments();
  console.log("Total orders:", count);

  const sample = await Order.findOne();
  console.log("Sample order:", sample);

  await mongoose.disconnect();
})();

const mongoose = require("mongoose");

const UplinkSchema = new mongoose.Schema({
  device_id: String,
  gateway_id: String,
  rssi: Number,
  snr: Number,
  temperature: Number,
  humidity: Number,
  latitude: Number,
  longitude: Number
});

module.exports = mongoose.model("Uplink", UplinkSchema);

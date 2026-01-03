const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  order_id: { type: String },
  product: { type: String },
  category: { type: String },
  sub_category: { type: String },

  quantity: { type: Number },
  price: { type: Number },

  // sales = quantity * price
  sales: { type: Number },

  order_date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Order", OrderSchema);

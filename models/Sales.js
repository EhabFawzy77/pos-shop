const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, index: true },
  items: [
    {
      item: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  customer: { type: String },
  total: { type: Number, required: true },
});

module.exports = mongoose.model("Sale", salesSchema);

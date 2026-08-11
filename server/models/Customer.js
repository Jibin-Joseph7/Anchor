const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      min: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    purchaseHistory: [purchaseSchema],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({
  name: "text",
  email: "text",
  company: "text",
});

module.exports = mongoose.model("Customer", customerSchema);
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: ["Website", "Referral", "Cold Call", "Social Media", "Advertisement", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Unqualified", "Converted"],
      default: "New",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
    convertedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  },
  { timestamps: true }
);

leadSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

module.exports = mongoose.model("Lead", leadSchema);
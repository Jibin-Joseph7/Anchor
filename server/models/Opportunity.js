const mongoose = require("mongoose");

const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    value: { type: Number, default: 0 },
    stage: { type: String, enum: STAGES, default: "New Lead" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expectedCloseDate: Date,
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

opportunitySchema.statics.STAGES = STAGES;

module.exports = mongoose.model("Opportunity", opportunitySchema);
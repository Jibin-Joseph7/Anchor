const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    stage: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      default: "new",
    },

    expectedCloseDate: {
      type: Date,
    },

    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ owner: 1 });
opportunitySchema.index({ customer: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
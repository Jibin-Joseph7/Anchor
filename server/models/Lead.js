const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
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

    source: {
      type: String,
      enum: [
        "website",
        "referral",
        "social_media",
        "advertisement",
        "cold_call",
        "other",
      ],
      default: "other",
    },

    status: {
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

    notes: {
      type: String,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ owner: 1 });

module.exports = mongoose.model("Lead", leadSchema);
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

// Useful for searching leads
leadSchema.index({
  name: "text",
  email: "text",
  company: "text",
});

// Prevent duplicate active leads by email
leadSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
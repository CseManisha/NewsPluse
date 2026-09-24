const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    summary: {
      type: String
    },

    content: {
      type: String
    },

    source: {
      type: String,
      required: true
    },

    url: {
      type: String,
      required: true,
      unique: true
    },

    publishedAt: {
      type: Date
    },

    clusterId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Article", articleSchema);
const mongoose = require("mongoose");

const clusterSchema = new mongoose.Schema(
  {
    clusterId: {
      type: String,
      required: true,
      unique: true
    },

    label: {
      type: String,
      required: true
    },

    articleCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Cluster", clusterSchema);
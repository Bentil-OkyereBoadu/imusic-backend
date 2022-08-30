const mongoose = require("mongoose");

const musicSessionModel = mongoose.Schema(
  {
    name: { type: "String", required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    playlist: { type: Array },
    activeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const musicSession = mongoose.model("musicSession", musicSessionModel);

module.exports = musicSession;

const express = require("express");
const {
  createMusicSession,
  endMusicSession,
  userJoinSession,
  userLeaveSession,
  fetchSession,
  updatePlaylist,
  getSessionById,
} = require("../controllers/musicSessionControllers");

const router = express.Router();

router.route("/").post(createMusicSession);
router.route("/").get(fetchSession);
router.route("/:id").get(getSessionById);
router.route("/:id/join").put(userJoinSession);
router.route("/:id/leave").put(userLeaveSession);
router.route("/:id/playlist").put(updatePlaylist);
router.route("/:id/endSession").post(endMusicSession);

module.exports = router;
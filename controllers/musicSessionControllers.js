const asyncHandler = require("express-async-handler");
const MusicSession = require("../models/musicSessionModel");

const createMusicSession = asyncHandler(async (req, res) => {
  const { name, creatorId, playlist, activeUsers, isPrivate } = req.body;

  const session = await MusicSession.create({
    name,
    creatorId,
    playlist,
    activeUsers,
    isPrivate,
  });

  if (session) {
    res.status(201);
    res.json({
      _id: session._id,
      name: session.name,
      creatorId: session.creatorId,
      playlist: session.playlist,
      activeUsers: session.activeUsers,
      isPrivate: session.isPrivate,
    });
  } else {
    res.status(400);
    throw new Error("Session could not be created");
  }
});

const fetchSession = asyncHandler(async (req, res) => {
  MusicSession.find((error, data) => {
    if (error) {
      res.status(400);
      throw new Error("Unable to fetch sessions");
    } else {
      res.status(200);
      res.json(data);
    }
  });
});

const getSessionById = asyncHandler(async (req, res) => {

  try{
    let result = await MusicSession.findOne({ _id: req.params.id})
    res.send(result)
  } catch(error){
    console.log(error);
    throw new Error("Invalid session ID or session ended")
  }
});

const userJoinSession = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  try{
   let result = await MusicSession.findOne({ _id: req.params.id })
   result.activeUsers.push(userId);
   result.save();
   res.send("user joined session")
  } catch(error){
      console.log(error);
    throw new Error("Could not join session")
  }
});

const userLeaveSession = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  try{
    let result  = await MusicSession.findOne({ _id: req.params.id });
    let index = result.activeUsers.findIndex(element => element === userId)
      result.activeUsers.splice(index, 1);
      result.save();
      res.send("user left")
  } catch(error){
    console.log(error);
    throw new Error("Could not leave session")
  }
  
});

const updatePlaylist = asyncHandler( async (req, res) => {
    const { playlist } = req.body;

    try{
        let result = await MusicSession.findOne({ _id: req.params.id})
        result.activeUsers.push(playlist);
        result.save();
        res.send("playlist added")
    } catch(error){
    console.log(error);
    throw new Error("Could not join session")
    }
})

const endMusicSession = asyncHandler(async (req, res) => {
 
  try{
    await MusicSession.deleteOne({ _id: req.params.id})
    res.send("session ended")
  } catch(error){
    console.log(error);
    throw new Error("Could not join session")
  }
});

module.exports = {
  createMusicSession,
  endMusicSession,
  userJoinSession,
  userLeaveSession,
  fetchSession,
  getSessionById,
  updatePlaylist,
};

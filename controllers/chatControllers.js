const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler( async (req, res) => {
    //get user id from the current user 
    const { userId } = req.body;

    //if a chat with userid exists return it if not create new chat
    if(!userId){
        console.log('UserId param not sent with request');
        return res.sendStatus(400);
    }

    //finding a chat
    let isChat = await Chat.find({
       $or:[ 
        { users: { $elemMatch:{$eq: req.user._id}}},
        { users: { $elemMatch: {$eq: userId}}},
    ],
    }) //if the user match a user._id or userId, populate the user and latest message of the chat
    .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate( isChat, {
        path: "latestMessage.sender",
        select: "name email",
    })

    if(isChat.length > 0){
        res.send(isChat[0]);
    } else {
        let chatData = {
            chatName: "sender",
            users: [req.user._id, userId],
        };

        try{
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id: createdChat._id})
            .populate("users", "-password");

            res.status(200).send(FullChat)
        } catch(error){
            throw new Error(error.message);
        }

    }

});

const fetchChat = asyncHandler( async (req, res) =>{
    try{
        Chat.find({ users: {$elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("latestMessage")
        .sort({updateAt: -1})
        .then( async (results) => {
            results = await User.populate( results, {
                path: "latestMessage.sender",
                select: "name email",
            })

            res.status(200).send(results);
        })
    } catch(error){
        res.status(400);
        throw new Error(error.message);
    }  
});

module.exports = { accessChat, fetchChat };
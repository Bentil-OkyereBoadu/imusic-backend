const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require('../config/generateToken');
const bcrypt =  require('bcryptjs')
const saltRounds = 10;

//controller to register/signup users
const registerUser = asyncHandler (async (req, res) => {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash( password, salt);
    //throws error if user already exists in the db with the same email 
    const userExists = await User.findOne({ email });
    if(userExists){
        res.json("user already exists")
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    //if user data is ok, create user
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name, 
            email: user.email,
            password: user.password,
            token: generateToken(user._id),
        });
    } else{
        res.status(400);
        throw new Error(" Failed to create user");
    }
});


//controller for authenticating users/ logins
const authUser = asyncHandler( async (req, res) => {
    //get email and password from request body
    const { email, password } = req.body;

    //search for user email in db
    const user = await User.findOne({email}); 
    if(!user) {
        return res.status(404).json(`No user with email ${email} exists`);
    }

    const existingPassword = await bcrypt.compare( password, user.password);

    //if there is an email and the password matches, return user info
    if( user && existingPassword){
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
    })
    } else {
    res.status(401);
    throw new Error("Invalid Password");
    }
});


/// api/user?search=koo
const allUsers = asyncHandler( async (req, res) =>{
    const keyword = req.query.search? {
        $or: [
            //uses regex for comparison of the search term 
            {name: {$regex: req.query.search, $options: "i"}},
            {email: { $regex: req.query.search, $options: "i"}}
        ],
    } : {} ; 

    //finds the user from the provided search term with the _id value of the User in the db
    const users = await User.find(keyword).find({_id:{$ne: req.user._id}});
    res.send(users);
})

module.exports = {registerUser, authUser, allUsers}
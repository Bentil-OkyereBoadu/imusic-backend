const mongoose = require('mongoose')
const bcrypt =  require('bcryptjs')

const userSchema = mongoose.Schema({
    name: { type:String, required: true},
    email:{ type:String, required: true, unique: true}, 
    password: { type:String, required: true}
},
{
    timestamps: true
}
);

userSchema.methods.matchPassword = async (enteredPassword) => {
    return await bcrypt.compare( enteredPassword, this.password);
}

//encrypt password before storing password to database
userSchema.pre("save", async (next) => {
    if(!this.isModified){
       next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
})

const User = mongoose.model("User", userSchema);
module.exports = User;
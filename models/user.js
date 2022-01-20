const mongoose = require('mongoose')
const validator = require('validator');
const bycrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide name'],
        minlength:3,
        maxlength:50,
    },
    email:{
        type:String,
        unique:true,
        required:[true,'please provide email'],
        validate:{
            validator:validator.isEmail,
            message:'please provide valid email',
        }
    },
    password:{
        type:String,
        required:[true,'please provide password'],
        minlength:6,
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user',
    }
})

UserSchema.pre('save', async function(){
    if(!this.isModified('password')) return;
    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password,salt);
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bycrypt.compare(candidatePassword,this.password);
    return isMatch;
}

module.exports = mongoose.model('User',UserSchema)
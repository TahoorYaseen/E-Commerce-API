const User = require('../models/user')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {attachcookiestoResponse,createTokenUser,checkPermsissions} = require('../utils')


const getAllUsers = async (req,res)=>{
    const users = await User.find({role:'user'}).select('-password')
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req,res)=>{
    //const {id:userID} = req.params
    const user = await User.findOne({_id:req.params.id}).select('-password')
    if(!user){
        throw new CustomError.NotFoundError(`no user with the is ${userID}`)
    }
    checkPermsissions(req.user,user._id)
    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req,res)=>{
    res.status(StatusCodes.OK).json({user : req.user})
}
//updating user with findOne and update  
// const updateUser = async (req,res)=>{
//     const {name,email} = req.body
//     if(!name || !email){
//         throw new CustomError.BadRequestError('please provide name or email')
//     }
//     const user = await User.findOneAndUpdate({_id:req.user.userID},{name,email},{new:true,runValidators:true})
//     const tokenUser = createTokenUser(user);
//     attachcookiestoResponse({res,user:tokenUser})
//     res.status(StatusCodes.OK).json({user:tokenUser})
// }

//updating user with user.save
const updateUser = async (req,res)=>{
    const {name,email} = req.body
    if(!name || !email){
        throw new CustomError.BadRequestError('please provide name or email')
    }
    const user = await User.findOne({_id:req.user.userID})
    user.name = name;
    user.email = email;
    await user.save();

    const tokenUser = createTokenUser(user);
    attachcookiestoResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
}

const updateUserPassword = async (req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('please provide old or new password')
    }
    //console.log(req.user);
    const user = await User.findOne({_id:req.user.userID})
    const isMatch = await user.comparePassword(oldPassword)
    if(!isMatch){
        throw new CustomError.UnauthenticatedError('invalid credentials')
    }
    user.password = newPassword;
    await user.save()
    res.status(StatusCodes.OK).json({msg:'success! password changed'})
}

module.exports = {getAllUsers,getSingleUser,showCurrentUser,updateUser,updateUserPassword}
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors')
const User = require('../models/user');
const {attachcookiestoResponse,createTokenUser} = require('../utils')

const register = async(req,res)=>{
    const {email,name ,password} = req.body;
    const isfirstAccount = (await User.countDocuments({})) === 0;
    const role = isfirstAccount?'admin':'user'

    const emailAlreadyexists = await User.findOne({email})
    if(emailAlreadyexists){
        throw new CustomError.BadRequestError('email already exists')
    }
    const user = await User.create({name,email,password,role});
    const tokenUser = createTokenUser(user);
     attachcookiestoResponse({res,user:tokenUser})
   
    res.status(StatusCodes.CREATED).json({user:tokenUser})
}
const login =async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        throw new CustomError.BadRequestError('please provide email or password')
    }
    const user = await User.findOne({email});
    if(!user){
        throw new CustomError.UnauthenticatedError('no user with the given email')
    }
    const isCorrectPassword = await user.comparePassword(password)
    if(!isCorrectPassword){
        throw new CustomError.UnauthenticatedError('wrong password provided')
    }
    const tokenUser = createTokenUser(user);
    attachcookiestoResponse({res,user:tokenUser})

    res.status(StatusCodes.OK).json({user:tokenUser})
}
const logout =async (req,res)=>{
    res.cookie('token','logout',{
        httpOnly:true,
        expires: new Date(Date.now() )
})
    res.status(StatusCodes.OK).json({msg:'user logout!!'})
}
module.exports ={register,login,logout}